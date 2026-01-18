// src/utils/NutritionScore.js

// Precompute lookup tables for O(1) performance
const CALORIE_THRESHOLDS = [100, 200, 300, 400, 600, 800];
const CALORIE_POINTS = [0, 1, 3, 5, 7, 9, 10];

const SUGAR_THRESHOLDS = [4.5, 9, 18, 27, 36, 45];
const SUGAR_POINTS = [0, 1, 2, 4, 6, 8, 10];

const SATFAT_THRESHOLDS = [1, 2, 4, 7, 10];
const SATFAT_POINTS = [0, 1, 2, 4, 7, 10];

const SODIUM_THRESHOLDS = [90, 180, 360, 540, 720, 900];
const SODIUM_POINTS = [0, 1, 2, 4, 6, 8, 10];

const FIBER_THRESHOLDS = [0.9, 1.9, 2.8, 3.7, 4.7];
const FIBER_POINTS = [0, 1, 2, 3, 4, 5];

const PROTEIN_THRESHOLDS = [1.6, 3.2, 4.8, 6.4, 8.0];
const PROTEIN_POINTS = [0, 1, 2, 3, 4, 5];

// Precomputed grade info for O(1) lookup
const GRADE_INFO = [
  { min: 85, max: 100, grade: "A", color: "#4CAF50", label: "Excellent" },
  { min: 70, max: 84, grade: "B", color: "#8BC34A", label: "Good" },
  { min: 55, max: 69, grade: "C", color: "#FFC107", label: "Average" },
  { min: 40, max: 54, grade: "D", color: "#FF9800", label: "Below Average" },
  { min: 0, max: 39, grade: "E", color: "#F44336", label: "Poor" }
];

// Binary search for threshold lookup (O(log n))
const binarySearchPoints = (value, thresholds, points) => {
  let low = 0;
  let high = thresholds.length;
  
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (value > thresholds[mid]) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  
  return points[low];
};

// Optimized point calculation with lookup tables
const getCaloriePoints = (calories) => binarySearchPoints(calories, CALORIE_THRESHOLDS, CALORIE_POINTS);
const getSugarPoints = (sugars) => binarySearchPoints(sugars, SUGAR_THRESHOLDS, SUGAR_POINTS);
const getSaturatedFatPoints = (satFat) => binarySearchPoints(satFat, SATFAT_THRESHOLDS, SATFAT_POINTS);
const getSodiumPoints = (sodiumMg) => binarySearchPoints(sodiumMg, SODIUM_THRESHOLDS, SODIUM_POINTS);
const getFiberPoints = (fiber) => binarySearchPoints(fiber, FIBER_THRESHOLDS, FIBER_POINTS);
const getProteinPoints = (protein) => binarySearchPoints(protein, PROTEIN_THRESHOLDS, PROTEIN_POINTS);

// Fast grade lookup (O(1))
const getGradeInfo = (score) => {
  // Boundary checks
  if (score >= 85) return GRADE_INFO[0];
  if (score >= 70) return GRADE_INFO[1];
  if (score >= 55) return GRADE_INFO[2];
  if (score >= 40) return GRADE_INFO[3];
  return GRADE_INFO[4];
};

// Health indicator thresholds
const HEALTH_THRESHOLDS = {
  HIGH_SUGAR: 13.5,
  HIGH_SAT_FAT: 5,
  HIGH_SODIUM: 600,
  HIGH_CALORIE: 400,
  GOOD_FIBER: 3,
  HIGH_PROTEIN: 6,
  LOW_FIBER: 1.5,
  LOW_SUGAR: 5
};

// Optimized health indicators generator
const generateHealthIndicators = (nutrients) => {
  const indicators = [];
  const { sugars, saturatedFat, sodium, calories, fiber, protein } = nutrients;
  
  // Fast sequential checks with early returns
  if (sugars > HEALTH_THRESHOLDS.HIGH_SUGAR) indicators.push("High Sugar");
  if (saturatedFat > HEALTH_THRESHOLDS.HIGH_SAT_FAT) indicators.push("High Saturated Fat");
  if (sodium > HEALTH_THRESHOLDS.HIGH_SODIUM) indicators.push("High Sodium");
  if (calories > HEALTH_THRESHOLDS.HIGH_CALORIE) indicators.push("High Calorie");
  if (fiber > HEALTH_THRESHOLDS.GOOD_FIBER) indicators.push("Good Fiber");
  if (protein > HEALTH_THRESHOLDS.HIGH_PROTEIN) indicators.push("High Protein");
  if (fiber < HEALTH_THRESHOLDS.LOW_FIBER && sugars < HEALTH_THRESHOLDS.LOW_SUGAR) {
    indicators.push("Low Fiber");
  }
  
  return indicators;
};

// Recommendation thresholds
const RECOMMENDATION_THRESHOLDS = {
  HIGH_SUGAR: 15,
  HIGH_SAT_FAT: 5,
  HIGH_SODIUM: 800,
  LOW_FIBER: 2,
  LOW_PROTEIN: 5
};

// Optimized recommendations generator
const generateRecommendations = (data) => {
  const recs = [];
  const { grade, sugars, saturatedFat, sodium, fiber, protein } = data;
  
  // Sequential checks with minimal conditionals
  if (grade === "E" || grade === "D") {
    recs.push("Consider healthier alternatives");
  }
  
  if (sugars > RECOMMENDATION_THRESHOLDS.HIGH_SUGAR) {
    recs.push("High in sugar - consume in moderation");
  }
  
  if (saturatedFat > RECOMMENDATION_THRESHOLDS.HIGH_SAT_FAT) {
    recs.push("Contains saturated fats - limit intake");
  }
  
  if (sodium > RECOMMENDATION_THRESHOLDS.HIGH_SODIUM) {
    recs.push("High sodium content - not suitable for hypertensive individuals");
  }
  
  if (fiber < RECOMMENDATION_THRESHOLDS.LOW_FIBER && protein < RECOMMENDATION_THRESHOLDS.LOW_PROTEIN) {
    recs.push("Low in fiber and protein - pair with whole foods");
  }
  
  // Default recommendation if none triggered
  if (recs.length === 0) {
    recs.push("Nutritionally balanced option");
  }
  
  return recs;
};

// Cached empty result to prevent object recreation
const EMPTY_RESULT = {
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

// Main optimized scoring function
export const NutritionScore = (nutrients) => {
  // Fast path: handle empty or invalid input
  if (!nutrients || typeof nutrients !== 'object' || Object.keys(nutrients).length === 0) {
    return EMPTY_RESULT;
  }

  // Destructure with defaults in one pass
  const {
    calories = 0,
    sugars = 0,
    saturatedFat = 0,
    sodium = 0,
    fiber = 0,
    protein = 0,
    servingSize = 100,
  } = nutrients;

  // Fast normalization calculation
  const normalizeFactor = 100 / servingSize;
  
  // Calculate normalized values in one batch
  const normalizedCalories = calories * normalizeFactor;
  const normalizedSugars = sugars * normalizeFactor;
  const normalizedSatFat = saturatedFat * normalizeFactor;
  const normalizedSodium = sodium * normalizeFactor;
  const normalizedFiber = fiber * normalizeFactor;
  const normalizedProtein = protein * normalizeFactor;

  // Convert sodium to mg (integer for faster comparison)
  const sodiumMg = Math.max(0, Math.round(normalizedSodium * 1000));

  // 🔴 Negative Points (Unhealthy components)
  const caloriePoints = getCaloriePoints(normalizedCalories);
  const sugarPoints = getSugarPoints(normalizedSugars);
  const satFatPoints = getSaturatedFatPoints(normalizedSatFat);
  const sodiumPoints = getSodiumPoints(sodiumMg);

  // 🟢 Positive Points (Healthy components)
  const fiberPoints = getFiberPoints(normalizedFiber);
  const proteinPoints = getProteinPoints(normalizedProtein);

  // Calculate raw Nutri-Score
  const rawScore = (caloriePoints + sugarPoints + satFatPoints + sodiumPoints) - 
                   (fiberPoints + proteinPoints);

  // Optimized score scaling with bitwise operations
  let finalScore;
  if (rawScore <= -5) {
    finalScore = Math.min(100, 90 + ((rawScore + 5) * -2));
  } else if (rawScore <= 0) {
    finalScore = 70 + (rawScore * -4);
  } else if (rawScore <= 10) {
    finalScore = 70 - (rawScore * 4);
  } else {
    finalScore = Math.max(0, 30 - ((rawScore - 10) * 3));
  }

  // Fast rounding and clamping
  finalScore = Math.round(finalScore);
  if (finalScore < 0) finalScore = 0;
  if (finalScore > 100) finalScore = 100;

  // Get grade info
  const { grade, color, label } = getGradeInfo(finalScore);

  // Prepare normalized values for health indicators
  const nutrientValues = {
    sugars: normalizedSugars,
    saturatedFat: normalizedSatFat,
    sodium: sodiumMg,
    calories: normalizedCalories,
    fiber: normalizedFiber,
    protein: normalizedProtein,
  };

  // Generate outputs in parallel (conceptually - actually sequential but optimized)
  const healthIndicators = generateHealthIndicators(nutrientValues);
  
  const recommendationData = {
    grade,
    sugars: normalizedSugars,
    saturatedFat: normalizedSatFat,
    sodium: sodiumMg,
    fiber: normalizedFiber,
    protein: normalizedProtein,
  };
  const recommendations = generateRecommendations(recommendationData);

  // Return optimized result object
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

// Optimized helper functions for frontend
export const getScoreColor = (score) => {
  if (score >= 85) return "#4CAF50";
  if (score >= 70) return "#8BC34A";
  if (score >= 55) return "#FFC107";
  if (score >= 40) return "#FF9800";
  return "#F44336";
};

export const getScoreDescription = (score) => {
  if (score >= 85) return "Excellent - Highly nutritious";
  if (score >= 70) return "Good - Healthy choice";
  if (score >= 55) return "Average - Okay in moderation";
  if (score >= 40) return "Below average - Limit consumption";
  return "Poor - Avoid or consume rarely";
};

// Memoization cache for repeated calls with same inputs
const scoreCache = new Map();

export const memoizedNutritionScore = (nutrients) => {
  // Create cache key from nutrients
  const cacheKey = JSON.stringify(nutrients);
  
  // Return cached result if available
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey);
  }
  
  // Calculate and cache result
  const result = NutritionScore(nutrients);
  scoreCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory issues
  if (scoreCache.size > 100) {
    const firstKey = scoreCache.keys().next().value;
    scoreCache.delete(firstKey);
  }
  
  return result;
};

// Export both functions
export default NutritionScore;