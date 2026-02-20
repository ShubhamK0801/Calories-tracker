/**
 * usePersisted.js
 * Custom hook for state that syncs to window.storage (Claude artifact storage).
 */

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * @template T
 * @param {string} key  - Storage key
 * @param {T} fallback  - Default value if nothing is stored
 * @returns {[T, (val: T | ((prev: T) => T)) => void]}
 */
export function usePersisted(key, fallback) {
  const [state, setState] = useState(fallback);
  const initialized = useRef(false);

  // Load from storage once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    window.storage
      .get(key)
      .then((result) => {
        if (result?.value != null) setState(JSON.parse(result.value));
      })
      .catch(() => {});
  }, [key]);

  // Persist on every update
  const set = useCallback(
    (val) => {
      setState((prev) => {
        const next = typeof val === "function" ? val(prev) : val;
        window.storage.set(key, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [key]
  );

  return [state, set];
}
