# NutriTrack — Recommended Folder Structure

```
nutritrack/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.jsx                   ← Root + phase router + Dashboard + Onboarding + Summary
│   ├── main.jsx                  ← Vite entry point
│   │
│   ├── components/
│   │   ├── Ring.jsx              ← Animated SVG progress ring
│   │   ├── FoodRow.jsx           ← Swipe-to-delete food log row
│   │   └── AddFood.jsx           ← Bottom-sheet food entry modal
│   │
│   ├── hooks/
│   │   └── usePersisted.js       ← window.storage persistence hook
│   │
│   ├── utils/
│   │   ├── calculations.js       ← BMR/TDEE, BMI, weekly stats, backup/export (pure functions)
│   │   ├── foodParser.js         ← NLP food entry parser + emoji helper
│   │   └── aiLookup.js           ← Anthropic API calorie lookup
│   │
│   └── data/
│       ├── foodDatabase.js       ← Calorie per 100g lookup table
│       └── foodConstants.js      ← UNIT_MAP, STANDARD_WEIGHTS, WATER_WORDS, ONBOARDING_STEPS
│
├── index.html
├── vite.config.js
└── package.json
```

## Scalability Suggestions

### Short-term (immediate)
- **CSS-in-JS → Tailwind or CSS Modules**: Inline styles make maintenance difficult at scale.
  Migrate to Tailwind utility classes or CSS Modules for theming and readability.
- **Toast system**: Extract `showToast` + the toast `<div>` into a `useToast` hook + `<ToastProvider>`.
- **Split Dashboard tabs into files**: `TodayTab.jsx`, `HistoryTab.jsx`, `ProfileTab.jsx` — App.jsx is
  currently ~400 lines; tabs can be lazy-loaded with `React.lazy`.

### Medium-term
- **State management**: Replace `usePersisted` calls with Zustand or Jotai for shared state
  (meals, water, profile) instead of prop-drilling.
- **Context for profile/targets**: Wrap the app in a `ProfileContext` so any component can read
  targets without prop-drilling.
- **API key handling**: The `aiLookup.js` currently sends requests directly from the browser.
  In production, proxy through a backend/edge function to keep the API key server-side.
- **Unit tests**: `calculations.js` and `foodParser.js` are pure functions — easy to test with Vitest.

### Long-term
- **Backend sync**: Replace `window.storage` with a real database (Supabase, Firebase, or a REST API)
  for true cross-device sync without manual backup/restore.
- **PWA**: Add a service worker for offline support — the food DB and calc logic work fully offline.
- **React Query**: Use for AI lookup caching to avoid duplicate network requests.

## Bad Practices Fixed in This Refactor

| Issue | Before | After |
|---|---|---|
| God file | 1,463-line single file | Split across 8+ focused files |
| Inline business logic | `calcTargets` inside component file | `utils/calculations.js` (pure, testable) |
| Hardcoded API model string in component | `claude-sonnet-4-20250514` in render tree | Isolated in `aiLookup.js` |
| Repeated `console.log` style debugging | N/A (none present) | Clean |
| Fuzzy match logic duplicated | Duplicated in `estimateCal` + `getStandardWeight` | `findFuzzy()` helper |
| No input validation on onboarding | Missing | `validateOnboardingAnswer()` with range checks |
| Backup parse errors swallowed silently | `catch(err) {}` | `parseBackup()` returns typed result |
| Export helpers mixed with UI | `downloadBackup`, `exportCSV` in Dashboard | Moved to `calculations.js` |
| ONBOARDING_STEPS hardcoded inline | Inside Onboarding component | Extracted to `foodConstants.js` |
| `useRef + ready.current` pattern unclear | Slightly confusing naming | Renamed to `initialized` |
