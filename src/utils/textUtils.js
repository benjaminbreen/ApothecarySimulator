/**
 * Text Utilities
 * Helper functions for text processing and encoding fixes
 */

/**
 * Fix common UTF-8 encoding issues where accented characters become � (replacement character)
 * This happens when UTF-8 bytes are incorrectly decoded as ISO-8859-1/Windows-1252
 *
 * @param {string} text - Text that may contain encoding issues
 * @returns {string} Fixed text with proper UTF-8 characters
 */
export function fixEncodingIssues(text) {
  if (!text || typeof text !== 'string') return text;

  // Common Spanish character replacements that got corrupted
  const fixes = {
    'Ram�rez': 'Ramírez',
    'G�mez': 'Gómez',
    'D�az': 'Díaz',
    'L�pez': 'López',
    'Mart�nez': 'Martínez',
    'S�nchez': 'Sánchez',
    'Gonz�lez': 'González',
    'Hern�ndez': 'Hernández',
    'P�rez': 'Pérez',
    'Jim�nez': 'Jiménez',
    'Rodr�guez': 'Rodríguez',
    'espa�ol': 'español',
    'Sebasti�n': 'Sebastián',
    'Tom�s': 'Tomás',
    'Andr�s': 'Andrés',
    'Bartolom�': 'Bartolomé',
    'Crist�bal': 'Cristóbal',
    'In�s': 'Inés',
    'B�rbara': 'Bárbara',
    '�rsula': 'Úrsula',
    'Mar�a': 'María',
    'C�rdoba': 'Córdoba',
    'M�laga': 'Málaga',
    'C�diz': 'Cádiz',
    // Generic replacement character fixes
    '�': 'í', // Most common: í
  };

  let fixed = text;

  // Apply each fix
  for (const [broken, correct] of Object.entries(fixes)) {
    fixed = fixed.replace(new RegExp(broken, 'g'), correct);
  }

  return fixed;
}

/**
 * Recursively fix encoding issues in an object's string properties
 * @param {*} obj - Object to fix (can be array, object, or primitive)
 * @returns {*} Fixed object with corrected strings
 */
export function fixEncodingInObject(obj) {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return fixEncodingIssues(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => fixEncodingInObject(item));
  }

  if (typeof obj === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      fixed[key] = fixEncodingInObject(value);
    }
    return fixed;
  }

  return obj;
}

/**
 * Capitalize the first letter of each word in a string
 * @param {string} text - Text to capitalize
 * @returns {string} Text with each word capitalized
 */
export function toTitleCase(text) {
  if (!text || typeof text !== 'string') return text;

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
