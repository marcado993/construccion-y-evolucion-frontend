import { BRAILLE_ALPHABET, BRAILLE_TO_TEXT, CAPITAL_INDICATOR } from './braille-dictionary';

/**
 * Convierte texto normal a Braille
 */
export function textToBraille(text: string): string {
  if (!text) return '';
  
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const lowerChar = char.toLowerCase();
    
    // Primero buscar el carácter directamente (para símbolos como +, *, /, etc.)
    const directBraille = BRAILLE_ALPHABET[char];
    if (directBraille) {
      result += directBraille;
      continue;
    }
    
    // Si es mayúscula, agregar indicador
    if (char !== lowerChar && char !== ' ') {
      result += CAPITAL_INDICATOR;
    }
    
    // Convertir el carácter en minúscula
    const brailleChar = BRAILLE_ALPHABET[lowerChar];
    if (brailleChar) {
      result += brailleChar;
    } else {
      // Si no se encuentra, mantener el carácter original
      result += char;
    }
  }
  
  return result;
}

/**
 * Convierte Braille a texto normal
 */
export function brailleToText(braille: string): string {
  if (!braille) return '';
  
  let result = '';
  let isCapital = false;
  
  for (let i = 0; i < braille.length; i++) {
    const char = braille[i];
    
    // Detectar indicador de mayúscula
    if (char === CAPITAL_INDICATOR) {
      isCapital = true;
      continue;
    }
    
    // Convertir el carácter
    const textChar = BRAILLE_TO_TEXT[char];
    if (textChar) {
      result += isCapital ? textChar.toUpperCase() : textChar;
      isCapital = false;
    } else {
      result += char; // Mantener si no se encuentra
    }
  }
  
  return result;
}

/**
 * Valida si un texto contiene solo caracteres Braille válidos
 */
export function isValidBraille(text: string): boolean {
  const brailleChars = Object.values(BRAILLE_ALPHABET);
  brailleChars.push(CAPITAL_INDICATOR);
  
  return text.split('').every(char => brailleChars.includes(char) || char === ' ');
}

/**
 * Valida si un texto puede ser convertido a Braille
 */
export function canConvertToBraille(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'El texto no puede estar vacío' };
  }
  
  const unsupportedChars = text
    .split('')
    .filter(char => {
      // El carácter es soportado si:
      // 1. Está en el diccionario directamente (símbolos, números)
      // 2. Su versión minúscula está en el diccionario (letras)
      // 3. Es un espacio
      const directMatch = BRAILLE_ALPHABET[char];
      const lowerMatch = BRAILLE_ALPHABET[char.toLowerCase()];
      return !directMatch && !lowerMatch && char !== ' ';
    })
    .filter((char, index, self) => self.indexOf(char) === index);
  
  if (unsupportedChars.length > 0) {
    return {
      valid: false,
      error: `Caracteres no soportados: ${unsupportedChars.join(', ')}`
    };
  }
  
  return { valid: true };
}
