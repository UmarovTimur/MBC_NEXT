"use client";

import { Theme, useTheme } from "@/app/providers/Theme";
import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" disabled />;
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme == Theme.DARK ? <Sun /> : <Moon />}
    </Button>
  );
};
