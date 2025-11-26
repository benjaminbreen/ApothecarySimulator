/**
 * JSON parsing helpers with safe error handling
 * Prevents crashes from malformed JSON responses (especially from LLM outputs)
 */

/**
 * Safely parse JSON string with fallback
 *
 * @param {string} str - JSON string to parse
 * @param {*} fallback - Value to return if parsing fails (default: null)
 * @returns {*} Parsed object or fallback value
 *
 * @example
 * const data = safeJSONParse(response, []); // Returns [] if invalid JSON
 * const config = safeJSONParse(configStr, { default: true });
 */
export function safeJSONParse(str, fallback = null) {
  if (!str || typeof str !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('[JSON] Parse failed:', error.message.substring(0, 100));
    return fallback;
  }
}

/**
 * Safely stringify object to JSON with fallback
 *
 * @param {*} obj - Object to stringify
 * @param {string} fallback - String to return if stringify fails (default: '{}')
 * @returns {string} JSON string or fallback
 *
 * @example
 * const json = safeJSONStringify(gameState, '{"error": true}');
 */
export function safeJSONStringify(obj, fallback = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('[JSON] Stringify failed:', error.message);
    return fallback;
  }
}

/**
 * Clean common LLM JSON response issues before parsing
 * - Removes markdown code blocks (```json ... ```)
 * - Trims whitespace
 * - Removes leading/trailing non-JSON characters
 *
 * @param {string} str - Potentially dirty JSON string
 * @returns {string} Cleaned JSON string
 *
 * @example
 * const cleaned = cleanJSONString("```json\n{\"foo\": \"bar\"}\n```");
 * const data = JSON.parse(cleaned);
 */
export function cleanJSONString(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  let cleaned = str.trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // Remove common LLM prefixes
  cleaned = cleaned.replace(/^Here's the JSON:?\s*/i, '');
  cleaned = cleaned.replace(/^JSON:?\s*/i, '');

  return cleaned.trim();
}

/**
 * Parse JSON from LLM response with automatic cleaning
 * Combines cleanJSONString + safeJSONParse for common LLM use case
 *
 * @param {string} str - LLM response that should contain JSON
 * @param {*} fallback - Value to return if parsing fails (default: null)
 * @returns {*} Parsed object or fallback value
 *
 * @example
 * const data = parseLLMJSON(llmResponse, { error: true });
 */
export function parseLLMJSON(str, fallback = null) {
  const cleaned = cleanJSONString(str);
  return safeJSONParse(cleaned, fallback);
}

/**
 * Extract JSON object from text that may contain other content
 * Finds first { ... } or [ ... ] in string
 *
 * @param {string} str - Text containing JSON
 * @returns {string|null} Extracted JSON string or null if not found
 *
 * @example
 * const json = extractJSON("Some text before {\"key\": \"value\"} and after");
 * const data = safeJSONParse(json);
 */
export function extractJSON(str) {
  if (!str || typeof str !== 'string') {
    return null;
  }

  // Find first { or [
  const objectStart = str.indexOf('{');
  const arrayStart = str.indexOf('[');

  let start = -1;
  let endChar = '';

  if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
    start = objectStart;
    endChar = '}';
  } else if (arrayStart !== -1) {
    start = arrayStart;
    endChar = ']';
  }

  if (start === -1) {
    return null;
  }

  // Find matching closing bracket
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    const char = str[i];
    if (char === '{' || char === '[') {
      depth++;
    } else if (char === '}' || char === ']') {
      depth--;
      if (depth === 0) {
        return str.substring(start, i + 1);
      }
    }
  }

  return null;
}

export default {
  safeJSONParse,
  safeJSONStringify,
  cleanJSONString,
  parseLLMJSON,
  extractJSON
};
