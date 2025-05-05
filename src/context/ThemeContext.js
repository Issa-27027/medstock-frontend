import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    primaryColor: localStorage.getItem('primaryColor') || '#3b82f6',
    textSize: parseInt(localStorage.getItem('textSize') || '16'),
  });

  const theme = createTheme({
    palette: {
      mode: themeSettings.darkMode ? 'dark' : 'light',
      primary: {
        main: themeSettings.primaryColor,
        light: `${themeSettings.primaryColor}80`,
        dark: `${themeSettings.primaryColor}40`,
      },
    },
    typography: {
      fontSize: themeSettings.textSize,
    },
  });

  const updateTheme = (field, value) => {
    setThemeSettings(prev => {
      const newSettings = {
        ...prev,
        [field]: value
      };
      localStorage.setItem(field, value);
      return newSettings;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeSettings.darkMode ? 'dark' : 'light');
    document.documentElement.style.fontSize = `${themeSettings.textSize}px`;
  }, [themeSettings]);

  return (
    <ThemeContext.Provider value={{ theme, themeSettings, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 