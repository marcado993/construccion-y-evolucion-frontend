'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, Hand, Accessibility, Braces } from 'lucide-react';
import RegisterPage from './RegisterPage';

type ViewMode = 'login' | 'register';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const { theme: themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  const colors = {
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
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://backend-service-8ts6.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Login exitoso - guardar usuario en localStorage y contexto
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user.email, password); // Usar el contexto de autenticación existente
      } else {
        setError(data.message || 'Email o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = (registeredEmail: string) => {
    setViewMode('login');
    setEmail(registeredEmail);
    setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión');
    setError('');
  };

  // Mostrar componente de registro si está en modo register
  if (viewMode === 'register') {
    return (
      <RegisterPage 
        onBackToLogin={() => setViewMode('login')} 
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Patrón de puntos braille en el fondo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.border} 1.5px, transparent 1.5px)`,
        backgroundSize: '30px 30px',
        opacity: isDark ? 0.4 : 0.3,
      }} />

      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: theme.card,
          border: `2px solid ${theme.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = theme.primary;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = theme.border;
        }}
      >
        {isDark ? <Sun size={20} color={theme.primary} /> : <Moon size={20} color={theme.primary} />}
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{
          background: theme.card,
          borderRadius: '20px',
          padding: '32px',
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.border}`,
        }}>
          {/* Header compacto */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                boxShadow: `0 8px 24px ${theme.primary}40`,
                position: 'relative',
              }}
            >
              {/* Puntos braille estilizados */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                padding: '8px',
              }}>
                <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%' }} />
                <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%' }} />
                <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%', opacity: 0.5 }} />
                <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%' }} />
                <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%' }} />
                <div style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%', opacity: 0.5 }} />
              </div>
            </motion.div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
              letterSpacing: '-0.5px',
            }}>
              Braille Studio
            </h1>

            <p style={{
              color: theme.textSecondary,
              fontSize: '14px',
              lineHeight: '1.5',
            }}>
              Accesibilidad para todos
            </p>
          </div>

          {/* Mensaje de éxito */}
          {successMessage && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: `${theme.success}20`,
              border: `1px solid ${theme.success}`,
              borderRadius: '8px',
              color: theme.success,
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {successMessage}
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: `${theme.error}20`,
              border: `1px solid ${theme.error}`,
              borderRadius: '8px',
              color: theme.error,
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: theme.text,
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textSecondary,
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 44px',
                    background: theme.input,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: theme.text,
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: theme.text,
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textSecondary,
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    background: theme.input,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: theme.text,
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={theme.textSecondary} />
                  ) : (
                    <Eye size={18} color={theme.textSecondary} />
                  )}
                </button>
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                padding: '14px',
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 16px ${theme.primary}40`,
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </motion.button>
          </form>

          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <div style={{
              flex: 1,
              padding: '12px',
              background: `${theme.primary}10`,
              borderRadius: '10px',
              textAlign: 'center',
              border: `1px solid ${theme.primary}20`,
            }}>
              <Hand size={20} color={theme.primary} style={{ margin: '0 auto 6px' }} />
              <p style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>
                Inclusión
              </p>
            </div>
            <div style={{
              flex: 1,
              padding: '12px',
              background: `${theme.secondary}10`,
              borderRadius: '10px',
              textAlign: 'center',
              border: `1px solid ${theme.secondary}20`,
            }}>
              <Accessibility size={20} color={theme.secondary} style={{ margin: '0 auto 6px' }} />
              <p style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>
                Accesibilidad
              </p>
            </div>
            <div style={{
              flex: 1,
              padding: '12px',
              background: `${theme.accent}10`,
              borderRadius: '10px',
              textAlign: 'center',
              border: `1px solid ${theme.accent}20`,
            }}>
              <Braces size={20} color={theme.accent} style={{ margin: '0 auto 6px' }} />
              <p style={{ color: theme.text, fontSize: '12px', fontWeight: 600 }}>
                Tecnología
              </p>
            </div>
          </div>

          <p style={{
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: '13px',
            marginBottom: '12px',
          }}>
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setViewMode('register')}
              style={{
                background: 'none',
                border: 'none',
                color: theme.primary,
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Regístrate aquí
            </button>
          </p>

          <p style={{
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: '12px',
            fontWeight: 500,
          }}>
            Conectando el mundo a través del braille
          </p>
        </div>
      </motion.div>
    </div>
  );
}