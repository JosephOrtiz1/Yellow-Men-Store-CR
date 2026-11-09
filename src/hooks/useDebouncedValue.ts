import { useEffect, useState } from "react";

/**
 * Returns the value only after it has stopped changing for `delay` ms.
 * Used so live search does not hit the database on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
