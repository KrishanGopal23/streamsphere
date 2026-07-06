import { useCallback, useRef } from "react";

export function useDebouncedCallback(callback, delay = 250) {
  const timerRef = useRef(null);

  return useCallback(
    (...args) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}
