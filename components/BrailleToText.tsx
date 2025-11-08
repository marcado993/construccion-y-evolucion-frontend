'use client';

import { useState } from 'react';
import { brailleToText, isValidBraille } from '@/lib/braille-converter';
import { addConversionToHistory } from './ConversionHistory';
import ConversionHistory from './ConversionHistory';
import { Accessibility, Copy, RotateCcw, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useConversion, useBackendStatus } from '@/lib/hooks/useApi';
import { useTheme } from '@/context/ThemeContext';

export default function BrailleToText() {
  const [brailleInput, setBrailleInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  // Hooks para backend
  const { convertir, loading: apiLoading } = useConversion();
  const { isConnected } = useBackendStatus();
  
  // Hook para el tema global
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const colors = {
    dark: {
      bg: '#0A0E27',
      card: '#151937',
      input: '#1A1F3A',
      text: '#FFFFFF',
      textSecondary: '#8B92B8',
      border: '#252B4F',
      primary: '#8B5CF6',
      secondary: '#EC4899',
    },
    light: {
      bg: '#F8F9FF',
      card: '#FFFFFF',
      input: '#F8F9FF',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      primary: '#8B5CF6',
      secondary: '#EC4899',
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  const handleConvert = async () => {
    setError('');
    setIsConverting(true);

    if (!brailleInput.trim()) {
      setError('Por favor ingresa texto en Braille');
      setIsConverting(false);
      return;
    }

    if (!isValidBraille(brailleInput)) {
      setError('El texto ingresado no contiene caracteres Braille válidos');
      setIsConverting(false);
      return;
    }

    // Intentar con backend si está conectado
    if (isConnected) {
      try {
        const response = await convertir(brailleInput, 'braille-a-texto', true);
        if (response && response.exito) {
          setTextOutput(response.resultado);
          setIsConverting(false);
          return;
        }
      } catch (err) {
        console.warn('Backend no disponible, usando conversión local', err);
      }
    }

    // Fallback: conversión local
    const result = brailleToText(brailleInput);
    setTextOutput(result);
    
    // Guardar en localStorage solo si el backend no está disponible
    if (!isConnected) {
      addConversionToHistory(brailleInput, result, 'braille-a-texto');
    }
    
    setIsConverting(false);
  };

  const handleRestore = (original: string, tipo: 'texto-a-braille' | 'braille-a-texto') => {
    if (tipo === 'braille-a-texto') {
      setBrailleInput(original);
      setShowHistory(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textOutput);
      alert('¡Texto copiado al portapapeles!');
    } catch (err) {
      alert('Error al copiar');
    }
  };

  const handleClear = () => {
    setBrailleInput('');
    setTextOutput('');
    setError('');
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ display: 'grid', gridTemplateColumns: showHistory ? '1fr 400px' : '1fr', gap: '24px' }}>
        <div style={{ minWidth: 0 }}>
          {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Accessibility size={24} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 800,
                color: theme.text,
                margin: 0,
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Braille a Texto
              </h2>
              <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>
                Convierte caracteres Braille a texto español legible
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Input de Braille */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="braille-input" style={{
                fontSize: '13px',
                fontWeight: 600,
                color: theme.text,
              }}>
                Caracteres Braille
              </label>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  padding: '6px 12px',
                  background: showHistory ? '#8B5CF6' : 'transparent',
                  border: '2px solid #8B5CF6',
                  borderRadius: '8px',
                  color: showHistory ? '#FFFFFF' : '#8B5CF6',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
              </button>
            </div>
            <textarea
              id="braille-input"
              value={brailleInput}
              onChange={(e) => setBrailleInput(e.target.value)}
              placeholder="⠃⠗⠁⠊⠇⠇⠑..."
              style={{
                width: '100%',
                height: '150px',
                padding: '14px',
                background: theme.input,
                border: `2px solid ${theme.border}`,
                borderRadius: '12px',
                fontSize: '32px',
                color: theme.text,
                outline: 'none',
                resize: 'none',
                fontFamily: 'monospace',
                letterSpacing: '4px',
                lineHeight: '1.6',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8B5CF6';
                e.currentTarget.style.boxShadow = '0 0 0 3px #8B5CF620';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Ingresa los caracteres Braille"
            />
            <p style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '6px' }}>
              {brailleInput.length} caracteres Braille
            </p>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleConvert}
              disabled={!brailleInput.trim() || isConverting}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px',
                background: brailleInput.trim() && !isConverting ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : theme.border,
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: brailleInput.trim() && !isConverting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseOver={(e) => {
                if (brailleInput.trim() && !isConverting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 16px ${theme.primary}40`;
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isConverting ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '3px solid #FFFFFF40',
                    borderTop: '3px solid #FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Convirtiendo...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Convertir a Texto
                </>
              )}
            </button>
            
            {/* Indicador de conexión */}
            <div style={{
              padding: '14px 16px',
              background: isConnected ? '#10B98120' : '#F59E0B20',
              border: `2px solid ${isConnected ? '#10B981' : '#F59E0B'}`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: isConnected ? '#059669' : '#D97706',
            }} title={isConnected ? 'Conectado al servidor' : 'Modo offline - datos en local'}>
              {isConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
              {isConnected ? 'Online' : 'Offline'}
            </div>
            
            <button
              onClick={handleClear}
              style={{
                padding: '14px 20px',
                background: 'transparent',
                border: `2px solid ${theme.border}`,
                borderRadius: '10px',
                color: theme.textSecondary,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#8B5CF6';
                e.currentTarget.style.color = '#8B5CF6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: isDark ? '#DC262620' : '#FEE2E2',
              border: `2px solid #DC2626`,
              borderRadius: '12px',
              padding: '14px',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Output Texto */}
          {textOutput && (
            <div style={{
              background: isDark ? `linear-gradient(135deg, ${theme.bg} 0%, ${theme.card} 100%)` : theme.card,
              border: `2px solid ${theme.primary}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: `0 8px 24px ${theme.primary}40`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: theme.text,
                  margin: 0,
                }}>
                  🎯 Resultado en Texto
                </h3>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 14px',
                    background: theme.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = theme.secondary;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = theme.primary;
                  }}
                >
                  <Copy size={14} />
                  Copiar
                </button>
              </div>
              <div
                style={{
                  fontSize: '28px',
                  lineHeight: '1.8',
                  wordBreak: 'break-word',
                  userSelect: 'all',
                  color: theme.secondary,
                  fontWeight: 600,
                }}
                aria-label="Resultado en texto"
              >
                {textOutput}
              </div>
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: isDark ? theme.bg : theme.input,
                borderRadius: '8px',
                fontSize: '13px',
                color: theme.textSecondary,
              }}>
                💡 <strong style={{ color: theme.text }}>Tip:</strong> El texto convertido mantiene la puntuación y acentos originales
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div style={{ minWidth: '400px' }}>
          <ConversionHistory onRestore={handleRestore} />
        </div>
      )}
      </div>
    </>
  );
}
