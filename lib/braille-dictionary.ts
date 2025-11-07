// Diccionario de conversión Braille
// Cada carácter se representa con 6 puntos (⠿)
// Formato: '123456' donde cada dígito es 0 (sin punto) o 1 (con punto)

export const BRAILLE_ALPHABET: Record<string, string> = {
  // Letras minúsculas
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
  'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'ñ': '⠻',
  'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎',
  't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
  'y': '⠽', 'z': '⠵',
  
  // Números (precedidos por signo numérico ⠼)
  '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑',
  '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚',
  
  // Vocales con tilde
  'á': '⠷', 'é': '⠮', 'í': '⠌', 'ó': '⠬', 'ú': '⠾',
  'ü': '⠳',
  
  // Puntuación
  '.': '⠲', ',': '⠂', ';': '⠆', ':': '⠒', '?': '⠦',
  '¿': '⠢', '!': '⠖', '¡': '⠖', '-': '⠤', '(': '⠐⠣',
  ')': '⠐⠜', '"': '⠦', "'": '⠄', ' ': '⠀',
};

// Inversión del diccionario para Braille → Texto
export const BRAILLE_TO_TEXT: Record<string, string> = Object.entries(BRAILLE_ALPHABET)
  .reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, string>);

// Indicador de mayúscula
export const CAPITAL_INDICATOR = '⠨';

// Indicador numérico
export const NUMBER_INDICATOR = '⠼';
