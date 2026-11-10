import { describe, it, expect } from 'vitest';
import { parseImagens } from './ordem';

describe('parseImagens', () => {
  it('returns an empty array when input is null or undefined', () => {
    expect(parseImagens(null)).toEqual([]);
    expect(parseImagens(undefined)).toEqual([]);
  });

  it('returns an empty array when input is an empty string', () => {
    expect(parseImagens('')).toEqual([]);
    expect(parseImagens('   ')).toEqual([]);
  });

  it('extracts a single image URL from a stringified JSON array', () => {
    const raw = '["https://example.com/storage/foto1.jpg"]';
    expect(parseImagens(raw)).toEqual(['https://example.com/storage/foto1.jpg']);
  });
});
