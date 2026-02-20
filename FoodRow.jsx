/**
 * NutriTrack — FoodRow Component
 * Displays a logged food item with swipe-to-delete (mobile) and click-to-delete (desktop).
 */

import { useState, useRef } from "react";
import { foodEmoji } from "../utils/foodEmoji.js";
import { formatTime } from "../utils/calculations.js";

const SWIPE_THRESHOLD_PX = 50;
const DELETE_ANIMATION_MS = 320;

export function FoodRow({ meal, index, onDelete }) {
  const [swiped, setSwiped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > SWIPE_THRESHOLD_PX) setSwiped(true);
    if (delta < -20) setSwiped(false);
    touchStartX.current = null;
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, DELETE_ANIMATION_MS);
  };

  return (
    <div
      style={{ position: "relative", borderRadius: 14, overflow: "hidden", animation: `up .3s ease ${index * 0.05}s both` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#2a0808,#3d0a0a)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 20, borderRadius: 14, transition: "opacity .2s", opacity: swiped ? 1 : 0, pointerEvents: swiped ? "auto" : "none" }}>
        <div style={{ fontSize: 12, color: "#ff6060", fontFamily: "'Nunito',sans-serif", marginRight: 12, fontWeight: 600 }}>Remove entry</div>
        <span style={{ fontSize: 24 }}>🗑️</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: deleting ? "#1a0808" : swiped ? "#120808" : "#08120a", borderRadius: 14, padding: "13px 12px 13px 15px", border: `1px solid ${deleting ? "#3a1010" : swiped ? "#2a1515" : "#122015"}`, transition: "all .25s cubic-bezier(.4,0,.2,1)", transform: deleting ? "translateX(100%) scale(0.95)" : swiped ? "translateX(-80px)" : "translateX(0)", opacity: deleting ? 0 : 1 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{foodEmoji(meal.name)}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meal.name}</span>
          </div>
          <div style={{ fontSize: 11, color: "#2a5a2a", fontFamily: "'Nunito',sans-serif", marginTop: 2, paddingLeft: 24 }}>
            {meal.grams}g &nbsp;·&nbsp; {formatTime(meal.time)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#00ff87", fontFamily: "'DM Mono',monospace" }}>{meal.cal} kcal</div>
          <button onClick={handleDelete} title="Remove this entry" onMouseEnter={(e) => { e.currentTarget.style.background = "#2a0808"; e.currentTarget.style.borderColor = "#ff4444"; e.currentTarget.style.color = "#ff4444"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#130808"; e.currentTarget.style.borderColor = "#2a1212"; e.currentTarget.style.color = "#cc3333"; }} style={{ background: "#130808", border: "1px solid #2a1212", borderRadius: 10, color: "#cc3333", cursor: "pointer", fontSize: 16, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
            🗑️
          </button>
        </div>
      </div>

      {swiped && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={handleDelete} style={{ background: "linear-gradient(135deg,#cc0000,#ff2222)", border: "none", borderRadius: "0 14px 14px 0", color: "#fff", fontWeight: 800, fontSize: 20, width: "100%", height: "100%", cursor: "pointer" }}>🗑️</button>
        </div>
      )}
    </div>
  );
}
