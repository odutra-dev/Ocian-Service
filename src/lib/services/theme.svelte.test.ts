import { describe, it, expect } from 'vitest';
import { themeManager } from './theme.svelte';

describe('themeManager', () => {
  it('instantiates with default system mode and light theme', () => {
    expect(themeManager.mode).toBe('system');
    expect(themeManager.currentTheme).toBe('light');
  });

  it('updates mode to dark and light using setMode', () => {
    themeManager.setMode('dark');
    expect(themeManager.mode).toBe('dark');

    themeManager.setMode('light');
    expect(themeManager.mode).toBe('light');

    themeManager.setMode('system');
    expect(themeManager.mode).toBe('system');
  });
});
