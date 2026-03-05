/**
 * Detects and extracts prices from text content.
 * Returns an array of { value, original, start, end } objects.
 */

// Matches prices like $1, $1.99, $1,234.56, $1,234, $.99
// Also handles ranges like $10-$20, $10 - $20
const PRICE_REGEX =
  /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\.\d{1,2})/g;

/**
 * Parse a single price string into a numeric value.
 * "$1,234.56" -> 1234.56
 */
export function parsePriceValue(priceStr) {
  const cleaned = priceStr.replace(/[$,\s]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

/**
 * Find all prices in a text string.
 * Returns array of { value, original, start, end }
 */
export function findPrices(text) {
  const results = [];
  let match;

  PRICE_REGEX.lastIndex = 0;
  while ((match = PRICE_REGEX.exec(text)) !== null) {
    const original = match[0];
    const value = parsePriceValue(original);

    if (value !== null && value > 0) {
      results.push({
        value,
        original,
        start: match.index,
        end: match.index + original.length,
      });
    }
  }

  return results;
}

/**
 * Check if a DOM element should be skipped for price detection.
 */
export function shouldSkipElement(element) {
  if (!element || !element.parentElement) return true;

  const parent = element.parentElement;
  const tag = parent.tagName?.toLowerCase();

  // Skip form inputs, scripts, styles, code blocks
  const skipTags = [
    'script', 'style', 'textarea', 'input', 'select',
    'code', 'pre', 'noscript', 'svg', 'math',
  ];
  if (skipTags.includes(tag)) return true;

  // Skip contenteditable elements
  if (parent.isContentEditable) return true;

  // Skip elements with specific attributes that suggest non-price content
  const closest = parent.closest(
    '[contenteditable="true"], [role="textbox"], [role="code"]'
  );
  if (closest) return true;

  // Skip if inside a PriceTag annotation (avoid double-processing)
  if (parent.closest('.pricetag-annotation')) return true;

  return false;
}
