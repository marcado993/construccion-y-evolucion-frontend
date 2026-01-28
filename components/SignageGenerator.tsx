'use client';

import { useState } from 'react';
import { textToBraille, canConvertToBraille } from '@/lib/braille-converter';
import { FileText, Image as ImageIcon, RotateCcw, Sparkles, FileDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function SignageGenerator() {
  const [signText, setSignText] = useState('');
  const [brailleText, setBrailleText] = useState('');
  const [error, setError] = useState('');
  const [highContrast, setHighContrast] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
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
      primary: '#10B981',
      secondary: '#059669',
    },
    light: {
      bg: '#F8F9FF',
      card: '#FFFFFF',
      input: '#F8F9FF',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      primary: '#10B981',
      secondary: '#059669',
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  const handleGenerate = () => {
    setError('');
    
    const validation = canConvertToBraille(signText);
    if (!validation.valid) {
      setError(validation.error || 'Error en la conversión');
      return;
    }

    const result = textToBraille(signText);
    setBrailleText(result);
  };

  // Calcular tamaños de fuente dinámicos basados en la longitud del texto
  const getTextFontSize = () => {
    const length = signText.length;
    if (length > 30) return '32px';
    if (length > 20) return '42px';
    return '52px';
  };

  const getBrailleFontSize = () => {
    const length = brailleText.length;
    if (length > 30) return '48px';
    if (length > 20) return '58px';
    return '72px';
  };

  const getBrailleLetterSpacing = () => {
    const length = brailleText.length;
    if (length > 30) return '6px';
    if (length > 20) return '8px';
    return '12px';
  };

  // Función para crear el canvas de la señalética
  const createSignCanvas = (scale: number = 2) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el contexto');

    // Dimensiones del canvas - aumentadas para textos largos
    const width = 1000 * scale;
    const height = 500 * scale;
    canvas.width = width;
    canvas.height = height;

    // Colores fijos (evitar cualquier CSS computado)
    const bgColor = highContrast ? '#000000' : '#FFFFFF';
    const textColor = highContrast ? '#FFFFFF' : '#000000';
    const borderColor = highContrast ? '#10B981' : '#1F2937';
    const brailleColor = '#10B981';

    // Fondo
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Borde
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8 * scale;
    ctx.strokeRect(4 * scale, 4 * scale, width - 8 * scale, height - 8 * scale);

    // Calcular tamaño de fuente dinámico según longitud del texto
    const calcFontSize = (text: string, baseSize: number) => {
      const len = text.length;
      if (len > 80) return baseSize * 0.4;
      if (len > 60) return baseSize * 0.5;
      if (len > 40) return baseSize * 0.6;
      if (len > 25) return baseSize * 0.75;
      return baseSize;
    };

    // Texto principal
    const textFontSize = calcFontSize(signText, 64 * scale);
    ctx.font = `bold ${textFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Si el texto es muy largo, dividirlo en líneas
    const maxWidth = width - 80 * scale;
    const words = signText.toUpperCase().split(' ');
    let lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Dibujar líneas de texto
    const lineHeight = textFontSize * 1.2;
    const startY = height * 0.3 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    // Texto Braille - también con tamaño dinámico
    const brailleFontSize = calcFontSize(brailleText, 72 * scale);
    ctx.font = `${brailleFontSize}px Arial`;
    ctx.fillStyle = brailleColor;
    
    // Dividir Braille en líneas si es necesario
    const brailleLines: string[] = [];
    let brailleLine = '';
    for (let i = 0; i < brailleText.length; i++) {
      brailleLine += brailleText[i];
      const metrics = ctx.measureText(brailleLine);
      if (metrics.width > maxWidth) {
        brailleLines.push(brailleLine.slice(0, -1));
        brailleLine = brailleText[i];
      }
    }
    if (brailleLine) brailleLines.push(brailleLine);

    const brailleStartY = height * 0.7 - ((brailleLines.length - 1) * brailleFontSize * 1.1) / 2;
    brailleLines.forEach((line, i) => {
      ctx.fillText(line, width / 2, brailleStartY + i * brailleFontSize * 1.1);
    });

    return canvas;
  };

  const downloadAsPNG = () => {
    if (!brailleText) {
      alert('Primero genera el texto Braille');
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = createSignCanvas(3);
      
      const link = document.createElement('a');
      link.download = `senaletica-braille-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generando PNG:', err);
      alert('Error al generar la imagen PNG: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsPDF = () => {
    if (!brailleText) {
      alert('Primero genera el texto Braille');
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = createSignCanvas(2);
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Abrir ventana para imprimir/guardar como PDF
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
          <title>Señalética Braille - PDF</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              background: #f0f0f0;
              padding: 20px;
            }
            img { 
              max-width: 100%; 
              height: auto; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              border-radius: 8px;
            }
            @media print { 
              body { background: white; padding: 0; } 
              img { box-shadow: none; border-radius: 0; max-width: 100%; }
            }
            .instructions {
              position: fixed;
              top: 10px;
              left: 50%;
              transform: translateX(-50%);
              background: #4F46E5;
              color: white;
              padding: 10px 20px;
              border-radius: 8px;
              font-family: Arial, sans-serif;
              font-size: 14px;
              z-index: 1000;
            }
              @media print { .instructions { display: none; } }
            </style>
          </head>
          <body>
            <div class="instructions">📄 Presiona Ctrl+P o Cmd+P para guardar como PDF</div>
            <img src="${imgData}" alt="Señalética Braille" />
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

  const handleClear = () => {
    setSignText('');
    setBrailleText('');
    setError('');
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div>
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
            <FileDown size={24} color="#FFFFFF" />
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
              Generar Señalética
            </h2>
            <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>
              Crea diseños Braille profesionales para imprimir
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Input de texto */}
        <div>
          <label htmlFor="sign-text" style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: theme.text,
          }}>
            Texto de la señalética
          </label>
          <input
            id="sign-text"
            type="text"
            value={signText}
            onChange={(e) => setSignText(e.target.value)}
            placeholder="Ej: Baño, Salida, Recepción..."
            style={{
              width: '100%',
              padding: '14px',
              background: theme.input,
              border: `2px solid ${theme.border}`,
              borderRadius: '12px',
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
            aria-label="Texto para la señalética"
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '6px',
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: theme.textSecondary,
              margin: 0,
            }}>
              {signText.length} caracteres
            </p>
          </div>
        </div>

        {/* Opciones de diseño */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '14px',
          background: theme.input,
          borderRadius: '12px',
          border: `2px solid ${theme.border}`,
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: theme.text,
          }}>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: theme.primary,
              }}
            />
            <span>Alto contraste (fondo negro)</span>
          </label>
          <div style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: theme.textSecondary,
            background: theme.card,
            padding: '6px 12px',
            borderRadius: '6px',
          }}>
            💡 Recomendado para accesibilidad
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleGenerate}
            disabled={!signText.trim()}
            style={{
              flex: 1,
              padding: '14px',
              background: signText.trim() ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : theme.border,
              border: 'none',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: signText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              if (signText.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 16px ${theme.primary}40`;
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Sparkles size={18} />
            Generar Vista Previa
          </button>
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
            background: isDark ? '#DC262620' : '#FEE2E2',
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

        {/* Vista Previa */}
        {brailleText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: theme.text,
              margin: 0,
            }}>
              Vista Previa de Señalética
            </h3>
            
            {/* Preview Container */}
            <div
              style={{
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                background: highContrast ? '#000000' : '#FFFFFF',
                border: `4px solid ${highContrast ? theme.primary : '#000000'}`,
                minHeight: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px',
                maxWidth: '100%',
                width: '100%',
              }}>
                {/* Texto normal */}
                <div style={{
                  fontSize: getTextFontSize(),
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  color: highContrast ? '#FFFFFF' : '#000000',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  lineHeight: '1.3',
                  maxWidth: '100%',
                }}>
                  {signText}
                </div>
                
                {/* Texto Braille */}
                <div
                  style={{
                    fontSize: getBrailleFontSize(),
                    lineHeight: '1.5',
                    fontFamily: 'monospace',
                    letterSpacing: getBrailleLetterSpacing(),
                    color: highContrast ? theme.primary : theme.secondary,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                  }}
                >
                  {brailleText}
                </div>
              </div>
            </div>

            {/* Botones de descarga */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={downloadAsPDF}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: isDownloading ? theme.border : 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  opacity: isDownloading ? 0.6 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isDownloading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(79, 70, 229, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isDownloading ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid #FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Descargar PDF
                  </>
                )}
              </button>
              <button
                onClick={downloadAsPNG}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: isDownloading ? theme.border : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  opacity: isDownloading ? 0.6 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isDownloading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isDownloading ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid #FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Generando...
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} />
                    Descargar PNG
                  </>
                )}
              </button>
            </div>

            <div style={{
              padding: '16px',
              background: isDark ? `linear-gradient(135deg, ${theme.bg} 0%, ${theme.card} 100%)` : theme.card,
              borderRadius: '12px',
              border: `2px solid ${theme.primary}`,
              fontSize: '14px',
              color: theme.textSecondary,
            }}>
              💡 <strong style={{ color: theme.text }}>Tip Profesional:</strong> Imprime en papel adhesivo transparente o en vinilo para crear señalética duradera y profesional
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
