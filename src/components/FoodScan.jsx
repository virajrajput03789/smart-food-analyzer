import React, { useState, useCallback, useRef, useMemo, memo, useEffect, lazy, Suspense } from 'react';
import { db, auth } from "./FireBase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { NutritionScore } from "./NutritionScore";
import { motion, AnimatePresence } from "framer-motion";
import { isFoodBarcode } from '../utils/barcodeValidator';

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

  useEffect(() => {
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

  useEffect(() => {
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
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-green-400 to-emerald-600"
        />
      )}
      {isComplete && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-green-400 to-emerald-600"
        />
      )}
    </div>
  );
});

TypingAnimation.displayName = 'TypingAnimation';

// ============================================
// MAIN COMPONENT CODE
// ============================================

// Lazy load heavy components
const Scanner = lazy(() => import('../components/Scanner'));
const FoodResultCard = lazy(() => import("./FoodResultCard"));

// Memoized loading indicator with optimized animations
const LoadingIndicator = memo(({ barcode }) => {
  const dots = useMemo(() => [0, 1, 2], []);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 border border-gray-200"
    >
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
          <motion.div
            className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <Typography variant="subheading" className="text-gray-800 mb-2 font-bold">
          <TypingAnimation text="Fetching Product Data" speed={40} variant="subheading" />
        </Typography>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ 
              width: ["0%", "60%", "90%", "100%"],
              transition: { duration: 2, ease: "easeInOut" }
            }}
          />
        </div>
        <Typography variant="body" className="text-gray-600 text-sm mb-2">
          Searching for: <span className="font-mono font-bold text-green-700">{barcode}</span>
        </Typography>
        <div className="flex space-x-1">
          {dots.map((dot) => (
            <motion.span
              key={dot}
              className="w-1 h-1 bg-gray-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                delay: dot * 0.2 
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

LoadingIndicator.displayName = 'LoadingIndicator';

// Optimized warning message
const WarningMessage = memo(({ warning, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-md bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-5 shadow-sm"
  >
    <div className="flex items-start">
      <motion.span 
        className="text-yellow-600 text-xl mr-3"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        ⚠️
      </motion.span>
      <div className="text-left">
        <Typography variant="accent" className="text-yellow-800 font-medium mb-2">{warning}</Typography>
        <button 
          onClick={onRetry}
          className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow hover:shadow-md active:scale-95"
          style={TYPOGRAPHY_CONFIG.button}
        >
          Scan Again
        </button>
      </div>
    </div>
  </motion.div>
));

WarningMessage.displayName = 'WarningMessage';

// Optimized product not found
const ProductNotFound = memo(({ barcode, onReset }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full max-w-md bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-6 shadow-sm"
  >
    <div className="flex flex-col items-center">
      <motion.span 
        className="text-red-600 text-4xl mb-3"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5 }}
      >
        ❌
      </motion.span>
      <Typography variant="subheading" className="text-red-700 mb-2 font-bold">
        Product Not Found
      </Typography>
      <Typography variant="body" className="text-gray-600 mb-4 text-sm text-center">
        We couldn't find this product in our database.
      </Typography>
      <div className="bg-white p-4 rounded-lg border border-gray-300 mb-4 w-full">
        <Typography variant="accent" className="text-sm text-gray-500 mb-1">Scanned Barcode:</Typography>
        <Typography variant="body" className="font-mono font-bold text-xl text-gray-800">{barcode}</Typography>
      </div>
      <button 
        onClick={onReset}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 font-medium w-full"
        style={TYPOGRAPHY_CONFIG.button}
      >
        Scan Another Product
      </button>
    </div>
  </motion.div>
));

ProductNotFound.displayName = 'ProductNotFound';

// Optimized incomplete data
const IncompleteData = memo(({ barcode, onReset }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="w-full max-w-md bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6 shadow-sm"
  >
    <div className="flex flex-col items-center">
      <motion.span 
        className="text-yellow-600 text-4xl mb-3"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 0.5, repeat: 1 }}
      >
        ⚠️
      </motion.span>
      <Typography variant="subheading" className="text-yellow-700 mb-2 font-bold">
        Limited Data Available
      </Typography>
      <Typography variant="body" className="text-gray-600 mb-3 text-sm text-center">
        This product has incomplete nutrition information in our database.
      </Typography>
      <div className="bg-white p-4 rounded-lg border border-gray-300 mb-4 w-full">
        <Typography variant="accent" className="text-sm text-gray-500 mb-1">Scanned Barcode:</Typography>
        <Typography variant="body" className="font-mono font-bold text-xl text-gray-800">{barcode}</Typography>
      </div>
      <button 
        onClick={onReset}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 font-medium w-full"
        style={TYPOGRAPHY_CONFIG.button}
      >
        Scan Another Product
      </button>
    </div>
  </motion.div>
));

IncompleteData.displayName = 'IncompleteData';

// Optimized status indicator
const StatusIndicator = memo(({ isLoading, saved, barcode }) => {
  const statusColor = useMemo(() => 
    isLoading ? 'bg-yellow-500' : saved ? 'bg-green-500' : 'bg-blue-500',
    [isLoading, saved]
  );
  
  const statusText = useMemo(() => 
    isLoading ? 'Fetching data...' : saved ? 'Analysis complete' : 'Ready to scan',
    [isLoading, saved]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 max-w-md w-full"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${statusColor} ${isLoading ? 'animate-pulse' : ''}`} />
          {isLoading && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-yellow-300 animate-ping" />
          )}
        </div>
        <div className="text-left">
          <Typography variant="accent" className="text-sm text-gray-500">Status</Typography>
          <Typography variant="body" className="font-medium text-gray-800">
            {statusText}
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Typography variant="accent" className="text-gray-500">Barcode:</Typography>
        <Typography variant="body" className="font-mono font-medium bg-gray-200 px-2 py-1 rounded">{barcode}</Typography>
      </div>
    </motion.div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

// Optimized help text
const HelpText = memo(() => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="mt-6 text-sm text-gray-500 max-w-md w-full"
  >
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
      <Typography variant="accent" className="text-blue-700 mb-2 flex items-center gap-2">
        <span>📋</span> How to use:
      </Typography>
      <ul className="text-left space-y-2">
        {[
          "Point camera at product barcode",
          "Hold steady until scan completes",
          "View nutrition score and analysis"
        ].map((item, idx) => (
          <motion.li 
            key={idx}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + idx * 0.1 }}
          >
            <span className="text-blue-500">•</span>
            <Typography variant="body" className="text-sm">{item}</Typography>
          </motion.li>
        ))}
      </ul>
    </div>
  </motion.div>
));

HelpText.displayName = 'HelpText';

// Scanner placeholder while loading
const ScannerPlaceholder = memo(() => (
  <div className="w-full max-w-md h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center animate-pulse">
    <div className="text-center">
      <div className="text-3xl mb-2">📷</div>
      <Typography variant="body" className="text-gray-500">Loading scanner...</Typography>
    </div>
  </div>
));

ScannerPlaceholder.displayName = 'ScannerPlaceholder';

const FoodScan = memo(({ scanType }) => {
  // State optimizations - group related states
  const [scanState, setScanState] = useState({
    data: '',
    saved: false,
    image: null,
    nutrients: null,
    productName: '',
    score: null,
    isIncomplete: false,
    productNotFound: false,
    warning: '',
    isLoading: false,
    showScanner: true,
  });

  // Individual state setters for optimization
  const updateScanState = useCallback((updates) => {
    setScanState(prev => ({ ...prev, ...updates }));
  }, []);

  // Refs for cleanup and performance
  const abortControllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastScannedRef = useRef('');

  // Memoized reset function
  const handleReset = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    // Batch state reset
    updateScanState({
      data: '',
      saved: false,
      image: null,
      nutrients: null,
      productName: '',
      score: null,
      isIncomplete: false,
      productNotFound: false,
      warning: '',
      isLoading: false,
      showScanner: true,
    });
    
    lastScannedRef.current = '';
  }, [updateScanState]);

  // Optimized barcode validation with memoization
  const validateBarcode = useCallback((barcode) => {
    if (!barcode || typeof barcode !== 'string') return false;
    const cleaned = barcode.replace(/\D/g, '');
    return cleaned.length >= 8 && cleaned.length <= 13;
  }, []);

  // Debounced scan handler to prevent multiple scans
  const handleScan = useCallback((scannedBarcode) => {
    if (!validateBarcode(scannedBarcode) || 
        scanState.isLoading || 
        scanState.saved || 
        lastScannedRef.current === scannedBarcode) return;
    
    const cleanedBarcode = scannedBarcode.replace(/\D/g, '');
    lastScannedRef.current = cleanedBarcode;
    
    // Batch state updates
    updateScanState({
      data: cleanedBarcode,
      showScanner: false,
      isLoading: true,
      saved: false,
      productNotFound: false,
      isIncomplete: false,
      warning: '',
    });
  }, [validateBarcode, scanState.isLoading, scanState.saved, updateScanState]);

  // Optimized fetch function with caching
  const fetchProductData = useCallback(async (barcode) => {
    if (!barcode || scanType === "cosmetic") return null;
    
    // Validate food barcode
    if (!isFoodBarcode(barcode)) {
      return { error: "⚠️ This barcode does not belong to a food product." };
    }

    // Create abort controller for request cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      // Add a small delay for better UX and to prevent too rapid requests
      await new Promise(resolve => {
        fetchTimeoutRef.current = setTimeout(resolve, 100);
      });

      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { 
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'max-age=300', // 5 minute cache
          }
        }
      );
      
      if (!res.ok) {
        if (res.status === 404) {
          return { notFound: true };
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const json = await res.json();
      
      if (!json.product) {
        return { notFound: true };
      }

      const nutriments = json.product.nutriments || {};
      
      // Optimized nutrient extraction
      const nutrientsData = {
        calories: nutriments['energy-kcal'] || nutriments.energy_kcal || 0,
        energy: nutriments['energy-kj'] || 0,
        sugars: nutriments.sugars || 0,
        saturatedFat: nutriments['saturated-fat'] || 0,
        sodium: nutriments.sodium || 0,
        fiber: nutriments.fiber || 0,
        protein: nutriments.proteins || 0,
      };

      // Check if we have any data using efficient calculation
      const hasData = Object.values(nutrientsData).some(val => val > 0);
      
      if (!hasData) {
        return { incomplete: true };
      }

      // Calculate score
      const scoreResult = NutritionScore(nutrientsData);
      
      return {
        success: true,
        image: json.product.image_url || null,
        productName: json.product.product_name || 'Unknown Product',
        score: scoreResult,
        nutrients: nutrientsData
      };
      
    } catch (error) {
      if (error.name === 'AbortError') {
        return null; // Request was cancelled
      }
      console.error('Fetch error:', error);
      return { notFound: true };
    } finally {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    }
  }, [scanType]);

  // Optimized save to database with batching
  const saveToDatabase = useCallback(async (productData, barcode) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Batch database operations
      const batchPromises = [];
      
      const docRef = doc(db, 'scans', `${user.uid}_${barcode}`);
      batchPromises.push(
        setDoc(docRef, {
          barcode: barcode,
          productName: productData.productName,
          imageUrl: productData.image,
          nutrients: productData.nutrients,
          score: productData.score,
          scannedAt: serverTimestamp(),
        })
      );

      batchPromises.push(
        addDoc(collection(db, 'scanHistory'), {
          uid: user.uid,
          productName: productData.productName,
          barcode: barcode,
          nutritionScore: productData.score,
          image: productData.image || null,
          timestamp: serverTimestamp(),
        })
      );
      
      // Execute all promises
      await Promise.allSettled(batchPromises);
      
    } catch (error) {
      console.warn("Database save warning:", error);
      // Non-critical error, don't break the flow
    }
  }, []);

  // Main effect for data fetching with cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    const processBarcode = async () => {
      if (!scanState.data || !scanState.isLoading) return;

      const result = await fetchProductData(scanState.data);
      
      if (!isMountedRef.current || !result) return;

      // Batch state updates based on result
      if (result.error) {
        updateScanState({
          warning: result.error,
          saved: true,
          isLoading: false,
        });
      } else if (result.notFound) {
        updateScanState({
          productNotFound: true,
          saved: true,
          isLoading: false,
        });
      } else if (result.incomplete) {
        updateScanState({
          isIncomplete: true,
          saved: true,
          isLoading: false,
        });
      } else if (result.success) {
        const user = auth.currentUser;
        
        // Update all state at once
        const updates = {
          image: result.image,
          productName: result.productName,
          score: result.score,
          nutrients: result.nutrients,
          saved: true,
          isLoading: false,
        };
        
        // Save to database if logged in (non-blocking)
        if (user) {
          saveToDatabase({
            productName: result.productName,
            image: result.image,
            nutrients: result.nutrients,
            score: result.score
          }, scanState.data).catch(console.error);
        }
        
        updateScanState(updates);
      }
    };

    processBarcode();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [scanState.data, scanState.isLoading, fetchProductData, saveToDatabase, updateScanState]);

  // Memoized render logic
  const renderScanner = useMemo(() => (
    scanState.showScanner && !scanState.saved && !scanState.isLoading && (
      <div className="w-full max-w-md">
        <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Suspense fallback={<ScannerPlaceholder />}>
            <Scanner onScan={handleScan} borderColor="green" />
          </Suspense>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-gray-500"
        >
          <Typography variant="accent">Align barcode within the frame to scan</Typography>
        </motion.p>
      </div>
    )
  ), [scanState.showScanner, scanState.saved, scanState.isLoading, handleScan]);

  const renderResults = useMemo(() => (
    scanState.saved && scanState.score && !scanState.isLoading && (
      <Suspense fallback={<LoadingIndicator barcode={scanState.data} />}>
        <FoodResultCard
          score={scanState.score}
          image={scanState.image}
          productName={scanState.productName}
          nutrients={scanState.nutrients}
          onReset={handleReset}
        />
      </Suspense>
    )
  ), [scanState.saved, scanState.score, scanState.isLoading, scanState.image, scanState.productName, scanState.nutrients, scanState.data, handleReset]);

  // Memoized main render
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
      <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Typography variant="heading" className="text-2xl sm:text-3xl bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
            Scan a Product
          </Typography>
          <Typography variant="body" className="text-gray-600 text-sm sm:text-base max-w-md">
            Point your camera at a barcode to scan and analyze nutritional information.
          </Typography>
        </motion.div>

        <AnimatePresence mode="wait">
          {scanState.isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingIndicator barcode={scanState.data} />
            </motion.div>
          )}
          
          {scanState.warning && !scanState.isLoading && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <WarningMessage warning={scanState.warning} onRetry={handleReset} />
            </motion.div>
          )}
          
          {scanState.productNotFound && !scanState.isLoading && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <ProductNotFound barcode={scanState.data} onReset={handleReset} />
            </motion.div>
          )}
          
          {scanState.isIncomplete && !scanState.isLoading && (
            <motion.div
              key="incomplete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <IncompleteData barcode={scanState.data} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        {renderScanner}
        {renderResults}
        
        {scanState.data && (
          <StatusIndicator 
            isLoading={scanState.isLoading} 
            saved={scanState.saved} 
            barcode={scanState.data} 
          />
        )}
        
        {!scanState.saved && !scanState.isLoading && scanState.showScanner && <HelpText />}
      </main>
    </div>
  );
});

FoodScan.displayName = 'FoodScan';

export default FoodScan;