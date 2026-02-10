"use client";

import { useTheme as nextUseTheme } from "next-themes";
import { Theme } from "./ThemeContext";

interface useThemeResult {
  toggleTheme: () => void;
  theme?: Theme;
}

export function useTheme(): useThemeResult {
  const { theme, setTheme } = nextUseTheme();

  const toggleTheme = () => {
    if (!theme) return;
    setTheme?.(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  return {
    theme: theme as Theme | undefined,
    toggleTheme,
  };
}
