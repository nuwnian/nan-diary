import { createContext, useContext, useEffect, useState, useRef } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setIsAnimating(true);
    
    // Show ripple animation
    if (rippleRef.current) {
      rippleRef.current.style.display = 'block';
      // Force reflow
      rippleRef.current.offsetHeight;
      rippleRef.current.classList.add('active');
    }
    
    // Change theme after a brief delay
    setTimeout(() => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, 150);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
      if (rippleRef.current) {
        rippleRef.current.classList.remove('active');
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.style.display = 'none';
          }
        }, 500);
      }
    }, 500);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={isAnimating ? 'theme-transitioning' : ''}>
        <div 
          ref={rippleRef} 
          className="theme-ripple"
          style={{ display: 'none' }}
        />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
