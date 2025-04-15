// src/contexts/ThemeContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for system preference or stored preference on initial load
    const isDark = 
      localStorage.getItem('darkMode') === 'true' || 
      (localStorage.getItem('darkMode') === null && 
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    
    // Apply the theme to the document
    applyTheme(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    applyTheme(newMode);
  };

  // Function to apply theme to document
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}