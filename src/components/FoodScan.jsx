import React, { useState, useEffect } from 'react';
import { db, auth } from "./FireBase";
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { NutritionScore } from "./NutritionScore";
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';
import { isFoodBarcode } from '../utils/barcodeValidator';
import Scanner from '../components/Scanner';
import FoodResultCard from "./FoodResultCard";

const FoodScan = ({ scanType }) => {
  const [data, setData] = useState('Not Found');
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(null);
  const [nutrients, setNutrients] = useState(null);
  const [productName, setProductName] = useState('');
  const [score, setScore] = useState(null);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [warning, setWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const location = useLocation();

  // Simple reset function
  const handleReset = () => {
    setData('Not Found');
    setSaved(false);
    setImage(null);
    setNutrients(null);
    setProductName('');
    setScore(null);
    setIsIncomplete(false);
    setProductNotFound(false);
    setWarning('');
    setIsLoading(false);
    setShowScanner(true);
  };

  // Handle barcode scan
  const handleScan = (barcode) => {
    if (barcode && barcode !== data && !isLoading && !saved) {
      setData(barcode);
      setShowScanner(false); // Camera stop
      setIsLoading(true);
    }
  };

  // Fetch data when barcode is scanned
  useEffect(() => {
    const fetchData = async () => {
      if (data === 'Not Found' || !isLoading || scanType === "cosmetic") return;

      const user = auth.currentUser;
      
      // Check if barcode is valid
      if (!isFoodBarcode(data)) {
        setWarning("⚠️ This barcode does not belong to a food product.");
        setIsLoading(false);
        setSaved(true);
        return;
      }

      try {
        // Show loading for 1 second minimum for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
        const json = await res.json();
        
        if (!json.product) {
          setProductNotFound(true);
          setSaved(true);
          setIsLoading(false);
          return;
        }

        const nutriments = json.product.nutriments || {};
        const nutrientsData = {
          calories: nutriments['energy-kcal'] || nutriments.energy_kcal || 0,
          energy: nutriments['energy-kj'] || 0,
          sugars: nutriments.sugars || 0,
          saturatedFat: nutriments['saturated-fat'] || 0,
          sodium: nutriments.sodium || 0,
          fiber: nutriments.fiber || 0,
          protein: nutriments.proteins || 0,
        };

        // Check if we have any data
        const hasData = Object.values(nutrientsData).some(val => val > 0);
        
        if (!hasData) {
          setIsIncomplete(true);
          setSaved(true);
          setIsLoading(false);
          return;
        }

        // Calculate score
        const scoreResult = NutritionScore(nutrientsData);
        
        // Update states
        setImage(json.product.image_url || null);
        setProductName(json.product.product_name || 'Unknown Product');
        setScore(scoreResult);
        setNutrients(nutrientsData);

        // Save to database if user is logged in
        if (user) {
          try {
            const docRef = doc(db, 'scans', `${user.uid}_${data}`);
            await setDoc(docRef, {
              barcode: data,
              productName: json.product.product_name || 'Unnamed Product',
              imageUrl: json.product.image_url || null,
              nutrients: nutrientsData,
              score: scoreResult,
              isIncomplete: !hasData,
              scannedAt: serverTimestamp(),
            });

            await addDoc(collection(db, 'scanHistory'), {
              uid: user.uid,
              productName: json.product.product_name || 'Unknown Product',
              barcode: data,
              nutritionScore: scoreResult,
              image: json.product.image_url || null,
              timestamp: serverTimestamp(),
            });
          } catch (error) {
            console.warn("Could not save to database:", error);
          }
        }

        setSaved(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error:', error);
        setProductNotFound(true);
        setSaved(true);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [data, isLoading, scanType]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Scan a Product</h1>
        <p className="text-gray-600 mb-6">
          Point your camera at a barcode to scan and analyze the product.
        </p>

        {/* Scanner - Only show when needed */}
        {showScanner && !saved && !isLoading && (
          <div className="w-full max-w-md">
            <div className="border rounded-md overflow-hidden shadow-md">
              <Scanner onScan={handleScan} borderColor="green" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Align barcode within the frame to scan
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 border border-gray-200"
          >
            <div className="flex flex-col items-center">
              {/* Spinner */}
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">Fetching Product Data</h3>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div 
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: "10%" }}
                  animate={{ width: ["10%", "60%", "90%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <p className="text-gray-600 text-sm mb-2">
                Searching database for barcode: <span className="font-mono font-bold">{data}</span>
              </p>
              
              <p className="text-gray-500 text-xs">
                Please wait while we analyze the product...
              </p>
            </div>
          </motion.div>
        )}

        {/* Warning Message */}
        {warning && !isLoading && (
          <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-start">
              <span className="text-yellow-600 text-xl mr-3">⚠️</span>
              <div className="text-left">
                <p className="text-yellow-800 font-medium mb-2">{warning}</p>
                <button 
                  onClick={handleReset}
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Scan Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Not Found */}
        {productNotFound && !isLoading && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-red-600 text-3xl mb-3">❌</span>
              <h3 className="text-lg font-bold text-red-700 mb-2">Product Not Found</h3>
              <p className="text-gray-600 mb-4 text-sm">
                This product is not available in our database.
              </p>
              <button 
                onClick={handleReset}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}

        {/* Incomplete Data */}
        {isIncomplete && !isLoading && (
          <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-yellow-600 text-3xl mb-3">⚠️</span>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Limited Data Available</h3>
              <p className="text-gray-600 mb-3 text-sm text-center">
                This product has incomplete nutrition information in the database.
              </p>
              <div className="bg-white p-3 rounded border border-gray-300 mb-4">
                <p className="text-sm text-gray-500">Scanned Barcode:</p>
                <p className="font-mono font-bold text-lg">{data}</p>
              </div>
              <button 
                onClick={handleReset}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {saved && score && !isLoading && (
          <FoodResultCard
            score={score}
            image={image}
            productName={productName}
            nutrients={nutrients}
            onReset={handleReset}
          />
        )}

        {/* Current Status */}
        {data !== 'Not Found' && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                isLoading ? 'bg-yellow-500 animate-pulse' :
                saved ? 'bg-green-500' :
                'bg-blue-500'
              }`} />
              <div className="text-left">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-gray-800">
                  {isLoading ? 'Fetching data...' :
                   saved ? 'Analysis complete' :
                   'Ready to scan'}
                </p>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Barcode: </span>
              <span className="font-mono font-medium">{data}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!saved && !isLoading && showScanner && (
          <div className="mt-6 text-sm text-gray-500 max-w-md">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-700 mb-1">How to use:</p>
              <ul className="text-left space-y-1">
                <li>• Point camera at product barcode</li>
                <li>• Hold steady until scan completes</li>
                <li>• View nutrition score and analysis</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodScan;
