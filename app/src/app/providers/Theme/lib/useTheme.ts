"use client";

import { useTheme as nextUseTheme } from "next-themes";
import { Theme } from "./ThemeContext";

interface useThemeResult {
  toggleTheme: () => void;
  theme?: Theme;
}

export function useTheme(): useThemeResult {
  const { resolvedTheme, setTheme } = nextUseTheme();

  const toggleTheme = () => {
    setTheme?.(resolvedTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  return {
    theme: resolvedTheme as Theme | undefined,
    toggleTheme,
  };
}
