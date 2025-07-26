import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, default to dark
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Add current theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark"
  };
}