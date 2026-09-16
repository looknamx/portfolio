import { useState, useEffect } from 'react';
export function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio:theme');
      return saved
        ? saved === 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem('portfolio:theme', dark ? 'dark' : 'light');
    } catch {
      /* Optional persistence. */
    }
  }, [dark]);
  return { dark, toggle: () => setDark((value) => !value) };
}
