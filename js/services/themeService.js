class ThemeService {
  constructor(storageService) {
    this.storage = storageService;
    this.THEME_KEY = 'theme';
    this.CUSTOM_THEME_KEY = 'customTheme';
    this.DARK_MODE = 'dark-mode';
    this.CUSTOM_COLORS = ['red', 'green', 'blue', 'gold', 'purple', 'black'];
    this.init();
  }

  init() {
    const savedTheme = this.storage.get(this.THEME_KEY, 'light');
    this.setTheme(savedTheme);
    
    const savedCustomTheme = this.storage.get(this.CUSTOM_THEME_KEY);
    if (savedCustomTheme) {
      this.setCustomTheme(savedCustomTheme);
    }
  }

  getCurrentTheme() {
    return document.documentElement.classList.contains(this.DARK_MODE) ? 'dark' : 'light';
  }

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add(this.DARK_MODE);
    } else {
      document.documentElement.classList.remove(this.DARK_MODE);
    }
    this.storage.set(this.THEME_KEY, theme);
  }

  toggle() {
    const current = this.getCurrentTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  setCustomTheme(color) {
    if (!this.CUSTOM_COLORS.includes(color)) {
      console.error(`Invalid theme color: ${color}`);
      return;
    }

    this.CUSTOM_COLORS.forEach(c => {
      document.documentElement.classList.remove(c);
    });

    document.documentElement.classList.add('custom-theme', color);
    this.storage.set(this.CUSTOM_THEME_KEY, color);
  }

  getCustomTheme() {
    return this.storage.get(this.CUSTOM_THEME_KEY);
  }

  clearCustomTheme() {
    this.CUSTOM_COLORS.forEach(c => {
      document.documentElement.classList.remove(c);
    });
    document.documentElement.classList.remove('custom-theme');
    this.storage.remove(this.CUSTOM_THEME_KEY);
  }

  getAvailableColors() {
    return [...this.CUSTOM_COLORS];
  }
}
