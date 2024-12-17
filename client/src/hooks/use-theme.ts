import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    function updateTheme() {
      root.classList.remove("light", "dark");
      const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
      root.classList.add(effectiveTheme);
      localStorage.setItem("theme", theme);
    }

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, setTheme };
}
