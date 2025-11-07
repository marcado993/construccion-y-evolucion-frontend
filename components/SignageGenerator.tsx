'use client';

import { useState, useRef } from 'react';
import { textToBraille, canConvertToBraille } from '@/lib/braille-converter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FileText, Image as ImageIcon, RotateCcw, Sparkles, FileDown, Sun, Moon } from 'lucide-react';

export default function SignageGenerator() {
  const [signText, setSignText] = useState('');
  const [brailleText, setBrailleText] = useState('');
  const [error, setError] = useState('');
  const [highContrast, setHighContrast] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

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

  const downloadAsPDF = async () => {
    if (!previewRef.current || !brailleText) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: highContrast ? '#000000' : '#ffffff',
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
    } catch (err) {
      alert('Error al generar PDF');
      console.error(err);
    }
  };

  const downloadAsImage = async () => {
    if (!previewRef.current || !brailleText) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        backgroundColor: highContrast ? '#000000' : '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `senaletica-braille-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('Error al generar imagen');
      console.error(err);
    }
  };

  const handleClear = () => {
    setSignText('');
    setBrailleText('');
    setError('');
  };

  return (
    <div>
      {/* Header con botón de tema */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
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
                background: 'linear-gradient(135deg, #10B981, #059669)',
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
          <label htmlFor="sign-text" style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1E293B',
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
              background: '#F8F9FF',
              border: '2px solid #E2E8F0',
              borderRadius: '12px',
              fontSize: '15px',
              color: '#1E293B',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#10B981';
              e.currentTarget.style.boxShadow = '0 0 0 3px #10B98120';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label="Texto para la señalética"
          />
        </div>

        {/* Opciones de diseño */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '14px',
          background: '#F8F9FF',
          borderRadius: '12px',
          border: '2px solid #E2E8F0',
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1E293B',
          }}>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#10B981',
              }}
            />
            <span>Alto contraste (fondo negro)</span>
          </label>
          <div style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: '#64748B',
            background: '#FFFFFF',
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
              background: signText.trim() ? 'linear-gradient(135deg, #10B981, #059669)' : '#E2E8F0',
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
                e.currentTarget.style.boxShadow = '0 8px 16px #10B98140';
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
              border: '2px solid #E2E8F0',
              borderRadius: '10px',
              color: '#64748B',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#10B981';
              e.currentTarget.style.color = '#10B981';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#64748B';
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

        {/* Vista Previa */}
        {brailleText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1E293B',
              margin: 0,
            }}>
              Vista Previa de Señalética
            </h3>
            
            {/* Preview Container */}
            <div
              ref={previewRef}
              style={{
                borderRadius: '16px',
                padding: '60px',
                textAlign: 'center',
                background: highContrast ? '#000000' : '#FFFFFF',
                border: highContrast ? '4px solid #10B981' : '4px solid #000000',
                minHeight: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Texto normal */}
                <div style={{
                  fontSize: '52px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  color: highContrast ? '#FFFFFF' : '#000000',
                }}>
                  {signText}
                </div>
                
                {/* Texto Braille */}
                <div
                  style={{
                    fontSize: '72px',
                    lineHeight: '1.6',
                    fontFamily: 'monospace',
                    letterSpacing: '12px',
                    color: highContrast ? '#10B981' : '#059669',
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
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
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
                  e.currentTarget.style.boxShadow = '0 8px 16px #4F46E540';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FileText size={18} />
                Descargar PDF
              </button>
              <button
                onClick={downloadAsImage}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
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
                  e.currentTarget.style.boxShadow = '0 8px 16px #8B5CF640';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ImageIcon size={18} />
                Descargar PNG
              </button>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #0A0E27 0%, #151937 100%)',
              borderRadius: '12px',
              border: '2px solid #10B981',
              fontSize: '14px',
              color: '#8B92B8',
            }}>
              💡 <strong style={{ color: '#FFFFFF' }}>Tip Profesional:</strong> Imprime en papel adhesivo transparente o en vinilo para crear señalética duradera y profesional
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
