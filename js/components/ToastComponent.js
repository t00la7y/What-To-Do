class ToastComponent {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <span class="toast-close">&times;</span>
    `;

    this.container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.remove(toast);
    });

    setTimeout(() => {
      this.remove(toast);
    }, duration);
  }

  remove(toast) {
    toast.classList.add('toast-fade');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  }

  warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

const toast = new ToastComponent();
