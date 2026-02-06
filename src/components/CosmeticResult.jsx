import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

// ============================================
// FONT STYLES & TYPOGRAPHY SYSTEM
// ============================================

// Google Fonts import
const loadFonts = () => {
  if (typeof window !== 'undefined') {
    // Remove existing font links if any
    const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    existingLinks.forEach(link => link.remove());
    
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

// Load fonts on initial render
if (typeof window !== 'undefined') {
  loadFonts();
}

// Typography configuration with new fonts
const TYPOGRAPHY_CONFIG = {
  heading: {
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 800,
    letterSpacing: '-0.02em',
    fontFeatureSettings: '"salt" on, "ss01" on'
  },
  subheading: {
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 600,
    letterSpacing: '-0.01em',
    fontFeatureSettings: '"ss03" on'
  },
  body: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 400,
    lineHeight: 1.7,
    letterSpacing: '-0.01em'
  },
  accent: {
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 500,
    letterSpacing: '0.02em'
  },
  button: {
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 600,
    letterSpacing: '0.01em'
  }
};

// Typography Component
const Typography = React.memo(({ 
  children, 
  variant = "body", 
  className = "",
  style = {},
  as: Component = "div",
  ...props 
}) => {
  const baseStyle = TYPOGRAPHY_CONFIG[variant] || TYPOGRAPHY_CONFIG.body;
  
  return (
    <Component
      className={className}
      style={{
        ...baseStyle,
        ...style,
        fontFeatureSettings: baseStyle.fontFeatureSettings || 'normal',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
      {...props}
    >
      {children}
    </Component>
  );
});

Typography.displayName = 'Typography';

// Typing Animation Component (Updated with new fonts)
const TypingAnimation = React.memo(({ text, speed = 50, className = "", delay = 0, variant = "body" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  React.useEffect(() => {
    if (isComplete) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const typographyStyle = TYPOGRAPHY_CONFIG[variant] || TYPOGRAPHY_CONFIG.body;

  return (
    <div className={`inline-flex items-center ${className}`} style={typographyStyle}>
      <span>{displayedText}</span>
      {!isComplete && (
        <motion.div
          animate={{ 
            opacity: [1, 0, 1],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-purple-400 to-purple-600"
        />
      )}
      {isComplete && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-purple-400 to-purple-600"
        />
      )}
    </div>
  );
});

TypingAnimation.displayName = 'TypingAnimation';

// ============================================
// MAIN COMPONENT CODE
// ============================================

// Memoized static components to prevent re-renders
const SkinTypeButton = React.memo(({ type, isSelected, onClick }) => (
  <button
    onClick={() => onClick(type.id)}
    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
      isSelected 
        ? 'border-purple-500 bg-purple-50 shadow-sm' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
    style={TYPOGRAPHY_CONFIG.button}
  >
    <div className="text-2xl mb-1">{type.icon}</div>
    <Typography variant="accent" className="font-medium text-gray-900 text-sm">{type.label}</Typography>
    <Typography variant="body" className="text-gray-500 text-xs mt-1">{type.desc}</Typography>
  </button>
));

SkinTypeButton.displayName = 'SkinTypeButton';

const TabButton = React.memo(({ tab, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-all whitespace-nowrap ${
      isActive 
        ? 'border-b-2 border-purple-600 text-purple-700' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
    style={TYPOGRAPHY_CONFIG.button}
  >
    {tab === 'overview' && '📊 Overview'}
    {tab === 'ingredients' && '🧪 Ingredients'}
    {tab === 'safety' && '🛡️ Safety'}
    {tab === 'usage' && '📝 Usage'}
  </button>
));

TabButton.displayName = 'TabButton';

const SafetyIndicator = React.memo(({ score, safetyLevel, grade }) => {
  const safetyColor = useMemo(() => {
    if (score >= 80) return "from-emerald-500 to-green-500";
    if (score >= 60) return "from-green-400 to-lime-400";
    if (score >= 40) return "from-yellow-400 to-amber-400";
    return "from-red-400 to-pink-400";
  }, [score]);

  return (
    <>
      <div className={`bg-gradient-to-r ${safetyColor} w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center shadow-lg`}>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-bold text-white">{score}</div>
          <Typography variant="body" className="text-white text-sm font-medium">/100</Typography>
        </div>
      </div>
      
      <div className="flex-1">
        <Typography variant="subheading" className="text-lg sm:text-xl text-gray-900 mb-1 font-bold">
          {safetyLevel} Safety
        </Typography>
        <Typography variant="body" className="text-gray-600 mb-2">
          Grade: <span className="font-bold text-lg">{grade}</span>
        </Typography>
        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${safetyColor} transition-all duration-1000`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      </div>
    </>
  );
});

SafetyIndicator.displayName = 'SafetyIndicator';

const CosmeticResult = React.memo(({ data, onReset }) => {
  const [expandedIngredients, setExpandedIngredients] = useState(false);
  const [userSkinType, setUserSkinType] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Early return if no data
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">🔍</div>
        <Typography variant="heading" className="text-2xl text-gray-800 mb-3">
          <TypingAnimation text="No Product Data Found" speed={40} variant="heading" />
        </Typography>
        <Typography variant="body" className="text-gray-600 text-center mb-8 max-w-md">
          Could not load cosmetic product information. Please try scanning again or check your connection.
        </Typography>
        <button
          onClick={onReset}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={TYPOGRAPHY_CONFIG.button}
        >
          ← Back to Product Scanner
        </button>
      </div>
    );
  }

  // Memoized constants
  const skinTypes = useMemo(() => [
    { id: 'oily', label: 'Oily', icon: '💧', desc: 'Shiny skin, enlarged pores' },
    { id: 'dry', label: 'Dry', icon: '🌵', desc: 'Flaky, tight feeling' },
    { id: 'sensitive', label: 'Sensitive', icon: '🌡️', desc: 'Easily irritated, reactive' },
    { id: 'combination', label: 'Combination', icon: '⚖️', desc: 'Mix of oily and dry areas' },
    { id: 'normal', label: 'Normal', icon: '🌟', desc: 'Balanced, few concerns' }
  ], []);

  const tabs = useMemo(() => ['overview', 'ingredients', 'safety', 'usage'], []);

  // Memoized calculations
  const productScore = useMemo(() => 
    data.score || data.safety_score || data.rating || 65,
    [data.score, data.safety_score, data.rating]
  );

  const productGrade = useMemo(() => {
    if (productScore >= 90) return "A+";
    if (productScore >= 80) return "A";
    if (productScore >= 70) return "B";
    if (productScore >= 60) return "C";
    if (productScore >= 50) return "D";
    return "F";
  }, [productScore]);

  const safetyLevel = useMemo(() => {
    if (productScore >= 80) return "Excellent";
    if (productScore >= 70) return "Good";
    if (productScore >= 60) return "Moderate";
    if (productScore >= 50) return "Fair";
    if (productScore >= 40) return "Poor";
    return "Very Poor";
  }, [productScore]);

  const gradeDescription = useMemo(() => {
    const descriptions = {
      'A+': 'Outstanding safety profile with beneficial ingredients',
      'A': 'Excellent safety with high-quality ingredients',
      'B': 'Good safety with minor concerns',
      'C': 'Moderate safety, some caution advised',
      'D': 'Below average safety, significant concerns',
      'F': 'Poor safety, consider alternatives',
      'N/A': 'Safety data not available'
    };
    return descriptions[productGrade] || 'Safety assessment available';
  }, [productGrade]);

  const productType = useMemo(() => {
    const name = data.name || '';
    const desc = data.description || '';
    const text = (name + ' ' + desc).toLowerCase();
    
    if (text.includes('cleans') || text.includes('wash')) return 'Cleanser';
    if (text.includes('moisturiz') || text.includes('cream')) return 'Moisturizer';
    if (text.includes('serum') || text.includes('treatment')) return 'Serum';
    if (text.includes('sunscreen') || text.includes('spf')) return 'Sunscreen';
    if (text.includes('toner') || text.includes('essence')) return 'Toner';
    if (text.includes('mask')) return 'Face Mask';
    
    return 'Cosmetic Product';
  }, [data.name, data.description]);

  const ingredientsList = useMemo(() => 
    Array.isArray(data.ingredients) ? data.ingredients : [],
    [data.ingredients]
  );

  const ingredientsCount = useMemo(() => ingredientsList.length, [ingredientsList]);

  // Memoized Wikipedia link generator
  const getWikipediaLink = useCallback((ingredientName) => {
    if (!ingredientName) return "#";
    const formattedName = ingredientName.split(' ')[0];
    return `https://en.wikipedia.org/wiki/${formattedName.replace(/\s+/g, '_')}`;
  }, []);

  // Memoized ingredient classifier
  const classifyIngredient = useCallback((ingredient) => {
    if (!ingredient) return { 
      effect: "Neutral", 
      color: "text-gray-600", 
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    };
    
    const ing = ingredient.toLowerCase();
    
    const classificationMap = {
      // Excellent ingredients
      'niacinamide': 'Excellent',
      'vitamin c': 'Excellent',
      'ascorbic acid': 'Excellent',
      'hyaluronic acid': 'Excellent',
      'glycerin': 'Excellent',
      'panthenol': 'Excellent',
      'ceramide': 'Excellent',
      'peptide': 'Excellent',
      'retinol': 'Excellent',
      'centella': 'Excellent',
      'green tea': 'Excellent',
      'licorice': 'Excellent',
      'zinc oxide': 'Excellent',
      'titanium dioxide': 'Excellent',
      'aloe vera': 'Excellent',
      'shea butter': 'Excellent',
      'jojoba oil': 'Excellent',
      'argan oil': 'Excellent',
      'squalane': 'Excellent',
      
      // Good ingredients
      'glycolic acid': 'Good',
      'lactic acid': 'Good',
      'salicylic acid': 'Good',
      'azelaic acid': 'Good',
      'kojic acid': 'Good',
      'tranexamic acid': 'Good',
      'arbutin': 'Good',
      'vitamin e': 'Good',
      'vitamin b': 'Good',
      'collagen': 'Good',
      'elastin': 'Good',
      'ceramides': 'Good',
      'amino acids': 'Good',
      'antioxidant': 'Good',
      
      // Caution ingredients
      'alcohol': 'Caution',
      'ethanol': 'Caution',
      'isopropyl alcohol': 'Caution',
      'denatured alcohol': 'Caution',
      'fragrance': 'Caution',
      'parfum': 'Caution',
      'perfume': 'Caution',
      'essential oil': 'Caution',
      'limonene': 'Caution',
      'linalool': 'Caution',
      'citral': 'Caution',
      'citronellol': 'Caution',
      'eugenol': 'Caution',
      
      // Harmful ingredients
      'paraben': 'Avoid',
      'methylparaben': 'Avoid',
      'ethylparaben': 'Avoid',
      'propylparaben': 'Avoid',
      'butylparaben': 'Avoid',
      'sls': 'Avoid',
      'sodium lauryl sulfate': 'Avoid',
      'sles': 'Avoid',
      'sodium laureth sulfate': 'Avoid',
      'oxybenzone': 'Avoid',
      'homosalate': 'Avoid',
      'octinoxate': 'Avoid',
      'avobenzone': 'Avoid',
      'formaldehyde': 'Avoid',
      'dmdm hydantoin': 'Avoid',
      'imidazolidinyl urea': 'Avoid',
      'quaternium-15': 'Avoid',
      'triclosan': 'Avoid',
      'toluene': 'Avoid',
      'phthalate': 'Avoid',
      'bha': 'Avoid',
      'bht': 'Avoid'
    };
    
    for (const [key, effect] of Object.entries(classificationMap)) {
      if (ing.includes(key)) {
        const colorMap = {
          'Excellent': { color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
          'Good': { color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
          'Caution': { color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
          'Avoid': { color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" }
        };
        
        return { effect, ...colorMap[effect] };
      }
    }
    
    return { 
      effect: "Neutral", 
      color: "text-gray-600", 
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    };
  }, []);

  // Memoized key ingredients extraction
  const keyIngredients = useMemo(() => {
    if (ingredientsList.length === 0) return [];
    
    const priorityIngredients = [
      'niacinamide', 'retinol', 'vitamin c', 'hyaluronic', 'salicylic',
      'glycolic', 'lactic', 'azelaic', 'peptide', 'ceramide',
      'tranexamic', 'arbutin', 'kojic', 'centella', 'green tea'
    ];
    
    const found = [];
    const ingredientBenefits = {
      'niacinamide': ['Reduces inflammation', 'Minimizes pores', 'Improves barrier function'],
      'retinol': ['Stimulates collagen', 'Reduces wrinkles', 'Improves skin texture'],
      'vitamin c': ['Brightens complexion', 'Protects from free radicals', 'Boosts collagen'],
      'ascorbic': ['Brightens complexion', 'Protects from free radicals', 'Boosts collagen'],
      'hyaluronic': ['Deep hydration', 'Plumps skin', 'Reduces fine lines'],
      'salicylic': ['Unclogs pores', 'Reduces acne', 'Exfoliates skin'],
      'ceramide': ['Strengthens barrier', 'Retains moisture', 'Protects skin'],
      'glycerin': ['Attracts moisture', 'Prevents dryness', 'Soothes skin'],
      'default': ['Contributes to product efficacy', 'Supports formulation stability']
    };
    
    ingredientsList.forEach(ingredient => {
      const ingLower = ingredient.toLowerCase();
      priorityIngredients.forEach(priority => {
        if (ingLower.includes(priority) && !found.some(f => f.name === ingredient)) {
          let benefits = ingredientBenefits.default;
          
          for (const [key, benefitList] of Object.entries(ingredientBenefits)) {
            if (key !== 'default' && ingLower.includes(key)) {
              benefits = benefitList;
              break;
            }
          }
          
          found.push({
            name: ingredient,
            description: 'Active cosmetic ingredient',
            benefits,
            wikipediaLink: getWikipediaLink(ingredient)
          });
        }
      });
    });
    
    if (found.length === 0 && ingredientsList.length > 0) {
      return ingredientsList.slice(0, 3).map(ing => ({
        name: ing,
        description: 'Standard cosmetic ingredient',
        benefits: ['Essential formulation component'],
        wikipediaLink: getWikipediaLink(ing)
      }));
    }
    
    return found.slice(0, 4);
  }, [ingredientsList, getWikipediaLink]);

  // Memoized safety concerns
  const safetyConcerns = useMemo(() => {
    const concernMarkers = {
      'paraben': { concern: 'Potential endocrine disruptor', severity: 'medium' },
      'fragrance': { concern: 'May cause irritation or allergies', severity: 'low' },
      'alcohol denat': { concern: 'Can be drying and damaging to barrier', severity: 'medium' },
      'sls': { concern: 'May strip natural oils and irritate', severity: 'low' },
      'formaldehyde': { concern: 'Known carcinogen and irritant', severity: 'high' },
      'oxybenzone': { concern: 'Potential hormone disruptor', severity: 'medium' },
      'triclosan': { concern: 'Antibacterial linked to resistance', severity: 'medium' }
    };
    
    const ingStr = ingredientsList.join(' ').toLowerCase();
    const concerns = [];
    
    Object.entries(concernMarkers).forEach(([marker, data]) => {
      if (ingStr.includes(marker.toLowerCase())) {
        concerns.push({
          ingredient: marker,
          concern: data.concern,
          severity: data.severity
        });
      }
    });
    
    return concerns.slice(0, 3);
  }, [ingredientsList]);

  // Memoized usage instructions
  const usageInstructions = useMemo(() => {
    const instructions = {
      'Cleanser': [
        'Wet face with lukewarm water',
        'Apply small amount to hands',
        'Massage gently in circular motions',
        'Rinse thoroughly',
        'Pat dry with clean towel'
      ],
      'Moisturizer': [
        'Apply to clean, damp skin',
        'Use upward, outward motions',
        'Focus on dry areas',
        'Allow to absorb fully',
        'Use AM and/or PM'
      ],
      'Serum': [
        'Apply after cleansing, before moisturizer',
        'Use 2-3 drops for face',
        'Pat gently until absorbed',
        'Wait 1-2 minutes before next step',
        'Store in cool, dark place'
      ],
      'Sunscreen': [
        'Apply as final step in morning routine',
        'Use generous amount (1/4 teaspoon for face)',
        'Reapply every 2 hours of sun exposure',
        'Cover all exposed areas',
        'Use daily regardless of weather'
      ]
    };
    
    return instructions[productType] || [
      'Apply as directed on packaging',
      'Perform patch test before full use',
      'Store in cool, dry place',
      'Use consistently for best results',
      'Consult professional for concerns'
    ];
  }, [productType]);

  // Memoized skin type analysis
  const skinTypeAnalysis = useMemo(() => {
    if (!userSkinType) return { compatible: 'not_selected', warnings: [] };
    
    const analysisRules = {
      'oily': {
        positive: ['niacinamide', 'salicylic', 'zinc', 'clay', 'willow bark'],
        negative: ['coconut oil', 'cocoa butter', 'isopropyl myristate', 'heavy oil'],
        warnings: ['Heavy oils may clog pores', 'Rich emollients can cause breakouts']
      },
      'dry': {
        positive: ['hyaluronic', 'glycerin', 'ceramide', 'shea butter', 'squalane'],
        negative: ['alcohol denat', 'sls', 'sodium lauryl sulfate', 'astringent'],
        warnings: ['Drying alcohols can strip moisture', 'Harsh surfactants may irritate']
      },
      'sensitive': {
        positive: ['centella', 'oat', 'allantoin', 'bisabolol', 'chamomile'],
        negative: ['fragrance', 'parfum', 'essential oil', 'alcohol', 'acid'],
        warnings: ['Fragrance may cause reactions', 'Potent acids can irritate']
      },
      'combination': {
        positive: ['niacinamide', 'hyaluronic', 'green tea', 'peptide'],
        negative: [],
        warnings: ['Balance hydration without overloading']
      },
      'normal': {
        positive: [],
        negative: [],
        warnings: []
      }
    };
    
    const rules = analysisRules[userSkinType] || { positive: [], negative: [], warnings: [] };
    const ingStr = ingredientsList.join(' ').toLowerCase();
    
    let score = 0;
    const warnings = [];
    
    rules.positive.forEach(ing => {
      if (ingStr.includes(ing.toLowerCase())) score += 25;
    });
    
    rules.negative.forEach(ing => {
      if (ingStr.includes(ing.toLowerCase())) {
        score -= 30;
        warnings.push(`Contains ${ing} which may not be ideal`);
      }
    });
    
    const compatible = score >= 50 ? 'good' : score >= 0 ? 'moderate' : 'poor';
    
    return { 
      compatible, 
      warnings: warnings.length ? warnings : rules.warnings 
    };
  }, [userSkinType, ingredientsList]);

  // Memoized recommended skin types
  const recommendedSkinTypes = useMemo(() => {
    const concerns = safetyConcerns;
    const ingStr = ingredientsList.join(' ').toLowerCase();
    
    const recommendations = [];
    
    if (!ingStr.includes('alcohol denat') && !ingStr.includes('astringent')) {
      recommendations.push('Dry');
    }
    
    if (!ingStr.includes('coconut oil') && !ingStr.includes('heavy oil')) {
      recommendations.push('Oily');
    }
    
    if (!ingStr.includes('fragrance') && !ingStr.includes('essential oil')) {
      recommendations.push('Sensitive');
    }
    
    if (recommendations.length >= 2) {
      recommendations.push('Combination');
    }
    
    return recommendations.length > 0 ? recommendations : ['All Skin Types'];
  }, [safetyConcerns, ingredientsList]);

  // Memoized product info object
  const productInfo = useMemo(() => ({
    brand: data.brand || "Brand Information",
    name: data.name || "Cosmetic Product",
    description: data.description || "A carefully formulated cosmetic product designed for optimal results.",
    image: data.image || null,
    score: productScore,
    grade: productGrade,
    safetyLevel,
    gradeDescription,
    productType,
    keyIngredients,
    allIngredients: ingredientsList,
    safetyConcerns,
    usageInstructions,
    recommendedSkinTypes,
    source: data.source || data.apiSource || "Cosmetic Database",
    barcode: data.barcode || data.barcode_number || null,
    manufacturer: data.manufacturer || data.brand,
    ingredientsCount,
    concernsCount: safetyConcerns.length
  }), [
    data.brand, data.name, data.description, data.image, data.source, data.barcode, data.manufacturer,
    productScore, productGrade, safetyLevel, gradeDescription, productType, keyIngredients,
    ingredientsList, safetyConcerns, usageInstructions, recommendedSkinTypes, ingredientsCount
  ]);

  // Event handlers
  const handleSkinTypeSelect = useCallback((typeId) => {
    setUserSkinType(typeId);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleExpandIngredients = useCallback(() => {
    setExpandedIngredients(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  // Render functions for tabs
  const renderOverviewTab = useMemo(() => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.score}</div>
          <Typography variant="accent" className="text-gray-600 text-sm">Safety Score</Typography>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.ingredientsCount}</div>
          <Typography variant="accent" className="text-gray-600 text-sm">Ingredients</Typography>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.grade}</div>
          <Typography variant="accent" className="text-gray-600 text-sm">Grade</Typography>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.keyIngredients.length}</div>
          <Typography variant="accent" className="text-gray-600 text-sm">Key Ingredients</Typography>
        </div>
      </div>
      
      {userSkinType && (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
          <Typography variant="subheading" className="text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            <TypingAnimation text={`Compatibility with ${skinTypes.find(t => t.id === userSkinType)?.label} Skin`} speed={40} variant="subheading" />
          </Typography>
          <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium mb-3 ${
            skinTypeAnalysis.compatible === 'good' ? 'bg-emerald-100 text-emerald-800' :
            skinTypeAnalysis.compatible === 'moderate' ? 'bg-amber-100 text-amber-800' :
            skinTypeAnalysis.compatible === 'poor' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {skinTypeAnalysis.compatible === 'good' ? '✅ Good Match' :
             skinTypeAnalysis.compatible === 'moderate' ? '⚠️ Moderate Match' :
             skinTypeAnalysis.compatible === 'poor' ? '❌ Poor Match' :
             'Not Analyzed'}
          </div>
          
          {skinTypeAnalysis.warnings.length > 0 && (
            <div className="space-y-2">
              {skinTypeAnalysis.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start text-gray-700">
                  <span className="text-amber-500 mr-2 mt-1">⚠️</span>
                  <Typography variant="body" className="text-sm">{warning}</Typography>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
        <Typography variant="subheading" className="text-gray-900 mb-3 flex items-center">
          <span className="mr-2">👍</span>
          <TypingAnimation text="Recommended For" speed={40} variant="subheading" />
        </Typography>
        <div className="flex flex-wrap gap-2">
          {productInfo.recommendedSkinTypes.map((type, idx) => (
            <div key={idx} className="bg-white border border-green-300 text-green-800 px-4 py-2 rounded-full font-medium flex items-center">
              <span className="mr-2">✅</span>
              <Typography variant="accent">{type}</Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), [productInfo, userSkinType, skinTypeAnalysis, skinTypes]);

  const renderIngredientsTab = useMemo(() => (
    <div className="space-y-6">
      <div>
        <Typography variant="subheading" className="text-xl text-gray-900 mb-4 flex items-center">
          <span className="text-purple-600 mr-3">🔑</span>
          <TypingAnimation text="Key Active Ingredients" speed={40} variant="subheading" />
        </Typography>
        
        {productInfo.keyIngredients.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {productInfo.keyIngredients.map((ingredient, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Typography variant="subheading" className="text-gray-900 text-lg mb-1 font-bold">
                      {ingredient.name}
                    </Typography>
                    <Typography variant="body" className="text-gray-600 text-sm mb-2">
                      {ingredient.description}
                    </Typography>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {ingredient.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start">
                      <span className="text-green-500 mt-0.5 mr-2">✓</span>
                      <Typography variant="body" className="text-gray-700 text-sm">{benefit}</Typography>
                    </div>
                  ))}
                </div>
                
                <a 
                  href={ingredient.wikipediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  <Typography variant="accent">Learn more on Wikipedia</Typography>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <div className="text-4xl mb-4">🧪</div>
            <Typography variant="body" className="text-gray-600">No key ingredients identified</Typography>
          </div>
        )}
      </div>
      
      {productInfo.allIngredients.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="subheading" className="text-gray-900 flex items-center">
              <span className="mr-3">📋</span>
              <TypingAnimation text="Complete Ingredients List" speed={40} variant="subheading" />
              <span className="ml-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                {productInfo.ingredientsCount} ingredients
              </span>
            </Typography>
            
            {productInfo.allIngredients.length > 12 && (
              <button
                onClick={handleExpandIngredients}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                style={TYPOGRAPHY_CONFIG.button}
              >
                {expandedIngredients ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(expandedIngredients ? productInfo.allIngredients : productInfo.allIngredients.slice(0, 12))
              .map((ingredient, idx) => {
                const classification = classifyIngredient(ingredient);
                return (
                  <a
                    key={idx}
                    href={getWikipediaLink(ingredient)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${classification.bgColor} border ${classification.borderColor} rounded-lg p-3 text-center hover:shadow-md transition-all hover:scale-105`}
                  >
                    <div className={`font-medium ${classification.color} text-xs mb-1 truncate`}>
                      {ingredient}
                    </div>
                    <div className={`text-xs font-bold ${classification.color}`}>
                      {classification.effect}
                    </div>
                  </a>
                );
              })
            }
          </div>
          
          {!expandedIngredients && productInfo.allIngredients.length > 12 && (
            <div className="text-center mt-4">
              <button
                onClick={handleExpandIngredients}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                style={TYPOGRAPHY_CONFIG.button}
              >
                <Typography variant="accent">+ {productInfo.allIngredients.length - 12} more ingredients</Typography>
              </button>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-300">
            <Typography variant="accent" className="text-sm text-gray-700 mb-3">Safety Legend</Typography>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                <Typography variant="body" className="text-xs text-gray-600">Excellent</Typography>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
                <Typography variant="body" className="text-xs text-gray-600">Good</Typography>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                <Typography variant="body" className="text-xs text-gray-600">Caution</Typography>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <Typography variant="body" className="text-xs text-gray-600">Avoid</Typography>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                <Typography variant="body" className="text-xs text-gray-600">Neutral</Typography>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ), [productInfo, expandedIngredients, classifyIngredient, getWikipediaLink, handleExpandIngredients]);

  const renderSafetyTab = useMemo(() => (
    <div className="space-y-6">
      {productInfo.safetyConcerns.length > 0 ? (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
          <Typography variant="subheading" className="text-gray-900 mb-4 flex items-center">
            <span className="text-red-600 mr-3">⚠️</span>
            <TypingAnimation text="Safety Considerations" speed={40} variant="subheading" />
          </Typography>
          <div className="space-y-4">
            {productInfo.safetyConcerns.map((concern, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-start">
                  <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                    concern.severity === 'high' ? 'bg-red-500' :
                    concern.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <Typography variant="subheading" className="text-gray-900 mb-1">
                      {concern.ingredient}
                    </Typography>
                    <Typography variant="body" className="text-gray-700 text-sm">
                      {concern.concern}
                    </Typography>
                    <Typography variant="accent" className="text-gray-500 text-xs mt-2">
                      Severity: {concern.severity.charAt(0).toUpperCase() + concern.severity.slice(1)}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center">
            <span className="text-3xl text-green-500 mr-4">✅</span>
            <div>
              <Typography variant="subheading" className="text-gray-900 mb-1">
                <TypingAnimation text="No Major Safety Concerns" speed={40} variant="subheading" />
              </Typography>
              <Typography variant="body" className="text-gray-700">
                This product has a clean safety profile with no known concerning ingredients.
              </Typography>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
        <Typography variant="subheading" className="text-gray-900 mb-4 flex items-center">
          <span className="text-blue-600 mr-3">💡</span>
          <TypingAnimation text="Safety Tips" speed={40} variant="subheading" />
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <Typography variant="accent" className="text-gray-900 mb-2">Patch Test</Typography>
            <Typography variant="body" className="text-gray-600 text-sm">
              Always patch test new products on your inner arm for 24 hours before full facial application.
            </Typography>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <Typography variant="accent" className="text-gray-900 mb-2">Expiration</Typography>
            <Typography variant="body" className="text-gray-600 text-sm">
              Check expiration dates and discard products that have changed color, consistency, or smell.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  ), [productInfo.safetyConcerns]);

  const renderUsageTab = useMemo(() => (
    <div className="space-y-6">
      <div>
        <Typography variant="subheading" className="text-xl text-gray-900 mb-4 flex items-center">
          <span className="text-blue-600 mr-3">📋</span>
          <TypingAnimation text="How to Use" speed={40} variant="subheading" />
        </Typography>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productInfo.usageInstructions.map((step, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3">
                  {idx + 1}
                </div>
                <Typography variant="accent" className="text-gray-800 font-medium">
                  {step}
                </Typography>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
        <Typography variant="subheading" className="text-gray-900 mb-4 flex items-center">
          <span className="text-purple-600 mr-3">⭐</span>
          <TypingAnimation text="Best Practices" speed={40} variant="subheading" />
        </Typography>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-purple-500 mt-0.5 mr-3">•</span>
            <Typography variant="body" className="text-gray-700">Apply to clean skin for optimal absorption</Typography>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mt-0.5 mr-3">•</span>
            <Typography variant="body" className="text-gray-700">Use sunscreen daily when using active ingredients</Typography>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mt-0.5 mr-3">•</span>
            <Typography variant="body" className="text-gray-700">Introduce one new product at a time</Typography>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mt-0.5 mr-3">•</span>
            <Typography variant="body" className="text-gray-700">Consult a dermatologist for persistent skin concerns</Typography>
          </div>
        </div>
      </div>
    </div>
  ), [productInfo.usageInstructions]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleReset}
            className="group inline-flex items-center text-gray-700 hover:text-purple-700 font-medium text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
            style={TYPOGRAPHY_CONFIG.button}
          >
            <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <Typography variant="accent" className="border-b border-transparent group-hover:border-purple-700 transition-all">
              Back to Scanner
            </Typography>
          </button>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-4 sm:p-8 bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="lg:w-2/5">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  {productInfo.image ? (
                    <img 
                      src={productInfo.image} 
                      alt={productInfo.name}
                      className="w-full h-full object-contain p-6"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <div className="text-6xl sm:text-7xl text-gray-300 mb-4">🧴</div>
                      <Typography variant="accent" className="text-gray-400 text-center font-medium">
                        {productInfo.name}
                      </Typography>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm flex items-center">
                    <span className="mr-2">🏷️</span>
                    <Typography variant="accent">{productInfo.productType}</Typography>
                  </div>
                  
                  {productInfo.barcode && (
                    <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-mono text-sm">
                      <Typography variant="accent">🏷️ {productInfo.barcode.substring(0, 12)}...</Typography>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:w-3/5">
                <div className="mb-6">
                  <div className="inline-block bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold mb-3">
                    <Typography variant="accent">{productInfo.brand}</Typography>
                  </div>
                  <Typography variant="heading" className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-3 leading-tight">
                    <TypingAnimation text={productInfo.name} speed={30} variant="heading" />
                  </Typography>
                  <Typography variant="body" className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    {productInfo.description}
                  </Typography>
                </div>
                
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <SafetyIndicator 
                      score={productInfo.score}
                      safetyLevel={productInfo.safetyLevel}
                      grade={productInfo.grade}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <Typography variant="accent">0</Typography>
                    <Typography variant="accent">Safety Score</Typography>
                    <Typography variant="accent">100</Typography>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Typography variant="subheading" className="text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👤</span>
                    <TypingAnimation text="Select Your Skin Type for Personalized Analysis" speed={40} variant="subheading" />
                  </Typography>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {skinTypes.map((type) => (
                      <SkinTypeButton
                        key={type.id}
                        type={type}
                        isSelected={userSkinType === type.id}
                        onClick={handleSkinTypeSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <TabButton
                  key={tab}
                  tab={tab}
                  isActive={activeTab === tab}
                  onClick={handleTabChange}
                />
              ))}
            </div>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === 'overview' && renderOverviewTab}
            {activeTab === 'ingredients' && renderIngredientsTab}
            {activeTab === 'safety' && renderSafetyTab}
            {activeTab === 'usage' && renderUsageTab}
          </div>
          
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <Typography variant="subheading" className="text-xl text-white mb-2">
                  <TypingAnimation text="Ready to analyze another product?" speed={40} variant="subheading" />
                </Typography>
                <Typography variant="body" className="text-gray-300">
                  Scan more cosmetics for safety, ingredients, and compatibility.
                </Typography>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                style={TYPOGRAPHY_CONFIG.button}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <TypingAnimation text="Scan Another Product" speed={30} variant="accent" />
              </motion.button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <Typography variant="body" className="text-gray-400 text-sm">
                Data analyzed from: <span className="font-medium text-gray-300">{productInfo.source}</span>
              </Typography>
              <Typography variant="body" className="text-gray-500 text-xs mt-2">
                Always perform patch tests and consult professionals for specific concerns
              </Typography>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <Typography variant="accent" className="font-medium">Important Disclaimer</Typography>
          </div>
          <Typography variant="body" className="text-gray-600">
            This analysis is for informational purposes only. Always patch test new products and 
            consult with a dermatologist for specific skincare concerns. Data sourced from {productInfo.source}.
          </Typography>
        </div>
      </div>
    </motion.div>
  );
});

CosmeticResult.displayName = 'CosmeticResult';

export default CosmeticResult;