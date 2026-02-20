/**
 * App.jsx — NutriTrack
 * Root component managing app phase (loading → onboarding → summary → app).
 *
 * Architecture:
 *   App (phase router)
 *     ├── Onboarding (multi-step wizard)
 *     ├── Summary    (plan preview)
 *     └── Dashboard  (main tracker)
 *           ├── TodayTab
 *           ├── HistoryTab
 *           └── ProfileTab
 */

import { useState, useEffect } from "react";
import { usePersisted } from "./hooks/usePersisted";
import { calcTargets, calcBMI, buildWeekData, getGreeting, getTodayKey, downloadBackup, parseBackup, exportCSV } from "./utils/calculations";
import { estimateProtein } from "./utils/calculations";
import { ONBOARDING_STEPS } from "./data/foodConstants";
import Ring from "./components/Ring";
import FoodRow from "./components/FoodRow";
import AddFood from "./components/AddFood";

// ─── Global Styles ────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Nunito:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050d08; color: #e8f5ee; font-family: 'Syne', sans-serif; }
  input, textarea { outline: none; font-family: 'Nunito', sans-serif; }
  button { font-family: 'Syne', sans-serif; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #1a3a2a; border-radius: 2px; }
  @keyframes up   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin { to   { transform: rotate(360deg) } }
  @keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
  @keyframes pulse  { 0%,100% { opacity:1 } 50% { opacity:.6 } }
`;

// ─── Input Validation ─────────────────────────────────────────────────────────

function validateOnboardingAnswer(stepId, value) {
  if (!value && value !== 0) return "This field is required.";
  if (stepId === "age") {
    const n = Number(value);
    if (isNaN(n) || n < 10 || n > 100) return "Please enter a valid age (10–100).";
  }
  if (stepId === "height") {
    const n = Number(value);
    if (isNaN(n) || n < 100 || n > 250) return "Please enter a valid height in cm (100–250).";
  }
  if (stepId === "weight") {
    const n = Number(value);
    if (isNaN(n) || n < 20 || n > 300) return "Please enter a valid weight in kg (20–300).";
  }
  return null;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [value, setValue] = useState("");
  const [fading, setFading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const currentStep = ONBOARDING_STEPS[step];

  useEffect(() => {
    setValue(answers[currentStep.id] ?? "");
    setValidationError("");
  }, [step]);

  const advance = (override) => {
    const chosen = override !== undefined ? override : value;
    const err = validateOnboardingAnswer(currentStep.id, chosen);
    if (err) { setValidationError(err); return; }

    setFading(true);
    setTimeout(() => {
      const next = { ...answers, [currentStep.id]: chosen };
      setAnswers(next);
      setValue("");
      setFading(false);
      setValidationError("");
      if (step + 1 >= ONBOARDING_STEPS.length) onDone(next);
      else setStep((p) => p + 1);
    }, 180);
  };

  const pct = (step / ONBOARDING_STEPS.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#050d08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Decorative orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(#00ff8715,transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(#006aff10,transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }} />

      {/* Progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#0a1a10" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#00c853,#00ff87)", transition: "width .5s ease", borderRadius: "0 2px 2px 0" }} />
      </div>
      <div style={{ position: "absolute", top: 18, right: 20, fontSize: 11, color: "#2a6a3a", fontFamily: "'DM Mono',monospace" }}>{step + 1}/{ONBOARDING_STEPS.length}</div>
      {step > 0 && (
        <button onClick={() => setStep((p) => p - 1)} style={{ position: "absolute", top: 12, left: 16, background: "none", border: "none", color: "#2a6a3a", cursor: "pointer", fontSize: 22 }}>←</button>
      )}

      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>🌿</div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#1a5a2a", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>NutriTrack</div>
      </div>

      <div style={{ width: "100%", maxWidth: 400, opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)", transition: "all .18s ease" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#e8f5ee", marginBottom: 10, lineHeight: 1.3, letterSpacing: -0.5 }}>
          {currentStep.q}
        </h2>

        {currentStep.hint && (
          <div style={{ fontSize: 12, color: "#00ff87", marginBottom: 16, padding: "8px 12px", background: "#00ff8710", borderRadius: 10, border: "1px solid #00ff8720", lineHeight: 1.5 }}>
            💡 {currentStep.hint}
          </div>
        )}
        {step === 7 && (
          <div style={{ fontSize: 12, color: "#ffa040", marginBottom: 16, padding: "8px 12px", background: "#ffa04010", borderRadius: 10, border: "1px solid #ffa04025", lineHeight: 1.5 }}>
            ⚠️ Eating 1–2 large meals can cause bloating & stomach pain. We'll help you build a better eating schedule.
          </div>
        )}

        {validationError && (
          <p style={{ color: "#ff7070", fontSize: 12, marginBottom: 10 }}>⚠️ {validationError}</p>
        )}

        {currentStep.type === "text" && (
          <div style={{ marginTop: 16 }}>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && advance()}
              placeholder={currentStep.placeholder}
              style={{ width: "100%", background: "#0a1a0d", border: "2px solid #1a3a20", borderRadius: 14, padding: "16px 18px", color: "#e8f5ee", fontSize: 20, fontWeight: 700, transition: "border-color .2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#00ff87")}
              onBlur={(e) => (e.target.style.borderColor = "#1a3a20")}
            />
            <button onClick={() => advance()} style={{ marginTop: 14, width: "100%", background: "linear-gradient(135deg,#00c853,#00ff87)", border: "none", borderRadius: 14, color: "#021008", fontWeight: 800, fontSize: 16, padding: 16, cursor: "pointer" }}>Continue →</button>
          </div>
        )}

        {currentStep.type === "num" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ position: "relative" }}>
              <input
                autoFocus
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && advance()}
                placeholder={currentStep.placeholder}
                style={{ width: "100%", background: "#0a1a0d", border: "2px solid #1a3a20", borderRadius: 14, padding: "16px 60px 16px 18px", color: "#e8f5ee", fontSize: 26, fontFamily: "'DM Mono',monospace", transition: "border-color .2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#00ff87")}
                onBlur={(e) => (e.target.style.borderColor = "#1a3a20")}
              />
              <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#3a7a4a", fontFamily: "'DM Mono',monospace" }}>{currentStep.unit}</div>
            </div>
            <button onClick={() => advance()} style={{ marginTop: 14, width: "100%", background: "linear-gradient(135deg,#00c853,#00ff87)", border: "none", borderRadius: 14, color: "#021008", fontWeight: 800, fontSize: 16, padding: 16, cursor: "pointer" }}>Continue →</button>
          </div>
        )}

        {currentStep.type === "pick" && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {currentStep.opts.map((opt) => (
              <button key={opt.v} onClick={() => advance(opt.v)}
                style={{ background: "#0a1a0d", border: "2px solid #1a3a20", borderRadius: 14, padding: "14px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, color: "#e8f5ee", transition: "all .15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00ff87"; e.currentTarget.style.background = "#0d2015"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a3a20"; e.currentTarget.style.background = "#0a1a0d"; }}>
                <span style={{ fontSize: 26, width: 34, textAlign: "center" }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{opt.l}</div>
                  {opt.s && <div style={{ fontSize: 12, color: "#3a7a4a", fontFamily: "'Nunito',sans-serif", marginTop: 2 }}>{opt.s}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────

function Summary({ profile, targets, onStart }) {
  const { bmi, label: bmiLabel, color: bmiColor } = calcBMI(profile.weightKg, profile.heightCm);

  return (
    <div style={{ minHeight: "100vh", background: "#050d08", fontFamily: "'Syne',sans-serif", color: "#e8f5ee", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: "100%", maxWidth: 420, animation: "up .5s ease" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#2a7a3a", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>Your Plan is Ready</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>Hey, {profile.name}! 👋</h1>
        <p style={{ fontSize: 14, color: "#3a7a4a", fontFamily: "'Nunito',sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
          Based on your body & goals, here's your personalised daily plan:
        </p>

        {/* BMI Card */}
        <div style={{ background: "#0a1a0d", border: "1px solid #1a3a20", borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#2a5a30", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 14 }}>YOUR BODY ANALYSIS</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[["Age", `${profile.age} yrs`], ["Height", `${profile.heightCm} cm`], ["Weight", `${profile.weightKg} kg`]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#3a6a40", fontFamily: "'Nunito',sans-serif", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#3a6a40", fontFamily: "'Nunito',sans-serif", marginBottom: 4 }}>BMI</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: bmiColor }}>{bmi}</div>
              <div style={{ fontSize: 10, color: bmiColor }}>{bmiLabel}</div>
            </div>
          </div>
        </div>

        {bmi < 18.5 && (
          <div style={{ background: "#080d1a", border: "1px solid #1a2a5a", borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", marginBottom: 6 }}>⚠️ You're Underweight (BMI {bmi})</div>
            <p style={{ fontSize: 12, color: "#5a80b0", fontFamily: "'Nunito',sans-serif", lineHeight: 1.7 }}>
              You need to eat in a <b style={{ color: "#60a5fa" }}>caloric surplus</b> to gain healthy weight. We've set a plan to fix this.
            </p>
          </div>
        )}

        {/* Targets */}
        <div style={{ background: "#0a1a0d", border: "1px solid #1a3a20", borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#2a5a30", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>DAILY TARGETS</div>
          {[
            { icon: "⚡", l: "Your TDEE",    v: `${targets.tdee} kcal`,                    s: "Maintenance calories" },
            { icon: "🔥", l: "Calorie Goal", v: `${targets.calGoal} kcal`,                  s: "With goal adjustment", hi: true },
            { icon: "🥩", l: "Protein",      v: `~${targets.proteinG}g`,                    s: `${(targets.proteinG / profile.weightKg).toFixed(1)}g per kg` },
            { icon: "💧", l: "Water Goal",   v: `${(targets.waterMl / 1000).toFixed(1)}L`,  s: "Based on body weight" },
            { icon: "🍽️", l: "Meals/Day",   v: `${targets.mealFreq}+ meals`,               s: "Smaller meals = better digestion" },
          ].map(({ icon, l, v, s, hi }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #0d1a10" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: hi ? "#00ff87" : "#b8d8b8" }}>{l}</div>
                  <div style={{ fontSize: 11, color: "#2a5a30", fontFamily: "'Nunito',sans-serif" }}>{s}</div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: hi ? "#00ff87" : "#e8f5ee", fontFamily: "'DM Mono',monospace" }}>{v}</div>
            </div>
          ))}
        </div>

        <button onClick={onStart} style={{ width: "100%", background: "linear-gradient(135deg,#00c853,#00ff87)", border: "none", borderRadius: 18, color: "#021008", fontWeight: 800, fontSize: 18, padding: 20, cursor: "pointer", boxShadow: "0 8px 32px #00ff8750" }}>
          Start Tracking 🚀
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ profile, targets }) {
  const [meals, setMeals] = usePersisted("nt_meals_v3", {});
  const [water, setWater] = usePersisted("nt_water_v3", {});
  const [showAdd, setShowAdd] = useState(false);
  const [waterAnim, setWaterAnim] = useState(false);
  const [toast, setToast] = useState(null);
  const [waterAlert, setWaterAlert] = useState(false);
  const [tab, setTab] = useState("today");

  const today = getTodayKey();
  const todayMeals = meals[today] ?? [];
  const todayWater = water[today] ?? 0;
  const totalCal = todayMeals.reduce((s, m) => s + m.cal, 0);
  const calPct = (totalCal / targets.calGoal) * 100;
  const waterPct = (todayWater / targets.waterMl) * 100;
  const leftCal = Math.max(targets.calGoal - totalCal, 0);
  const surplus = totalCal > targets.calGoal ? totalCal - targets.calGoal : 0;
  const estProtein = estimateProtein(totalCal);
  const calColor = calPct > 110 ? "#ff6060" : calPct > 85 ? "#ffa040" : "#00ff87";
  const week = buildWeekData(meals, water, targets);

  // Water reminder every 50 minutes
  useEffect(() => {
    const iv = setInterval(() => { setWaterAlert(true); setTimeout(() => setWaterAlert(false), 10000); }, 50 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const addFood = ({ name, grams, cal }) => {
    setMeals((ms) => ({ ...ms, [today]: [...(ms[today] ?? []), { id: Date.now(), name, grams, cal, time: Date.now() }] }));
    showToast(`✓ ${name} · ${cal} kcal`);
  };

  const addWaterMl = (ml) => {
    setWater((w) => ({ ...w, [today]: Math.min((w[today] ?? 0) + ml, targets.waterMl + 2000) }));
    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), 600);
    setWaterAlert(false);
  };

  const addWater = (ml) => { addWaterMl(ml); showToast(`💧 +${ml}ml water`); };

  const deleteFood = (id) => {
    const meal = todayMeals.find((m) => m.id === id);
    setMeals((ms) => ({ ...ms, [today]: (ms[today] ?? []).filter((m) => m.id !== id) }));
    if (meal) showToast(`🗑️ "${meal.name}" removed · ${meal.cal} kcal subtracted`);
  };

  const handleDownloadBackup = () => {
    downloadBackup({ profile, targets, meals, water });
    showToast("💾 Backup downloaded!");
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = parseBackup(text);
    if (!result.ok) { showToast(`❌ ${result.error}`); return; }
    setMeals(result.backup.meals);
    setWater(result.backup.water);
    showToast(`✅ Restored ${Object.keys(result.backup.meals).length} days of data.`);
    e.target.value = "";
  };

  const handleExportCSV = () => {
    exportCSV(meals, water, targets);
    showToast("📊 CSV exported.");
  };

  return (
    <div style={{ fontFamily: "'Syne',sans-serif", minHeight: "100vh", background: "#050d08", color: "#e8f5ee", paddingBottom: 100 }}>
      <style>{GLOBAL_CSS + `.wbtn:hover{transform:scale(1.07);border-color:#38bdf8!important;} .wbtn{transition:all .15s;}`}</style>

      {/* Water Reminder */}
      {waterAlert && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 600, background: "linear-gradient(135deg,#002d6e,#0055cc)", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 24px #0055cc66", animation: "up .3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26, animation: "bounce 1s infinite" }}>💧</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Hydrate! Muscles need water 💪</div>
              <div style={{ fontSize: 11, color: "#80b8ff", fontFamily: "'Nunito',sans-serif" }}>{((targets.waterMl - todayWater) / 1000).toFixed(1)}L remaining today</div>
            </div>
          </div>
          <button onClick={() => addWater(250)} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 20, color: "#fff", padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>+250ml ✓</button>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: waterAlert ? 70 : 18, right: 14, zIndex: 700, background: "#0a1a0d", border: "1px solid #00ff8740", borderRadius: 12, padding: "11px 15px", fontSize: 13, fontFamily: "'Nunito',sans-serif", animation: "up .25s ease", color: "#00ff87" }}>{toast}</div>}

      {showAdd && (
        <AddFood
          onAdd={addFood}
          onAddWater={(ml) => { addWaterMl(ml); showToast(`💧 +${ml}ml water from drink`); }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Header */}
      <div style={{ padding: "26px 18px 14px", background: "linear-gradient(180deg,#08150a,#050d08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#1a5a25", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 4 }}>
              {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{getGreeting()}, {profile.name}! 🌿</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#1a5a25", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>MEALS</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: todayMeals.length >= targets.mealFreq ? "#00ff87" : "#ffa040" }}>{todayMeals.length}/{targets.mealFreq}</div>
          </div>
        </div>
        {todayMeals.length < targets.mealFreq && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#1a0e02", border: "1px solid #ffa04028", borderRadius: 10, fontSize: 12, color: "#cc8040", fontFamily: "'Nunito',sans-serif" }}>
            🍽️ {todayMeals.length} meal{todayMeals.length !== 1 ? "s" : ""} logged — aim for {targets.mealFreq} today.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#050d08", borderBottom: "1px solid #0d1a10", padding: "0 14px" }}>
        {[["today", "Today"], ["history", "History"], ["profile", "Profile"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, background: "none", border: "none", color: tab === id ? "#00ff87" : "#1a5a25", padding: "12px 8px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderBottom: tab === id ? "2px solid #00ff87" : "2px solid transparent", transition: "all .2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {tab === "today" && (
        <div style={{ padding: 14, animation: "up .4s ease" }}>

          {/* Rings */}
          <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 20, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <Ring pct={calPct} size={126} stroke={11} color={calColor} track="#122015">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: calColor, fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{totalCal}</div>
                  <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace" }}>/{targets.calGoal}</div>
                  <div style={{ fontSize: 9, color: "#1a4a1a" }}>kcal</div>
                </div>
              </Ring>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: "#b0d0b0" }}>Calories</div>
              <div style={{ fontSize: 11, color: surplus > 0 ? "#00ff87" : "#3a7a3a", fontFamily: "'Nunito',sans-serif" }}>
                {surplus > 0 ? `+${surplus} surplus 💪` : `${leftCal} kcal to go`}
              </div>
            </div>

            <div style={{ width: 1, height: 90, background: "#122015" }} />

            <div style={{ textAlign: "center" }}>
              <Ring pct={waterPct} size={126} stroke={11} color={waterPct >= 100 ? "#00ff87" : "#38bdf8"} track="#0a1525">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: waterPct >= 100 ? "#00ff87" : "#38bdf8", fontFamily: "'DM Mono',monospace", lineHeight: 1, animation: waterAnim ? "bounce .6s" : "none" }}>
                    {(todayWater / 1000).toFixed(1)}L
                  </div>
                  <div style={{ fontSize: 10, color: "#1a3a5a", fontFamily: "'DM Mono',monospace" }}>/{(targets.waterMl / 1000).toFixed(1)}L</div>
                  <div style={{ fontSize: 14, marginTop: 2 }}>💧</div>
                </div>
              </Ring>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: "#b0d0b0" }}>Hydration</div>
              <div style={{ fontSize: 11, color: waterPct >= 100 ? "#00ff87" : "#2a5a8a", fontFamily: "'Nunito',sans-serif" }}>
                {waterPct >= 100 ? "Fully hydrated! 🎉" : `${Math.round(targets.waterMl - todayWater)}ml left`}
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 14 }}>DAILY PROGRESS</div>
            {[
              { l: "Calories",      c: totalCal,                          m: targets.calGoal,                          u: "kcal", col: calColor },
              { l: "Protein (est.)",c: estProtein,                        m: targets.proteinG,                         u: "g",    col: "#fb923c" },
              { l: "Hydration",     c: +(todayWater / 1000).toFixed(2),   m: +(targets.waterMl / 1000).toFixed(1),    u: "L",    col: waterPct >= 100 ? "#00ff87" : "#38bdf8" },
            ].map(({ l, c, m, u, col }) => (
              <div key={l} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'Nunito',sans-serif", color: "#2a5a2a", marginBottom: 5 }}>
                  <span>{l}</span><span style={{ color: col }}>{c}{u} / {m}{u}</span>
                </div>
                <div style={{ height: 6, background: "#122015", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((c / m) * 100, 100)}%`, background: col, borderRadius: 3, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Water Log */}
          <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>💧 LOG WATER</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[150, 250, 350, 500].map((ml) => (
                <button key={ml} onClick={() => addWater(ml)} className="wbtn"
                  style={{ flex: 1, background: "#060f18", border: "1px solid #122540", borderRadius: 12, color: "#38bdf8", fontWeight: 700, fontSize: 12, padding: "12px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "'DM Mono',monospace" }}>
                  <span style={{ fontSize: 18 }}>💧</span><span>{ml}ml</span>
                </button>
              ))}
            </div>
          </div>

          {/* Food Log */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Today's Food Log</div>
              <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg,#00c853,#00ff87)", border: "none", borderRadius: 20, color: "#021008", fontWeight: 800, fontSize: 12, padding: "8px 16px", cursor: "pointer" }}>+ Log Food</button>
            </div>

            {todayMeals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", background: "#08120a", borderRadius: 16, border: "1px dashed #1a3a20" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <p style={{ color: "#2a5a2a", fontSize: 14, fontFamily: "'Nunito',sans-serif", lineHeight: 1.7 }}>
                  No food logged yet today.<br />
                  Tap <b style={{ color: "#00ff87" }}>+ Log Food</b>, type what you ate<br />
                  and we'll calculate the calories for you!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: "#2a5a2a", fontFamily: "'Nunito',sans-serif", textAlign: "center", padding: "4px 0", marginBottom: 2 }}>
                  Tap 🗑️ on any entry to remove it
                </div>
                {todayMeals.map((m, i) => (
                  <FoodRow key={m.id} meal={m} index={i} onDelete={() => deleteFood(m.id)} />
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "linear-gradient(135deg,#001a08,#000e04)", borderRadius: 14, border: "1px solid #00ff8728" }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#00ff87", fontFamily: "'DM Mono',monospace" }}>{totalCal} kcal</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div style={{ padding: 16, animation: "up .4s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Weekly Overview</div>
            <button onClick={handleExportCSV} style={{ background: "#0a1a0d", border: "1px solid #1a3a20", borderRadius: 12, padding: "7px 12px", color: "#00ff87", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              📊 Export CSV
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#2a5a2a", fontFamily: "'Nunito',sans-serif", marginBottom: 18 }}>Goal: {targets.calGoal} kcal/day</div>

          {/* 30-day stats */}
          {(() => {
            const last30 = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split("T")[0]; });
            const allMeals = last30.flatMap((date) => meals[date] ?? []);
            const avgCals = Math.round(allMeals.reduce((s, m) => s + m.cal, 0) / 30);
            const daysLogged = last30.filter((d) => (meals[d] ?? []).length > 0).length;
            const daysMetGoal = last30.filter((d) => (meals[d] ?? []).reduce((s, m) => s + m.cal, 0) >= targets.calGoal * 0.9).length;
            const daysMetWater = last30.filter((d) => (water[d] ?? 0) >= targets.waterMl * 0.8).length;

            return (
              <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#2a5a2a", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, marginBottom: 12 }}>LAST 30 DAYS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[["📅 Days Tracked", `${daysLogged}/30`], ["📊 Avg Daily", `${avgCals} kcal`], ["✅ Met Goal", `${daysMetGoal} days`], ["💧 Hydrated", `${daysMetWater} days`]].map(([label, val]) => (
                    <div key={label} style={{ background: "#0a1a0d", borderRadius: 10, padding: "10px 12px", border: "1px solid #122015" }}>
                      <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'Nunito',sans-serif", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#00ff87" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Bar Chart */}
          <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 20, padding: 20, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
              {week.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9, color: d.cals > 0 ? "#00ff87" : "#1a3a1a", fontFamily: "'DM Mono',monospace", height: 14, display: "flex", alignItems: "center" }}>
                    {d.cals > 0 ? d.cals : ""}
                  </div>
                  <div style={{ width: "100%", height: `${Math.max(d.pct, 3)}%`, background: d.isToday ? "linear-gradient(180deg,#00ff87,#00c853)" : d.cals > 0 ? "#1a3a1a" : "#0d1a10", borderRadius: "4px 4px 0 0", minHeight: 4, position: "relative" }}>
                    {d.waterOk && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: 10 }}>💧</div>}
                  </div>
                  <div style={{ fontSize: 10, color: d.isToday ? "#00ff87" : "#1a5a20", fontWeight: d.isToday ? 700 : 400 }}>{d.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#1a4a1a", fontFamily: "'Nunito',sans-serif", marginTop: 10, textAlign: "center" }}>💧 = hit water goal that day</div>
          </div>

          {/* History Log */}
          {Object.entries(meals).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10).map(([date, dayMeals]) => {
            const total = dayMeals.reduce((s, m) => s + m.cal, 0);
            const isToday = date === today;
            const d = new Date(date + "T12:00:00");
            return (
              <div key={date} style={{ background: "#08120a", border: `1px solid ${isToday ? "#00ff8728" : "#122015"}`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? "#00ff87" : "#b0d0b0" }}>
                    {isToday ? "Today" : d.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, color: total >= targets.calGoal ? "#00ff87" : "#ffa040" }}>{total} kcal</div>
                </div>
                <div style={{ height: 4, background: "#122015", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((total / targets.calGoal) * 100, 100)}%`, background: total >= targets.calGoal ? "#00ff87" : "#ffa040", borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: "#1a4a1a", fontFamily: "'Nunito',sans-serif", lineHeight: 1.5 }}>
                  {dayMeals.slice(0, 3).map((m) => `${m.name} (${m.cal}kcal)`).join(" · ")}
                  {dayMeals.length > 3 && <span style={{ color: "#1a3a1a" }}> +{dayMeals.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div style={{ padding: 16, animation: "up .4s ease" }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Your Profile & Plan</div>

          {/* Backup */}
          <div style={{ background: "linear-gradient(135deg,#0a1a20,#081218)", border: "1px solid #1a3a5a", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4a9aff", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>☁️ Backup & Sync</div>
            <p style={{ fontSize: 11, color: "#2a5a7a", fontFamily: "'Nunito',sans-serif", lineHeight: 1.6, marginBottom: 12 }}>
              Download all your data as a backup file, then upload to Google Drive. Restore on any device by importing the file.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleDownloadBackup} style={{ flex: 1, background: "linear-gradient(135deg,#0066cc,#0088ff)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 12, padding: "12px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                💾 Download Backup
              </button>
              <button onClick={() => document.getElementById("restore-input").click()} style={{ flex: 1, background: "#0a2a1a", border: "1px solid #1a4a2a", borderRadius: 12, color: "#00ff87", fontWeight: 700, fontSize: 12, padding: "12px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                📂 Restore Backup
              </button>
            </div>
            <input id="restore-input" type="file" accept=".json" onChange={handleRestoreFile} style={{ display: "none" }} />
          </div>

          {/* Body Stats */}
          <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>BODY STATS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                ["Age",      `${profile.age} yrs`],
                ["Height",   `${profile.heightCm} cm`],
                ["Weight",   `${profile.weightKg} kg`],
                ["Activity", { sedentary: "Sedentary", light: "Light", moderate: "Moderate", active: "Very Active" }[profile.activity]],
                ["Goal",     { gain_muscle: "Gain Muscle", lose_fat: "Lose Fat", maintain: "Maintain" }[profile.goal]],
                ["Sex",      profile.sex === "male" ? "Male" : "Female"],
              ].map(([l, v]) => (
                <div key={l} style={{ background: "#0a1a0d", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'Nunito',sans-serif", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Targets */}
          <div style={{ background: "#08120a", border: "1px solid #122015", borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>DAILY TARGETS</div>
            {[
              ["🔥", "Calorie Goal", `${targets.calGoal} kcal`],
              ["⚡", "BMR",          `${targets.bmr} kcal`],
              ["📊", "TDEE",         `${targets.tdee} kcal`],
              ["🥩", "Protein",      `~${targets.proteinG}g`],
              ["💧", "Water",        `${(targets.waterMl / 1000).toFixed(1)}L`],
              ["🍽️","Meals",         `${targets.mealFreq}+ per day`],
            ].map(([icon, l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0d1a10" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: "#9aba9a", fontFamily: "'Nunito',sans-serif" }}>{l}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#00ff87" }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { window.storage.delete("nt_profile_v3").catch(() => {}); window.location.reload(); }}
            style={{ width: "100%", background: "#0a1a0d", border: "1px solid #2a1a1a", borderRadius: 14, color: "#5a2a2a", fontWeight: 700, padding: 14, cursor: "pointer", fontSize: 13 }}>
            🔄 Reset & Restart Onboarding
          </button>
        </div>
      )}

      {/* FAB */}
      {tab === "today" && (
        <button onClick={() => setShowAdd(true)} style={{ position: "fixed", bottom: 24, right: 22, zIndex: 400, width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#00c853,#00ff87)", border: "none", color: "#021008", fontSize: 28, cursor: "pointer", boxShadow: "0 8px 32px #00ff8760", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>+</button>
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState("loading");
  const [profile, setProfile] = usePersisted("nt_profile_v3", null);
  const [pending, setPending] = useState(null);
  const [targets, setTargets] = useState(null);

  useEffect(() => {
    window.storage
      .get("nt_profile_v3")
      .then((result) => {
        if (result?.value) {
          const p = JSON.parse(result.value);
          setTargets(calcTargets(p));
          setPhase("app");
        } else {
          setPhase("onboarding");
        }
      })
      .catch(() => setPhase("onboarding"));
  }, []);

  const handleOnboardingDone = (answers) => {
    const p = {
      name:        answers.name     || "Friend",
      age:         +answers.age     || 23,
      sex:         answers.sex      || "male",
      heightCm:    +answers.height  || 167,
      weightKg:    +answers.weight  || 65,
      activity:    answers.activity || "sedentary",
      goal:        answers.goal     || "maintain",
      currentMeals:answers.meals    || "3",
    };
    setPending(p);
    setTargets(calcTargets(p));
    setPhase("summary");
  };

  const handleStart = () => {
    setProfile(pending);
    setPhase("app");
  };

  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#050d08", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ fontSize: 44 }}>🌿</div>
        <div style={{ width: 30, height: 30, border: "3px solid #122015", borderTopColor: "#00ff87", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  if (phase === "onboarding") return <Onboarding onDone={handleOnboardingDone} />;
  if (phase === "summary")    return <Summary profile={pending} targets={targets} onStart={handleStart} />;
  return <Dashboard profile={profile ?? pending} targets={targets} />;
}
