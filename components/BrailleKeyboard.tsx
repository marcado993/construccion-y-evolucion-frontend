'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface BrailleKeyboardProps {
  onInput: (brailleChar: string) => void;
  onSpace: () => void;
  onDelete: () => void;
}

export default function BrailleKeyboard({ onInput, onSpace, onDelete }: BrailleKeyboardProps) {
  const [activeDots, setActiveDots] = useState<Set<number>>(new Set());

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
      onInput(brailleChar);
      setActiveDots(new Set());
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0E27 0%, #151937 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #252B4F',
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: '16px',
        textAlign: 'center',
      }}>
        Teclado Braille Visual
      </h3>

      {/* Matriz de puntos */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          width: 'fit-content',
        }}>
          {dots.map(dot => (
            <button
              key={dot.id}
              onClick={() => toggleDot(dot.id)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: activeDots.has(dot.id) 
                  ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                  : '#151937',
                border: activeDots.has(dot.id) 
                  ? '3px solid #818CF8'
                  : '3px solid #252B4F',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: 700,
                color: activeDots.has(dot.id) ? '#FFFFFF' : '#8B92B8',
                gridColumn: dot.col + 1,
                gridRow: dot.row + 1,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {dot.id}
            </button>
          ))}
        </div>
      </div>

      {/* Vista previa */}
      <div style={{
        background: '#0A0E27',
        border: '2px solid #252B4F',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        textAlign: 'center',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '48px',
          color: '#FFFFFF',
          fontFamily: 'monospace',
        }}>
          {activeDots.size > 0 ? dotsToUnicode(activeDots) : '⠀'}
        </span>
      </div>

      {/* Botones de acción */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        <button
          onClick={addBrailleChar}
          disabled={activeDots.size === 0}
          style={{
            padding: '12px',
            background: activeDots.size > 0 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : '#1F2937',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: activeDots.size > 0 ? 'pointer' : 'not-allowed',
            opacity: activeDots.size > 0 ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            if (activeDots.size > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Siguiente Letra
        </button>

        <button
          onClick={onSpace}
          style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Siguiente Palabra
        </button>

        <button
          onClick={() => {
            setActiveDots(new Set());
            onDelete();
          }}
          style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Trash2 size={16} />
          Borrar
        </button>
      </div>

      {/* Instrucciones */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#0A0E27',
        borderRadius: '8px',
        border: '1px solid #252B4F',
      }}>
        <p style={{
          fontSize: '12px',
          color: '#8B92B8',
          margin: 0,
          textAlign: 'center',
        }}>
          Haz clic en los puntos para formar un carácter Braille
        </p>
      </div>
    </div>
  );
}
