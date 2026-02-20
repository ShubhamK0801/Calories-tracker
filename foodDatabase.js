/**
 * foodDatabase.js
 * Calorie values per 100g (or per 100ml for liquids).
 * Source: standard nutritional databases + Indian food estimates.
 */

export const FOOD_DB = {
  // Grains & Bread
  "rice": 130, "white rice": 130, "brown rice": 111, "boiled rice": 130, "steamed rice": 130,
  "roti": 297, "chapati": 297, "paratha": 326, "naan": 310, "puri": 340,
  "bread": 265, "white bread": 265, "whole wheat bread": 247, "toast": 280,
  "oats": 389, "oatmeal": 71,
  "dalia": 100, "dalia cooked": 100, "dalia with ghee": 180, "broken wheat": 100,
  "poha": 110, "poha with oil": 160, "upma": 160, "upma with oil": 200,
  "idli": 58, "dosa": 168, "dosa with oil": 220,

  // Lentils & Legumes
  "dal": 116, "dal with tadka": 145, "moong dal": 105, "chana dal": 360,
  "masoor dal": 116, "toor dal": 116, "dal makhani": 145, "dal fry": 135,
  "rajma": 127, "rajma curry": 150, "chole": 164, "chana": 164,
  "chickpeas": 164, "kidney beans": 127,

  // Vegetables
  "potato": 77, "aloo": 77, "boiled potato": 77, "fried potato": 180,
  "sweet potato": 90, "broccoli": 34, "spinach": 23, "palak": 23,
  "carrot": 41, "tomato": 18, "onion": 40, "cucumber": 15, "corn": 86, "peas": 81,
  "cauliflower": 25, "gobi": 25, "cabbage": 25, "eggplant": 25, "baingan": 25,

  // Protein
  "chicken": 165, "chicken breast": 165, "chicken curry": 180, "grilled chicken": 165,
  "fried chicken": 250, "chicken tikka": 150,
  "mutton": 294, "lamb": 294, "mutton curry": 320,
  "beef": 250, "pork": 242,
  "fish": 136, "fried fish": 220, "salmon": 208, "tuna": 132,
  "egg": 155, "boiled egg": 78, "fried egg": 148, "omelette": 154, "scrambled egg": 148,
  "paneer": 265, "paneer curry": 290, "fried paneer": 320,
  "tofu": 76, "soya chunks": 345,

  // Dairy
  "milk": 61, "whole milk": 61, "curd": 98, "dahi": 98, "yogurt": 98, "greek yogurt": 97,
  "cheese": 402, "butter": 717, "ghee": 900,
  "whey protein": 380, "protein shake": 150, "mass gainer": 380, "protein bar": 350,

  // Fruits
  "banana": 89, "apple": 52, "mango": 60, "orange": 47, "grapes": 69,
  "watermelon": 30, "papaya": 43, "guava": 68, "pineapple": 50,

  // Snacks
  "samosa": 262, "samosa fried": 310, "big samosa": 350,
  "pakora": 200, "pakora fried": 280, "bhajiya": 200, "vada": 240,
  "kachori": 350, "khasta kachori": 370, "mini kachori": 350, "fried kachori": 370,
  "aloo tikki": 180, "aloo tikki fried": 240,
  "bread pakora": 220, "paneer pakora": 280,

  // Sweets
  "jalebi": 300, "gulab jamun": 150, "rasgulla": 140, "ladoo": 420,
  "barfi": 400, "halwa": 320, "kheer": 150, "gajar halwa": 350,

  // Sabudana
  "sabudana": 358, "sabudana khichdi": 180, "sabudana khichdi with oil": 220,
  "sabudana vada": 250, "sabudana vada fried": 320,

  // Fast Food
  "burger": 295, "fried burger": 380, "pizza": 266, "sandwich": 200,
  "biscuit": 458, "cookie": 480, "chocolate": 546, "chips": 547,
  "namkeen": 450, "peanuts": 567, "almonds": 579, "cashew": 553, "walnuts": 654,

  // Drinks (per 100ml)
  "chai": 40, "tea": 40, "coffee": 5, "lassi": 72,
  "juice": 46, "fruit juice": 46, "orange juice": 45, "apple juice": 46, "mango juice": 60,
  "watermelon juice": 30, "pomegranate juice": 54, "grape juice": 60, "pineapple juice": 50,
  "lemon juice": 22, "nimbu pani": 25, "shikanji": 30, "sugarcane juice": 73,
  "amla juice": 25, "aloe vera juice": 15, "carrot juice": 40, "tomato juice": 17,
  "mixed fruit juice": 50, "packaged juice": 50, "real juice": 55, "tropicana": 50,
  "coconut water": 19, "nariyal pani": 19, "buttermilk": 40, "chaas": 40,

  // Indian Meals
  "biryani": 190, "chicken biryani": 220, "mutton biryani": 240,
  "pulao": 150, "veg pulao": 140, "khichdi": 130,
  "pav bhaji": 180, "butter chicken": 165, "shahi paneer": 200,
  "palak paneer": 140, "aloo gobi": 95, "aloo matar": 110,
  "baingan bharta": 90, "bhindi": 80, "mixed vegetables": 80, "sabzi": 90,
  "curry": 120, "paneer butter masala": 200,
  "rajma chawal": 130, "curd rice": 140, "dahi rice": 140,
  "egg bhurji": 180, "paneer bhurji": 200,
};
