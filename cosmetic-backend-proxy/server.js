const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const axios = require('axios');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const winston = require('winston');
require('dotenv').config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console({ format: winston.format.simple() })]
      : [])
  ],
});

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure cache (5 minutes TTL for successful responses)
const cache = new NodeCache({ 
  stdTTL: 300, 
  checkperiod: 60,
  useClones: false 
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : '*',
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min in prod, 1 min in dev
  max: NODE_ENV === 'production' ? 100 : 1000, // Limits per windowMs
  message: { 
    error: 'Too many requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip,
};

const scrapeLimiter = rateLimit(rateLimitConfig);

// Global error handler middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Process event handlers for graceful shutdown
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit immediately in production, let the process manager handle it
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ✅ FIXED: Google Custom Search API Configuration with validation
const GOOGLE_CUSTOM_SEARCH_CONFIG = {
  apiKey: process.env.GOOGLE_API_KEY || '',
  searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
  enabled: !!process.env.GOOGLE_API_KEY && !!process.env.GOOGLE_SEARCH_ENGINE_ID,
  timeout: parseInt(process.env.GOOGLE_TIMEOUT) || 10000,
  maxResults: parseInt(process.env.GOOGLE_MAX_RESULTS) || 5,
  retryAttempts: parseInt(process.env.GOOGLE_RETRY_ATTEMPTS) || 2,
};

// ✅ FIXED: Enhanced barcode sources configuration with timeouts from env
const BARCODE_SOURCES = {
  UPCDB: {
    name: 'UPCitemDB',
    url: (barcode) => `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
    enabled: process.env.UPCDB_ENABLED !== 'false',
    priority: 1,
    timeout: parseInt(process.env.UPCDB_TIMEOUT) || 10000,
    retries: parseInt(process.env.UPCDB_RETRIES) || 2,
    parser: (data) => {
      if (!data.items || data.items.length === 0) return null;
      const item = data.items[0];
      return {
        title: item.title,
        brand: item.brand || item.manufacturer || '',
        category: item.category,
        images: item.images || [],
        description: item.description || '',
        source: 'UPCitemDB'
      };
    }
  },
  OPENBEAUTYFACTS: {
    name: 'Open Beauty Facts',
    url: (barcode) => `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
    enabled: process.env.OPENBEAUTYFACTS_ENABLED !== 'false',
    priority: 2,
    timeout: parseInt(process.env.OPENBEAUTYFACTS_TIMEOUT) || 10000,
    retries: parseInt(process.env.OPENBEAUTYFACTS_RETRIES) || 2,
    parser: (data) => {
      if (data.status !== 1 || !data.product) return null;
      const product = data.product;
      return {
        title: product.product_name || product.product_name_en || '',
        brand: product.brands || product.brand_owner || '',
        category: product.categories || product.categories_tags?.join(', ') || '',
        images: product.image_url ? [product.image_url] : [],
        ingredients: product.ingredients_text || '',
        description: product.generic_name || '',
        source: 'Open Beauty Facts'
      };
    }
  },
  BARCODELIST: {
    name: 'Barcode-List.com',
    url: (barcode) => `https://barcode-list.com/barcode/${barcode}.htm`,
    enabled: process.env.BARCODELIST_ENABLED !== 'false',
    priority: 3,
    timeout: parseInt(process.env.BARCODELIST_TIMEOUT) || 8000,
    retries: parseInt(process.env.BARCODELIST_RETRIES) || 1,
    isHtmlSource: true,
    parser: (htmlData) => {
      try {
        if (!htmlData || typeof htmlData !== 'string') return null;
        const $ = cheerio.load(htmlData);
        const fullTitle = $('h1.pageTitle').text().trim();
        
        if (!fullTitle || fullTitle.toLowerCase() === 'search' || 
            fullTitle.toLowerCase().includes('no results') ||
            fullTitle.toLowerCase().includes('barcode not found')) {
          logger.debug(`[Barcode-List] REJECTED: Non-product page "${fullTitle}"`);
          return null;
        }
        
        let cleanTitle = fullTitle;
        cleanTitle = cleanTitle.replace(/\s*-\s*Barcode:.*$/i, '').trim();
        cleanTitle = cleanTitle.replace(/[\d,\.]+\s*(g|ml|oz|l|kg|lb|fl\s*oz)\s*,?\s*/gi, '').trim();
        cleanTitle = cleanTitle.replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim();
        
        let brand = '';
        const brandPatterns = [
          /\b(MAMAEAARTH|MAMAEARTH|HIMALAYA|CETAPHIL|CERAVE|GARNIER|L'ORÉAL|NEUTROGENA|DOVE|NIKE|MAC|MAYBELLINE|OLAY|BIOTIQUE|POND'S|LAKME|LOVEA|VLCC|VASELINE)\b/i,
        ];
        
        for (const pattern of brandPatterns) {
          const match = cleanTitle.match(pattern);
          if (match) {
            brand = match[1] || match[0];
            break;
          }
        }
        
        const tableRow = $('table.randomBarcodes tr.even').first();
        if (tableRow.length) {
          const tableTitle = tableRow.find('td:nth-child(3)').text().trim();
          if (tableTitle && !cleanTitle.toLowerCase().includes('barcode')) {
            cleanTitle = tableTitle;
          }
        }
        
        cleanTitle = cleanTitle.replace(/\s+/g, ' ').replace(/\s*-\s*-/g, '-').trim();
        
        logger.debug(`[Barcode-List] Original: "${fullTitle}" -> Cleaned: "${cleanTitle}", Brand: "${brand}"`);
        
        return {
          title: cleanTitle,
          brand: brand || '',
          category: '',
          images: [],
          description: '',
          source: 'Barcode-List.com'
        };
      } catch (error) {
        logger.error('[Barcode-List] Parser Error:', error);
        return null;
      }
    }
  }
};

// ✅ FIXED: EWG Skin Deep Configuration with env vars
const EWG_CONFIG = {
  enabled: process.env.EWG_ENABLED !== 'false',
  searchUrl: (productName) => `https://www.ewg.org/skindeep/search/?search=${encodeURIComponent(productName)}`,
  fallbackEnabled: process.env.EWG_FALLBACK_ENABLED !== 'false',
  manualLookup: process.env.EWG_MANUAL_LOOKUP !== 'false',
  timeout: parseInt(process.env.EWG_TIMEOUT) || 15000,
  userAgent: process.env.EWG_USER_AGENT || 'CosmeticScanner/2.0 (+https://github.com/cosmetic-scanner)',
};

// ✅ FIXED: Enhanced axios instance with retry logic
const axiosWithRetry = axios.create();
axiosWithRetry.interceptors.response.use(undefined, async (err) => {
  const config = err.config;
  config.retryCount = config.retryCount || 0;
  const shouldRetry = config.retryCount < (config.retryAttempts || 2);
  
  if (err.response && err.response.status === 429 && shouldRetry) {
    config.retryCount += 1;
    const delay = Math.pow(2, config.retryCount) * 1000;
    logger.info(`Retrying request to ${config.url} after ${delay}ms (attempt ${config.retryCount})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return axiosWithRetry(config);
  }
  
  return Promise.reject(err);
});

// ✅ FIXED: CRITICAL - REVISED PRODUCT NAME CLEANER - PRESERVES SPECIFICITY
function enhancedCleanProductName(fullProductName, brand) {
  let cleaned = fullProductName.trim();
  
  logger.debug(`[Cleaner] STEP 0 - Original Input: "${cleaned}"`);
  
  // PHASE 1: PRESERVE CRITICAL INFORMATION
  const compoundPatterns = [
    { pattern: /\bvitamin\s+c\b/gi, replacement: '__VITAMIN_C__' },
    { pattern: /\bvitamin\s+e\b/gi, replacement: '__VITAMIN_E__' },
    { pattern: /\bvitamin\s+b(\d+)\b/gi, replacement: '__VITAMIN_B$1__' },
    { pattern: /\bhyaluronic\s+acid\b/gi, replacement: '__HYALURONIC_ACID__' },
    { pattern: /\bniacinamide\b/gi, replacement: '__NIACINAMIDE__' },
    { pattern: /\bsalicylic\s+acid\b/gi, replacement: '__SALICYLIC_ACID__' },
    { pattern: /\bturmeric\b/gi, replacement: '__TURMERIC__' },
    { pattern: /\baloe\s+vera\b/gi, replacement: '__ALOE_VERA__' },
    { pattern: /\bmineralize\s+rich\b/gi, replacement: '__MINERALIZE_RICH__' },
    { pattern: /\bgentle\s+skin\b/gi, replacement: '__GENTLE_SKIN__' },
    { pattern: /\bmaster\s+precise\b/gi, replacement: '__MASTER_PRECISE__' },
    { pattern: /\bbaby\s+cream\b/gi, replacement: '__BABY_CREAM__' },
    { pattern: /\bfragrant\s+talc\b/gi, replacement: '__FRAGRANT_TALC__' },
    { pattern: /\bmultipurpose\s+cream\b/gi, replacement: '__MULTIPURPOSE_CREAM__' }
  ];
  
  compoundPatterns.forEach(({ pattern, replacement }) => {
    cleaned = cleaned.replace(pattern, replacement);
  });
  
  // PHASE 2: REMOVE ONLY TRUE NOISE
  cleaned = cleaned
    .replace(/\s*\([^)]*B0[A-Z0-9]{8,9}[^)]*\)/gi, '')
    .replace(/\s*with\s*free\s*shipping/gi, '')
    .replace(/\s*-\s*[^-]*(shipping|discount|cheap|bulk|wholesale)[^-]*$/gi, '')
    .replace(/\s*pack\s*of\s*\d+/gi, '')
    .replace(/\s*\([^)]*unisex[^)]*\)/gi, '')
    .replace(/\s*[\(\[]?\d+\s*(ml|g|oz|fl\.?\s*oz)[\)\]]?\s*$/gi, '')
    .replace(/\s*-\s*\d+\s*(ml|g)\s*$/gi, '')
    .replace(/\s*\(.*\d+\s*(ml|g).*\)/gi, '')
    .replace(/\s+for\s+(unisex|men|women|all|daily\s*use)\b/gi, '')
    .replace(/\bwith\s+[^,]+\s+and\s+with\b/gi, 'with');
  
  // PHASE 3: RESTORE PRESERVED INFORMATION
  cleaned = cleaned.replace(/__VITAMIN_C__/g, 'Vitamin C');
  cleaned = cleaned.replace(/__VITAMIN_E__/g, 'Vitamin E');
  cleaned = cleaned.replace(/__VITAMIN_B(\d+)__/g, 'Vitamin B$1');
  cleaned = cleaned.replace(/__HYALURONIC_ACID__/g, 'Hyaluronic Acid');
  cleaned = cleaned.replace(/__NIACINAMIDE__/g, 'Niacinamide');
  cleaned = cleaned.replace(/__SALICYLIC_ACID__/g, 'Salicylic Acid');
  cleaned = cleaned.replace(/__TURMERIC__/g, 'Turmeric');
  cleaned = cleaned.replace(/__ALOE_VERA__/g, 'Aloe Vera');
  cleaned = cleaned.replace(/__MINERALIZE_RICH__/g, 'Mineralize Rich');
  cleaned = cleaned.replace(/__GENTLE_SKIN__/g, 'Gentle Skin');
  cleaned = cleaned.replace(/__MASTER_PRECISE__/g, 'Master Precise');
  cleaned = cleaned.replace(/__BABY_CREAM__/g, 'Baby Cream');
  cleaned = cleaned.replace(/__FRAGRANT_TALC__/g, 'Fragrant Talc');
  cleaned = cleaned.replace(/__MULTIPURPOSE_CREAM__/g, 'Multipurpose Cream');
  
  // PHASE 4: FINAL CLEANUP
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*$/, '')
    .replace(/^\s*-\s*|\s*-\s*$/g, '')
    .replace(/\s*\.\s*$/g, '')
    .trim();
  
  const words = cleaned.split(' ');
  const uniqueWords = [];
  let lastWord = '';
  
  for (const word of words) {
    if (word.toLowerCase() !== lastWord.toLowerCase()) {
      uniqueWords.push(word);
      lastWord = word;
    }
  }
  
  cleaned = uniqueWords.join(' ');
  
  logger.debug(`[Cleaner] Final Output: "${cleaned}"`);
  
  return cleaned;
}

// ✅ FIXED: CRITICAL - REVISED SEARCH TERM GENERATOR
function generateAccurateSearchTerms(productName, brand, cleanedName) {
  const attempts = new Set();
  
  logger.debug(`[SearchGen] Generating Search Terms - Original: "${productName}", Brand: "${brand}", Cleaned: "${cleanedName}"`);
  
  if (brand) {
    let originalMinusNoise = productName
      .replace(/\s*\([^)]*B0[A-Z0-9]{8,9}[^)]*\)/gi, '')
      .replace(/\s*with\s*free\s*shipping/gi, '')
      .replace(/\s*-\s*\d+\s*(ml|g)\b/gi, '')
      .replace(/\s*\(unisex\)/gi, '')
      .trim();
    
    if (!originalMinusNoise.toLowerCase().startsWith(brand.toLowerCase())) {
      attempts.add(`${brand} ${originalMinusNoise}`.trim());
    }
    
    attempts.add(originalMinusNoise);
  }
  
  if (brand && cleanedName && cleanedName.length > 3) {
    let cleanForSearch = cleanedName;
    if (cleanForSearch.toLowerCase().startsWith(brand.toLowerCase())) {
      cleanForSearch = cleanForSearch.substring(brand.length).trim();
    }
    
    attempts.add(`${brand} ${cleanForSearch}`.trim());
  }
  
  if (cleanedName && cleanedName.split(' ').length >= 2) {
    attempts.add(cleanedName);
    
    const withoutWith = cleanedName.replace(/\s+with\s+.*$/i, '').trim();
    if (withoutWith.length > 5 && withoutWith !== cleanedName) {
      attempts.add(withoutWith);
      
      if (brand) {
        attempts.add(`${brand} ${withoutWith}`.trim());
      }
    }
  }
  
  const productType = detectExactProductType(cleanedName || productName);
  if (productType && brand) {
    attempts.add(`${brand} ${productType}`.trim());
    
    if (productType.includes('baby cream') && brand.toLowerCase().includes('himalaya')) {
      attempts.add('Himalaya Herbals Baby Cream');
      attempts.add('himalaya herbals baby cream');
      attempts.add('Himalaya baby cream');
    }
    
    if (productType.includes('vitamin c face wash') && brand.toLowerCase().includes('mamaearth')) {
      attempts.add('Mamaearth Vitamin C Face Wash');
      attempts.add('Mamaearth Vitamin C Face Wash with Turmeric');
    }
  }
  
  if (brand && attempts.size < 2) {
    attempts.add(brand);
  }
  
  const finalAttempts = Array.from(attempts)
    .filter(term => {
      if (!term || term.length < 3) return false;
      
      const words = term.split(' ');
      if (words.length === 1) {
        const genericWords = ['search', 'product', 'item', 'code', 'barcode', 'undefined', 'null'];
        return !genericWords.includes(term.toLowerCase());
      }
      
      return term.toLowerCase() !== 'search';
    })
    .sort((a, b) => calculateTermAccuracy(b, productName, brand) - calculateTermAccuracy(a, productName, brand))
    .slice(0, 6);
  
  logger.debug(`[SearchGen] Generated ${finalAttempts.length} terms:`, finalAttempts);
  
  return finalAttempts;
}

function calculateTermAccuracy(term, originalProductName, brand) {
  let score = 0;
  const termLower = term.toLowerCase();
  const originalLower = originalProductName.toLowerCase();
  const brandLower = brand?.toLowerCase() || '';
  
  if (termLower === originalLower) score += 1000;
  if (originalLower.includes(termLower) || termLower.includes(originalLower)) score += 500;
  if (brandLower && termLower.includes(brandLower)) score += 200;
  
  const keyPhrases = extractKeyPhrases(originalProductName);
  keyPhrases.forEach(phrase => {
    if (termLower.includes(phrase.toLowerCase())) score += 80;
  });
  
  if (termLower.includes('vitamin c') && originalLower.includes('vitamin c')) score += 150;
  if (termLower.includes('baby cream') && originalLower.includes('baby cream')) score += 150;
  
  const wordCount = term.split(' ').length;
  if (wordCount >= 3 && wordCount <= 8) {
    score += wordCount * 15;
  } else if (wordCount === 2) {
    score += 20;
  }
  
  if (wordCount === 1) {
    const genericWords = ['search', 'product', 'item', 'code'];
    if (genericWords.includes(termLower)) {
      score -= 1000;
    } else {
      score -= 200;
    }
  }
  
  if (termLower === 'search') score -= 2000;
  
  return score;
}

function extractKeyPhrases(productName) {
  const phrases = [];
  const nameLower = productName.toLowerCase();
  
  const compoundPatterns = [
    'vitamin c', 'vitamin e', 'hyaluronic acid', 'salicylic acid',
    'baby cream', 'face wash', 'lipstick', 'cleanser', 'moisturizer',
    'mineralize rich', 'gentle skin', 'master precise', 'aloe vera',
    'turmeric', 'fragrant talc', 'multipurpose cream', 'skin illumination',
    'herbals', 'mineralize', 'aromatherapy', 'liquid liner'
  ];
  
  compoundPatterns.forEach(phrase => {
    if (nameLower.includes(phrase)) phrases.push(phrase);
  });
  
  return phrases;
}

function detectExactProductType(productName) {
  if (!productName) return null;
  
  const nameLower = productName.toLowerCase();
  
  const typeMapping = [
    { pattern: /\bhimalaya\s+herbals\s+baby\s+cream\b/, type: 'himalaya herbals baby cream' },
    { pattern: /\bmamaearth\s+vitamin\s+c\s+face\s+wash\b/, type: 'mamaearth vitamin c face wash' },
    { pattern: /\bvitamin\s+c\s+face\s+wash\b/, type: 'vitamin c face wash' },
    { pattern: /\bbaby\s+cream\b/, type: 'baby cream' },
    { pattern: /\bmultipurpose\s+cream\b/, type: 'multipurpose cream' },
    { pattern: /\bdry\s+skin\s+(?:cream|lotion|repair)\b/, type: 'dry skin cream' },
    { pattern: /\bliquid\s+liner\b/, type: 'liquid eyeliner' },
    { pattern: /\bfragrant\s+talc\b/, type: 'talcum powder' },
    { pattern: /\baromatherapy\s+lotion\b/, type: 'aromatherapy lotion' },
    { pattern: /\bmaster\s+precise\s+liquid\s+liner\b/, type: 'master precise liquid liner' },
    { pattern: /\bgentle\s+skin\s+cleanser\b/, type: 'gentle skin cleanser' },
    { pattern: /\bmineralize\s+rich\s+lipstick\b/, type: 'mineralize rich lipstick' },
    { pattern: /\bface\s+wash\b/, type: 'face wash' }
  ];
  
  for (const mapping of typeMapping) {
    if (mapping.pattern.test(nameLower)) {
      return mapping.type;
    }
  }
  
  const genericTypes = [
    'face wash', 'cleanser', 'serum', 'moisturizer', 
    'cream', 'toner', 'sunscreen', 'lipstick', 
    'foundation', 'mask', 'scrub', 'lotion',
    'talc', 'powder', 'liner', 'eyeliner', 'wash'
  ];
  
  for (const type of genericTypes) {
    if (nameLower.includes(type)) {
      return type;
    }
  }
  
  return null;
}

// ✅ FIXED: EWG Data Fetching with improved error handling
async function fetchEwgProductData(productName, brand) {
  if (!EWG_CONFIG.enabled) {
    return { success: false, method: 'disabled' };
  }
  
  try {
    const searchQuery = brand ? `${brand} ${productName}` : productName;
    const searchUrl = EWG_CONFIG.searchUrl(searchQuery);
    
    logger.info(`[EWG] Searching for: "${searchQuery}"`);
    
    const headers = {
      'User-Agent': EWG_CONFIG.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    };
    
    const response = await axiosWithRetry.get(searchUrl, { 
      headers, 
      timeout: EWG_CONFIG.timeout,
      retryAttempts: 2,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    
    const $ = cheerio.load(response.data);
    const searchResults = $('.search-results .product-item, .result-item, a[href^="/skindeep/products/"]');
    
    if (searchResults.length > 0) {
      let bestMatch = null;
      let bestMatchScore = 0;
      
      searchResults.each((index, element) => {
        const productLink = $(element).attr('href') || $(element).find('a').attr('href');
        const productText = $(element).text().toLowerCase();
        const searchText = searchQuery.toLowerCase();
        
        if (productLink && productLink.includes('/skindeep/products/')) {
          let score = 0;
          if (brand && productText.includes(brand.toLowerCase())) score += 30;
          if (productText.includes(productName.toLowerCase())) score += 20;
          
          const productWords = productName.toLowerCase().split(/\s+/);
          productWords.forEach(word => {
            if (word.length > 3 && productText.includes(word)) score += 5;
          });
          
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = {
              url: productLink.startsWith('http') ? productLink : `https://www.ewg.org${productLink}`,
              score: score
            };
          }
        }
      });
      
      if (bestMatch && bestMatchScore > 10) {
        try {
          const productResponse = await axiosWithRetry.get(bestMatch.url, { 
            headers, 
            timeout: EWG_CONFIG.timeout,
            retryAttempts: 1,
          });
          
          const product$ = cheerio.load(productResponse.data);
          const productNameEwg = product$('.product-name').text().trim() || 
                               product$('h1').first().text().trim() ||
                               product$('title').text().replace(' - EWG Skin Deep®', '').trim();
          
          const scoreImg = product$('.product-score img').attr('alt') || '';
          const scoreMatch = scoreImg.match(/score:\s*(\d+)/i);
          const productScore = scoreMatch ? parseInt(scoreMatch[1]) : null;
          
          const dataAvailability = product$('.availability b').text().trim() || 
                                  product$('.data-level').next().text().trim();
          
          const brandEwg = product$('a[href*="/skindeep/browse/brands/"]').text().trim() ||
                         product$('.product-lower a').first().text().trim();
          
          const ingredients = [];
          product$('.ingredient-overview-tr').each((i, el) => {
            const ingredientName = product$(el).find('.td-ingredient-interior').text().trim();
            if (ingredientName) ingredients.push(ingredientName);
          });
          
          return {
            success: true,
            method: 'scraped',
            productName: productNameEwg,
            productScore: productScore,
            dataAvailability: dataAvailability,
            brand: brandEwg,
            ingredients: ingredients,
            sourceUrl: bestMatch.url,
            extractedAt: new Date().toISOString()
          };
        } catch (productError) {
          logger.warn(`[EWG] Product page fetch failed: ${productError.message}`);
        }
      }
    }
    
    if (EWG_CONFIG.fallbackEnabled) {
      return {
        success: true,
        method: 'manual_lookup',
        searchUrl: searchUrl,
        message: 'Direct scraping blocked. Use the search link for manual lookup.',
        ewgData: {
          productName: productName,
          brand: brand,
          manualLookup: true
        }
      };
    }
    
    return { success: false, method: 'no_results', searchUrl: searchUrl };
    
  } catch (error) {
    logger.error('[EWG] Error:', error);
    
    if (EWG_CONFIG.manualLookup) {
      const searchUrl = EWG_CONFIG.searchUrl(brand ? `${brand} ${productName}` : productName);
      return {
        success: true,
        method: 'error_fallback',
        searchUrl: searchUrl,
        message: `Scraping failed: ${error.message}. Use the search link for manual lookup.`,
        ewgData: {
          productName: productName,
          brand: brand,
          manualLookup: true
        }
      };
    }
    
    return { success: false, method: 'error', error: error.message };
  }
}

// ✅ FIXED: Fetch from barcode source with retry logic
async function fetchProductFromBarcodeSource(barcode, sourceConfig) {
  const maxRetries = sourceConfig.retries || 1;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`[${sourceConfig.name}] Attempt ${attempt}/${maxRetries} for barcode: ${barcode}`);
      
      const config = {
        method: 'GET',
        url: sourceConfig.url(barcode),
        timeout: sourceConfig.timeout,
        headers: { 
          'User-Agent': 'CosmeticScanner/2.0 (+https://github.com/cosmetic-scanner)',
          'Accept': sourceConfig.isHtmlSource ? 'text/html' : 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        retryAttempts: 0, // We handle retry manually
      };
      
      const response = await axiosWithRetry(config);
      
      if (sourceConfig.isHtmlSource) {
        const parsedData = sourceConfig.parser(response.data);
        if (parsedData) {
          logger.info(`[${sourceConfig.name}] Success: Found "${parsedData.title.substring(0, 50)}..."`);
          return {
            success: true,
            source: sourceConfig.name,
            data: parsedData
          };
        }
      } else {
        const parsedData = sourceConfig.parser(response.data);
        if (parsedData) {
          logger.info(`[${sourceConfig.name}] Success: Found "${parsedData.title.substring(0, 50)}..."`);
          return {
            success: true,
            source: sourceConfig.name,
            data: parsedData
          };
        }
      }
      
      logger.debug(`[${sourceConfig.name}] Product not found`);
      return {
        success: false,
        source: sourceConfig.name,
        error: 'Product not found in this database'
      };
      
    } catch (error) {
      logger.warn(`[${sourceConfig.name}] Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        if (error.response) {
          return {
            success: false,
            source: sourceConfig.name,
            error: `${sourceConfig.name} API error: ${error.response.status}`
          };
        } else if (error.request) {
          return {
            success: false,
            source: sourceConfig.name,
            error: 'Network timeout'
          };
        } else {
          return {
            success: false,
            source: sourceConfig.name,
            error: 'Internal error'
          };
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ✅ FIXED: Multi-source barcode scan with caching
async function scanBarcodeFromMultipleSources(barcode) {
  const cacheKey = `barcode_${barcode}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    logger.info(`[Multi-Source] Cache hit for barcode: ${barcode}`);
    return cachedResult;
  }
  
  logger.info(`[Multi-Source] Starting scan for barcode: ${barcode}`);
  
  const activeSources = Object.values(BARCODE_SOURCES)
    .filter(source => source.enabled)
    .sort((a, b) => a.priority - b.priority);
  
  let finalResult = null;
  let triedSources = [];
  
  for (const source of activeSources) {
    triedSources.push(source.name);
    
    const sourceResult = await fetchProductFromBarcodeSource(barcode, source);
    
    if (sourceResult.success) {
      finalResult = sourceResult;
      logger.info(`[Multi-Source] Found product via ${source.name}`);
      break;
    } else {
      logger.debug(`[Multi-Source] ${source.name} failed: ${sourceResult.error}`);
    }
  }
  
  const result = finalResult ? {
    success: true,
    barcode: barcode,
    product: finalResult.data,
    source: finalResult.source,
    triedSources: triedSources,
    timestamp: new Date().toISOString()
  } : {
    success: false,
    barcode: barcode,
    error: `Product not found in any available database. Tried: ${triedSources.join(', ')}`,
    triedSources: triedSources,
    timestamp: new Date().toISOString()
  };
  
  // Only cache successful results
  if (result.success) {
    cache.set(cacheKey, result);
  }
  
  return result;
}

// ✅ FIXED: Extract ingredients and image
function extractAllIngredientsAndImageFromPage($) {
  const ingredients = new Set();
  const productTitle = $('#product-title').text().trim();
  const brandName = $('#product-brand-title a').text().trim();

  $('#ingredlist-short a.ingred-link').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text !== '[more]' && text !== '[less]' && text.length > 1) {
      ingredients.add(text);
    }
  });
  
  $('#ingredlist-table-section a.ingred-detail-link').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 1) {
      ingredients.add(text);
    }
  });
  
  $('a.product-long-ingred-link').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 1) {
      ingredients.add(text);
    }
  });
  
  let productImage = null;
  const mainImage = $('#product-main-image img');
  if (mainImage.length) {
    const imgSrc = mainImage.attr('src');
    productImage = {
      src: imgSrc,
      alt: mainImage.attr('alt') || productTitle,
      fullUrl: imgSrc?.startsWith('http') ? imgSrc : `https://incidecoder.com${imgSrc}`
    };
  }
  
  const ingredientArray = Array.from(ingredients);
  
  logger.debug(`[INCI] Extracted ${ingredientArray.length} ingredients and ${productImage ? 'found' : 'no'} image`);
  
  return {
    ingredients: ingredientArray,
    productImage: productImage
  };
}

// ✅ FIXED: Google Custom Search API function with caching
async function searchProductWithGoogle(productName, brand) {
  if (!GOOGLE_CUSTOM_SEARCH_CONFIG.enabled) {
    logger.debug('[Google Search] Disabled in configuration');
    return null;
  }
  
  const cacheKey = `google_${brand}_${productName}`.replace(/\s+/g, '_');
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    logger.debug('[Google Search] Cache hit');
    return cachedResult;
  }
  
  try {
    const query = encodeURIComponent(`${brand} ${productName} site:incidecoder.com`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${GOOGLE_CUSTOM_SEARCH_CONFIG.apiKey}&cx=${GOOGLE_CUSTOM_SEARCH_CONFIG.searchEngineId}&num=${GOOGLE_CUSTOM_SEARCH_CONFIG.maxResults}`;
    
    logger.info(`[Google Search] Searching for: "${brand} ${productName}"`);
    
    const response = await axiosWithRetry.get(url, { 
      timeout: GOOGLE_CUSTOM_SEARCH_CONFIG.timeout,
      retryAttempts: GOOGLE_CUSTOM_SEARCH_CONFIG.retryAttempts,
    });
    
    if (response.data.items && response.data.items.length > 0) {
      const results = [];
      
      response.data.items.forEach((item, index) => {
        if (item.link.includes('incidecoder.com/products/')) {
          let title = item.title;
          
          if (brand) {
            const brandRegex = new RegExp(`^${brand}\\s*[-:]\\s*`, 'i');
            title = title.replace(brandRegex, '');
          }
          
          title = title.replace(/\s*-\s*INCIDecoder.*$/i, '');
          title = title.replace(/\s*-\s*Ingredients.*$/i, '');
          
          results.push({
            rank: index + 1,
            title: title.trim(),
            url: item.link,
            snippet: item.snippet?.substring(0, 100) + '...',
            source: 'Google Custom Search'
          });
        }
      });
      
      if (results.length > 0) {
        logger.info(`[Google Search] Found ${results.length} potential matches`);
        cache.set(cacheKey, results, 600); // Cache for 10 minutes
        return results;
      }
    }
    
    logger.debug('[Google Search] No relevant results found');
    return null;
    
  } catch (error) {
    logger.error('[Google Search] Error:', error);
    if (error.response?.status === 403) {
      logger.error('[Google Search] API key or Search Engine ID might be invalid');
    }
    return null;
  }
}

// ✅ FIXED: Helper function for similarity calculation
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// ✅ FIXED: MAIN ENDPOINT - Combined product search with improved caching
app.get('/api/product/:barcode', scrapeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { barcode } = req.params;
  
  // Cache check for full response
  const cacheKey = `full_${barcode}`;
  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse) {
    logger.info(`[Combined] Cache hit for barcode: ${barcode}`);
    return res.json(cachedResponse);
  }
  
  if (!barcode || barcode.length < 8) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid barcode. Barcode must be at least 8 characters long.' 
    });
  }
  
  logger.info(`\n=== [Combined] Processing barcode: ${barcode} ===`);
  
  try {
    // Step 1: Multi-source barcode scan
    const barcodeScanResult = await scanBarcodeFromMultipleSources(barcode);
    
    if (!barcodeScanResult.success) {
      const response = {
        success: false,
        error: barcodeScanResult.error,
        barcode: barcode,
        metadata: { 
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime 
        }
      };
      return res.status(404).json(response);
    }
    
    const productData = barcodeScanResult.product;
    const productName = productData.title;
    const brand = productData.brand || '';
    
    // Step 2: Enhanced product name cleaning
    const cleanProductName = enhancedCleanProductName(productName, brand);
    
    // Step 3: Generate ACCURATE search terms
    const searchAttempts = generateAccurateSearchTerms(productName, brand, cleanProductName);
    
    // Step 4: Try INCIDecoder with accurate terms
    let incidecoderData = { success: false };
    let successfulSearchTerm = '';
    let exactProductMatch = false;
    let foundProductName = '';
    
    for (const searchTerm of searchAttempts) {
      logger.debug(`[Combined] Trying: "${searchTerm}"`);
      
      try {
        const searchQuery = encodeURIComponent(searchTerm);
        const searchUrl = `https://incidecoder.com/search?query=${searchQuery}`;
        
        const { data: searchHtml } = await axiosWithRetry.get(searchUrl, {
          headers: { 
            'User-Agent': 'CosmeticScanner/2.0 (+https://github.com/cosmetic-scanner)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }, 
          timeout: 10000,
          retryAttempts: 1,
        });
        
        const $search = cheerio.load(searchHtml);
        let productLink = null;
        
        const selectors = [
          '.productpreviewbox-v2 a[href^="/products/"]', 
          'a[href^="/products/"]',
          '.product-card a',
          '.result-item a'
        ];
        
        for (const selector of selectors) {
          const link = $search(selector).first().attr('href');
          if (link && link.includes('/products/') && !link.includes('/products/create')) { 
            productLink = link; 
            break; 
          }
        }
        
        if (!productLink) {
          logger.debug(`[Combined] No product found for term: "${searchTerm}"`);
          continue;
        }
        
        const productUrl = productLink.startsWith('http') ? productLink : `https://incidecoder.com${productLink}`;
        logger.debug(`[Combined] Found product URL: ${productUrl}`);
        
        const { data: productHtml } = await axiosWithRetry.get(productUrl, { 
          headers: { 'User-Agent': 'CosmeticScanner/2.0' }, 
          timeout: 10000,
          retryAttempts: 1,
        });
        
        const $product = cheerio.load(productHtml);
        const extractedData = extractAllIngredientsAndImageFromPage($product);
        
        foundProductName = $product('#product-title').text().trim() || searchTerm;
        const foundBrand = $product('#product-brand-title a').text().trim() || brand;
        
        // Check if this is the EXACT product
        const searchLower = searchTerm.toLowerCase();
        const foundLower = foundProductName.toLowerCase();
        const originalLower = cleanProductName.toLowerCase();
        
        let isExactMatch = false;
        
        if (searchLower.includes('vitamin c') && foundLower.includes('vitamin c')) {
          if (brand && foundLower.includes(brand.toLowerCase())) {
            isExactMatch = true;
          }
        }
        
        if (searchLower.includes('baby cream') && foundLower.includes('baby cream')) {
          if (brand && foundLower.includes(brand.toLowerCase())) {
            isExactMatch = true;
          }
        }
        
        const similarityScore = calculateSimilarity(foundLower, originalLower);
        if (similarityScore > 0.7) {
          isExactMatch = true;
        }
        
        incidecoderData = {
          success: true,
          incidecoderProductName: foundProductName,
          incidecoderBrand: foundBrand,
          incidecoderIngredientList: extractedData.ingredients,
          incidecoderProductImage: extractedData.productImage,
          sourceUrl: productUrl,
          scrapeTimestamp: new Date().toISOString(),
          matchScore: similarityScore,
          isExactMatch: isExactMatch
        };
        
        exactProductMatch = isExactMatch;
        successfulSearchTerm = searchTerm;
        
        if (isExactMatch) {
          logger.info(`✅ [Combined] EXACT MATCH FOUND with term: "${searchTerm}" -> "${foundProductName}"`);
        } else {
          logger.info(`⚠️ [Combined] Partial match found: "${foundProductName}"`);
        }
        
        break;
        
      } catch (error) {
        logger.debug(`[Combined] Error with term "${searchTerm}": ${error.message}`);
        continue;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Step 5: Google Search fallback
    let googleSearchResult = null;
    if (!incidecoderData.success && GOOGLE_CUSTOM_SEARCH_CONFIG.enabled) {
      logger.debug(`[Combined] Trying Google Search for exact match...`);
      
      const googleResults = await searchProductWithGoogle(cleanProductName, brand);
      if (googleResults && googleResults.length > 0) {
        googleSearchResult = googleResults[0];
        
        try {
          logger.debug(`[Combined] Trying Google URL: ${googleSearchResult.url}`);
          const { data: productHtml } = await axiosWithRetry.get(googleSearchResult.url, { 
            headers: { 'User-Agent': 'CosmeticScanner/2.0' }, 
            timeout: 10000,
            retryAttempts: 1,
          });
          
          const $product = cheerio.load(productHtml);
          const extractedData = extractAllIngredientsAndImageFromPage($product);
          
          incidecoderData = {
            success: true,
            incidecoderProductName: $product('#product-title').text().trim() || cleanProductName,
            incidecoderBrand: $product('#product-brand-title a').text().trim() || brand,
            incidecoderIngredientList: extractedData.ingredients,
            incidecoderProductImage: extractedData.productImage,
            sourceUrl: googleSearchResult.url,
            googleAssisted: true,
            scrapeTimestamp: new Date().toISOString()
          };
          
          successfulSearchTerm = 'google-assisted search';
          logger.info(`✅ [Combined] Google-assisted SUCCESS!`);
        } catch (error) {
          logger.debug(`[Combined] Google URL failed: ${error.message}`);
        }
      }
    }
    
    // Step 6: Fetch EWG Skin Deep Data
    let ewgData = null;
    if (EWG_CONFIG.enabled && (cleanProductName || brand)) {
      logger.debug(`[Combined] Fetching EWG Skin Deep data...`);
      ewgData = await fetchEwgProductData(cleanProductName, brand);
    }
    
    // Step 7: Prepare final response
    const result = {
      success: incidecoderData.success || false,
      exactMatch: exactProductMatch,
      barcode: barcode,
      barcodeSource: {
        name: barcodeScanResult.source,
        product: productData,
        triedSources: barcodeScanResult.triedSources
      },
      incidecoder: {
        ...incidecoderData,
        successfulSearchTerm: successfulSearchTerm || null
      },
      ewgSkinDeep: ewgData,
      googleSearch: googleSearchResult,
      metadata: { 
        originalProductName: productName, 
        cleanedProductName: cleanProductName, 
        searchAttempts: searchAttempts,
        successfulSearchTerm: successfulSearchTerm,
        brand: brand, 
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        cacheHit: false,
      }
    };
    
    logger.info(`[Combined] FINISHED: ${incidecoderData.success ? 'SUCCESS' : 'FAILED'}, Exact Match: ${exactProductMatch}, Ingredients: ${incidecoderData.incidecoderIngredientList?.length || 0}`);
    
    // Cache successful responses
    if (result.success) {
      cache.set(cacheKey, result);
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error('[Combined] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product data', 
      details: NODE_ENV === 'production' ? undefined : error.message,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      }
    });
  }
});

// ✅ FIXED: INCIDecoder scraping endpoint
app.get('/api/scrape/incidecoder', scrapeLimiter, async (req, res) => {
  const productName = req.query.productName;
  const brand = req.query.brand || '';
  
  if (!productName) {
    return res.status(400).json({ error: 'Product name required' });
  }
  
  logger.info(`[INCIDecoder] Searching: "${productName}"`);
  
  try {
    let searchQuery = encodeURIComponent(productName);
    if (brand && !productName.toLowerCase().includes(brand.toLowerCase())) {
      searchQuery = encodeURIComponent(`${brand} ${productName}`);
    }
    
    const searchUrl = `https://incidecoder.com/search?query=${searchQuery}`;
    
    const { data: searchHtml } = await axiosWithRetry.get(searchUrl, {
      headers: { 
        'User-Agent': 'CosmeticScanner/2.0 (+https://github.com/cosmetic-scanner)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }, 
      timeout: 10000,
      retryAttempts: 1,
    });
    
    const $search = cheerio.load(searchHtml);
    let productLink = null;
    
    const selectors = [
      '.productpreviewbox-v2 a[href^="/products/"]', 
      'a[href^="/products/"]',
      '.product-card a',
      '.result-item a'
    ];
    
    for (const selector of selectors) {
      const link = $search(selector).first().attr('href');
      if (link && link.includes('/products/') && !link.includes('/products/create')) { 
        productLink = link; 
        break; 
      }
    }
    
    if (!productLink) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found on INCIDecoder.' 
      });
    }
    
    const productUrl = productLink.startsWith('http') ? productLink : `https://incidecoder.com${productLink}`;
    logger.info(`[INCIDecoder] Found: ${productUrl}`);
    
    const { data: productHtml } = await axiosWithRetry.get(productUrl, { 
      headers: { 'User-Agent': 'CosmeticScanner/2.0' }, 
      timeout: 10000,
      retryAttempts: 1,
    });
    
    const $product = cheerio.load(productHtml);
    const extractedData = extractAllIngredientsAndImageFromPage($product);
    
    const scrapedData = {
      success: true,
      incidecoderProductName: $product('#product-title').text().trim() || productName,
      incidecoderBrand: $product('#product-brand-title a').text().trim() || brand,
      incidecoderIngredientList: extractedData.ingredients,
      incidecoderProductImage: extractedData.productImage,
      sourceUrl: productUrl,
      scrapeTimestamp: new Date().toISOString()
    };
    
    logger.info(`[INCIDecoder] Success: ${scrapedData.incidecoderProductName} (${scrapedData.incidecoderIngredientList.length} ingredients)`);
    
    res.json(scrapedData);
    
  } catch (error) {
    logger.error('[INCIDecoder] Error:', error);
    
    if (error.response?.status === 404) {
      res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Scraping failed', 
        details: NODE_ENV === 'production' ? undefined : error.message,
      });
    }
  }
});

// ✅ FIXED: EWG Skin Deep Search Endpoint
app.get('/api/search/ewg', scrapeLimiter, async (req, res) => {
  const { product, brand } = req.query;
  
  if (!product) {
    return res.status(400).json({ error: 'Product name required' });
  }
  
  try {
    const ewgResult = await fetchEwgProductData(product, brand || '');
    res.json(ewgResult);
  } catch (error) {
    logger.error('[EWG Search] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search EWG database', 
      details: NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

// ✅ FIXED: Cache management endpoint (admin only)
app.get('/api/admin/cache', (req, res) => {
  // Basic auth for cache management
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.ADMIN_TOKEN}`;
  
  if (process.env.ADMIN_TOKEN && authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const stats = cache.getStats();
  const keys = cache.keys();
  
  res.json({
    success: true,
    stats: {
      keys: keys.length,
      hits: stats.hits,
      misses: stats.misses,
      ksize: stats.ksize,
      vsize: stats.vsize,
    },
    keys: keys.slice(0, 50), // Show first 50 keys
  });
});

app.delete('/api/admin/cache', (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.ADMIN_TOKEN}`;
  
  if (process.env.ADMIN_TOKEN && authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const count = cache.keys().length;
  cache.flushAll();
  
  res.json({
    success: true,
    message: `Cache cleared (${count} items removed)`,
  });
});

// ✅ FIXED: Health endpoint with system metrics
app.get('/api/health', (req, res) => {
  const cacheStats = cache.getStats();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Cosmetic Scanner API v5.0 (Production Ready)',
    version: '5.0.0',
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    cache: {
      keys: cacheStats.keys,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
    },
    features: [
      'Production-grade security with Helmet',
      'Request compression',
      'Structured logging with Winston',
      'Intelligent caching with NodeCache',
      'Rate limiting with express-rate-limit',
      'Retry logic with axios',
      'Graceful shutdown handling',
      'Environment-based configuration',
    ],
    sources: {
      barcode: Object.values(BARCODE_SOURCES).filter(s => s.enabled).map(s => s.name),
      ewg: EWG_CONFIG.enabled ? 'Enabled' : 'Disabled',
      google: GOOGLE_CUSTOM_SEARCH_CONFIG.enabled ? 'Enabled' : 'Disabled',
    },
    endpoints: {
      main: '/api/product/{barcode}',
      incidecoder: '/api/scrape/incidecoder',
      ewg: '/api/search/ewg',
      health: '/api/health',
      cache: '/api/admin/cache (admin only)',
    },
  });
});

// ✅ FIXED: 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      'GET /api/product/{barcode}': 'Scan barcode and get product details',
      'GET /api/scrape/incidecoder': 'Direct INCIDecoder search',
      'GET /api/search/ewg': 'EWG Skin Deep search',
      'GET /api/health': 'System health check',
    },
  });
});

// Graceful shutdown handler
function gracefulShutdown(signal) {
  return () => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new requests
    server.close(() => {
      logger.info('HTTP server closed.');
      
      // Close cache
      cache.close();
      logger.info('Cache closed.');
      
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
}

// Start server with graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`🎯 Cosmetic Scanner API v5.0 (Production Ready) running at http://localhost:${PORT}`);
  logger.info(`🔧 Environment: ${NODE_ENV}`);
  logger.info(`📊 Features:`);
  logger.info(`   • Production-grade security with Helmet`);
  logger.info(`   • Intelligent caching with ${cache.keys().length} initial cache slots`);
  logger.info(`   • Structured logging with Winston`);
  logger.info(`   • Rate limiting: ${rateLimitConfig.max} requests per ${rateLimitConfig.windowMs / 60000} minutes`);
  logger.info(`   • Graceful shutdown enabled`);
  
  // Log configuration status
  logger.info(`📋 Configuration Status:`);
  logger.info(`   • Google Search: ${GOOGLE_CUSTOM_SEARCH_CONFIG.enabled ? 'Enabled' : 'Disabled (set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID)'}`);
  logger.info(`   • EWG Integration: ${EWG_CONFIG.enabled ? 'Enabled' : 'Disabled'}`);
  logger.info(`   • Cache: Enabled (300s TTL)`);
  
  if (NODE_ENV === 'production') {
    logger.info(`🚀 Production mode: Logs are saved to files, CORS restricted to: ${process.env.ALLOWED_ORIGINS || 'all'}`);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

module.exports = app; // For testing