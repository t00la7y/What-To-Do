class UserComponent {
  constructor() {
    this.signupBtn = document.getElementById('signup-btn');
    this.loginBtn = document.getElementById('login-btn');
    this.logInForm = document.querySelector('.page-userProfile .logIn');
    this.signUpForm = document.querySelector('.page-userProfile .signUp');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.signupBtn) {
      this.signupBtn.addEventListener('click', () => {
        this.showSignUp();
      });
    }

    if (this.loginBtn) {
      this.loginBtn.addEventListener('click', () => {
        this.showLogIn();
      });
    }
  }

  showSignUp() {
    if (this.logInForm) {
      this.logInForm.hidden = true;
    }
    if (this.signUpForm) {
      this.signUpForm.hidden = false;
    }
  }

  showLogIn() {
    if (this.signUpForm) {
      this.signUpForm.hidden = true;
    }
    if (this.logInForm) {
      this.logInForm.hidden = false;
    }
  }

  validateEmail(email) {
    return isValidEmail(email);
  }

  validateUsername(username) {
    return username && username.trim().length >= 3;
  }

  validatePassword(password) {
    return password && password.length >= 6;
  }
}
