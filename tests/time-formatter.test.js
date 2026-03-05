import { describe, it, expect } from 'vitest';
import {
  dollarsToMinutes,
  formatTime,
  getTimeTier,
  convertPrice,
} from '../src/utils/time-formatter.js';

describe('dollarsToMinutes', () => {
  it('converts basic amounts', () => {
    expect(dollarsToMinutes(45, 45)).toBe(60); // $45 at $45/hr = 1 hour
    expect(dollarsToMinutes(22.5, 45)).toBe(30); // half hour
    expect(dollarsToMinutes(6, 45)).toBeCloseTo(8); // $6 latte = ~8 min
  });

  it('handles zero and invalid wages', () => {
    expect(dollarsToMinutes(10, 0)).toBe(0);
    expect(dollarsToMinutes(10, -5)).toBe(0);
  });
});

describe('formatTime (compact)', () => {
  it('formats minutes', () => {
    expect(formatTime(8)).toBe('8m');
    expect(formatTime(45)).toBe('45m');
  });

  it('formats hours and minutes', () => {
    expect(formatTime(65)).toBe('1h 5m');
    expect(formatTime(120)).toBe('2h');
    expect(formatTime(135)).toBe('2h 15m');
  });

  it('formats days and hours (8h = 1 work day)', () => {
    expect(formatTime(480)).toBe('1d');
    expect(formatTime(510)).toBe('1d 0h 30m'.length ? '1d' : '1d'); // 8.5h
    // Actually 510 min = 8h 30m, which is 1 day + 0.5h
    expect(formatTime(540)).toBe('1d 1h');
  });

  it('formats weeks', () => {
    // 5 days * 8h * 60m = 2400 min
    expect(formatTime(2400)).toBe('1w');
    expect(formatTime(2880)).toBe('1w 1d');
  });

  it('handles zero', () => {
    expect(formatTime(0)).toBe('0m');
  });
});

describe('formatTime (conversational)', () => {
  it('formats conversational style', () => {
    expect(formatTime(8, 'conversational')).toBe('8 minutes of your life');
    expect(formatTime(1, 'conversational')).toBe('1 minute of your life');
    expect(formatTime(65, 'conversational')).toBe(
      '1 hour and 5 minutes of your life'
    );
    expect(formatTime(120, 'conversational')).toBe('2 hours of your life');
  });
});

describe('getTimeTier', () => {
  it('returns correct color tiers', () => {
    expect(getTimeTier(30)).toBe('green');    // < 1 hour
    expect(getTimeTier(59)).toBe('green');
    expect(getTimeTier(60)).toBe('yellow');   // 1-4 hours
    expect(getTimeTier(180)).toBe('yellow');
    expect(getTimeTier(240)).toBe('orange');  // 4-8 hours
    expect(getTimeTier(400)).toBe('orange');
    expect(getTimeTier(480)).toBe('red');     // > 8 hours
    expect(getTimeTier(1000)).toBe('red');
  });
});

describe('convertPrice', () => {
  it('converts $6 latte at $45/hr', () => {
    const result = convertPrice(6, 45);
    expect(result.text).toBe('8m');
    expect(result.tier).toBe('green');
  });

  it('converts $28 Uber Eats at $45/hr', () => {
    const result = convertPrice(28, 45);
    expect(result.text).toBe('37m');
    expect(result.tier).toBe('green');
  });

  it('converts $1200 MacBook at $45/hr', () => {
    const result = convertPrice(1200, 45);
    // 1200/45 * 60 = 1600 min = 26h 40m -> 3 days + 2h remainder
    expect(result.text).toBe('3d 2h');
    expect(result.tier).toBe('red');
  });
});
