/**
 * NexusAuth - Interactive Authentication Controller
 * Features:
 * - Theme Switcher (Light / Dark mode persistence with prefers-color-scheme)
 * - Synchronized Panel Switcher (Desktop slide + Mobile segmented tab navigation)
 * - Accessible focus management (inert attribute handling)
 * - Live password strength validator (Rules check + visual progress meter)
 * - Show / Hide password toggle
 * - Form validation & Toast feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Theme Switcher (Dark / Light Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const STORAGE_KEY = 'nexus_auth_theme';

    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        const isDark = theme === 'dark';
        themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        themeToggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Initialize theme
    applyTheme(getPreferredTheme());

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });

    // Listen for OS preference change if user hasn't set an explicit manual preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // ==========================================
    // 2. Authentication View Mode Switcher
    // ==========================================
    const authCard = document.getElementById('auth-container');
    const signupSection = document.getElementById('signup-section');
    const signinSection = document.getElementById('signin-section');

    const registerSlideBtn = document.getElementById('register-slide-btn');
    const loginSlideBtn = document.getElementById('login-slide-btn');
    const mobileTabSignin = document.getElementById('mobile-tab-signin');
    const mobileTabSignup = document.getElementById('mobile-tab-signup');

    function switchToSignUp() {
        authCard.classList.add('active');
        
        // Update Mobile Tab States
        mobileTabSignup.classList.add('active');
        mobileTabSignup.setAttribute('aria-selected', 'true');
        mobileTabSignin.classList.remove('active');
        mobileTabSignin.setAttribute('aria-selected', 'false');

        // Manage accessibility focus traps
        signupSection.removeAttribute('inert');
        signinSection.setAttribute('inert', '');

        // Auto focus first field
        setTimeout(() => {
            document.getElementById('signup-name')?.focus();
        }, 300);
    }

    function switchToSignIn() {
        authCard.classList.remove('active');

        // Update Mobile Tab States
        mobileTabSignin.classList.add('active');
        mobileTabSignin.setAttribute('aria-selected', 'true');
        mobileTabSignup.classList.remove('active');
        mobileTabSignup.setAttribute('aria-selected', 'false');

        // Manage accessibility focus traps
        signinSection.removeAttribute('inert');
        signupSection.setAttribute('inert', '');

        // Auto focus first field
        setTimeout(() => {
            document.getElementById('signin-email')?.focus();
        }, 300);
    }

    // Desktop slider triggers
    registerSlideBtn?.addEventListener('click', switchToSignUp);
    loginSlideBtn?.addEventListener('click', switchToSignIn);

    // Mobile tabs triggers
    mobileTabSignup?.addEventListener('click', switchToSignUp);
    mobileTabSignin?.addEventListener('click', switchToSignIn);

    // ==========================================
    // 3. Show / Hide Password Toggles
    // ==========================================
    const passwordToggleButtons = document.querySelectorAll('.btn-toggle-password');

    passwordToggleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.classList.toggle('active', isPassword);
            btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        });
    });

    // ==========================================
    // 4. Live Password Strength Validation
    // ==========================================
    const passwordInput = document.getElementById('signup-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');

    const ruleLength = document.getElementById('rule-length');
    const ruleUppercase = document.getElementById('rule-uppercase');
    const ruleNumber = document.getElementById('rule-number');
    const ruleSymbol = document.getElementById('rule-symbol');

    function checkPasswordStrength(val) {
        if (!val) {
            strengthBar.className = 'strength-bar';
            strengthLabel.className = 'strength-text';
            strengthLabel.textContent = 'Password strength';
            [ruleLength, ruleUppercase, ruleNumber, ruleSymbol].forEach(el => el.classList.remove('valid'));
            return 0;
        }

        const hasLength = val.length >= 8;
        const hasUpper = /[A-Z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasSymbol = /[^A-Za-z0-9]/.test(val);

        ruleLength.classList.toggle('valid', hasLength);
        ruleUppercase.classList.toggle('valid', hasUpper);
        ruleNumber.classList.toggle('valid', hasNumber);
        ruleSymbol.classList.toggle('valid', hasSymbol);

        const score = [hasLength, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

        strengthBar.className = 'strength-bar';
        strengthLabel.className = 'strength-text';

        switch (score) {
            case 1:
                strengthBar.classList.add('weak');
                strengthLabel.classList.add('weak');
                strengthLabel.textContent = 'Weak';
                break;
            case 2:
                strengthBar.classList.add('fair');
                strengthLabel.classList.add('fair');
                strengthLabel.textContent = 'Fair';
                break;
            case 3:
                strengthBar.classList.add('good');
                strengthLabel.classList.add('good');
                strengthLabel.textContent = 'Good';
                break;
            case 4:
                strengthBar.classList.add('strong');
                strengthLabel.classList.add('strong');
                strengthLabel.textContent = 'Strong password';
                break;
            default:
                strengthLabel.textContent = 'Too weak';
                break;
        }

        return score;
    }

    passwordInput?.addEventListener('input', (e) => {
        checkPasswordStrength(e.target.value);
    });

    // ==========================================
    // 5. Toast Notifications & Form Submissions
    // ==========================================
    const toast = document.getElementById('toast');
    let toastTimeout;

    function showToast(message, type = 'success') {
        clearTimeout(toastTimeout);
        toast.className = `toast ${type} show`;
        toast.textContent = message;

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // Sign In Form Submission
    const signinForm = document.getElementById('signin-form');
    const signinSubmitBtn = document.getElementById('signin-submit');

    signinForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            showToast('Please enter both your email and password.', 'error');
            return;
        }

        // Simulate async authentication
        signinSubmitBtn.classList.add('loading');
        signinSubmitBtn.disabled = true;

        setTimeout(() => {
            signinSubmitBtn.classList.remove('loading');
            signinSubmitBtn.disabled = false;
            showToast(`Welcome back! Signed in as ${email}`, 'success');
        }, 1200);
    });

    // Sign Up Form Submission
    const signupForm = document.getElementById('signup-form');
    const signupSubmitBtn = document.getElementById('signup-submit');
    const termsAgree = document.getElementById('terms-agree');

    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!name || !email) {
            showToast('Please provide your name and email.', 'error');
            return;
        }

        const strengthScore = checkPasswordStrength(password);
        if (strengthScore < 3) {
            showToast('Please create a stronger password (at least 3 criteria).', 'error');
            document.getElementById('signup-password').focus();
            return;
        }

        if (!termsAgree.checked) {
            showToast('You must agree to the Terms of Service to continue.', 'error');
            termsAgree.focus();
            return;
        }

        // Simulate async registration
        signupSubmitBtn.classList.add('loading');
        signupSubmitBtn.disabled = true;

        setTimeout(() => {
            signupSubmitBtn.classList.remove('loading');
            signupSubmitBtn.disabled = false;
            showToast(`Account created for ${name}! Please verify your email.`, 'success');
            signupForm.reset();
            checkPasswordStrength('');
            setTimeout(switchToSignIn, 1500);
        }, 1400);
    });

    // Social Button Clicks (Google, GitHub, Apple)
    document.querySelectorAll('.btn-social').forEach((btn) => {
        btn.addEventListener('click', () => {
            const provider = btn.querySelector('span')?.textContent || 'Provider';
            showToast(`Initiating secure authentication with ${provider}...`, 'success');
        });
    });

    // Forgot Password link
    document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim();
        if (email) {
            showToast(`Password reset link sent to ${email}`, 'success');
        } else {
            showToast('Please enter your email above to receive a reset link.', 'error');
            document.getElementById('signin-email').focus();
        }
    });
});
