'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';

// Paleta de colores
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
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof themeColors.dark;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const value = {
    isDark,
    toggleTheme,
    colors: isDark ? themeColors.dark : themeColors.light,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Componente del botón de toggle de tema
export function ThemeToggleButton() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: colors.card,
        border: `2px solid ${colors.border}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
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
