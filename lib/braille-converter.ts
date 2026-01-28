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
  // Estado para el modo numérico
  let isNumberMode = false;
  // Estado para mayúsculas (solo la siguiente letra)
  let capitalizeNext = false;
  
  for (let i = 0; i < braille.length; i++) {
    const char = braille[i];
    
    // 1. Detectar indicadores especiales
    
    // Indicador de mayúscula
    if (char === CAPITAL_INDICATOR) {
      capitalizeNext = true;
      continue;
    }
    
    // Indicador de número (activa modo numérico)
    if (char === '⠼') { // NUMBER_INDICATOR
      isNumberMode = true;
      continue;
    }
    
    // Espacio: resetea modo numérico
    if (char === ' ') {
      result += ' ';
      isNumberMode = false;
      continue;
    }

    // 2. Manejo de separadores en modo numérico (punto, coma, guion)
    // Estos caracteres tienen doble significado, pero en contexto numérico son separadores
    // y mantienen el modo numérico activo (o lo terminan dependiendo del siguiente?)
    // Según backend: si es separador, se añade y se "verifica siguiente" para mantener estado.
    // Simplificación para frontend: Si es un mapeo directo a separador numérico conocido, úsalo.
    
    // Verificamos si es un carácter mapeado
    let textChar = BRAILLE_TO_TEXT[char];
    
    // Caso especial: coincidencia de separadores que son ambiguos
    // En el backend ⠤ (guion) o ⠂ (coma) o ⠄ (punto) se tratan directo.
    if (['⠤', '⠂', '⠄'].includes(char)) {
       if (textChar) result += textChar;
       continue;
       // Nota: Backend dice "continue" sin cambiar isNumberMode.
       // Esto puede ser sutil. Supongamos que "1.2" es #a.b -> ⠼⠁⠄⠃
       // Si ⠄ es punto, isNumberMode sigue true para la ⠃?
       // El backend dice: "Detectar separadores... no salir de modo número".
       // Así que aquí NO cambiamos isNumberMode.
    }
    
    if (textChar) {
      // Si estamos en modo numérico y el carácter es una de las primeras 10 letras (a-j)
      if (isNumberMode && 'abcdefghij'.includes(textChar)) {
        // Convertir a número
        const numberMap: Record<string, string> = {
          'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5',
          'f': '6', 'g': '7', 'h': '8', 'i': '9', 'j': '0'
        };
        result += numberMap[textChar];
      } else {
        // Modo normal (letras/símbolos)
        if (capitalizeNext) {
          result += textChar.toUpperCase();
          capitalizeNext = false;
        } else {
          result += textChar;
        }
        
        // Si encontramos una letra/símbolo que NO es válido como número, ¿deberíamos salir del modo numérico?
        // El estándar Braille suele requerir un indicador o espacio para salir, 
        // pero si escribes "1a", sería ⠼⠁⠁ (que es 11) o ⠼⠁⠰⠁ (con separador?).
        // Por simplicidad, y siguiendo el backend: 
        // El backend NO resetea isNumberMode explícitamente en letras no numéricas dentro del loop, 
        // confiando en que el usuario ponga separadores o espacios si mezcla.
      }
    } else {
      // Caracter no encontrado en diccionario, añadir tal cual
      result += char;
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
