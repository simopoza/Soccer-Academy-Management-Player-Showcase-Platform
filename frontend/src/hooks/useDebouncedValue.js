import { useState, useEffect, useRef } from 'react';

/**
 * useDebouncedValue
 * Returns a debounced value that updates after `delay` ms of no changes.
 *
 * @param value any - the input value to debounce
 * @param delay number - debounce delay in milliseconds
 */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debounced;
}
