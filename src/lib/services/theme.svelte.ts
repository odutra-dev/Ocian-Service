export type ThemeMode = 'system' | 'light' | 'dark';

class ThemeManager {
  currentTheme = $state<'light' | 'dark'>('light');
  mode = $state<ThemeMode>('system');
  initialized = false;

  init() {
    if (typeof window === 'undefined' || this.initialized) return;
    this.initialized = true;

    const stored = localStorage.getItem('chaveiro-ocian-theme-mode') as ThemeMode | null;
    this.mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDark =
        this.mode === 'dark' || (this.mode === 'system' && mediaQuery.matches);
      this.currentTheme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      document.body.setAttribute('data-theme', this.currentTheme);
    };

    updateTheme();

    mediaQuery.addEventListener('change', () => {
      if (this.mode === 'system') {
        updateTheme();
      }
    });
  }

  setMode(newMode: ThemeMode) {
    this.mode = newMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chaveiro-ocian-theme-mode', newMode);
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark =
        newMode === 'dark' || (newMode === 'system' && mediaQuery.matches);
      this.currentTheme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      document.body.setAttribute('data-theme', this.currentTheme);
    }
  }

  toggle() {
    // Alterna: system -> dark -> light -> system
    if (this.mode === 'system') {
      this.setMode(this.currentTheme === 'dark' ? 'light' : 'dark');
    } else if (this.mode === 'dark') {
      this.setMode('light');
    } else {
      this.setMode('system');
    }
  }
}

export const themeManager = new ThemeManager();
