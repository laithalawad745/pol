// context/ThemeContext.js
// Make sure this is a 'use client' component as it uses useState and localStorage
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('current'); // Default to 'current' theme

  useEffect(() => {
    // Read theme from localStorage on initial load
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.body.setAttribute('data-theme', storedTheme);
    } else {
      // If no theme in localStorage, set default 'current' and apply it
      document.body.setAttribute('data-theme', 'current');
      localStorage.setItem('theme', 'current');
    }
  }, []);

  useEffect(() => {
    // Apply theme attribute to body when theme state changes
    document.body.setAttribute('data-theme', theme);
    // Persist theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};