/**
 * foodParser.js
 * Natural-language food entry parser.
 * Pure functions — no side effects, fully testable.
 */

import { FOOD_DB } from "../data/foodDatabase";
import { STANDARD_WEIGHTS, UNIT_MAP, WATER_WORDS } from "../data/foodConstants";

export function estimateCal(name, grams) {
  const key = name.toLowerCase().trim();
  const perHundred = FOOD_DB[key] ?? findFuzzy(FOOD_DB, key);
  return perHundred != null ? Math.round((perHundred * grams) / 100) : null;
}

export function getStandardWeight(foodName) {
  const key = foodName.toLowerCase().trim();
  if (STANDARD_WEIGHTS[key]) return { grams: STANDARD_WEIGHTS[key], source: "standard" };
  const partial = findFuzzy(STANDARD_WEIGHTS, key);
  if (partial) return { grams: partial, source: "standard" };
  const LIQUID_KW = ["juice","milk","lassi","chai","tea","coffee","drink","shake","water"];
  if (LIQUID_KW.some((w) => key.includes(w))) return { grams: 200, source: "liquid-default" };
  return { grams: 100, source: "default" };
}

export function parseEntry(raw) {
  if (!raw?.trim()) return [];
  const parts = raw.trim().toLowerCase().split(/\bwith\b|\band\b|\+|&/);
  const items = [];
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    const WATER_EXCLUSIONS = ["lassi","juice","milk","chai","protein","shake","coconut","nariyal","nimbu","shikanji","sugarcane"];
    const isWater = WATER_WORDS.some((w) => part.includes(w)) && !WATER_EXCLUSIONS.some((w) => part.includes(w));
    if (isWater) {
      const mlMatch = part.match(/(\d+\.?\d*)\s*ml/);
      const ml = mlMatch ? parseFloat(mlMatch[1]) : 250;
      items.push({ name: "Water", grams: ml, isWater: true, ml, weightSource: "specified" });
      continue;
    }
    let grams = null, weightSource = "standard", foodName = part;
    const mlMatch = part.match(/(\d+\.?\d*)\s*ml\s+(.*)/);
    if (mlMatch) { grams = parseFloat(mlMatch[1]); foodName = mlMatch[2].trim(); weightSource = "specified"; }
    if (grams === null) {
      const gMatch = part.match(/(\d+\.?\d*)\s*g(?:ram|rams)?\b/);
      if (gMatch) { grams = parseFloat(gMatch[1]); foodName = part.replace(/\d+\.?\d*\s*g(?:ram|rams)?\b/, "").trim(); weightSource = "specified"; }
    }
    if (grams === null) {
      const unitMatch = part.match(/^(\d+\.?\d*)\s+(\w+)\s+(.*)/);
      if (unitMatch) { const [,qty,unit,rest] = unitMatch; if (UNIT_MAP[unit]) { grams = parseFloat(qty) * UNIT_MAP[unit]; foodName = rest.trim(); weightSource = "specified"; } }
    }
    if (grams === null) {
      const countMatch = part.match(/^(\d+\.?\d*)\s+(.+)$/);
      if (countMatch) {
        const qty = parseFloat(countMatch[1]); const food = countMatch[2].trim();
        const unitGrams = UNIT_MAP[food] ?? UNIT_MAP[food + "s"];
        if (unitGrams) { grams = qty * unitGrams; foodName = food; weightSource = "specified"; }
        else { const sw = getStandardWeight(food); grams = qty * sw.grams; foodName = food; weightSource = sw.source === "default" ? "counted-default" : "counted-standard"; }
      }
    }
    if (grams === null) { const sw = getStandardWeight(foodName); grams = sw.grams; weightSource = sw.source; }
    foodName = foodName.replace(/\d+\.?\d*\s*(g|gram|grams|ml|scoop|scoops|cup|cups|tbsp|tsp)\b/gi,"").replace(/^\s*(of|with|the|a|an)\s+/gi,"").trim();
    if (!foodName) foodName = part.replace(/\d+\.?\d*\s*(g|ml|scoop|cup|tbsp|tsp)?\b/g,"").trim() || "Food";
    items.push({ name: foodName, grams: Math.round(grams), isWater: false, weightSource });
  }
  return items.length ? items : [{ name: raw.trim(), grams: 100, isWater: false, weightSource: "default" }];
}

function findFuzzy(db, key) {
  for (const [k, v] of Object.entries(db)) { if (key.includes(k) || k.includes(key)) return v; }
  return null;
}

export function getFoodWarning(name, perHundred) {
  const isFried = /kachori|samosa|pakora|vada|fried|jalebi|gulab|halwa/.test(name.toLowerCase());
  if (perHundred && perHundred > 350) return "⚠️ Very high cal";
  if ((perHundred && perHundred > 300) || isFried) return "⚠️ Fried/oily";
  return null;
}

export function foodEmoji(name) {
  const n = name.toLowerCase();
  const MAP = [
    [["juice","nimbu","shikanji"],"🧃"],[["coconut water","nariyal"],"🥥"],
    [["water","paani"],"💧"],[["protein","whey","gainer"],"💪"],
    [["shake","lassi","smoothie","milk"],"🥛"],[["chai","tea"],"🍵"],
    [["coffee"],"☕"],[["egg"],"🥚"],[["chicken","mutton","lamb"],"🍗"],
    [["fish","salmon","tuna"],"🐟"],[["paneer"],"🧀"],
    [["rice","biryani","pulao"],"🍚"],[["roti","chapati","paratha","naan"],"🫓"],
    [["dal","curry","sabzi","chole","rajma"],"🍛"],[["banana","fruit","apple","mango","orange"],"🍌"],
    [["samosa","pakora","kachori","vada"],"🥟"],[["oat","cereal","dalia"],"🥣"],
    [["bread","sandwich","toast"],"🍞"],[["sweet","chocolate","biscuit"],"🍫"],
    [["nut","almond","peanut","cashew"],"🥜"],[["salad","vegetable","sabzi"],"🥗"],
  ];
  for (const [kws, emoji] of MAP) { if (kws.some((kw) => n.includes(kw))) return emoji; }
  return "🍽️";
}
