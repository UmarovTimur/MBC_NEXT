"use client";

import { FC, useState, useMemo, ReactNode, useEffect } from "react";
import { LOCAL_STORAGE_THEME_KEY, Theme, ThemeContext } from "../lib/ThemeContext";

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme;
    if (saved) setTheme(saved);
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
  }, [theme]);

  const defaultProps = useMemo(
    () => ({
      theme: theme,
      setTheme: setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={defaultProps}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
