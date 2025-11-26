'use client';

import { useState } from 'react';
import { brailleToText, isValidBraille } from '@/lib/braille-converter';
import { addConversionToHistory } from './ConversionHistory';
import ConversionHistory from './ConversionHistory';
import BrailleKeyboard from './BrailleKeyboard';
import { Accessibility, Copy, RotateCcw, Sparkles, Wifi, WifiOff, Download, FileText, Image, Printer } from 'lucide-react';
import { useConversion, useBackendStatus } from '@/lib/hooks/useApi';
import { useTheme } from '@/context/ThemeContext';
import { downloadAsPNG, downloadAsPDF, downloadAsWord, printElement } from '@/lib/export-utils';

export default function BrailleToText() {
  const [brailleInput, setBrailleInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  const { convertir } = useConversion();
  const { isConnected } = useBackendStatus();
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const theme = {
    bg: isDark ? '#0A0E27' : '#F8F9FF',
    card: isDark ? '#151937' : '#FFFFFF',
    input: isDark ? '#1A1F3A' : '#F8F9FF',
    text: isDark ? '#FFFFFF' : '#1E293B',
    textSecondary: isDark ? '#8B92B8' : '#64748B',
    border: isDark ? '#252B4F' : '#E2E8F0',
    primary: '#8B5CF6',
    secondary: '#EC4899',
  };

  const handleBrailleInput = (char: string) => setBrailleInput(p => p + char);
  const handleSpace = () => setBrailleInput(p => p + ' ');
  const handleDelete = () => setBrailleInput(p => p.slice(0, -1));
  const handleClear = () => { setBrailleInput(''); setTextOutput(''); setError(''); };

  const handleConvert = async () => {
    setError(''); setIsConverting(true);
    if (!brailleInput.trim()) { setError('Por favor ingresa texto en Braille'); setIsConverting(false); return; }
    if (!isValidBraille(brailleInput)) { setError('Texto Braille invalido'); setIsConverting(false); return; }
    if (isConnected) {
      try {
        const r = await convertir(brailleInput, 'braille-a-texto', true);
        if (r?.exito) { setTextOutput(r.resultado); setIsConverting(false); return; }
      } catch (e) { console.warn(e); }
    }
    const result = brailleToText(brailleInput);
    setTextOutput(result);
    if (!isConnected) addConversionToHistory(brailleInput, result, 'braille-a-texto');
    setIsConverting(false);
  };

  const handleRestore = (original: string, tipo: 'texto-a-braille' | 'braille-a-texto') => {
    if (tipo === 'braille-a-texto') { setBrailleInput(original); setShowHistory(false); }
  };

  const handleCopy = async () => { try { await navigator.clipboard.writeText(textOutput); alert('Copiado!'); } catch { alert('Error'); } };
  const handleDownloadPNG = async () => { try { await downloadAsPNG('braille-result', 'braille.png'); setShowDownloadMenu(false); } catch { alert('Error PNG'); } };
  const handleDownloadPDF = async () => { try { await downloadAsPDF('braille-result', 'braille.pdf'); setShowDownloadMenu(false); } catch { alert('Error PDF'); } };
  const handleDownloadWord = () => { try { downloadAsWord(brailleInput, textOutput, 'braille-a-texto', 'braille.doc'); setShowDownloadMenu(false); } catch { alert('Error Word'); } };
  const handlePrint = () => { try { printElement('braille-result'); setShowDownloadMenu(false); } catch { alert('Error'); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: showHistory ? '1fr 400px' : '1fr', gap: '24px' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Accessibility size={24} color="#FFF" />
          </div>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: theme.text, margin: 0, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Braille a Texto</h2>
            <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0 }}>Convierte Braille a texto legible</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showKeyboard ? '300px 1fr' : '1fr', gap: 20 }}>
          {showKeyboard && <BrailleKeyboard onInput={handleBrailleInput} onSpace={handleSpace} onDelete={handleDelete} />}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Caracteres Braille</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowKeyboard(!showKeyboard)} style={{ padding: '6px 12px', background: showKeyboard ? '#10B981' : 'transparent', border: '2px solid #10B981', borderRadius: 8, color: showKeyboard ? '#FFF' : '#10B981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {showKeyboard ? 'Teclado ON' : 'Teclado OFF'}
                  </button>
                  <button onClick={() => setShowHistory(!showHistory)} style={{ padding: '6px 12px', background: showHistory ? '#8B5CF6' : 'transparent', border: '2px solid #8B5CF6', borderRadius: 8, color: showHistory ? '#FFF' : '#8B5CF6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {showHistory ? 'Ocultar' : 'Historial'}
                  </button>
                </div>
              </div>
              <textarea value={brailleInput} onChange={e => setBrailleInput(e.target.value)} placeholder="Usa el teclado visual..." style={{ width: '100%', height: 150, padding: 14, background: theme.input, border: '2px solid ' + theme.border, borderRadius: 12, fontSize: 32, color: theme.text, outline: 'none', resize: 'none', fontFamily: 'monospace', letterSpacing: 4 }} />
              <p style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>{brailleInput.length} caracteres</p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={handleConvert} disabled={!brailleInput.trim() || isConverting} style={{ flex: 1, minWidth: 200, padding: 14, background: brailleInput.trim() && !isConverting ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : theme.border, border: 'none', borderRadius: 10, color: '#FFF', fontSize: 15, fontWeight: 700, cursor: brailleInput.trim() && !isConverting ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isConverting ? 'Convirtiendo...' : <><Sparkles size={18} /> Convertir</>}
              </button>
              <div style={{ padding: '14px 16px', background: isConnected ? '#10B98120' : '#F59E0B20', border: '2px solid ' + (isConnected ? '#10B981' : '#F59E0B'), borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: isConnected ? '#059669' : '#D97706' }}>
                {isConnected ? <Wifi size={18} /> : <WifiOff size={18} />} {isConnected ? 'Online' : 'Offline'}
              </div>
              <button onClick={handleClear} style={{ padding: '14px 20px', background: 'transparent', border: '2px solid ' + theme.border, borderRadius: 10, color: theme.textSecondary, cursor: 'pointer' }}><RotateCcw size={18} /></button>
            </div>

            {error && <div style={{ background: isDark ? '#DC262620' : '#FEE2E2', border: '2px solid #DC2626', borderRadius: 12, padding: 14, color: '#DC2626', fontSize: 14, fontWeight: 600 }}>{error}</div>}

            {textOutput && (
              <div id="braille-result" style={{ background: isDark ? theme.bg : theme.card, border: '2px solid ' + theme.primary, borderRadius: 16, padding: 24, boxShadow: '0 8px 24px ' + theme.primary + '40' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: 0 }}>Resultado</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCopy} style={{ padding: '8px 14px', background: theme.primary, border: 'none', borderRadius: 8, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Copy size={14} /> Copiar</button>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} style={{ padding: '8px 14px', background: '#10B981', border: 'none', borderRadius: 8, color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> Descargar</button>
                      {showDownloadMenu && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: theme.card, border: '2px solid ' + theme.border, borderRadius: 12, padding: 8, zIndex: 100, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                          <button onClick={handleDownloadPNG} style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: theme.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}><Image size={16} color="#10B981" /> PNG</button>
                          <button onClick={handleDownloadPDF} style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: theme.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}><FileText size={16} color="#DC2626" /> PDF</button>
                          <button onClick={handleDownloadWord} style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: theme.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}><FileText size={16} color="#2563EB" /> Word</button>
                          <hr style={{ border: 'none', borderTop: '1px solid ' + theme.border, margin: '8px 0' }} />
                          <button onClick={handlePrint} style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: theme.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}><Printer size={16} color="#8B5CF6" /> Imprimir</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 16, padding: 12, background: isDark ? theme.bg : theme.input, borderRadius: 8 }}>
                  <p style={{ fontSize: 12, color: theme.textSecondary, margin: '0 0 8px 0' }}>Braille:</p>
                  <p style={{ fontSize: 24, fontFamily: 'monospace', color: theme.text, margin: 0, letterSpacing: 4 }}>{brailleInput}</p>
                </div>
                <div style={{ fontSize: 28, lineHeight: 1.8, wordBreak: 'break-word', userSelect: 'all', color: theme.secondary, fontWeight: 600 }}>{textOutput}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showHistory && <div style={{ minWidth: 400 }}><ConversionHistory onRestore={handleRestore} tipo="braille-a-texto" /></div>}
    </div>
  );
}
