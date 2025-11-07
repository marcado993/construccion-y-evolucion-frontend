'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

// Paleta de colores consistente
const themeColors = {
  dark: {
    bg: '#0A0E27',
    card: '#151937',
    input: '#0A0E27',
    text: '#FFFFFF',
    textSecondary: '#8B92B8',
    border: '#252B4F',
    primary: '#4F46E5',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
    error: '#EF4444',
    success: '#10B981',
  },
  light: {
    bg: '#F8F9FF',
    card: '#FFFFFF',
    input: '#F8F9FF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#4F46E5',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
    error: '#EF4444',
    success: '#10B981',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof themeColors.dark;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  if (!mounted) {
    return null;
  }

  const colors = theme === 'dark' ? themeColors.dark : themeColors.light;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Componente del botón de toggle de tema reutilizable
export function ThemeToggleButton({ style }: { style?: React.CSSProperties }) {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: style?.position || 'fixed',
        top: style?.top || '20px',
        right: style?.right || '20px',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: colors.card,
        border: `2px solid ${colors.border}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: style?.zIndex || 1000,
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = colors.border;
      }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <Sun size={20} color={colors.primary} /> : <Moon size={20} color={colors.primary} />}
    </button>
  );
}
