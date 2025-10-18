/**
 * Utility for resolving detail images for POIs and furniture
 * Checks if a detail image exists in public/details/ folder
 */

/**
 * Convert a POI/furniture name to the expected filename format
 * Examples:
 * - "Shop Counter" → "shop_counter.png"
 * - "Sales Counter" → "sales_counter.png"
 * - "sales counter" → "sales_counter.png"
 */
export function nameToFilename(name) {
  if (!name) return null;

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '') // Remove special characters
    + '.png';
}

/**
 * Check if a detail image exists for this POI/furniture
 * Returns the path if it exists, null otherwise
 */
export async function getDetailImagePath(name) {
  if (!name) return null;

  const filename = nameToFilename(name);
  const path = `/details/${filename}`;

  try {
    // Try to load the image to see if it exists
    const response = await fetch(path, { method: 'HEAD' });
    if (response.ok) {
      return path;
    }
  } catch (error) {
    // Image doesn't exist
    console.log(`[DetailImageResolver] No detail image found for "${name}" at ${path}`);
  }

  return null;
}

/**
 * Synchronous version that returns the path without checking
 * Use this if you want to attempt to load the image optimistically
 */
export function getDetailImagePathSync(name) {
  if (!name) return null;
  const filename = nameToFilename(name);
  return `/details/${filename}`;
}
