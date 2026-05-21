import { describe, it, expect } from 'vitest';
import { generateCode } from './shorten';

const BASE62_REGEX = /^[A-Za-z0-9]{6}$/;

describe('generateCode', () => {
  it('returns a string of exactly 6 characters', () => {
    const code = generateCode();
    expect(code).toHaveLength(6);
  });

  it('every character matches [A-Za-z0-9] (base62 alphabet)', () => {
    const code = generateCode();
    expect(code).toMatch(BASE62_REGEX);
  });

  it('returns base62 characters across 50 calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).toMatch(BASE62_REGEX);
    }
  });

  it('successive calls produce differing values with high probability (≥ 10 calls)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      results.add(generateCode());
    }
    // With 62^6 ≈ 56.8 billion possible codes, the probability all 10 are identical is negligible
    expect(results.size).toBeGreaterThan(1);
  });
});
