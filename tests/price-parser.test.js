import { describe, it, expect } from 'vitest';
import { findPrices, parsePriceValue } from '../src/utils/price-parser.js';

describe('parsePriceValue', () => {
  it('parses simple prices', () => {
    expect(parsePriceValue('$5')).toBe(5);
    expect(parsePriceValue('$5.99')).toBe(5.99);
    expect(parsePriceValue('$0.99')).toBe(0.99);
  });

  it('parses prices with commas', () => {
    expect(parsePriceValue('$1,234')).toBe(1234);
    expect(parsePriceValue('$1,234.56')).toBe(1234.56);
    expect(parsePriceValue('$12,345,678')).toBe(12345678);
  });

  it('parses cents-only prices', () => {
    expect(parsePriceValue('$.99')).toBe(0.99);
    expect(parsePriceValue('$.50')).toBe(0.5);
  });

  it('returns null for invalid input', () => {
    expect(parsePriceValue('abc')).toBe(null);
    expect(parsePriceValue('$')).toBe(null);
  });
});

describe('findPrices', () => {
  it('finds a single price', () => {
    const results = findPrices('This costs $5.99');
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(5.99);
    expect(results[0].original).toBe('$5.99');
  });

  it('finds multiple prices', () => {
    const results = findPrices('Compare $10 vs $20.50');
    expect(results).toHaveLength(2);
    expect(results[0].value).toBe(10);
    expect(results[1].value).toBe(20.5);
  });

  it('finds prices with commas', () => {
    const results = findPrices('The car costs $25,000');
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(25000);
  });

  it('finds cents-only prices', () => {
    const results = findPrices('Just $.99!');
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(0.99);
  });

  it('returns correct positions', () => {
    const text = 'Price: $42.00 total';
    const results = findPrices(text);
    expect(results[0].start).toBe(7);
    expect(results[0].end).toBe(13);
    expect(text.slice(results[0].start, results[0].end)).toBe('$42.00');
  });

  it('ignores text without dollar signs', () => {
    expect(findPrices('No prices here')).toHaveLength(0);
    expect(findPrices('100 items')).toHaveLength(0);
  });

  it('handles price with space after $', () => {
    const results = findPrices('Costs $ 25');
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(25);
  });

  it('handles large prices', () => {
    const results = findPrices('House: $1,250,000.00');
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(1250000);
  });
});
