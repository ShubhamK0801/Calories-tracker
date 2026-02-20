/**
 * AddFood.jsx
 * Bottom-sheet modal for logging a food entry.
 */

import { useState, useRef, useEffect } from "react";
import { parseEntry, estimateCal, getFoodWarning, foodEmoji } from "../utils/foodParser";
import { aiLookup } from "../utils/aiLookup";
import { FOOD_DB } from "../data/foodDatabase";

const EXAMPLES = [
  "1 scoop protein powder 35g with 300ml water",
  "2 rotis with dal",
  "banana",
  "grilled chicken 150g",
  "oatmeal 80g with milk 200ml",
  "3 boiled eggs",
  "orange juice 200ml",
  "mango juice 250ml",
];

export default function AddFood({ onAdd, onClose, onAddWater }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setBreakdown(null);
    setError("");
  };

  const calculate = async () => {
    const trimmed = input.trim();
    if (!trimmed) { setError("Please describe what you ate or drank."); return; }

    setLoading(true);
    setError("");
    setBreakdown(null);

    const items = parseEntry(trimmed);
    const results = [];

    for (const item of items) {
      if (item.isWater) {
        results.push({ ...item, cal: 0, note: "Pure water — 0 calories ✓" });
        continue;
      }

      let cal = estimateCal(item.name, item.grams);
      const dbKey = Object.keys(FOOD_DB).find(
        (k) => item.name.toLowerCase().includes(k) || k.includes(item.name.toLowerCase())
      );
      const perHundred = dbKey ? FOOD_DB[dbKey] : null;

      if (cal === null) cal = await aiLookup(item.name, item.grams);

      results.push({
        ...item,
        cal: cal ?? null,
        note: cal !== null ? (perHundred ? `${perHundred} kcal/100g` : "AI estimated") : "Unknown food",
        warning: cal !== null ? getFoodWarning(item.name, perHundred) : null,
      });
    }

    setLoading(false);

    if (results.every((r) => r.cal === null)) {
      setError("Couldn't find calorie data. Try simpler names like 'protein shake', 'chicken', or 'rice'.");
    } else {
      setBreakdown(results);
    }
  };

  const confirmLog = () => {
    if (!breakdown) return;
    breakdown.filter((r) => !r.isWater && r.cal !== null).forEach((r) => onAdd({ name: r.name, grams: r.grams, cal: r.cal }));
    const totalWaterMl = breakdown.filter((r) => r.isWater).reduce((s, r) => s + (r.ml ?? r.grams), 0);
    if (totalWaterMl > 0) onAddWater(totalWaterMl);
    onClose();
  };

  const totalCal = breakdown?.reduce((s, r) => s + (r.cal || 0), 0) ?? 0;
  const totalWaterMl = breakdown?.filter((r) => r.isWater).reduce((s, r) => s + (r.ml ?? r.grams), 0) ?? 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-end", background: "rgba(2,8,4,.9)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "#080f0a", borderRadius: "22px 22px 0 0", border: "1px solid #1a3a20", padding: "22px 18px 36px", animation: "up .3s ease" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>What Did You Eat?</div>
          <button onClick={onClose} style={{ background: "#132015", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#3a7a3a", cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: "#3a7a3a", fontFamily: "'Nunito',sans-serif", marginBottom: 14, lineHeight: 1.5 }}>
          Describe naturally — include weight, scoops, or ml. We'll split and calculate each item.
        </p>

        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); calculate(); } }}
          placeholder="e.g. 1 scoop protein powder 35g with 300ml water"
          rows={2}
          style={{ width: "100%", background: "#0a1a0d", border: "2px solid #1a3a20", borderRadius: 14, padding: "13px 15px", color: "#e8f5ee", fontSize: 14, fontFamily: "'Nunito',sans-serif", resize: "none", lineHeight: 1.6, marginBottom: 10, outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "#00ff87")}
          onBlur={(e) => (e.target.style.borderColor = "#1a3a20")}
        />

        {/* Example Pills */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 6 }}>EXAMPLES — tap to try:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => { setInput(ex); setBreakdown(null); setError(""); }}
                style={{ background: "#0a1a0d", border: "1px solid #1a3a20", borderRadius: 20, padding: "4px 10px", color: "#3a7a3a", fontSize: 11, cursor: "pointer" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize: 12, color: "#ff7070", marginBottom: 10 }}>⚠️ {error}</p>}

        {/* Breakdown */}
        {breakdown && (
          <div style={{ background: "#021008", border: "1px solid #00ff8730", borderRadius: 16, padding: 14, marginBottom: 14, animation: "up .3s ease" }}>
            <div style={{ fontSize: 10, color: "#00ff87", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, marginBottom: 12 }}>CALORIE BREAKDOWN</div>
            {breakdown.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < breakdown.length - 1 ? "1px solid #0a2015" : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{item.isWater ? "💧" : foodEmoji(item.name)}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8e8c8", textTransform: "capitalize", display: "flex", alignItems: "center", gap: 6 }}>
                        {item.name}
                        {item.warning && <span style={{ fontSize: 9, background: "#2a0808", border: "1px solid #5a1010", borderRadius: 4, padding: "2px 6px", color: "#ff6060", fontWeight: 700 }}>{item.warning}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#2a5a2a", fontFamily: "'DM Mono',monospace" }}>
                        {item.isWater ? `${item.ml ?? item.grams}ml` : `${item.grams}g`} · {item.note}
                        {!item.isWater && item.weightSource && item.weightSource !== "specified" && (
                          <span style={{ marginLeft: 6, background: "#0d2a1a", border: "1px solid #1a4a2a", borderRadius: 4, padding: "1px 5px", fontSize: 9, color: "#3a8a4a" }}>
                            📐 {item.weightSource === "standard" || item.weightSource === "counted-standard" ? "STD SERVING" : item.weightSource === "liquid-default" ? "STD 200ml" : "EST"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: item.isWater ? "#38bdf8" : item.cal === null ? "#ff6060" : "#00ff87", minWidth: 70, textAlign: "right" }}>
                  {item.isWater ? "0 kcal" : item.cal === null ? "?" : `${item.cal} kcal`}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e8f5ee" }}>Total Calories</div>
                {totalWaterMl > 0 && <div style={{ fontSize: 11, color: "#38bdf8" }}>+{totalWaterMl}ml water will be added</div>}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#00ff87", fontFamily: "'DM Mono',monospace" }}>
                {totalCal} <span style={{ fontSize: 13, color: "#3a8a3a" }}>kcal</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!breakdown ? (
          <button onClick={calculate} disabled={loading} style={{ width: "100%", background: loading ? "#0d2015" : "linear-gradient(135deg,#00c853,#00ff87)", border: "none", borderRadius: 14, color: loading ? "#3a7a3a" : "#021008", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, padding: "15px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {loading ? (<><div style={{ width: 16, height: 16, border: "2px solid #2a6a2a", borderTopColor: "#00ff87", borderRadius: "50%", animation: "spin .8s linear infinite" }} />Calculating...</>) : "Calculate Calories →"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setBreakdown(null); setInput(""); }} style={{ flex: 1, background: "#0a1a0d", border: "1px solid #1a3a20", borderRadius: 14, color: "#3a7a3a", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, padding: "13px", cursor: "pointer" }}>← Edit</button>
            <button onClick={confirmLog} style={{ flex: 2, background: "linear-gradient(135deg,#00c853,#00ff87)", border: "none", borderRadius: 14, color: "#021008", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, padding: "13px", cursor: "pointer" }}>
              Log {totalCal} kcal{totalWaterMl > 0 ? ` + 💧${totalWaterMl}ml` : ""} ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
