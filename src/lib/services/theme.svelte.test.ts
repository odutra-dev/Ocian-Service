import { describe, it, expect } from 'vitest';
import { themeManager } from './theme.svelte';

describe('themeManager', () => {
  it('instantiates with default system mode and light theme', () => {
    expect(themeManager.mode).toBe('system');
    expect(themeManager.currentTheme).toBe('light');
  });
});
