export const analyzeIngredients = (ingredients) => {
  // Enhanced ingredient database
  const INGREDIENT_DATABASE = {
    // Vitamins & Beneficial Ingredients
    vitamins: {
      niacinamide: { name: "Vitamin B3 (Niacinamide)", benefit: "Brightening, pore refinement, barrier repair" },
      ascorbic_acid: { name: "Vitamin C", benefit: "Antioxidant protection, collagen synthesis, brightening" },
      tocopherol: { name: "Vitamin E", benefit: "Antioxidant, moisturizing, UV protection" },
      panthenol: { name: "Vitamin B5", benefit: "Hydration, soothing, anti-inflammatory" },
      retinol: { name: "Vitamin A", benefit: "Anti-aging, cell renewal, acne treatment" },
      biotin: { name: "Vitamin B7", benefit: "Skin hydration and health" },
    },
    
    // Skin-friendly actives
    actives: {
      hyaluronic_acid: { name: "Hyaluronic Acid", benefit: "Intense hydration, plumping, moisture retention" },
      salicylic_acid: { name: "Salicylic Acid", benefit: "Acne treatment, exfoliation, pore cleansing" },
      glycolic_acid: { name: "Glycolic Acid", benefit: "Exfoliation, brightening, texture improvement" },
      ceramide: { name: "Ceramides", benefit: "Barrier repair, moisture retention, protection" },
      peptide: { name: "Peptides", benefit: "Collagen production, firming, anti-aging" },
      coenzyme_q10: { name: "Coenzyme Q10", benefit: "Antioxidant, anti-aging, energy production" },
      aloe_vera: { name: "Aloe Vera", benefit: "Soothing, calming, anti-inflammatory" },
      tea_tree: { name: "Tea Tree Oil", benefit: "Antibacterial, acne treatment, antiseptic" },
      zinc_oxide: { name: "Zinc Oxide", benefit: "Soothing, oil control, anti-inflammatory" },
    },
    
    // Potentially problematic ingredients
    flagged: {
      alcohol: { concern: "Can be drying, irritating for sensitive skin", severity: "medium" },
      fragrance: { concern: "Potential allergen, may cause irritation", severity: "medium" },
      paraben: { concern: "Preservatives linked to skin sensitivity", severity: "low" },
      sulfate: { concern: "Can strip natural oils, causing dryness", severity: "medium" },
      formaldehyde: { concern: "Potential irritant and allergen", severity: "high" },
      phthalate: { concern: "Linked to skin sensitivity concerns", severity: "medium" },
      mineral_oil: { concern: "Can be comedogenic for acne-prone skin", severity: "low" },
      silicone: { concern: "May clog pores for some skin types", severity: "low" },
    }
  };

  const vitamins = [];
  const flagged = [];
  const benefits = [];
  const analysis = [];
  const unknown = [];

  // Process each ingredient
  ingredients.forEach((ingredient) => {
    const normalized = ingredient.toLowerCase()
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .trim();

    let found = false;

    // Check for vitamins
    for (const [key, vitamin] of Object.entries(INGREDIENT_DATABASE.vitamins)) {
      if (normalized.includes(key) || ingredient.toLowerCase().includes(key)) {
        vitamins.push(vitamin.name);
        analysis.push(`✅ Contains ${vitamin.name} – ${vitamin.benefit}`);
        found = true;
        break;
      }
    }

    // Check for beneficial actives
    if (!found) {
      for (const [key, active] of Object.entries(INGREDIENT_DATABASE.actives)) {
        if (normalized.includes(key) || ingredient.toLowerCase().includes(key)) {
          benefits.push(active.name);
          analysis.push(`✨ ${active.name} – ${active.benefit}`);
          found = true;
          break;
        }
      }
    }

    // Check for flagged ingredients
    if (!found) {
      for (const [key, concern] of Object.entries(INGREDIENT_DATABASE.flagged)) {
        if (normalized.includes(key) || ingredient.toLowerCase().includes(key)) {
          flagged.push(`${ingredient} (${concern.concern})`);
          analysis.push(`⚠️ ${ingredient} – ${concern.concern}`);
          found = true;
          break;
        }
      }
    }

    // Track unknown ingredients
    if (!found && ingredient.trim().length > 2) {
      unknown.push(ingredient);
    }
  });

  // Generate comprehensive analysis
  const totalIngredients = ingredients.length;
  const knownIngredients = totalIngredients - unknown.length;
  const knownPercentage = totalIngredients > 0 ? Math.round((knownIngredients / totalIngredients) * 100) : 0;

  // Add summary analysis
  if (knownPercentage < 50) {
    analysis.push(`ℹ️ Only ${knownPercentage}% of ingredients are well-researched`);
  } else if (knownPercentage >= 80) {
    analysis.push(`✅ ${knownPercentage}% of ingredients have established research`);
  }

  if (vitamins.length > 0) {
    analysis.push(`🌿 Contains ${vitamins.length} skin-friendly vitamins`);
  }

  if (flagged.length === 0) {
    analysis.push(`🛡️ No major irritants detected`);
  } else if (flagged.length <= 2) {
    analysis.push(`⚠️ Contains ${flagged.length} potentially problematic ingredients`);
  } else {
    analysis.push(`🚨 Contains ${flagged.length} ingredients that may cause issues`);
  }

  // Calculate safety score
  let score = 70; // Base score
  
  // Adjust based on findings
  score += vitamins.length * 5;          // +5 for each vitamin
  score += benefits.length * 4;          // +4 for each active
  score -= flagged.length * 8;           // -8 for each flagged ingredient
  score -= Math.min(unknown.length, 10); // -1 for each unknown (max -10)
  
  // Adjust for ingredient transparency
  if (knownPercentage > 80) score += 10;
  if (knownPercentage < 30) score -= 10;

  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine grade
  let grade = "C";
  if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 40) grade = "C";
  else if (score >= 20) grade = "D";
  else grade = "E";

  // Determine suitable skin types
  const skinTypes = new Set();
  
  // Add based on ingredients
  if (flagged.length === 0 && unknown.length < 5) {
    skinTypes.add("sensitive");
  }
  
  if (!flagged.some(f => f.toLowerCase().includes('oil') || f.toLowerCase().includes('comedogenic'))) {
    skinTypes.add("oily");
    skinTypes.add("combination");
  }
  
  if (vitamins.length > 0 || benefits.some(b => b.includes('Hydration') || b.includes('Moistur'))) {
    skinTypes.add("dry");
  }
  
  if (skinTypes.size === 0 || skinTypes.size >= 3) {
    skinTypes.add("normal");
    skinTypes.add("all");
  }

  // Generate side effects summary
  const sideEffects = [];
  if (flagged.length > 3) {
    sideEffects.push("Contains multiple potential irritants - patch test recommended");
  } else if (flagged.some(f => f.includes('alcohol') || f.includes('fragrance'))) {
    sideEffects.push("May cause dryness or irritation for sensitive skin");
  } else {
    sideEffects.push("Generally well-tolerated by most skin types");
  }

  if (unknown.length > 5) {
    sideEffects.push(`${unknown.length} ingredients have limited safety data`);
  }

  return {
    vitamins,
    flagged,
    benefits,
    unknown: unknown.slice(0, 10), // Limit display
    analysis,
    score,
    grade,
    breakdown: {
      flagged: flagged.length,
      vitamins: vitamins.length,
      benefits: benefits.length,
      unknown: unknown.length,
      total: totalIngredients,
      knownPercentage,
    },
    sideEffects,
    recommendedSkinTypes: Array.from(skinTypes),
  };
};