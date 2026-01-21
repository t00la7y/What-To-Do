class ThemeService {
  constructor(storageService) {
    this.storage = storageService;
    this.THEME_KEY = "theme";
    this.CUSTOM_THEME_KEY = "customTheme";
    this.DARK_MODE = "dark-mode";
    this.CUSTOM_COLORS = [
      "red",
      "green",
      "blue",
      "gold",
      "purple",
      "black",
      "orange",
    ];
    this.init();
  }

  init() {
    const savedTheme = this.storage.get(this.THEME_KEY, "light");
    this.setTheme(savedTheme);

    const savedCustomTheme = this.storage.get(this.CUSTOM_THEME_KEY);
    if (savedCustomTheme) {
      this.setCustomTheme(savedCustomTheme);
    }
  }

  getCurrentTheme() {
    return document.documentElement.classList.contains(this.DARK_MODE)
      ? "dark"
      : "light";
  }

  setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add(this.DARK_MODE);
    } else {
      document.documentElement.classList.remove(this.DARK_MODE);
    }
    this.storage.set(this.THEME_KEY, theme);
  }

  toggle() {
    const current = this.getCurrentTheme();
    this.setTheme(current === "dark" ? "light" : "dark");
  }

  setCustomTheme(color) {
    if (!this.CUSTOM_COLORS.includes(color)) {
      console.error(`Invalid theme color: ${color}`);
      return;
    }

    this.CUSTOM_COLORS.forEach((c) => {
      document.documentElement.classList.remove(c);
    });

    document.documentElement.classList.add("custom-theme", color);
    this.storage.set(this.CUSTOM_THEME_KEY, color);

    window.addEventListener("load", () => {
      try {
        const themeButtons = document.querySelectorAll(".theme-btn");
        const storage = new StorageService("wtd_");
        const themeService = new ThemeService(storage);

        themeButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const theme = e.target.dataset.theme;
            themeService.setCustomTheme(theme);
            if (window.toast) {
              window.toast.success(`Theme changed to ${theme}`);
            }
          });
        });

        const currentTheme = themeService.getCustomTheme();
        if (currentTheme) {
          const activeBtn = document.querySelector(
            `[data-theme="${currentTheme}"]`,
          );
          if (activeBtn) {
            activeBtn.style.opacity = "0.7";
            activeBtn.style.fontWeight = "bold";
          }
        }
      } catch (error) {
        console.error("Theme setup error:", error);
      }
    });
  }

  getCustomTheme() {
    return this.storage.get(this.CUSTOM_THEME_KEY);
  }

  clearCustomTheme() {
    this.CUSTOM_COLORS.forEach((c) => {
      document.documentElement.classList.remove(c);
    });
    document.documentElement.classList.remove("custom-theme");
    this.storage.remove(this.CUSTOM_THEME_KEY);
  }

  getAvailableColors() {
    return [...this.CUSTOM_COLORS];
  }
}
