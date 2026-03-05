import { findPrices, shouldSkipElement } from '../utils/price-parser.js';
import { convertPrice } from '../utils/time-formatter.js';
import { loadSettings, isSiteDisabled } from '../utils/storage.js';

let settings = null;
let processedNodes = new WeakSet();
let observer = null;

async function init() {
  settings = await loadSettings();

  if (!settings.onboarded || !settings.enabled || settings.hourlyWage <= 0) {
    return;
  }

  if (isSiteDisabled(settings.disabledSites, location.hostname)) {
    return;
  }

  processPage();
  observeDOM();
}

/**
 * Walk all text nodes in the document and annotate prices.
 */
function processPage() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (shouldSkipElement(node)) return NodeFilter.FILTER_REJECT;
        if (!node.textContent.includes('$')) return NodeFilter.FILTER_REJECT;
        if (processedNodes.has(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    annotateTextNode(node);
  }
}

/**
 * Annotate a single text node with price-to-time conversions.
 */
function annotateTextNode(textNode) {
  if (processedNodes.has(textNode)) return;

  const text = textNode.textContent;
  const prices = findPrices(text);

  if (prices.length === 0) return;

  // Filter prices below minimum
  const validPrices = prices.filter((p) => p.value >= settings.minPrice);
  if (validPrices.length === 0) return;

  processedNodes.add(textNode);

  // Build a document fragment with annotated prices
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const price of validPrices) {
    // Add text before the price
    if (price.start > lastIndex) {
      fragment.appendChild(
        document.createTextNode(text.slice(lastIndex, price.start))
      );
    }

    // Create annotated price element
    const { text: timeText, tier } = convertPrice(
      price.value,
      settings.hourlyWage,
      settings.displayStyle
    );

    const wrapper = document.createElement('span');
    wrapper.className = 'pricetag-annotation';
    wrapper.setAttribute('data-pricetag-tier', tier);

    // Original price text
    const original = document.createTextNode(price.original);
    wrapper.appendChild(original);

    // Time badge
    const badge = document.createElement('span');
    badge.className = 'pricetag-badge';
    badge.setAttribute('data-pricetag-tier', tier);
    badge.textContent = timeText;
    wrapper.appendChild(badge);

    fragment.appendChild(wrapper);
    lastIndex = price.end;

    // Track stats
    trackPrice(price.value);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  // Replace the text node with our annotated fragment
  textNode.parentNode.replaceChild(fragment, textNode);
}

/**
 * Observe DOM for dynamically added content (SPAs, infinite scroll).
 */
function observeDOM() {
  let debounceTimer = null;

  observer = new MutationObserver((mutations) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processSubtree(node);
          } else if (node.nodeType === Node.TEXT_NODE) {
            if (!shouldSkipElement(node) && node.textContent.includes('$')) {
              annotateTextNode(node);
            }
          }
        }
      }
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Process a subtree of the DOM (for newly added elements).
 */
function processSubtree(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (shouldSkipElement(node)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent.includes('$')) return NodeFilter.FILTER_REJECT;
      if (processedNodes.has(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    annotateTextNode(node);
  }
}

/**
 * Send price stats to background service worker.
 */
function trackPrice(value) {
  try {
    chrome.runtime.sendMessage({
      type: 'PRICE_SEEN',
      value,
    });
  } catch {
    // Extension context may be invalidated; silently ignore
  }
}

/**
 * Listen for settings changes (e.g., user toggles extension off).
 */
chrome.storage.onChanged.addListener((changes) => {
  const needsRefresh =
    changes.hourlyWage || changes.enabled || changes.displayStyle || changes.minPrice;

  if (needsRefresh) {
    // Reload settings and re-process
    loadSettings().then((newSettings) => {
      settings = newSettings;
      if (!settings.enabled || settings.hourlyWage <= 0) {
        removeAnnotations();
        if (observer) observer.disconnect();
      } else {
        removeAnnotations();
        processedNodes = new WeakSet();
        processPage();
        if (!observer) observeDOM();
      }
    });
  }
});

/**
 * Remove all PriceTag annotations from the page.
 */
function removeAnnotations() {
  const annotations = document.querySelectorAll('.pricetag-annotation');
  for (const el of annotations) {
    // Extract original text and replace the annotation
    const badge = el.querySelector('.pricetag-badge');
    if (badge) badge.remove();
    const text = el.textContent;
    el.replaceWith(document.createTextNode(text));
  }
}

// Start
init();
