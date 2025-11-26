'use client';

import { useState, useRef } from 'react';
import { textToBraille, canConvertToBraille } from '@/lib/braille-converter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FileText, Image as ImageIcon, RotateCcw, Sparkles, FileDown, Printer } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function SignageGenerator() {
  const [signText, setSignText] = useState('');
  const [brailleText, setBrailleText] = useState('');
  const [error, setError] = useState('');
  const [highContrast, setHighContrast] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
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

  const downloadAsPDF = async () => {
    if (!previewRef.current || !brailleText) return;

    setIsDownloading(true);
    try {
      // Asegurar que el contenido esté renderizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: highContrast ? '#000000' : '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`senaletica-braille-${Date.now()}.pdf`);
      
      // Mostrar mensaje de éxito
      alert('✅ PDF descargado exitosamente');
    } catch (err) {
      alert('❌ Error al generar PDF: ' + (err as Error).message);
      console.error('Error completo:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsImage = async () => {
    if (!previewRef.current || !brailleText) return;

    setIsDownloading(true);
    try {
      // Asegurar que el contenido esté renderizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        backgroundColor: highContrast ? '#000000' : '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `senaletica-braille-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Mostrar mensaje de éxito
      alert('✅ Imagen descargada exitosamente');
    } catch (err) {
      alert('❌ Error al generar imagen: ' + (err as Error).message);
      console.error('Error completo:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = () => {
    setSignText('');
    setBrailleText('');
    setError('');
  };

  const downloadAsWord = () => {
    if (!brailleText) return;
    const html = `
      <html>
        <head><meta charset="utf-8"><title>Senaletica Braille</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; font-size: 32px;">${signText}</h1>
          <p style="text-align: center; font-size: 48px; font-family: monospace; letter-spacing: 8px;">${brailleText}</p>
          <hr/>
          <p style="text-align: center; color: #666; font-size: 12px;">Generado por Braille App - Senaletica Accesible</p>
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `senaletica-braille-${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Word descargado exitosamente');
  };

  const handlePrint = () => {
    if (!previewRef.current || !brailleText) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Imprimir Senaletica</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: ${highContrast ? '#000' : '#fff'};">
            <div style="text-align: center; padding: 40px;">
              <h1 style="font-size: 48px; color: ${highContrast ? '#fff' : '#000'}; margin-bottom: 20px;">${signText}</h1>
              <p style="font-size: 72px; font-family: monospace; letter-spacing: 12px; color: ${highContrast ? '#fff' : '#000'};">${brailleText}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
            maxLength={50}
            style={{
              width: '100%',
              padding: '14px',
              background: theme.input,
              border: `2px solid ${signText.length > 30 ? '#F59E0B' : theme.border}`,
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
              e.currentTarget.style.borderColor = signText.length > 30 ? '#F59E0B' : theme.border;
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
              color: signText.length > 30 ? '#F59E0B' : theme.textSecondary,
              margin: 0,
              fontWeight: signText.length > 30 ? 600 : 400,
            }}>
              {signText.length > 30 && '⚠️ '}{signText.length}/50 caracteres
            </p>
            {signText.length > 30 && (
              <p style={{ 
                fontSize: '12px', 
                color: '#F59E0B',
                margin: 0,
                fontWeight: 600,
              }}>
                Textos cortos son más legibles
              </p>
            )}
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
              ref={previewRef}
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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={downloadAsPDF}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  minWidth: '140px',
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
                    PDF
                  </>
                )}
              </button>
              <button
                onClick={downloadAsImage}
                disabled={isDownloading}
                style={{
                  flex: 1,
                  minWidth: '140px',
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
                    PNG
                  </>
                )}
              </button>
              <button
                onClick={downloadAsWord}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FileText size={18} />
                Word
              </button>
              <button
                onClick={handlePrint}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Printer size={18} />
                Imprimir
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
