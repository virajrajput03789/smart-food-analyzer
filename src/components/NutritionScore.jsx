// src/utils/NutritionScore.js

export const NutritionScore = (nutrients) => {
  const {
    calories = 0,
    sugars = 0,
    saturatedFat = 0,
    sodium = 0, // in grams
    fiber = 0,
    protein = 0,
    servingSize = 100, // Default to 100g if not provided
  } = nutrients;

  // Handle missing or zero data
  if (!nutrients || Object.keys(nutrients).length === 0) {
    return {
      value: 0,
      grade: "N/A",
      color: "#CCCCCC",
      breakdown: {
        calories: 0,
        sugars: 0,
        saturatedFat: 0,
        sodium: 0,
        fiber: 0,
        protein: 0,
        penalty: 0,
      },
      healthIndicators: [],
      warning: "No nutrient data available",
      recommendations: ["Scan again for accurate results"],
    };
  }

  // Normalize to per 100g basis for consistent scoring
  const normalizeFactor = 100 / servingSize;
  const normalizedCalories = calories * normalizeFactor;
  const normalizedSugars = sugars * normalizeFactor;
  const normalizedSatFat = saturatedFat * normalizeFactor;
  const normalizedSodium = sodium * normalizeFactor;
  const normalizedFiber = fiber * normalizeFactor;
  const normalizedProtein = protein * normalizeFactor;

  // Convert sodium to mg
  const sodiumMg = Math.max(0, Math.round(normalizedSodium * 1000));

  // 🔴 Negative Points (Unhealthy components)
  const caloriePoints = getCaloriePoints(normalizedCalories);
  const sugarPoints = getSugarPoints(normalizedSugars);
  const satFatPoints = getSaturatedFatPoints(normalizedSatFat);
  const sodiumPoints = getSodiumPoints(sodiumMg);

  // 🟢 Positive Points (Healthy components)
  const fiberPoints = getFiberPoints(normalizedFiber);
  const proteinPoints = getProteinPoints(normalizedProtein);

  // Calculate raw Nutri-Score (French/European model)
  const rawScore = (caloriePoints + sugarPoints + satFatPoints + sodiumPoints) - 
                   (fiberPoints + proteinPoints);

  // Adjust score to 0-100 scale with better distribution
  let finalScore;
  if (rawScore <= -5) {
    finalScore = Math.min(100, 90 + (rawScore + 5) * -2);
  } else if (rawScore <= 0) {
    finalScore = 70 + rawScore * -4;
  } else if (rawScore <= 10) {
    finalScore = 70 - rawScore * 4;
  } else {
    finalScore = Math.max(0, 30 - (rawScore - 10) * 3);
  }

  // Round to nearest whole number
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  // Determine grade and color
  const { grade, color, label } = getGradeInfo(finalScore);

  // Generate health indicators and warnings
  const healthIndicators = generateHealthIndicators({
    sugars: normalizedSugars,
    saturatedFat: normalizedSatFat,
    sodium: sodiumMg,
    calories: normalizedCalories,
    fiber: normalizedFiber,
    protein: normalizedProtein,
  });

  // Generate personalized recommendations
  const recommendations = generateRecommendations({
    grade,
    sugars: normalizedSugars,
    saturatedFat: normalizedSatFat,
    sodium: sodiumMg,
    fiber: normalizedFiber,
    protein: normalizedProtein,
  });

  return {
    value: finalScore,
    grade,
    color,
    label,
    breakdown: {
      calories: caloriePoints,
      sugars: sugarPoints,
      saturatedFat: satFatPoints,
      sodium: sodiumPoints,
      fiber: fiberPoints,
      protein: proteinPoints,
      totalNegative: caloriePoints + sugarPoints + satFatPoints + sodiumPoints,
      totalPositive: fiberPoints + proteinPoints,
      rawScore,
    },
    healthIndicators,
    recommendations,
    normalizedValues: {
      calories: Math.round(normalizedCalories),
      sugars: Math.round(normalizedSugars * 10) / 10,
      saturatedFat: Math.round(normalizedSatFat * 10) / 10,
      sodium: sodiumMg,
      fiber: Math.round(normalizedFiber * 10) / 10,
      protein: Math.round(normalizedProtein * 10) / 10,
    },
  };
};

// Improved grading system with better distribution
function getGradeInfo(score) {
  if (score >= 85) return { grade: "A", color: "#4CAF50", label: "Excellent" };
  if (score >= 70) return { grade: "B", color: "#8BC34A", label: "Good" };
  if (score >= 55) return { grade: "C", color: "#FFC107", label: "Average" };
  if (score >= 40) return { grade: "D", color: "#FF9800", label: "Below Average" };
  return { grade: "E", color: "#F44336", label: "Poor" };
}

// Generate health indicators based on nutrient levels
function generateHealthIndicators(nutrients) {
  const indicators = [];
  
  if (nutrients.sugars > 13.5) indicators.push("High Sugar");
  if (nutrients.saturatedFat > 5) indicators.push("High Saturated Fat");
  if (nutrients.sodium > 600) indicators.push("High Sodium");
  if (nutrients.calories > 400) indicators.push("High Calorie");
  if (nutrients.fiber > 3) indicators.push("Good Fiber");
  if (nutrients.protein > 6) indicators.push("High Protein");
  if (nutrients.fiber < 1.5 && nutrients.sugars < 5) indicators.push("Low Fiber");
  
  return indicators;
}

// Generate personalized recommendations
function generateRecommendations(data) {
  const recs = [];
  
  if (data.grade === "E" || data.grade === "D") {
    recs.push("Consider healthier alternatives");
  }
  
  if (data.sugars > 15) {
    recs.push("High in sugar - consume in moderation");
  }
  
  if (data.saturatedFat > 5) {
    recs.push("Contains saturated fats - limit intake");
  }
  
  if (data.sodium > 800) {
    recs.push("High sodium content - not suitable for hypertensive individuals");
  }
  
  if (data.fiber < 2 && data.protein < 5) {
    recs.push("Low in fiber and protein - pair with whole foods");
  }
  
  if (recs.length === 0) {
    recs.push("Nutritionally balanced option");
  }
  
  return recs;
}

// Optimized point calculation functions with smoother transitions
function getCaloriePoints(calories) {
  if (calories > 800) return 10;
  if (calories > 600) return 9;
  if (calories > 400) return 7;
  if (calories > 300) return 5;
  if (calories > 200) return 3;
  if (calories > 100) return 1;
  return 0;
}

function getSugarPoints(sugars) {
  if (sugars > 45) return 10;
  if (sugars > 36) return 8;
  if (sugars > 27) return 6;
  if (sugars > 18) return 4;
  if (sugars > 9) return 2;
  if (sugars > 4.5) return 1;
  return 0;
}

function getSaturatedFatPoints(satFat) {
  if (satFat > 10) return 10;
  if (satFat > 7) return 7;
  if (satFat > 4) return 4;
  if (satFat > 2) return 2;
  if (satFat > 1) return 1;
  return 0;
}

function getSodiumPoints(sodiumMg) {
  if (sodiumMg > 900) return 10;
  if (sodiumMg > 720) return 8;
  if (sodiumMg > 540) return 6;
  if (sodiumMg > 360) return 4;
  if (sodiumMg > 180) return 2;
  if (sodiumMg > 90) return 1;
  return 0;
}

function getFiberPoints(fiber) {
  if (fiber > 4.7) return 5;
  if (fiber > 3.7) return 4;
  if (fiber > 2.8) return 3;
  if (fiber > 1.9) return 2;
  if (fiber > 0.9) return 1;
  return 0;
}

function getProteinPoints(protein) {
  if (protein > 8.0) return 5;
  if (protein > 6.4) return 4;
  if (protein > 4.8) return 3;
  if (protein > 3.2) return 2;
  if (protein > 1.6) return 1;
  return 0;
}

// Additional utility function for frontend display
export const getScoreColor = (score) => {
  if (score >= 85) return "#4CAF50";
  if (score >= 70) return "#8BC34A";
  if (score >= 55) return "#FFC107";
  if (score >= 40) return "#FF9800";
  return "#F44336";
};

// Get score description for UI
export const getScoreDescription = (score) => {
  if (score >= 85) return "Excellent - Highly nutritious";
  if (score >= 70) return "Good - Healthy choice";
  if (score >= 55) return "Average - Okay in moderation";
  if (score >= 40) return "Below average - Limit consumption";
  return "Poor - Avoid or consume rarely";
};