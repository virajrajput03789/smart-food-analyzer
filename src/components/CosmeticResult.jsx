import React, { useState } from "react";
import { motion } from "framer-motion";

const CosmeticResult = ({ data, onReset }) => {
  const [expandedIngredients, setExpandedIngredients] = useState(false);
  const [userSkinType, setUserSkinType] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">No Product Data Found</h2>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          Could not load cosmetic product information. Please try scanning again or check your connection.
        </p>
        <button
          onClick={onReset}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        >
          ← Back to Product Scanner
        </button>
      </div>
    );
  }

  // ✅ Generate Wikipedia link for ingredients
  const getWikipediaLink = (ingredientName) => {
    if (!ingredientName) return "#";
    const formattedName = ingredientName.split(' ')[0];
    return `https://en.wikipedia.org/wiki/${formattedName.replace(/\s+/g, '_')}`;
  };

  // ✅ Dynamic grade calculation
  const calculateGrade = (score) => {
    if (score === undefined || score === null) return "N/A";
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  // ✅ Dynamic safety color
  const getSafetyColor = (score) => {
    if (score === undefined || score === null) return "from-gray-400 to-gray-500";
    if (score >= 80) return "from-emerald-500 to-green-500";
    if (score >= 60) return "from-green-400 to-lime-400";
    if (score >= 40) return "from-yellow-400 to-amber-400";
    return "from-red-400 to-pink-400";
  };

  // ✅ Dynamic safety level text
  const getSafetyLevel = (score) => {
    if (score === undefined || score === null) return "Not Rated";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Moderate";
    if (score >= 50) return "Fair";
    if (score >= 40) return "Poor";
    return "Very Poor";
  };

  // ✅ Dynamic grade description
  const getGradeDescription = (grade) => {
    const descriptions = {
      'A+': 'Outstanding safety profile with beneficial ingredients',
      'A': 'Excellent safety with high-quality ingredients',
      'B': 'Good safety with minor concerns',
      'C': 'Moderate safety, some caution advised',
      'D': 'Below average safety, significant concerns',
      'F': 'Poor safety, consider alternatives',
      'N/A': 'Safety data not available'
    };
    return descriptions[grade] || 'Safety assessment available';
  };

  // ✅ Smart ingredient classification
  const classifyIngredient = (ingredient) => {
    if (!ingredient) return { 
      effect: "Neutral", 
      color: "text-gray-600", 
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    };
    
    const ing = ingredient.toLowerCase();
    
    // Excellent ingredients
    const excellentIngredients = [
      'niacinamide', 'vitamin c', 'ascorbic acid', 'hyaluronic acid', 
      'glycerin', 'panthenol', 'ceramide', 'peptide', 'retinol', 
      'centella', 'green tea', 'licorice', 'zinc oxide', 'titanium dioxide',
      'aloe vera', 'shea butter', 'jojoba oil', 'argan oil', 'squalane'
    ];
    
    // Good ingredients
    const goodIngredients = [
      'glycolic acid', 'lactic acid', 'salicylic acid', 'azelaic acid',
      'kojic acid', 'tranexamic acid', 'arbutin', 'vitamin e', 'vitamin b',
      'collagen', 'elastin', 'ceramides', 'amino acids', 'antioxidant'
    ];
    
    // Caution ingredients
    const cautionIngredients = [
      'alcohol', 'ethanol', 'isopropyl alcohol', 'denatured alcohol',
      'fragrance', 'parfum', 'perfume', 'essential oil', 'limonene',
      'linalool', 'citral', 'citronellol', 'eugenol'
    ];
    
    // Harmful ingredients
    const harmfulIngredients = [
      'paraben', 'methylparaben', 'ethylparaben', 'propylparaben', 
      'butylparaben', 'sls', 'sodium lauryl sulfate', 'sles', 
      'sodium laureth sulfate', 'oxybenzone', 'homosalate', 'octinoxate',
      'avobenzone', 'formaldehyde', 'dmdm hydantoin', 'imidazolidinyl urea',
      'quaternium-15', 'triclosan', 'toluene', 'phthalate', 'bha', 'bht'
    ];
    
    for (const excellent of excellentIngredients) {
      if (ing.includes(excellent)) {
        return { 
          effect: "Excellent", 
          color: "text-emerald-600", 
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200"
        };
      }
    }
    
    for (const good of goodIngredients) {
      if (ing.includes(good)) {
        return { 
          effect: "Good", 
          color: "text-green-600", 
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      }
    }
    
    for (const caution of cautionIngredients) {
      if (ing.includes(caution)) {
        return { 
          effect: "Caution", 
          color: "text-amber-600", 
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200"
        };
      }
    }
    
    for (const harmful of harmfulIngredients) {
      if (ing.includes(harmful)) {
        return { 
          effect: "Avoid", 
          color: "text-red-600", 
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      }
    }
    
    return { 
      effect: "Neutral", 
      color: "text-gray-600", 
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    };
  };

  // ✅ Skin type analysis based on ingredients
  const analyzeForSkinType = (skinType, ingredients = []) => {
    if (!ingredients.length) return { compatible: 'unknown', warnings: [] };
    
    const ingStr = ingredients.join(' ').toLowerCase();
    
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
      }
    };
    
    const rules = analysisRules[skinType] || { positive: [], negative: [], warnings: [] };
    
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
    
    return { compatible, warnings: warnings.length ? warnings : rules.warnings };
  };

  // ✅ Extract key ingredients
  const getKeyIngredients = () => {
    if (!data.ingredients || !Array.isArray(data.ingredients)) return [];
    
    const priorityIngredients = [
      'niacinamide', 'retinol', 'vitamin c', 'hyaluronic', 'salicylic',
      'glycolic', 'lactic', 'azelaic', 'peptide', 'ceramide',
      'tranexamic', 'arbutin', 'kojic', 'centella', 'green tea'
    ];
    
    const found = [];
    
    data.ingredients.forEach(ingredient => {
      const ingLower = ingredient.toLowerCase();
      priorityIngredients.forEach(priority => {
        if (ingLower.includes(priority) && !found.some(f => f.name === ingredient)) {
          
          let benefits = [];
          if (ingLower.includes('niacinamide')) {
            benefits = ['Reduces inflammation', 'Minimizes pores', 'Improves barrier function'];
          } else if (ingLower.includes('retinol')) {
            benefits = ['Stimulates collagen', 'Reduces wrinkles', 'Improves skin texture'];
          } else if (ingLower.includes('vitamin c') || ingLower.includes('ascorbic')) {
            benefits = ['Brightens complexion', 'Protects from free radicals', 'Boosts collagen'];
          } else if (ingLower.includes('hyaluronic')) {
            benefits = ['Deep hydration', 'Plumps skin', 'Reduces fine lines'];
          } else if (ingLower.includes('salicylic')) {
            benefits = ['Unclogs pores', 'Reduces acne', 'Exfoliates skin'];
          } else if (ingLower.includes('ceramide')) {
            benefits = ['Strengthens barrier', 'Retains moisture', 'Protects skin'];
          } else if (ingLower.includes('glycerin')) {
            benefits = ['Attracts moisture', 'Prevents dryness', 'Soothes skin'];
          } else {
            benefits = ['Contributes to product efficacy', 'Supports formulation stability'];
          }
          
          found.push({
            name: ingredient,
            description: getIngredientDescription(ingredient),
            benefits: benefits,
            wikipediaLink: getWikipediaLink(ingredient)
          });
        }
      });
    });
    
    // If no priority ingredients found, use first few
    if (found.length === 0 && data.ingredients.length > 0) {
      return data.ingredients.slice(0, Math.min(3, data.ingredients.length)).map(ing => ({
        name: ing,
        description: 'Standard cosmetic ingredient',
        benefits: ['Essential formulation component'],
        wikipediaLink: getWikipediaLink(ing)
      }));
    }
    
    return found.slice(0, 4);
  };

  // ✅ Get ingredient description
  const getIngredientDescription = (ingredient) => {
    const ing = ingredient.toLowerCase();
    
    const descriptions = {
      'niacinamide': 'Vitamin B3 derivative with multiple skin benefits',
      'retinol': 'Vitamin A derivative for anti-aging and cell turnover',
      'vitamin c': 'Powerful antioxidant for brightening and protection',
      'hyaluronic': 'Humectant that attracts and retains moisture',
      'salicylic': 'Beta-hydroxy acid for exfoliation and acne treatment',
      'glycolic': 'Alpha-hydroxy acid for surface exfoliation',
      'ceramide': 'Lipids that strengthen the skin barrier',
      'peptide': 'Amino acid chains that signal skin repair',
      'glycerin': 'Humectant that draws moisture to the skin'
    };
    
    for (const [key, desc] of Object.entries(descriptions)) {
      if (ing.includes(key)) return desc;
    }
    
    return 'Cosmetic ingredient with skin conditioning properties';
  };

  // ✅ Get safety concerns
  const getSafetyConcerns = () => {
    if (!data.ingredients || !Array.isArray(data.ingredients)) return [];
    
    const concernMarkers = {
      'paraben': 'Potential endocrine disruptor',
      'fragrance': 'May cause irritation or allergies',
      'alcohol denat': 'Can be drying and damaging to barrier',
      'sls': 'May strip natural oils and irritate',
      'formaldehyde': 'Known carcinogen and irritant',
      'oxybenzone': 'Potential hormone disruptor',
      'triclosan': 'Antibacterial linked to resistance'
    };
    
    const concerns = [];
    const ingStr = data.ingredients.join(' ').toLowerCase();
    
    Object.entries(concernMarkers).forEach(([marker, concern]) => {
      if (ingStr.includes(marker.toLowerCase())) {
        concerns.push({
          ingredient: marker,
          concern: concern,
          severity: marker === 'formaldehyde' ? 'high' : 
                   marker === 'paraben' ? 'medium' : 'low'
        });
      }
    });
    
    return concerns.slice(0, 3);
  };

  // ✅ Get product type
  const getProductType = () => {
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
  };

  // ✅ Get usage instructions
  const getUsageInstructions = () => {
    const type = getProductType();
    
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
    
    return instructions[type] || [
      'Apply as directed on packaging',
      'Perform patch test before full use',
      'Store in cool, dry place',
      'Use consistently for best results',
      'Consult professional for concerns'
    ];
  };

  // ✅ Get recommended skin types
  const getRecommendedSkinTypes = () => {
    if (data.skin_types && Array.isArray(data.skin_types)) {
      return data.skin_types;
    }
    
    const concerns = getSafetyConcerns();
    const ingredients = data.ingredients || [];
    const ingStr = ingredients.join(' ').toLowerCase();
    
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
  };

  // ✅ Prepare all product data
  const productInfo = {
    // Basic Info
    brand: data.brand || "Brand Information",
    name: data.name || "Cosmetic Product",
    description: data.description || "A carefully formulated cosmetic product designed for optimal results.",
    image: data.image || null,
    
    // Safety Info
    score: data.score || data.safety_score || data.rating || 65,
    grade: calculateGrade(data.score || data.safety_score || data.rating || 65),
    safetyLevel: getSafetyLevel(data.score || data.safety_score || data.rating || 65),
    safetyColor: getSafetyColor(data.score || data.safety_score || data.rating || 65),
    gradeDescription: getGradeDescription(calculateGrade(data.score || data.safety_score || data.rating || 65)),
    
    // Dynamic Analysis
    productType: getProductType(),
    keyIngredients: getKeyIngredients(),
    allIngredients: data.ingredients || [],
    safetyConcerns: getSafetyConcerns(),
    usageInstructions: getUsageInstructions(),
    recommendedSkinTypes: getRecommendedSkinTypes(),
    
    // Metadata
    source: data.source || data.apiSource || "Cosmetic Database",
    barcode: data.barcode || data.barcode_number || null,
    manufacturer: data.manufacturer || data.brand,
    
    // Stats
    ingredientsCount: Array.isArray(data.ingredients) ? data.ingredients.length : 0,
    concernsCount: getSafetyConcerns().length
  };

  // Skin type selection
  const skinTypes = [
    { id: 'oily', label: 'Oily', icon: '💧', desc: 'Shiny skin, enlarged pores' },
    { id: 'dry', label: 'Dry', icon: '🌵', desc: 'Flaky, tight feeling' },
    { id: 'sensitive', label: 'Sensitive', icon: '🌡️', desc: 'Easily irritated, reactive' },
    { id: 'combination', label: 'Combination', icon: '⚖️', desc: 'Mix of oily and dry areas' },
    { id: 'normal', label: 'Normal', icon: '🌟', desc: 'Balanced, few concerns' }
  ];

  // Get skin type analysis
  const skinTypeAnalysis = userSkinType ? 
    analyzeForSkinType(userSkinType, productInfo.allIngredients) : 
    { compatible: 'not_selected', warnings: [] };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onReset}
            className="group inline-flex items-center text-gray-700 hover:text-purple-700 font-medium text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="border-b border-transparent group-hover:border-purple-700 transition-all">
              Back to Scanner
            </span>
          </button>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          
          {/* Product Header */}
          <div className="p-4 sm:p-8 bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              
              {/* Product Image Section */}
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
                      <div className="text-gray-400 text-center font-medium">
                        {productInfo.name}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Product Type Badge */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm flex items-center">
                    <span className="mr-2">🏷️</span>
                    {productInfo.productType}
                  </div>
                  
                  {productInfo.barcode && (
                    <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-mono text-sm">
                      🏷️ {productInfo.barcode.substring(0, 12)}...
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Details */}
              <div className="lg:w-3/5">
                {/* Brand & Name */}
                <div className="mb-6">
                  <div className="inline-block bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold mb-3">
                    {productInfo.brand}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {productInfo.name}
                  </h1>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                    {productInfo.description}
                  </p>
                </div>
                
                {/* Safety Score Card */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <div className={`bg-gradient-to-r ${productInfo.safetyColor} w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center shadow-lg`}>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-white">{productInfo.score}</div>
                        <div className="text-white text-sm font-medium">/100</div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {productInfo.safetyLevel} Safety
                      </div>
                      <div className="text-gray-600 mb-2">
                        Grade: <span className="font-bold text-lg">{productInfo.grade}</span>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base">
                        {productInfo.gradeDescription}
                      </p>
                    </div>
                  </div>
                  
                  {/* Safety Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${productInfo.safetyColor} transition-all duration-1000`}
                      style={{ width: `${productInfo.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0</span>
                    <span>Safety Score</span>
                    <span>100</span>
                  </div>
                </div>
                
                {/* Skin Type Selector */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👤</span>
                    Select Your Skin Type for Personalized Analysis
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {skinTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setUserSkinType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                          userSkinType === type.id 
                            ? 'border-purple-500 bg-purple-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="font-medium text-gray-900 text-sm">{type.label}</div>
                        <div className="text-gray-500 text-xs mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {['overview', 'ingredients', 'safety', 'usage'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'border-b-2 border-purple-600 text-purple-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'ingredients' && '🧪 Ingredients'}
                  {tab === 'safety' && '🛡️ Safety'}
                  {tab === 'usage' && '📝 Usage'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.score}</div>
                    <div className="text-gray-600 text-sm">Safety Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.ingredientsCount}</div>
                    <div className="text-gray-600 text-sm">Ingredients</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.grade}</div>
                    <div className="text-gray-600 text-sm">Grade</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productInfo.keyIngredients.length}</div>
                    <div className="text-gray-600 text-sm">Key Ingredients</div>
                  </div>
                </div>
                
                {/* Skin Type Compatibility */}
                {userSkinType && (
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🎯</span>
                      Compatibility with {skinTypes.find(t => t.id === userSkinType)?.label} Skin
                    </h3>
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
                            <span className="text-sm">{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Recommended For */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👍</span>
                    Recommended For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {productInfo.recommendedSkinTypes.map((type, idx) => (
                      <div key={idx} className="bg-white border border-green-300 text-green-800 px-4 py-2 rounded-full font-medium flex items-center">
                        <span className="mr-2">✅</span>
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="space-y-6">
                {/* Key Ingredients with Wikipedia Links */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-purple-600 mr-3">🔑</span>
                    Key Active Ingredients
                  </h3>
                  
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
                              <h4 className="font-bold text-gray-900 text-lg mb-1">
                                {ingredient.name}
                              </h4>
                              <p className="text-gray-600 text-sm mb-2">
                                {ingredient.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {ingredient.benefits.map((benefit, bIdx) => (
                              <div key={bIdx} className="flex items-start">
                                <span className="text-green-500 mt-0.5 mr-2">✓</span>
                                <span className="text-gray-700 text-sm">{benefit}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Wikipedia Link */}
                          <a 
                            href={ingredient.wikipediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            Learn more on Wikipedia
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
                      <p className="text-gray-600">No key ingredients identified</p>
                    </div>
                  )}
                </div>
                
                {/* Full Ingredients List with Wikipedia Links */}
                {productInfo.allIngredients.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center">
                        <span className="mr-3">📋</span>
                        Complete Ingredients List
                        <span className="ml-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                          {productInfo.ingredientsCount} ingredients
                        </span>
                      </h3>
                      
                      {productInfo.allIngredients.length > 12 && (
                        <button
                          onClick={() => setExpandedIngredients(!expandedIngredients)}
                          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
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
                          onClick={() => setExpandedIngredients(true)}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                          + {productInfo.allIngredients.length - 12} more ingredients
                        </button>
                      </div>
                    )}
                    
                    {/* Safety Legend */}
                    <div className="mt-6 pt-4 border-t border-gray-300">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Safety Legend</h4>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                          <span className="text-xs text-gray-600">Excellent</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
                          <span className="text-xs text-gray-600">Good</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                          <span className="text-xs text-gray-600">Caution</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                          <span className="text-xs text-gray-600">Avoid</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                          <span className="text-xs text-gray-600">Neutral</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Safety Tab */}
            {activeTab === 'safety' && (
              <div className="space-y-6">
                {/* Safety Concerns */}
                {productInfo.safetyConcerns.length > 0 ? (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-red-600 mr-3">⚠️</span>
                      Safety Considerations
                    </h3>
                    <div className="space-y-4">
                      {productInfo.safetyConcerns.map((concern, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-red-100">
                          <div className="flex items-start">
                            <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                              concern.severity === 'high' ? 'bg-red-500' :
                              concern.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
                            }`} />
                            <div>
                              <div className="font-bold text-gray-900 mb-1">
                                {concern.ingredient}
                              </div>
                              <div className="text-gray-700 text-sm">
                                {concern.concern}
                              </div>
                              <div className="text-gray-500 text-xs mt-2">
                                Severity: {concern.severity.charAt(0).toUpperCase() + concern.severity.slice(1)}
                              </div>
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
                        <h3 className="font-bold text-gray-900 mb-1">No Major Safety Concerns</h3>
                        <p className="text-gray-700">
                          This product has a clean safety profile with no known concerning ingredients.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Safety Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-blue-600 mr-3">💡</span>
                    Safety Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="font-medium text-gray-900 mb-2">Patch Test</div>
                      <p className="text-gray-600 text-sm">
                        Always patch test new products on your inner arm for 24 hours before full facial application.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="font-medium text-gray-900 mb-2">Expiration</div>
                      <p className="text-gray-600 text-sm">
                        Check expiration dates and discard products that have changed color, consistency, or smell.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                {/* Usage Instructions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-blue-600 mr-3">📋</span>
                    How to Use
                  </h3>
                  
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
                          <p className="text-gray-800 font-medium">
                            {step}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Best Practices */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-purple-600 mr-3">⭐</span>
                    Best Practices
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-purple-500 mt-0.5 mr-3">•</span>
                      <span className="text-gray-700">Apply to clean skin for optimal absorption</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-purple-500 mt-0.5 mr-3">•</span>
                      <span className="text-gray-700">Use sunscreen daily when using active ingredients</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-purple-500 mt-0.5 mr-3">•</span>
                      <span className="text-gray-700">Introduce one new product at a time</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-purple-500 mt-0.5 mr-3">•</span>
                      <span className="text-gray-700">Consult a dermatologist for persistent skin concerns</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-white mb-2">
                  Ready to analyze another product?
                </div>
                <p className="text-gray-300">
                  Scan more cosmetics for safety, ingredients, and compatibility.
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={onReset}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan Another Product
              </motion.button>
            </div>
            
            {/* Data Source */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <div className="text-gray-400 text-sm">
                Data analyzed from: <span className="font-medium text-gray-300">{productInfo.source}</span>
              </div>
              <div className="text-gray-500 text-xs mt-2">
                Always perform patch tests and consult professionals for specific concerns
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="text-center text-gray-500 text-sm mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Important Disclaimer</span>
          </div>
          <p className="text-gray-600">
            This analysis is for informational purposes only. Always patch test new products and 
            consult with a dermatologist for specific skincare concerns. Data sourced from {productInfo.source}.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CosmeticResult;