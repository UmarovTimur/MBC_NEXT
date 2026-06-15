"use client";

import { Theme, useTheme } from "@/app/providers/Theme";
import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const label = theme === Theme.DARK ? "Switch to light theme" : "Switch to dark theme";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" disabled aria-label="Toggle theme" title="Toggle theme" />;
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label={label} title={label}>
      {theme == Theme.DARK ? (
        <Sun aria-hidden="true" suppressHydrationWarning />
      ) : (
        <Moon aria-hidden="true" suppressHydrationWarning />
      )}
    </Button>
  );
};
