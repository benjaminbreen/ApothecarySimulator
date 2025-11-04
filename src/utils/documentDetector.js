/**
 * Document detection utility
 * Identifies readable documents from inventory items and provides metadata
 */

// Document keywords for detection
const DOCUMENT_KEYWORDS = {
  letter: ['letter', 'carta', 'missive', 'correspondence', 'epistle'],
  document: ['document', 'documento', 'parchment', 'scroll', 'escritura', 'deed', 'proclamation', 'notice', 'summons', 'citación', 'warrant', 'writ', 'complaint'],
  codex: ['codex', 'manuscript', 'manuscrito', 'tome', 'grimoire', 'treatise'],
  note: ['note', 'nota', 'message', 'mensaje', 'memorandum'],
  contract: ['contract', 'contrato', 'agreement', 'accord'],
  recipe: ['recipe', 'receta', 'formula', 'preparation'],
  map: ['map', 'mapa', 'chart', 'plano'],
  certificate: ['certificate', 'certificado', 'license', 'licencia', 'permit']
};

/**
 * Check if an item name represents a readable document
 * @param {string} itemName - Name of the item
 * @returns {boolean} True if item is a document
 */
export function isDocumentItem(itemName) {
  if (!itemName) return false;

  const lowerName = itemName.toLowerCase();

  // Check all document keyword categories
  return Object.values(DOCUMENT_KEYWORDS).some(keywords =>
    keywords.some(keyword => lowerName.includes(keyword))
  );
}

/**
 * Determine the document type from item name
 * @param {string} itemName - Name of the item
 * @returns {string} Document type (letter|document|codex|note|contract|recipe|map|certificate)
 */
export function getDocumentType(itemName) {
  if (!itemName) return 'document';

  const lowerName = itemName.toLowerCase();

  // Check each category in priority order
  for (const [type, keywords] of Object.entries(DOCUMENT_KEYWORDS)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return type;
    }
  }

  return 'document'; // Default fallback
}

/**
 * Extract document metadata from narrative context
 * @param {string} itemName - Name of the document
 * @param {string} narrativeContext - Recent narrative text
 * @param {Object} inventoryChange - Inventory change data from StateAgent
 * @returns {Object} Document metadata
 */
export function extractDocumentMetadata(itemName, narrativeContext = '', inventoryChange = {}) {
  const metadata = {
    author: null,
    recipient: 'Maria de Lima',
    giver: null,
    purpose: null,
    language: 'Spanish', // Default for 1680s Mexico
    condition: 'sealed'
  };

  // Extract from StateAgent metadata if available
  if (inventoryChange.metadata) {
    Object.assign(metadata, inventoryChange.metadata);
  }

  // Try to extract author from item name
  // Pattern: "Letter from [Name]"
  const fromMatch = itemName.match(/from\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|'s)/i);
  if (fromMatch) {
    metadata.author = fromMatch[1].trim();
  }

  // Try to extract author from item name
  // Pattern: "[Name]'s Letter"
  const possessiveMatch = itemName.match(/([A-Z][a-zA-Z\s]+?)'s\s+(?:letter|note|document)/i);
  if (possessiveMatch) {
    metadata.author = possessiveMatch[1].trim();
  }

  // Try to extract who gave it from narrative
  if (narrativeContext) {
    // Pattern: "X hands you", "X gives you", "X offers you"
    const giverMatch = narrativeContext.match(/([A-Z][a-zA-Z\s]+?)\s+(?:hands?|gives?|offers?|presents?)\s+(?:you|Maria)/i);
    if (giverMatch) {
      metadata.giver = giverMatch[1].trim();
    }
  }

  return metadata;
}

/**
 * Check if document should auto-open based on context
 * @param {Object} documentData - Document item data
 * @param {string} narrativeContext - Recent narrative
 * @returns {boolean} True if should auto-open
 */
export function shouldAutoOpenDocument(documentData, narrativeContext = '') {
  const lowerNarrative = narrativeContext.toLowerCase();

  // Auto-open if explicitly handed over in narrative
  const handoffKeywords = [
    'hands you', 'gives you', 'offers you', 'presents you', 'passes you',
    'holding out', 'holds out', 'held out', 'holding the', 'clutching a',
    'extends the', 'extending the', 'thrusts the', 'thrust the',
    'slides the', 'slide the', 'pushes the', 'push the'
  ];
  const hasHandoff = handoffKeywords.some(keyword =>
    lowerNarrative.includes(keyword)
  );

  // Auto-open if marked as story-critical
  const isCritical = documentData.tier === 'story-critical' ||
                     documentData.importance === 'high';

  // Auto-open for legal/official documents (summons, warrants, complaints)
  const isLegal = documentData.type === 'document' &&
                  (lowerNarrative.includes('summons') ||
                   lowerNarrative.includes('warrant') ||
                   lowerNarrative.includes('complaint') ||
                   lowerNarrative.includes('citación'));

  return hasHandoff || isCritical || isLegal;
}

export default {
  isDocumentItem,
  getDocumentType,
  extractDocumentMetadata,
  shouldAutoOpenDocument
};
