'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, User, ArrowLeft, Hand, Accessibility, Braces } from 'lucide-react';

interface RegisterPageProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (email: string) => void;
}

export default function RegisterPage({ onBackToLogin, onRegisterSuccess }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

    // Validaciones
    if (!username.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://backend-service-8ts6.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(),
          email: email.trim(),
          password: password,
          nombre_completo: name.trim(),
          rol: 'usuario',
          activo: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registro exitoso
        onRegisterSuccess(email);
      } else {
        setError(data.message || 'Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
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

      {/* Botón de cambio de tema */}
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
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
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
          {/* Botón volver */}
          <button
            onClick={onBackToLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: theme.textSecondary,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '16px',
              padding: '8px 0',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = theme.primary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = theme.textSecondary;
            }}
          >
            <ArrowLeft size={18} />
            Volver al inicio de sesión
          </button>

          {/* Header */}
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
              Crear Cuenta
            </h1>

            <p style={{
              color: theme.textSecondary,
              fontSize: '14px',
              lineHeight: '1.5',
            }}>
              Únete a la comunidad de accesibilidad
            </p>
          </div>

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
            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: theme.text,
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Nombre de Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textSecondary,
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario123"
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

            {/* Nombre */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: theme.text,
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Nombre Completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textSecondary,
                }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
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

            {/* Email */}
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
                    e.currentTarget.style.borderColor = theme.secondary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.secondary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '16px' }}>
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
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                color: theme.text,
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Confirmar Contraseña
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? (
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
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
            fontSize: '12px',
            fontWeight: 500,
          }}>
            Al registrarte aceptas nuestros términos y condiciones
          </p>
        </div>
      </motion.div>
    </div>
  );
}
