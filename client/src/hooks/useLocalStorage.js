import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const existing = localStorage.getItem(key);
      return existing ? JSON.parse(existing) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Browser storage can be unavailable. The in-memory state still works.
    }
  }, [key, value]);

  return [value, setValue];
}
