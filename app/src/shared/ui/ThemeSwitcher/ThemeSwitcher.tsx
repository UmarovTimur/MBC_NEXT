"use client";

import { Theme, useTheme } from "@/app/providers/ThemeProviders";
import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme == Theme.DARK ? <Sun /> : <Moon />}
    </Button>
  );
};
