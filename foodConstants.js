/**
 * foodConstants.js
 * Lookup tables for food parsing: units, standard weights, water keywords.
 */

export const WATER_WORDS = ["water", "paani", "pani", "plain water", "drinking water", "h2o"];

export const UNIT_MAP = {
  scoop: 30, scoops: 30,
  cup: 240, cups: 240,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  piece: 100, pieces: 100, pcs: 100,
  slice: 30, slices: 30,
  bowl: 300, bowls: 300,
  plate: 350, plates: 350,
  glass: 250, glasses: 250,
  bottle: 500, bottles: 500,
  serving: 100, servings: 100,
  packet: 30, packets: 30,
};

export const STANDARD_WEIGHTS = {
  // Fruits (per piece)
  banana: 120, bananas: 120, apple: 180, apples: 180, mango: 200, mangoes: 200,
  orange: 130, oranges: 130, guava: 100, papaya: 150, watermelon: 300, grapes: 100,

  // Eggs & Dairy
  egg: 55, eggs: 55, "boiled egg": 55, "boiled eggs": 55, omelette: 100, "scrambled egg": 100,

  // Indian Breads
  roti: 40, rotis: 40, chapati: 40, paratha: 60, naan: 80, puri: 35, bread: 30,

  // Rice & Grains (cooked)
  rice: 150, "white rice": 150, "brown rice": 150, oats: 80, oatmeal: 250,
  poha: 150, upma: 200, idli: 50, dosa: 100,

  // Lentils (1 katori)
  dal: 150, "moong dal": 150, "masoor dal": 150, "toor dal": 150, "dal makhani": 150,
  rajma: 150, chole: 150, chana: 100,

  // Vegetables (1 katori cooked)
  potato: 100, aloo: 100, "sweet potato": 100, broccoli: 80,
  spinach: 80, palak: 80, peas: 80, cauliflower: 100, gobi: 100, "mixed vegetables": 150,

  // Proteins (1 serving)
  chicken: 150, "chicken breast": 150, "grilled chicken": 150, "chicken curry": 200,
  mutton: 150, fish: 150, salmon: 150, tuna: 100,
  paneer: 80, "paneer curry": 120, tofu: 100, "soya chunks": 30,

  // Dairy & Drinks
  milk: 200, "whole milk": 200, curd: 100, dahi: 100, yogurt: 100, lassi: 250,
  chai: 150, tea: 150, coffee: 200,

  // Juices (1 glass)
  juice: 200, "fruit juice": 200, "orange juice": 200, "apple juice": 200,
  "mango juice": 200, "coconut water": 200, "nimbu pani": 200,

  // Main Dishes (1 serving)
  biryani: 300, "chicken biryani": 300, "mutton biryani": 300, pulao: 200,
  khichdi: 200, "pav bhaji": 250, "butter chicken": 200,

  // Snacks
  samosa: 60, "big samosa": 80, pakora: 50, vada: 60, kachori: 40, "aloo tikki": 70,

  // Sweets
  jalebi: 50, "gulab jamun": 50, rasgulla: 50, ladoo: 40, barfi: 50, halwa: 100,

  // Nuts & Supplements
  almonds: 30, cashew: 30, walnuts: 30, peanuts: 30, biscuit: 30,
  "whey protein": 30, "protein shake": 300, "protein bar": 60,
};

export const ONBOARDING_STEPS = [
  { id: "name",     q: "What's your name?",                    type: "text",  placeholder: "Your name..." },
  { id: "age",      q: "How old are you?",                     type: "num",   placeholder: "e.g. 23", unit: "years" },
  { id: "sex",      q: "What is your biological sex?",         type: "pick",  opts: [{ v: "male", icon: "♂️", l: "Male" }, { v: "female", icon: "♀️", l: "Female" }] },
  { id: "height",   q: "What is your height?",                 type: "num",   placeholder: "e.g. 167", unit: "cm" },
  { id: "weight",   q: "What is your current weight?",         type: "num",   placeholder: "e.g. 65", unit: "kg", hint: "Used to calculate your exact calorie & protein needs" },
  { id: "activity", q: "How active is your daily life?",       type: "pick",  opts: [
    { v: "sedentary", icon: "🪑", l: "Sedentary",   s: "Desk job, mostly sitting" },
    { v: "light",     icon: "🚶", l: "Light",        s: "Light exercise 1–3×/week" },
    { v: "moderate",  icon: "🏃", l: "Moderate",     s: "Exercise 4–5×/week" },
    { v: "active",    icon: "🏋️", l: "Very Active",  s: "Intense daily exercise" },
  ]},
  { id: "goal",     q: "What is your main health goal?",       type: "pick",  opts: [
    { v: "gain_muscle", icon: "💪", l: "Gain Muscle & Weight", s: "Build mass, look bigger & stronger" },
    { v: "lose_fat",    icon: "🔥", l: "Lose Fat",             s: "Get lean, burn body fat" },
    { v: "maintain",    icon: "⚖️", l: "Maintain Weight",      s: "Stay at current weight" },
  ]},
  { id: "meals",    q: "How many meals do you usually eat per day?", type: "pick", hint: "Eating too few meals can cause stomach issues", opts: [
    { v: "1", icon: "1️⃣", l: "1 meal",    s: "One big meal a day" },
    { v: "2", icon: "2️⃣", l: "2 meals",   s: "Twice a day" },
    { v: "3", icon: "3️⃣", l: "3 meals",   s: "Breakfast, lunch, dinner" },
    { v: "4", icon: "🍽️", l: "4–5 meals", s: "Frequent smaller meals" },
  ]},
];
