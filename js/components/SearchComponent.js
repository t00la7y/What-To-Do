class SearchComponent {
  constructor(inputSelector, storageService = null) {
    this.input = document.querySelector(inputSelector);
    this.storage = storageService;
    
    this.onSearch = null;
    
    this.searchHistory = [];
    
    this.init();
  }

  init() {
    if (!this.input) {
      console.error('Search input not found:', this.input);
      return;
    }

    this.setupEventListeners();
    this.loadSearchHistory();
  }

  setupEventListeners() {
    let debounceTimer;
    this.input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 300);
    });

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch(e.target.value);
      }
    });
  }

  handleSearch(query) {
    const trimmed = query.trim();

    if (trimmed) {
      this.addToHistory(trimmed);
    }

    if (this.onSearch) {
      this.onSearch(trimmed);
    }
  }

  addToHistory(query) {
    this.searchHistory = this.searchHistory.filter(q => q !== query);
    
    this.searchHistory.unshift(query);
    
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    if (this.storage) {
      this.storage.set('searchHistory', this.searchHistory);
    }
  }

  loadSearchHistory() {
    if (this.storage) {
      this.searchHistory = this.storage.get('searchHistory', []);
    }
  }

  getValue() {
    return this.input.value.trim();
  }

  setValue(value) {
    this.input.value = value;
    this.handleSearch(value);
  }

  clear() {
    this.input.value = '';
    if (this.onSearch) {
      this.onSearch('');
    }
  }

  getHistory() {
    return [...this.searchHistory];
  }

  clearHistory() {
    this.searchHistory = [];
    if (this.storage) {
      this.storage.remove('searchHistory');
    }
  }

  focus() {
    this.input.focus();
  }

  disable() {
    this.input.disabled = true;
  }

  enable() {
    this.input.disabled = false;
  }
}
