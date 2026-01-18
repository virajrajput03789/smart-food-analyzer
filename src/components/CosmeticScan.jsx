import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from './FireBase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import CosmeticResult from './CosmeticResult';
import Scanner from './Scanner';
import { motion } from "framer-motion";

// Memoized loading components
const LoadingIndicator = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 border border-gray-200"
  >
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Analyzing Product</h3>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <motion.div 
          className="bg-purple-600 h-2 rounded-full"
          initial={{ width: "10%" }}
          animate={{ width: ["10%", "60%", "90%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <p className="text-gray-600 text-sm mb-2">
        Searching database for barcode: <span className="font-mono font-bold">Loading...</span>
      </p>
      <div className="grid grid-cols-2 gap-3 w-full mt-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-blue-500">🔍</div>
          <p className="text-sm font-medium mt-1">Product Info</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-purple-500">🧪</div>
          <p className="text-sm font-medium mt-1">Ingredients</p>
        </div>
      </div>
    </div>
  </motion.div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

const ErrorDisplay = React.memo(({ error, onRetry }) => (
  <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm">
    <div className="flex items-start">
      <span className="text-yellow-600 text-xl mr-3">⚠️</span>
      <div className="text-left">
        <p className="text-yellow-800 font-medium mb-2">{error}</p>
        <button 
          onClick={onRetry}
          className="text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

const ProductNotFound = React.memo(({ barcode, onReset }) => (
  <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm">
    <div className="flex flex-col items-center">
      <span className="text-red-600 text-3xl mb-3">❌</span>
      <h3 className="text-lg font-bold text-red-700 mb-2">Product Not Found</h3>
      <p className="text-gray-600 mb-4 text-sm">
        This product is not available in our cosmetic databases.
      </p>
      <div className="bg-white p-3 rounded border border-gray-300 mb-4">
        <p className="text-sm text-gray-500">Scanned Barcode:</p>
        <p className="font-mono font-bold text-lg">{barcode}</p>
      </div>
      <button 
        onClick={onReset}
        className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
      >
        Scan Another Product
      </button>
    </div>
  </div>
));

ProductNotFound.displayName = 'ProductNotFound';

const IncompleteData = React.memo(({ barcode, onReset }) => (
  <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm">
    <div className="flex flex-col items-center">
      <span className="text-yellow-600 text-3xl mb-3">⚠️</span>
      <h3 className="text-lg font-bold text-yellow-700 mb-2">Limited Data Available</h3>
      <p className="text-gray-600 mb-3 text-sm text-center">
        This product has incomplete information in the database.
      </p>
      <div className="bg-white p-3 rounded border border-gray-300 mb-4">
        <p className="text-sm text-gray-500">Scanned Barcode:</p>
        <p className="font-mono font-bold text-lg">{barcode}</p>
      </div>
      <button 
        onClick={onReset}
        className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
      >
        Scan Another
      </button>
    </div>
  </div>
));

IncompleteData.displayName = 'IncompleteData';

const StatusIndicator = React.memo(({ loading, productNotFound, incompleteData, barcode }) => (
  <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 max-w-md">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-3 h-3 rounded-full ${
        loading ? 'bg-yellow-500 animate-pulse' :
        productNotFound || incompleteData ? 'bg-red-500' :
        'bg-green-500'
      }`} />
      <div className="text-left">
        <p className="text-sm text-gray-500">Status</p>
        <p className="font-medium text-gray-800">
          {loading ? 'Analyzing...' :
           productNotFound ? 'Product not found' :
           incompleteData ? 'Limited data' :
           'Ready to scan'}
        </p>
      </div>
    </div>
    <div className="text-sm">
      <span className="text-gray-500">Barcode: </span>
      <span className="font-mono font-medium">{barcode}</span>
    </div>
  </div>
));

StatusIndicator.displayName = 'StatusIndicator';

// Constants moved outside component to avoid hook issues
const API_BASE_URL = 'https://cosmetic-backend-proxy.vercel.app';
const IS_PRODUCTION = import.meta.env.PROD;

const CosmeticScan = () => {
    // State with minimal updates
    const [barcode, setBarcode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResultView, setShowResultView] = useState(false);
    const [showScanner, setShowScanner] = useState(true);
    const [productNotFound, setProductNotFound] = useState(false);
    const [incompleteData, setIncompleteData] = useState(false);
    
    // Refs for cleanup
    const abortControllerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Helper functions - moved to useCallback with proper dependencies
    const cleanBarcode = useCallback((rawBarcode) => {
        if (!rawBarcode) return null;
        const cleaned = rawBarcode.toString().replace(/\D/g, '');
        return (cleaned.length >= 8 && cleaned.length <= 13) ? cleaned : null;
    }, []);

    const fetchWithTimeout = useCallback(async (url, timeout = 15000) => {
        // Cancel any existing requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                abortControllerRef.current?.abort();
                reject(new Error('Request timeout. Please check your connection and try again.'));
            }, timeout);
            
            timeoutRef.current = timeoutId;
            
            const finalUrl = url.includes('localhost:3001') 
                ? url.replace('http://localhost:3001', API_BASE_URL)
                : url;
            
            fetch(finalUrl, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                cache: IS_PRODUCTION ? 'default' : 'no-cache'
            })
            .then(async response => {
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found in our databases');
                    } else if (response.status === 429) {
                        throw new Error('Too many requests. Please wait a moment.');
                    } else if (response.status >= 500) {
                        throw new Error('Server error. Please try again later.');
                    } else {
                        throw new Error(`Request failed with status ${response.status}`);
                    }
                }
                
                const data = await response.json();
                resolve(data);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    reject(new Error('Request timeout. Please check your connection and try again.'));
                } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    reject(new Error('Cannot connect to server. Please check your internet connection.'));
                } else {
                    reject(error);
                }
            });
        });
    }, []); // Empty dependency array since we use constants defined outside

    const calculateSafetyScore = useCallback((ingredientsList, description) => {
        let score = 75;
        
        let ingredientsText = '';
        if (ingredientsList && ingredientsList.length > 0) {
            ingredientsText = ingredientsList.join(' ').toLowerCase();
        } else if (description) {
            ingredientsText = description.toLowerCase();
        }

        if (ingredientsText) {
            // Pre-compiled regex patterns for performance
            const safeIngredients = [
                'glycerin', 'glycerol', 'hyaluronic', 'panthenol', 'niacinamide',
                'vitamin c', 'ascorbic', 'retinol', 'ceramide', 'shea butter',
                'jojoba oil', 'argan oil', 'zinc oxide', 'titanium dioxide',
                'aloe vera', 'green tea', 'chamomile', 'licorice', 'centella',
                'squalane', 'peptide', 'coenzyme q10', 'ferulic acid', 'vitamin e',
                'allantoin', 'bisabolol', 'xylitol', 'betaine', 'urea'
            ];
            
            const harmfulIngredients = [
                'paraben', 'methylparaben', 'ethylparaben', 'propylparaben', 'butylparaben',
                'sodium lauryl sulfate', 'sls', 'sodium laureth sulfate', 'sles',
                'alcohol denat', 'denatured alcohol', 'isopropyl alcohol', 'ethanol',
                'fragrance', 'parfum', 'perfume', 'limonene', 'linalool', 'citral',
                'oxybenzone', 'homosalate', 'octinoxate', 'avobenzone',
                'formaldehyde', 'dmdm hydantoin', 'imidazolidinyl urea', 'quaternium-15',
                'triclosan', 'toluene', 'phthalate', 'bha', 'bht'
            ];
            
            // Use includes check with early exit for performance
            safeIngredients.forEach(ing => {
                if (ingredientsText.includes(ing)) score += 1;
            });
            
            harmfulIngredients.forEach(ing => {
                if (ingredientsText.includes(ing)) score -= 2;
            });
        }
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }, []);

    const getSafetyLevel = useCallback((score) => {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Moderate';
        if (score >= 30) return 'Poor';
        return 'Very Poor';
    }, []);

    const getSafetyColor = useCallback((score) => {
        if (score >= 85) return '#10b981';
        if (score >= 70) return '#84cc16';
        if (score >= 50) return '#f59e0b';
        if (score >= 30) return '#f97316';
        return '#ef4444';
    }, []);

    const isValidImageUrl = useCallback((url) => {
        if (!url || typeof url !== 'string') return false;
        if (url.includes('placehold') || url.includes('dummyimage')) return false;
        if (!url.startsWith('http')) return false;
        if (url.length > 500) return false;
        
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    }, []);

    const getBestAvailableImage = useCallback((product) => {
        if (product.incidecoderProductImage?.fullUrl) {
            const url = product.incidecoderProductImage.fullUrl;
            if (isValidImageUrl(url)) return url;
        }
        
        if (product.images && Array.isArray(product.images)) {
            for (const img of product.images) {
                if (isValidImageUrl(img)) return img;
            }
        }
        
        if (product.image && isValidImageUrl(product.image)) {
            return product.image;
        }
        
        return null;
    }, [isValidImageUrl]);

    const fetchProductData = useCallback(async (barcode) => {
        try {
            const response = await fetchWithTimeout(
                `${API_BASE_URL}/api/product/${barcode}`,
                25000
            );

            if (!response.success) {
                throw new Error(response.error || 'Product not found in our databases');
            }

            const barcodeSource = response.barcodeSource || {};
            const incidecoderData = response.incidecoder || {};
            const metadata = response.metadata || {};

            if (!barcodeSource.product && !incidecoderData.success) {
                throw new Error('No product data available');
            }

            const mergedProduct = {
                ...(barcodeSource.product || {}),
                incidecoderProductName: incidecoderData.incidecoderProductName,
                incidecoderBrand: incidecoderData.incidecoderBrand,
                incidecoderIngredientList: incidecoderData.incidecoderIngredientList || [],
                incidecoderProductImage: incidecoderData.incidecoderProductImage,
                incidecoderUrl: incidecoderData.sourceUrl,
                hasCosmeticData: incidecoderData.success || false,
                exactMatch: response.exactMatch || false,
                cleanedProductName: metadata.cleanedProductName,
                searchAttempts: metadata.searchAttempts || [],
                brand: metadata.brand || barcodeSource.product?.brand,
                timestamp: metadata.timestamp,
                title: incidecoderData.incidecoderProductName || 
                       barcodeSource.product?.title || 
                       metadata.cleanedProductName ||
                       'Product'
            };

            return {
                success: true,
                product: mergedProduct
            };

        } catch (err) {
            return { 
                success: false, 
                error: err.message || 'Failed to fetch product data'
            };
        }
    }, [fetchWithTimeout]);

    const saveToFirestore = useCallback(async (productData, currentBarcode) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const scanId = `${user.uid}_${currentBarcode}_${Date.now()}`;
            const docRef = doc(db, 'cosmeticScans', scanId);
            
            const dataToSave = {
                userId: user.uid,
                id: scanId,
                barcode: currentBarcode,
                productName: productData.name,
                name: productData.name,
                brand: productData.brand || '',
                image: productData.image || '',
                safetyScore: productData.safety_score || 0,
                safetyLevel: productData.safety_level || 'Unknown',
                safety_score: productData.safety_score || 0,
                safety_level: productData.safety_level || 'Unknown',
                type: 'cosmetic',
                timestamp: serverTimestamp(),
                scannedAt: serverTimestamp(),
                category: productData.category || '',
                exactMatch: productData.exactMatch || false,
                apiSource: productData.apiSource || ''
            };
            
            await setDoc(docRef, dataToSave);
        } catch (error) {
            // Silently fail
        }
    }, []);

    // Optimized scan handler
    const handleScan = useCallback((scannedBarcode) => {
        const cleaned = cleanBarcode(scannedBarcode);
        
        if (!cleaned) {
            setError(`"${scannedBarcode}" is not a valid barcode. Please scan an 8-13 digit barcode.`);
            return;
        }
        
        // Batch state updates
        setShowScanner(false);
        setBarcode(cleaned);
        setResult(null);
        setError('');
        setLoading(true);
        setShowResultView(false);
        setProductNotFound(false);
        setIncompleteData(false);
    }, [cleanBarcode]);

    // Main effect with cleanup
    useEffect(() => {
        let isMounted = true;
        
        const executeDataFetch = async () => {
            if (!barcode || !loading) return;

            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
                const apiResult = await fetchProductData(barcode);
                
                if (!isMounted) return;
                
                if (!apiResult.success) {
                    setProductNotFound(true);
                    setLoading(false);
                    return;
                }

                const product = apiResult.product;
                
                if (!product.title && !product.incidecoderProductName) {
                    setIncompleteData(true);
                    setLoading(false);
                    return;
                }

                const productName = product.incidecoderProductName || 
                                   product.title || 
                                   'Product';
                
                const brand = product.incidecoderBrand || 
                             product.brand || 
                             product.manufacturer || 
                             'Brand';
                
                const bestImage = getBestAvailableImage(product);
                const ingredients = product.incidecoderIngredientList || [];
                const hasRealIngredients = ingredients.length > 0;
                const safetyScore = calculateSafetyScore(ingredients, product.description);
                const safetyLevel = getSafetyLevel(safetyScore);
                const safetyColor = getSafetyColor(safetyScore);

                const sources = [];
                if (product.hasCosmeticData) sources.push('INCIDecoder');
                if (sources.length === 0 && product.title) sources.push('UPCitemDB');

                const processedData = {
                    name: productName,
                    brand: brand,
                    description: product.description || 'No description available for this product.',
                    image: bestImage,
                    hasImage: !!bestImage,
                    category: product.category || '',
                    ingredients: ingredients,
                    hasIngredients: ingredients.length > 0,
                    hasRealIngredients: hasRealIngredients,
                    safety_score: safetyScore,
                    score: safetyScore,
                    safety_level: safetyLevel,
                    safety_color: safetyColor,
                    apiSource: sources.join(' + '),
                    source: sources.join(' + '),
                    hasCosmeticData: product.hasCosmeticData || false,
                    exactMatch: product.exactMatch || false,
                    sources: sources,
                    incidecoder_url: product.incidecoderUrl || '',
                    barcode_number: barcode,
                    barcode: barcode,
                    upc: product.upc || barcode,
                    manufacturer: product.manufacturer || brand,
                    timestamp: new Date().toISOString(),
                    scanDate: new Date().toLocaleDateString()
                };

                setResult(processedData);
                saveToFirestore(processedData, barcode);
                setLoading(false);
                setShowResultView(true);
                
            } catch (err) {
                if (!isMounted) return;
                setProductNotFound(true);
                setLoading(false);
            }
        };

        executeDataFetch();

        return () => {
            isMounted = false;
            // Cleanup any pending requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [barcode, loading, fetchProductData, getBestAvailableImage, calculateSafetyScore, getSafetyLevel, getSafetyColor, saveToFirestore]);

    // Reset handler
    const handleReset = useCallback(() => {
        // Cleanup any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Batch state updates
        setBarcode('');
        setResult(null);
        setError('');
        setLoading(false);
        setShowResultView(false);
        setShowScanner(true);
        setProductNotFound(false);
        setIncompleteData(false);
    }, []);

    const handleRetry = useCallback(() => {
        setError('');
        setShowScanner(true);
    }, []);

    // Early return for result view - MUST BE AFTER ALL HOOKS
    if (showResultView && result) {
        return <CosmeticResult data={result} onReset={handleReset} />;
    }

    // Render logic
    return (
        <div className="flex flex-col min-h-screen bg-white text-gray-800">
            <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 text-center">
                <h1 className="text-3xl font-bold text-purple-700 mb-4">Cosmetic Scanner</h1>
                <p className="text-gray-600 mb-6">
                    Scan cosmetic product barcode to analyze ingredients and safety.
                </p>

                {showScanner && !loading && !productNotFound && !incompleteData && (
                    <div className="w-full max-w-md">
                        <div className="border rounded-md overflow-hidden shadow-md">
                            <Scanner onScan={handleScan} borderColor="purple" />
                        </div>
                        <p className="mt-3 text-sm text-gray-500">
                            Align barcode within the frame to scan
                        </p>
                    </div>
                )}
                
                {loading && <LoadingIndicator />}
                
                {error && !loading && <ErrorDisplay error={error} onRetry={handleRetry} />}
                
                {productNotFound && !loading && <ProductNotFound barcode={barcode} onReset={handleReset} />}
                
                {incompleteData && !loading && <IncompleteData barcode={barcode} onReset={handleReset} />}
                
                {barcode && (
                    <StatusIndicator 
                        loading={loading}
                        productNotFound={productNotFound}
                        incompleteData={incompleteData}
                        barcode={barcode}
                    />
                )}
                
                {!loading && showScanner && !productNotFound && !incompleteData && (
                    <div className="mt-6 text-sm text-gray-500 max-w-md">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="font-medium text-blue-700 mb-1">How to use:</p>
                            <ul className="text-left space-y-1">
                                <li>• Point camera at cosmetic product barcode</li>
                                <li>• Hold steady until scan completes</li>
                                <li>• View ingredient analysis and safety score</li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default React.memo(CosmeticScan);