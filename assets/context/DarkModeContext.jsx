import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

/**
 * Dark Mode Context
 * @typedef {Object} DarkModeContextType
 * @property {boolean} isDarkMode - Whether dark mode is enabled.
 * @property {function(): void} toggleDarkMode - Function to toggle dark mode.
 */

/**
 * Context for managing dark mode state.
 * @type {React.Context<DarkModeContextType>}
 */
const DarkModeContext = createContext();

/**
 * Dark Mode Provider component.
 * @param {object} props - Component props.
 * @returns {JSX.Element} Dark Mode Provider component.
 */
export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * Function to toggle dark mode.
   */
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Effect to update body class when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ isDarkMode, toggleDarkMode }), [isDarkMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}

/**
 * Custom hook to use dark mode context.
 * @returns {DarkModeContextType} Dark mode context.
 */
export function useDarkMode() {
  return useContext(DarkModeContext);
}
