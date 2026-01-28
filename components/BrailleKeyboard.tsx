'use client';

import { useState, useEffect } from 'react';
import { BRAILLE_ALPHABET, CAPITAL_INDICATOR, NUMBER_INDICATOR } from '../lib/braille-dictionary';
import { Trash2, Keyboard, ArrowUp, Hash } from 'lucide-react';

interface BrailleKeyboardProps {
  onInput: (brailleChar: string) => void;
  onSpace: () => void;
  onDelete: () => void;
  isDark?: boolean;
}

export default function BrailleKeyboard({ onInput, onSpace, onDelete, isDark = true }: BrailleKeyboardProps) {
  const [activeDots, setActiveDots] = useState<Set<number>>(new Set());
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isNumberMode, setIsNumberMode] = useState(false);

  /* Lógica del componente */

  // Matriz de puntos Braille: [1,2,3] [4,5,6]
  const dots = [
    { id: 1, row: 0, col: 0 },
    { id: 2, row: 1, col: 0 },
    { id: 3, row: 2, col: 0 },
    { id: 4, row: 0, col: 1 },
    { id: 5, row: 1, col: 1 },
    { id: 6, row: 2, col: 1 },
  ];

  const toggleDot = (dotId: number) => {
    const newDots = new Set(activeDots);
    if (newDots.has(dotId)) {
      newDots.delete(dotId);
    } else {
      newDots.add(dotId);
    }
    setActiveDots(newDots);
  };

  const dotsToUnicode = (dots: Set<number>): string => {
    if (dots.size === 0) return '';

    // Base Unicode para Braille: U+2800
    let code = 0x2800;

    // Mapeo de puntos a bits
    const dotMap: { [key: number]: number } = {
      1: 0x01, // bit 0
      2: 0x02, // bit 1
      3: 0x04, // bit 2
      4: 0x08, // bit 3
      5: 0x10, // bit 4
      6: 0x20, // bit 5
    };

    dots.forEach(dot => {
      code += dotMap[dot];
    });

    return String.fromCharCode(code);
  };

  const addBrailleChar = () => {
    if (activeDots.size > 0) {
      const brailleChar = dotsToUnicode(activeDots);

      let prefix = '';
      if (isUpperCase) prefix = '\u2828'; // ⠨ Capital
      if (isNumberMode) prefix = '\u283C'; // ⠼ Number

      onInput(prefix + brailleChar);
      setActiveDots(new Set());
    }
  };

  // Listen for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el foco está en un input/textarea (para no duplicar o interferir)
      if (document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;

      if (key === 'Backspace') {
        onDelete();
        return;
      }

      if (key === ' ') {
        onSpace();
        e.preventDefault(); // Prevenir scroll
        return;
      }

      // Manejo de números (0-9) -> Automáticamente agrega prefijo numérico
      if (/^[0-9]$/.test(key)) {
        const brailleNum = BRAILLE_ALPHABET[key];
        if (brailleNum) {
          onInput(brailleNum);
        }
        return;
      }

      // Manejo de letras (a-z, A-Z)
      if (/^[a-zA-Z]$/.test(key)) {
        const lowerKey = key.toLowerCase();
        let brailleChar = BRAILLE_ALPHABET[lowerKey];

        if (brailleChar) {
          // Si es mayúscula (detectado por e.key siendo mayúscula o Shift activo), agregar prefijo
          if (key === key.toUpperCase() && key !== key.toLowerCase()) {
            brailleChar = CAPITAL_INDICATOR + brailleChar;
          }
          onInput(brailleChar);
        }
        return;
      }

      // Manejo de puntuación básica si está en el mapa
      if (BRAILLE_ALPHABET[key]) {
        onInput(BRAILLE_ALPHABET[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInput, onDelete, onSpace, isUpperCase, isNumberMode]);

  /* Diseño visual "Premium" */
  const containerClasses = isDark
    ? "bg-slate-900/50 backdrop-blur-xl border-slate-800 text-white shadow-2xl shadow-indigo-500/10"
    : "bg-white/80 backdrop-blur-xl border-slate-200 text-slate-800 shadow-xl";

  const cardClasses = isDark
    ? "bg-slate-800/50 border-slate-700/50"
    : "bg-white border-slate-200";

  const activeDotClass = "bg-gradient-to-br from-violet-500 to-fuchsia-500 border-transparent shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-105";
  const inactiveDotClass = isDark
    ? "bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-500 hover:bg-slate-750"
    : "bg-slate-100 border-slate-300 text-slate-400 hover:border-slate-400 hover:bg-slate-50";

  return (
    <div className={`rounded-3xl p-6 border ${containerClasses} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={`p-2 rounded-xl ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
          <Keyboard size={24} />
        </div>
        <h3 className="text-lg font-bold tracking-tight">
          Teclado Braille
        </h3>
      </div>

      {/* Matriz de puntos */}
      <div className="flex justify-center mb-8">
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/5 border border-white/5">
          {dots.map(dot => (
            <button
              key={dot.id}
              onClick={() => toggleDot(dot.id)}
              className={`
                w-16 h-16 rounded-full border-2 text-xl font-bold transition-all duration-200 flex items-center justify-center
                ${activeDots.has(dot.id) ? activeDotClass : inactiveDotClass}
              `}
              style={{ gridColumn: dot.col + 1, gridRow: dot.row + 1 }}
            >
              {dot.id}
            </button>
          ))}
        </div>
      </div>

      {/* Vista previa */}
      <div className={`
        relative mb-6 rounded-2xl border-2 overflow-hidden
        ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}
      `}>
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="relative p-4 flex items-center justify-center min-h-[80px]">
          <span className={`text-6xl font-mono transition-all duration-300 ${activeDots.size > 0 ? "scale-100 opacity-100" : "scale-90 opacity-50"}`}>
            {activeDots.size > 0 ? dotsToUnicode(activeDots) : '⠀'}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-4 gap-3">
        {/* Toggle Mayúsculas */}
        <button
          onClick={() => {
            setIsUpperCase(!isUpperCase);
            if (!isUpperCase) setIsNumberMode(false);
          }}
          className={`
            p-3 rounded-xl font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 border
            ${isUpperCase
              ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25 ring-2 ring-violet-500/20"
              : activeDots.size > 0 ? "opacity-50 cursor-not-allowed " + cardClasses : cardClasses + " hover:bg-slate-700/50"}
          `}
        >
          <ArrowUp size={18} />
          <span className="text-xs">Mayús</span>
        </button>

        {/* Toggle Números */}
        <button
          onClick={() => {
            setIsNumberMode(!isNumberMode);
            if (!isNumberMode) setIsUpperCase(false);
          }}
          className={`
            p-3 rounded-xl font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 border
            ${isNumberMode
              ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/25 ring-2 ring-pink-500/20"
              : activeDots.size > 0 ? "opacity-50 cursor-not-allowed " + cardClasses : cardClasses + " hover:bg-slate-700/50"}
          `}
        >
          <Hash size={18} />
          <span className="text-xs">123</span>
        </button>

        {/* Espacio */}
        <button
          onClick={onSpace}
          className={`
            col-span-1 p-3 rounded-xl font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 border
            bg-slate-700 border-slate-600 text-white hover:bg-slate-600
          `}
        >
          <span className="text-lg">␣</span>
          <span className="text-xs">Espacio</span>
        </button>

        {/* Borrar */}
        <button
          onClick={() => {
            setActiveDots(new Set());
            onDelete();
          }}
          className="p-3 rounded-xl font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 border bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/30"
        >
          <Trash2 size={18} />
          <span className="text-xs">Borrar</span>
        </button>

        {/* Botón Añadir (Full width) */}
        <button
          onClick={addBrailleChar}
          disabled={activeDots.size === 0}
          className={`
            col-span-4 p-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg
            ${activeDots.size > 0
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white transform hover:scale-[1.02] hover:shadow-emerald-500/20 active:scale-[0.98]"
              : "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50"}
          `}
        >
          ✓ Insertar Carácter
        </button>
      </div>

      {/* Footer Instrucciones */}
      <div className={`mt-6 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        <p>Usa tu teclado numérico (1-9) para entrada rápida</p>
      </div>
    </div>
  );
}
