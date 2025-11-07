'use client';

import { useState } from 'react';
import { textToBraille, canConvertToBraille } from '@/lib/braille-converter';
import { addConversionToHistory } from './ConversionHistory';
import ConversionHistory from './ConversionHistory';
import { Hand, Copy, RotateCcw, Sparkles, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { useConversion, useBackendStatus } from '@/lib/hooks/useApi';

export default function TextToBraille() {
  const [inputText, setInputText] = useState('');
  const [brailleOutput, setBrailleOutput] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Hooks para backend
  const { convertir, loading: apiLoading } = useConversion();
  const { isConnected } = useBackendStatus();

  const colors = {
    dark: {
      bg: '#0A0E27',
      card: '#151937',
      input: '#1A1F3A',
      text: '#FFFFFF',
      textSecondary: '#8B92B8',
      border: '#252B4F',
      primary: '#4F46E5',
      secondary: '#06B6D4',
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
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  const handleConvert = async () => {
    setError('');
    setIsConverting(true);
    
    const validation = canConvertToBraille(inputText);
    if (!validation.valid) {
      setError(validation.error || 'Error en la conversión');
      setIsConverting(false);
      return;
    }

    // Intentar con backend si está conectado
    if (isConnected) {
      try {
        const response = await convertir(inputText, 'texto-a-braille', true);
        if (response && response.exito) {
          setBrailleOutput(response.resultado);
          setIsConverting(false);
          return;
        }
      } catch (err) {
        console.warn('Backend no disponible, usando conversión local', err);
      }
    }

    // Fallback: conversión local
    const result = textToBraille(inputText);
    setBrailleOutput(result);
    
    // Guardar en localStorage solo si el backend no está disponible
    if (!isConnected) {
      addConversionToHistory(inputText, result, 'texto-a-braille');
    }
    
    setIsConverting(false);
  };

  const handleRestore = (original: string, tipo: 'texto-a-braille' | 'braille-a-texto') => {
    if (tipo === 'texto-a-braille') {
      setInputText(original);
      setShowHistory(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brailleOutput);
      alert('¡Braille copiado al portapapeles!');
    } catch (err) {
      alert('Error al copiar');
    }
  };

  const handleClear = () => {
    setInputText('');
    setBrailleOutput('');
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
          {/* Header con botón de tema */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Hand size={24} color="#FFFFFF" />
              </div>
              <div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: theme.text,
                  margin: 0,
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Texto a Braille
                </h2>
                <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>
                  Convierte texto en español al sistema Braille táctil
                </p>
              </div>
            </div>
            
            {/* Botón de cambio de tema */}
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: theme.card,
                border: `2px solid ${theme.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun size={20} color={theme.text} /> : <Moon size={20} color={theme.text} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Input de texto */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="input-text" style={{
                fontSize: '13px',
                fontWeight: 600,
                color: theme.text,
              }}>
                Texto a convertir
              </label>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  padding: '6px 12px',
                  background: showHistory ? theme.primary : 'transparent',
                  border: `2px solid ${theme.primary}`,
                  borderRadius: '8px',
                  color: showHistory ? '#FFFFFF' : theme.primary,
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
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe o pega tu texto aquí..."
              style={{
                width: '100%',
                height: '150px',
                padding: '14px',
                background: theme.input,
                border: `2px solid ${theme.border}`,
                borderRadius: '12px',
                fontSize: '15px',
                color: theme.text,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
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
              aria-label="Ingresa el texto a convertir"
            />
            <p style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '6px' }}>
              {inputText.length} caracteres
            </p>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleConvert}
              disabled={!inputText.trim() || isConverting}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px',
                background: inputText.trim() && !isConverting ? 'linear-gradient(135deg, #4F46E5, #06B6D4)' : theme.border,
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: inputText.trim() && !isConverting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                if (inputText.trim() && !isConverting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px #4F46E540';
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
                  Convertir a Braille
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
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.color = theme.primary;
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
              background: '#FEE2E2',
              border: '2px solid #DC2626',
              borderRadius: '12px',
              padding: '14px',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Output Braille */}
          {brailleOutput && (
            <div style={{
              background: 'linear-gradient(135deg, #0A0E27 0%, #151937 100%)',
              border: '2px solid #4F46E5',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.2)',
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
                  color: '#FFFFFF',
                  margin: 0,
                }}>
                  🎯 Resultado en Braille
                </h3>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 14px',
                    background: '#4F46E5',
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
                    e.currentTarget.style.background = '#06B6D4';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#4F46E5';
                  }}
                >
                  <Copy size={14} />
                  Copiar
                </button>
              </div>
              <div
                style={{
                  fontSize: '42px',
                  lineHeight: '1.8',
                  wordBreak: 'break-all',
                  userSelect: 'all',
                  fontFamily: 'monospace',
                  color: '#06B6D4',
                  letterSpacing: '4px',
                }}
                aria-label="Resultado en Braille"
              >
                {brailleOutput}
              </div>
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#0A0E27',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#8B92B8',
              }}>
                💡 <strong style={{ color: '#FFFFFF' }}>Tip:</strong> Este texto puede ser impreso en relieve para lectura táctil
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
