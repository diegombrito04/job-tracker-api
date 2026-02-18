import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useUser } from "./UserContext";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useUser();
  const theme: Theme = profile.theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function setTheme(t: Theme) {
    void updateProfile({ theme: t });
  }

  function toggleTheme() {
    void updateProfile({ theme: theme === "light" ? "dark" : "light" });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
