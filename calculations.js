/**
 * calculations.js
 * Pure utility functions — no React imports, fully unit-testable.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const GOAL_ADJUSTMENTS = {
  gain_muscle: 350,
  lose_fat: -400,
  maintain: 0,
};

// ─── Nutrition Calculations ───────────────────────────────────────────────────

/**
 * Calculate daily nutrition targets from a user profile (Mifflin-St Jeor).
 * @param {{ age: number, sex: "male"|"female", heightCm: number, weightKg: number, activity: string, goal: string }} profile
 * @returns {{ bmr: number, tdee: number, calGoal: number, waterMl: number, proteinG: number, mealFreq: number }}
 */
export function calcTargets(profile) {
  const { age, sex, heightCm, weightKg, activity, goal } = profile;

  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(sex === "male" ? bmrBase + 5 : bmrBase - 161);
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity] ?? 1.2));
  const calGoal = Math.round(tdee + (GOAL_ADJUSTMENTS[goal] ?? 0));
  const waterMl = Math.round(weightKg * 35 + (activity !== "sedentary" ? 200 : 0));
  const proteinG = Math.round(weightKg * (goal === "gain_muscle" ? 1.8 : 1.6));

  return { bmr, tdee, calGoal, waterMl, proteinG, mealFreq: 4 };
}

/**
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ bmi: number, label: string, color: string }}
 */
export function calcBMI(weightKg, heightCm) {
  const bmi = +(weightKg / (heightCm / 100) ** 2).toFixed(1);
  if (bmi < 18.5) return { bmi, label: "Underweight", color: "#60a5fa" };
  if (bmi < 25)   return { bmi, label: "Normal",      color: "#00ff87" };
  if (bmi < 30)   return { bmi, label: "Overweight",  color: "#ffa040" };
  return             { bmi, label: "Obese",        color: "#ff5555" };
}

/**
 * Rough protein estimate: 15% of calories / 4 kcal per gram.
 * @param {number} totalCalories
 * @returns {number}
 */
export function estimateProtein(totalCalories) {
  return Math.round((totalCalories * 0.15) / 4);
}

/**
 * Build a 7-day summary array ending today.
 * @param {Record<string, {cal:number}[]>} meals
 * @param {Record<string, number>} water
 * @param {{ calGoal: number, waterMl: number }} targets
 */
export function buildWeekData(meals, water, targets) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = getTodayKey();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const cals = (meals[key] || []).reduce((sum, m) => sum + m.cal, 0);
    return {
      label: DAYS[d.getDay()],
      cals,
      pct: Math.min((cals / targets.calGoal) * 100, 100),
      isToday: key === today,
      waterOk: (water[key] || 0) >= targets.waterMl * 0.8,
    };
  });
}

// ─── Date / Time Helpers ─────────────────────────────────────────────────────

export const getTodayKey = () => new Date().toISOString().split("T")[0];

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return "Good morning";
  if (hr < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Backup / Export ─────────────────────────────────────────────────────────

export function downloadBackup({ profile, targets, meals, water }) {
  const payload = JSON.stringify(
    { version: "3", exportDate: new Date().toISOString(), profile, targets, meals, water },
    null,
    2
  );
  triggerDownload(payload, "application/json", `NutriTrack_Backup_${getTodayKey()}.json`);
}

/**
 * @returns {{ ok: true, backup: object } | { ok: false, error: string }}
 */
export function parseBackup(text) {
  try {
    const backup = JSON.parse(text);
    if (!backup.meals || !backup.water || !backup.profile) {
      return { ok: false, error: "Invalid backup file format." };
    }
    return { ok: true, backup };
  } catch {
    return { ok: false, error: "Failed to parse backup — make sure it's a valid NutriTrack JSON." };
  }
}

export function exportCSV(meals, water, targets) {
  const allDates = [...new Set([...Object.keys(meals), ...Object.keys(water)])].sort().reverse();
  const header =
    "Date,Day,Total Calories,Calorie Goal,Calories %,Water (ml),Water Goal (ml),Water %,Meals Count,Meal Names,Meal Details";

  const rows = allDates.map((date) => {
    const dayMeals = meals[date] || [];
    const dayWater = water[date] || 0;
    const totalCal = dayMeals.reduce((s, m) => s + m.cal, 0);
    const dayName = new Date(date + "T12:00:00").toLocaleDateString("en", { weekday: "short" });
    const mealNames = dayMeals.map((m) => m.name).join("; ");
    const mealDetails = dayMeals.map((m) => `${m.name} (${m.grams}g, ${m.cal}kcal)`).join("; ");
    return [
      date, dayName, totalCal, targets.calGoal,
      `${Math.round((totalCal / targets.calGoal) * 100)}%`,
      dayWater, targets.waterMl,
      `${Math.round((dayWater / targets.waterMl) * 100)}%`,
      dayMeals.length,
      `"${mealNames}"`,
      `"${mealDetails}"`,
    ].join(",");
  });

  triggerDownload([header, ...rows].join("\n"), "text/csv;charset=utf-8;", `NutriTrack_Export_${getTodayKey()}.csv`);
}

function triggerDownload(content, mimeType, filename) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}
