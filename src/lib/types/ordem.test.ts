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
});
