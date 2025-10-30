import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type FontSize = '100' | '125' | '150';

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  highContrast: boolean;
  glassMode: boolean;
  toggleTheme: () => void;
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  toggleGlassMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(() => 
    (localStorage.getItem('fontSize') as FontSize) || '100'
  );
  const [highContrast, setHighContrast] = useState(() => 
    localStorage.getItem('highContrast') === 'true'
  );
  const [glassMode, setGlassMode] = useState(() => 
    localStorage.getItem('glassMode') !== 'false'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(theme);
    if (highContrast) root.classList.add('high-contrast');
    root.style.fontSize = fontSize === '100' ? '16px' : fontSize === '125' ? '20px' : '24px';
    
    localStorage.setItem('theme', theme);
  }, [theme, fontSize, highContrast]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', String(highContrast));
    localStorage.setItem('glassMode', String(glassMode));
  }, [fontSize, highContrast, glassMode]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const toggleHighContrast = () => setHighContrast(h => !h);
  const toggleGlassMode = () => setGlassMode(g => !g);

  return (
    <ThemeContext.Provider value={{
      theme,
      fontSize,
      highContrast,
      glassMode,
      toggleTheme,
      setFontSize,
      toggleHighContrast,
      toggleGlassMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
