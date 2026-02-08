"use client";

import { FC, useState, useMemo, ReactNode, useEffect } from "react";
import { Theme, ThemeContext, LOCAL_STORAGE_THEME_KEY } from "../lib/ThemeContext";

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme | null;
      if (saved && Object.values(Theme).includes(saved as Theme)) {
        setTheme(saved as Theme);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const preferTheme = window.matchMedia("(prefers-color-scheme: dark)");

    root.classList.remove(...Object.values(Theme));

    let appliedTheme: Theme;

    if (theme === Theme.SYSTEM) {
      appliedTheme = preferTheme.matches ? Theme.DARK : Theme.LIGHT;
    } else {
      appliedTheme = theme;
    }

    root.classList.add(appliedTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    } catch {
      // ignore localStorage write errors
    }
  }, [theme]);

  const defaultProps = useMemo(
    () => ({
      theme: theme,
      setTheme: setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={defaultProps}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
