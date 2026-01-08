import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const InfoRow = ({ label, value }) => (
  <motion.div 
    className="bg-green-100 text-green-800 p-3 rounded-xl shadow-sm flex justify-between hover:scale-[1.02] transform transition-all duration-300 hover:shadow-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 border border-transparent hover:border-green-300 group cursor-pointer"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="font-medium group-hover:text-green-900 transition-colors duration-200">{label}</span>
    <span className="font-bold group-hover:scale-110 transition-transform duration-200">{value}</span>
  </motion.div>
);

// Improved ImpactRow with better visualization
const ImpactRow = ({ label, value, max = 20, positive = false }) => {
  const abs = Math.abs(Number(value) || 0);
  const pct = Math.min(100, Math.round((abs / max) * 100));
  const barColor = positive ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-red-400 to-rose-500";
  const sign = positive ? "+" : "-";

  return (
    <motion.div 
      className="flex flex-col mb-4 group cursor-pointer"
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-medium">{label}</span>
        <span className={`font-bold ${positive ? "text-green-700 group-hover:text-green-800" : "text-red-700 group-hover:text-red-800"} transition-colors duration-200 group-hover:scale-110`}>
          {sign}{abs}
        </span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden group-hover:bg-gray-200 transition-colors duration-300 shadow-inner">
        <motion.div
          className={`${barColor} h-full rounded-full group-hover:brightness-110 transition-all duration-300`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scaleY: 1.2 }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {positive ? "Good for health" : "Limit consumption"}
      </div>
    </motion.div>
  );
};

// Enhanced NutriScoreBadges with better visual feedback
const NutriScoreBadges = ({ grade }) => {
  const gradeInfo = {
    A: { bg: "bg-gradient-to-r from-green-600 to-emerald-700", text: "text-white", label: "Excellent" },
    B: { bg: "bg-gradient-to-r from-green-400 to-lime-500", text: "text-white", label: "Good" },
    C: { bg: "bg-gradient-to-r from-yellow-400 to-amber-500", text: "text-black", label: "Average" },
    D: { bg: "bg-gradient-to-r from-orange-500 to-red-400", text: "text-white", label: "Poor" },
    E: { bg: "bg-gradient-to-r from-red-600 to-rose-700", text: "text-white", label: "Avoid" },
  };
  
  const order = ["A", "B", "C", "D", "E"];

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex justify-center gap-1 mb-3 flex-wrap">
        {order.map((g) => (
          <motion.div
            key={g}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg min-w-[50px] sm:min-w-[60px] text-center cursor-pointer
              ${g === grade ? gradeInfo[g].bg + " " + gradeInfo[g].text + " shadow-lg" : "bg-gray-100 text-gray-400 hover:bg-gray-200"} 
              transition-all duration-300 border-2 ${g === grade ? 'border-white' : 'border-transparent'}`}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {g}
          </motion.div>
        ))}
      </div>
      {grade && (
        <motion.p 
          className={`text-base sm:text-lg font-bold ${gradeInfo[grade].text.replace('text-black', 'text-gray-800')} hover:scale-105 transition-transform duration-200`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
        >
          {gradeInfo[grade].label} Quality
        </motion.p>
      )}
    </div>
  );
};

// New ScoreRing component for visual score representation
const ScoreRing = ({ score, grade }) => {
  const getGradeColor = () => {
    switch(grade) {
      case 'A': return '#4CAF50';
      case 'B': return '#8BC34A';
      case 'C': return '#FFC107';
      case 'D': return '#FF9800';
      case 'E': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <motion.div 
      className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="w-full h-full group-hover:rotate-12 transition-transform duration-500" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          className="group-hover:stroke-gray-300 transition-colors duration-300"
        />
        {/* Score circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getGradeColor()}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0 283" }}
          animate={{ 
            strokeDasharray: `${(score / 100) * 283} 283`,
            transition: { duration: 1.5, ease: "easeOut" }
          }}
          transform="rotate(-90 50 50)"
          className="group-hover:stroke-width-10 transition-all duration-300"
        />
        {/* Glow effect on hover */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getGradeColor()}
          strokeWidth="0"
          className="opacity-0 group-hover:opacity-30 group-hover:stroke-width-20 transition-all duration-500"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <motion.span 
          className="text-2xl sm:text-3xl font-bold group-hover:text-gray-900 transition-colors duration-200 group-hover:scale-110"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {score}
        </motion.span>
        <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">/100</span>
        <span className={`text-xs sm:text-sm font-bold ${grade === 'C' ? 'text-black group-hover:text-gray-900' : 'text-white'} mt-1 transition-colors duration-200 group-hover:scale-110`}>
          {grade}
        </span>
      </div>
    </motion.div>
  );
};

// Enhanced explanations with detailed vegetable emoji descriptions
const generateExplanations = (nutrients, breakdown) => {
  const explanations = [];

  // High Priority Warnings (Critical Issues)
  if (breakdown?.penalty > 15) {
    explanations.push({
      text: "Multiple concerning nutrients detected - Contains high levels of sugars, saturated fats, and sodium which may impact long-term health",
      type: "warning",
      emoji: "🥦⚠️",
      priority: 1
    });
  }

  // Calorie Analysis
  const calories = Number(nutrients?.calories || 0);
  if (calories >= 400) {
    explanations.push({
      text: "High calorie density - Consider smaller portions or pairing with low-calorie vegetables like 🥬 lettuce, 🥒 cucumber, or 🍅 tomatoes for balanced meals",
      type: "warning",
      emoji: "🥔🔥",
      priority: 2
    });
  } else if (calories >= 200) {
    explanations.push({
      text: "Moderate energy content - Suitable for main meals when combined with fiber-rich vegetables like 🥦 broccoli and 🥕 carrots",
      type: "neutral",
      emoji: "🥕⚖️",
      priority: 3
    });
  } else if (calories > 0) {
    explanations.push({
      text: "Low calorie option - Excellent for weight management, pair with nutrient-dense 🥑 avocado or 🫑 bell peppers for complete nutrition",
      type: "positive",
      emoji: "🥬✅",
      priority: 4
    });
  }

  // Protein Analysis
  const protein = Number(nutrients?.protein || 0);
  if (protein >= 10) {
    explanations.push({
      text: "Excellent protein source - Great for muscle maintenance, consider adding 🥦 broccoli or spinach for complete amino acid profile",
      type: "positive",
      emoji: "🌱💪",
      priority: 2
    });
  } else if (protein >= 5) {
    explanations.push({
      text: "Good protein content - Supports satiety, pair with legumes like lentils or chickpeas for plant-based protein boost",
      type: "neutral",
      emoji: "🫑👍",
      priority: 3
    });
  } else if (protein > 0) {
    explanations.push({
      text: "Low protein content - May not keep you full long, consider adding 🥦 broccoli, spinach, or peas to increase protein intake",
      type: "warning",
      emoji: "🥒⚠️",
      priority: 4
    });
  }

  // Fiber Analysis
  const fiber = Number(nutrients?.fiber || 0);
  if (fiber >= 4) {
    explanations.push({
      text: "Excellent fiber content - Promotes digestive health and supports gut microbiome, similar to 🥦 broccoli and 🥕 carrots",
      type: "positive",
      emoji: "🌾🌟",
      priority: 2
    });
  } else if (fiber >= 2) {
    explanations.push({
      text: "Good fiber level - Supports regular digestion, consider adding more 🥬 leafy greens for optimal gut health",
      type: "positive",
      emoji: "🥕🌱",
      priority: 3
    });
  } else if (fiber > 0) {
    explanations.push({
      text: "Low fiber content - Could be improved for better digestion, add 🥦 broccoli, 🥕 carrots, or Brussels sprouts to meals",
      type: "warning",
      emoji: "🥬📉",
      priority: 4
    });
  }

  // Sugar Analysis
  const sugars = Number(nutrients?.sugars || 0);
  if (sugars >= 15) {
    explanations.push({
      text: "Very high sugar content - Limit consumption to occasional treats, choose vegetables like 🥒 cucumber or 🥬 celery as healthier alternatives",
      type: "warning",
      emoji: "🍅🚫",
      priority: 1
    });
  } else if (sugars >= 8) {
    explanations.push({
      text: "High sugar level - Consume in moderation, pair with low-sugar vegetables like 🥦 broccoli or zucchini to balance blood sugar",
      type: "warning",
      emoji: "🫑⚠️",
      priority: 2
    });
  } else if (sugars > 0) {
    explanations.push({
      text: "Moderate natural sugars - Acceptable level, similar to natural sugars found in 🥕 carrots or 🍅 tomatoes",
      type: "neutral",
      emoji: "🥕🍯",
      priority: 3
    });
  }

  // Saturated Fat Analysis
  const satFat = Number(nutrients?.saturatedFat || 0);
  if (satFat >= 8) {
    explanations.push({
      text: "Very high saturated fat - Not heart healthy, replace with foods rich in healthy fats from 🥑 avocado or nuts",
      type: "warning",
      emoji: "🥦🚫",
      priority: 1
    });
  } else if (satFat >= 4) {
    explanations.push({
      text: "High saturated fat - Consider alternatives with healthier fats like those found in 🥑 avocado or olives",
      type: "warning",
      emoji: "🫑🔴",
      priority: 2
    });
  } else if (satFat > 0) {
    explanations.push({
      text: "Moderate saturated fat - Within acceptable limits, balance with heart-healthy vegetables like 🥬 spinach and kale",
      type: "neutral",
      emoji: "🥕🟡",
      priority: 3
    });
  }

  // Sodium Analysis
  const sodium = Number(nutrients?.sodium || 0);
  const sodiumMg = sodium * 1000;
  if (sodiumMg >= 1000) {
    explanations.push({
      text: "Very high sodium - May raise blood pressure, choose fresh vegetables like 🥒 cucumber or 🥬 lettuce instead of processed options",
      type: "warning",
      emoji: "🥕🧂",
      priority: 1
    });
  } else if (sodiumMg >= 500) {
    explanations.push({
      text: "High sodium content - Monitor intake, enhance flavor with herbs and spices instead of salt",
      type: "warning",
      emoji: "🥬⚡",
      priority: 2
    });
  } else if (sodium > 0) {
    explanations.push({
      text: "Reasonable sodium level - Within healthy limits, similar to naturally occurring sodium in vegetables",
      type: "positive",
      emoji: "🥒✅",
      priority: 3
    });
  }

  // Add positive highlights with detailed explanations
  if (breakdown?.fiber > 2) {
    explanations.push({
      text: `Fiber bonus points (+${breakdown.fiber}) - Excellent for digestive health, similar to the benefits of eating 🥦 broccoli and 🥕 carrots regularly`,
      type: "positive",
      emoji: "🌿🌟",
      priority: 2
    });
  }
  if (breakdown?.protein > 2) {
    explanations.push({
      text: `Protein bonus points (+${breakdown.protein}) - Great for muscle health and satiety, complements plant proteins from vegetables`,
      type: "positive",
      emoji: "🥬💪",
      priority: 2
    });
  }

  // Add final summary based on grade with detailed recommendations
  if (breakdown?.grade === 'A' || breakdown?.grade === 'B') {
    explanations.push({
      text: "Excellent nutritional choice - Well-balanced profile suitable for regular consumption. Pair with a variety of colorful vegetables like 🍅 tomatoes, 🫑 bell peppers, and 🥦 broccoli for optimal health benefits",
      type: "positive",
      emoji: "🎉🌟",
      priority: 1
    });
  } else if (breakdown?.grade === 'C') {
    explanations.push({
      text: "Average nutritional value - Okay for occasional consumption. Improve by adding more nutrient-dense vegetables like 🥬 kale, spinach, and Brussels sprouts to your meals",
      type: "neutral",
      emoji: "🤔🥕",
      priority: 1
    });
  } else if (breakdown?.grade === 'D' || breakdown?.grade === 'E') {
    explanations.push({
      text: "Limited nutritional value - Consider healthier alternatives. Focus on whole vegetables like 🥦 broccoli, 🥕 carrots, and 🥬 leafy greens for better nutrition and long-term health benefits",
      type: "warning",
      emoji: "⚠️🥒",
      priority: 1
    });
  }

  // Sort by priority (lower number = higher priority)
  return explanations.sort((a, b) => a.priority - b.priority);
};

// Separate component for explanation cards with enhanced hover effects
const ExplanationCard = ({ explanation, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyles = {
    positive: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-400 hover:shadow-lg",
    warning: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:border-red-400 hover:shadow-lg",
    neutral: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400 hover:shadow-lg"
  };

  const textStyles = {
    positive: "text-green-800 group-hover:text-green-900",
    warning: "text-red-800 group-hover:text-red-900",
    neutral: "text-blue-800 group-hover:text-blue-900"
  };

  const headerStyles = {
    positive: "text-green-700 group-hover:text-green-800",
    warning: "text-red-700 group-hover:text-red-800",
    neutral: "text-blue-700 group-hover:text-blue-800"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`p-4 rounded-xl border-2 ${cardStyles[explanation.type]} transition-all duration-300 group cursor-pointer mb-3`}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <motion.span 
          className="text-2xl"
          animate={isHovered ? { rotate: [0, 10, -10, 0], scale: 1.2 } : {}}
          transition={{ duration: 0.5 }}
        >
          {explanation.emoji}
        </motion.span>
        <div className="flex-1">
          <p className={`font-medium mb-1 ${headerStyles[explanation.type]} transition-colors duration-200`}>
            {explanation.text.split(' - ')[0]}
          </p>
          <p className={`text-sm ${textStyles[explanation.type]} transition-colors duration-200 opacity-90 group-hover:opacity-100`}>
            {explanation.text.split(' - ')[1] || explanation.text}
          </p>
        </div>
        <motion.div
          className={`w-2 h-2 rounded-full mt-2 ${
            explanation.type === 'positive' ? 'bg-green-400' : 
            explanation.type === 'warning' ? 'bg-red-400' : 'bg-blue-400'
          }`}
          animate={isHovered ? { scale: 2 } : {}}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const FoodResultCard = ({ score, image, productName, nutrients, onReset }) => {
  const explanations = generateExplanations(nutrients, { 
    ...score?.breakdown, 
    grade: score?.grade 
  });

  // Group explanations by type
  const positiveExplanations = explanations.filter(exp => exp.type === "positive");
  const warningExplanations = explanations.filter(exp => exp.type === "warning");
  const neutralExplanations = explanations.filter(exp => exp.type === "neutral");

  // Check if product name and image are available
  const hasProductName = productName && productName.trim() !== '';
  const hasImage = image && image.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 14 }}
      className="mt-4 sm:mt-8 bg-white border border-gray-200 p-3 sm:p-6 rounded-2xl shadow-xl max-w-lg mx-auto text-left hover:shadow-2xl transition-all duration-500 w-full hover:border-green-300"
    >
      {/* Product Name Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-700 flex items-center gap-2 sm:gap-3 group cursor-pointer">
          <motion.span 
            className="text-lg sm:text-xl md:text-2xl"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            🛒
          </motion.span>
          {hasProductName ? (
            <span className="group-hover:text-green-800 transition-colors duration-300">
              {productName}
            </span>
          ) : (
            <span className="text-red-500 italic group-hover:text-red-600 transition-colors duration-300">
              Product name not available
            </span>
          )}
        </h2>
      </motion.div>

      {/* Product Image Section */}
      {hasImage ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xs mx-auto mb-6 relative group"
        >
          <img
            src={image}
            alt="Product"
            className="w-full h-auto max-h-64 object-contain rounded-xl border-2 border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 group-hover:border-green-400 group-hover:ring-4 group-hover:ring-green-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent group-hover:to-green-50/30 rounded-xl transition-all duration-300" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-6 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 transition-all duration-300 group cursor-pointer"
          whileHover={{ scale: 1.02, borderColor: "#9CA3AF" }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span 
            className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: 15 }}
          >
            📷
          </motion.span>
          <span className="text-gray-500 font-medium group-hover:text-gray-600 transition-colors duration-300 text-center px-4">
            Product image not available
          </span>
          <span className="text-gray-400 text-sm mt-2 group-hover:text-gray-500 transition-colors duration-300">
            Click to upload or scan another
          </span>
        </motion.div>
      )}

      {/* Score Display Section */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl shadow-inner mb-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -5 }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="w-full lg:w-1/2 flex justify-center">
            <ScoreRing score={score?.value || 0} grade={score?.grade} />
          </div>
          
          <div className="w-full lg:w-1/2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 hover:text-gray-900 transition-colors duration-200 group-hover:scale-105 inline-block">
              Nutrition Breakdown
            </h3>
            <div className="space-y-3">
              {score?.breakdown && (
                <>
                  <ImpactRow label="Calories" value={score.breakdown.calories} positive={false} />
                  <ImpactRow label="Sugars" value={score.breakdown.sugars} positive={false} />
                  <ImpactRow label="Saturated Fat" value={score.breakdown.saturatedFat} positive={false} />
                  <ImpactRow label="Fiber" value={score.breakdown.fiber} positive={true} />
                  <ImpactRow label="Protein" value={score.breakdown.protein} positive={true} />
                  {score.breakdown.penalty > 0 && (
                    <motion.div 
                      className="text-red-600 text-sm font-bold hover:text-red-700 transition-colors duration-200 p-2 bg-red-50 rounded-lg inline-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      ⚠️ Penalty: -{score.breakdown.penalty} points
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <NutriScoreBadges grade={score?.grade} />
      </motion.div>

      {/* Nutrition Facts Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-6">
        <InfoRow label="Calories" value={`${nutrients?.calories || 0} kcal`} />
        <InfoRow label="Protein" value={`${nutrients?.protein || 0} g`} />
        <InfoRow label="Fiber" value={`${nutrients?.fiber || 0} g`} />
        <InfoRow label="Energy" value={`${nutrients?.energy || 0} kJ`} />
        <InfoRow label="Sugars" value={`${nutrients?.sugars || 0} g`} />
        <InfoRow label="Sat. Fat" value={`${nutrients?.saturatedFat || 0} g`} />
        <div className="xs:col-span-2 sm:col-span-1">
          <InfoRow label="Sodium" value={`${nutrients?.sodium ? Math.round(nutrients.sodium * 1000) : 0} mg`} />
        </div>
      </div>

      {/* Detailed Explanations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 mb-6"
      >
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 hover:text-gray-900 transition-colors duration-200">
          🥦 Detailed Nutrition Analysis
        </h3>

        {/* Positive Points */}
        {positiveExplanations.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <h4 className="font-bold text-green-700 hover:text-green-800 transition-colors duration-200">
                Health Benefits & Positive Aspects
              </h4>
            </div>
            {positiveExplanations.map((explanation, idx) => (
              <ExplanationCard key={`positive-${idx}`} explanation={explanation} index={idx} />
            ))}
          </motion.div>
        )}

        {/* Warnings */}
        {warningExplanations.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <h4 className="font-bold text-red-700 hover:text-red-800 transition-colors duration-200">
                Areas of Concern & Recommendations
              </h4>
            </div>
            {warningExplanations.map((explanation, idx) => (
              <ExplanationCard key={`warning-${idx}`} explanation={explanation} index={idx} />
            ))}
          </motion.div>
        )}

        {/* Neutral/Additional Info */}
        {neutralExplanations.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">ℹ️</span>
              <h4 className="font-bold text-blue-700 hover:text-blue-800 transition-colors duration-200">
                Additional Information & Context
              </h4>
            </div>
            {neutralExplanations.map((explanation, idx) => (
              <ExplanationCard key={`neutral-${idx}`} explanation={explanation} index={idx} />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Final Grade Summary */}
      <motion.div
        className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl text-white hover:from-gray-800 hover:to-gray-600 transition-all duration-300 group"
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-xl font-bold group-hover:text-gray-100 transition-colors duration-200">
              🥕 Overall Nutrition Grade
            </p>
            <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-200">
              Comprehensive analysis with vegetable-based recommendations
            </p>
          </div>
          <motion.div
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-xl sm:text-2xl font-bold min-w-[80px] text-center cursor-pointer shadow-lg ${
              score?.grade === 'A' ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800' :
              score?.grade === 'B' ? 'bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700' :
              score?.grade === 'C' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black' :
              score?.grade === 'D' ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' :
              'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800'
            } transition-all duration-300`}
            animate={{ 
              scale: [1, 1.1, 1],
              transition: { repeat: Infinity, repeatDelay: 3 }
            }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {score?.grade || 'N/A'}
          </motion.div>
        </div>
        <p className="text-sm mt-3 opacity-90 group-hover:opacity-100 transition-opacity duration-200 text-center sm:text-left">
          Score: <span className="font-bold">{score?.value || 0}</span>/100 • {
            score?.grade === 'A' ? 'Excellent choice for regular consumption! 🥦' :
            score?.grade === 'B' ? 'Good option with balanced nutrition 🥕' :
            score?.grade === 'C' ? 'Average - consume moderately with vegetable sides 🥬' :
            score?.grade === 'D' ? 'Poor - limit consumption, focus on vegetables 🥒' :
            'Very poor - avoid when possible, choose fresh vegetables instead 🥗'
          }
        </p>
      </motion.div>

      <motion.button
        whileHover={{ 
          scale: 1.05, 
          backgroundColor: "#10B981",
          boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="mt-8 w-full text-base font-semibold px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
      >
        <motion.span
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="text-lg"
        >
          🔄
        </motion.span>
        <span className="group-hover:scale-105 transition-transform duration-300">
          Scan Another Product
        </span>
      </motion.button>
    </motion.div>
  );
};

export default FoodResultCard;

