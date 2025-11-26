'use client';

import { useState } from 'react';
import { brailleToText, isValidBraille } from '@/lib/braille-converter';
import { addConversionToHistory } from './ConversionHistory';
import ConversionHistory from './ConversionHistory';
import BrailleKeyboard from './BrailleKeyboard';
import { Accessibility, Copy, RotateCcw, Sparkles, Wifi, WifiOff, Keyboard, ChevronDown, ChevronUp, FileText, Image as ImageIcon } from 'lucide-react';
import { useConversion, useBackendStatus } from '@/lib/hooks/useApi';
import { useTheme } from '@/context/ThemeContext';

export default function BrailleToText() {
  const [brailleInput, setBrailleInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
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

  // Funciones para el teclado Braille
  const handleBrailleKeyInput = (brailleChar: string) => {
    setBrailleInput(prev => prev + brailleChar);
  };

  const handleBrailleSpace = () => {
    setBrailleInput(prev => prev + ' ');
  };

  const handleBrailleDelete = () => {
    setBrailleInput(prev => prev.slice(0, -1));
  };

  // Funciones de descarga usando Canvas nativo
  const downloadAsPNG = () => {
    if (!textOutput) {
      alert('Primero convierte algún texto Braille');
      return;
    }
    
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas');

      // Configuración del canvas
      const padding = 60;
      const fontSize = 36;
      const lineHeight = fontSize * 1.6;
      const titleSize = 24;
      
      // Colores fijos (evitar CSS computado con lab())
      const bgColor1 = isDark ? '#0A0E27' : '#F8F9FF';
      const bgColor2 = isDark ? '#151937' : '#FFFFFF';
      const borderColor = '#8B5CF6';
      const titleColor = isDark ? '#8B92B8' : '#64748B';
      const textColor = isDark ? '#EC4899' : '#8B5CF6';
      
      // Dividir texto en líneas
      ctx.font = `bold ${fontSize}px Arial`;
      const maxCharsPerLine = 30;
      const textLines = textOutput.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [textOutput];
      
      // Calcular dimensiones
      const maxWidth = Math.max(
        ctx.measureText(textLines.reduce((a, b) => a.length > b.length ? a : b, '')).width,
        400
      );
      
      canvas.width = maxWidth + padding * 2;
      canvas.height = textLines.length * lineHeight + padding * 2 + 80;

      // Fondo con gradiente
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, bgColor1);
      gradient.addColorStop(1, bgColor2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Borde decorativo
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Título
      ctx.font = `bold ${titleSize}px Arial`;
      ctx.fillStyle = titleColor;
      ctx.textAlign = 'center';
      ctx.fillText('Braille a Texto', canvas.width / 2, padding);

      // Texto resultado
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      textLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, padding + 40 + index * lineHeight);
      });

      // Descargar
      const link = document.createElement('a');
      link.download = `texto-braille-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error PNG:', err);
      alert('Error al generar PNG: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsPDF = () => {
    if (!textOutput) {
      alert('Primero convierte algún texto Braille');
      return;
    }
    
    setIsDownloading(true);
    try {
      // Crear canvas para el PDF
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el contexto');

      // Tamaño A4 en píxeles (72 DPI)
      const a4Width = 595;
      const a4Height = 842;
      canvas.width = a4Width;
      canvas.height = a4Height;

      // Fondo blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Borde
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Título principal
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#8B5CF6';
      ctx.textAlign = 'center';
      ctx.fillText('BRAILLE A TEXTO', canvas.width / 2, 70);

      // Línea decorativa
      ctx.beginPath();
      ctx.moveTo(100, 90);
      ctx.lineTo(canvas.width - 100, 90);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Entrada Braille
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'left';
      ctx.fillText('Entrada Braille:', 50, 130);

      ctx.font = '24px Arial';
      ctx.fillStyle = '#1E293B';
      const brailleLines = brailleInput.match(/.{1,20}/g) || [brailleInput];
      brailleLines.slice(0, 4).forEach((line, i) => {
        ctx.fillText(line, 50, 165 + i * 35);
      });

      // Resultado Texto
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Resultado en Texto:', 50, 320);

      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#8B5CF6';
      ctx.textAlign = 'center';
      const textLines = textOutput.match(/.{1,25}/g) || [textOutput];
      textLines.slice(0, 8).forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 380 + i * 45);
      });

      // Fecha
      ctx.font = '12px Arial';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText(`Generado: ${new Date().toLocaleString('es-ES')}`, canvas.width / 2, canvas.height - 50);

      // Convertir canvas a imagen y abrir para imprimir como PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para descargar el PDF');
        setIsDownloading(false);
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Braille a Texto - PDF</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
            img { max-width: 100%; height: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
            .info { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #8B5CF6; color: white; padding: 10px 20px; border-radius: 8px; font-family: Arial; }
            @media print { body { background: white; } img { box-shadow: none; } .info { display: none; } }
          </style>
        </head>
        <body>
          <div class="info">📄 Presiona Ctrl+P para guardar como PDF</div>
          <img src="${imgData}" alt="Braille a Texto PDF" />
          <script>
            setTimeout(() => { window.print(); }, 800);
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Error PDF:', err);
      alert('Error al generar PDF: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          0% { 
            opacity: 0; 
            transform: translateY(-10px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '6px' 
            }}>
              <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>
                {brailleInput.length} caracteres Braille
              </p>
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                style={{
                  padding: '8px 14px',
                  background: showKeyboard 
                    ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                    : 'transparent',
                  border: `2px solid ${theme.primary}`,
                  borderRadius: '8px',
                  color: showKeyboard ? '#FFFFFF' : theme.primary,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseOver={(e) => {
                  if (!showKeyboard) {
                    e.currentTarget.style.background = `${theme.primary}15`;
                  }
                }}
                onMouseOut={(e) => {
                  if (!showKeyboard) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Keyboard size={16} />
                {showKeyboard ? 'Ocultar Teclado' : 'Teclado Braille'}
                {showKeyboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Teclado Braille */}
          {showKeyboard && (
            <div style={{
              animation: 'slideDown 0.3s ease-out',
            }}>
              <BrailleKeyboard
                onInput={handleBrailleKeyInput}
                onSpace={handleBrailleSpace}
                onDelete={handleBrailleDelete}
                isDark={isDark}
              />
            </div>
          )}

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
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: theme.text,
                  margin: 0,
                }}>
                  🎯 Resultado en Texto
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  <button
                    onClick={downloadAsPNG}
                    disabled={isDownloading}
                    style={{
                      padding: '8px 14px',
                      background: isDownloading ? theme.border : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isDownloading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      opacity: isDownloading ? 0.6 : 1,
                    }}
                  >
                    <ImageIcon size={14} />
                    PNG
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    disabled={isDownloading}
                    style={{
                      padding: '8px 14px',
                      background: isDownloading ? theme.border : 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isDownloading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      opacity: isDownloading ? 0.6 : 1,
                    }}
                  >
                    <FileText size={14} />
                    PDF
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontSize: '28px',
                  lineHeight: '1.8',
                  wordBreak: 'break-word',
                  userSelect: 'all',
                  color: theme.secondary,
                  fontWeight: 600,
                  padding: '20px',
                  background: isDark ? theme.card : '#F8F9FF',
                  borderRadius: '12px',
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
