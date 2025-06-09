// Authentication related JavaScript

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();

    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Enhanced validation
            if (!email) {
                showError('email', 'Please enter your email address');
                return;
            }

            if (!isValidEmail(email)) {
                showError('email', 'Please enter a valid email address');
                return;
            }

            if (!password) {
                showError('password', 'Please enter your password');
                return;
            }

            // Clear any previous errors
            clearErrors();

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;

            // Simulate login with delay to show loading state (in a real app, this would be an API call)
            setTimeout(() => {
                login(email, password);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }

    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsChecked = document.getElementById('terms').checked;

            // Enhanced validation
            let isValid = true;

            // Clear previous errors
            clearErrors();

            // Validate fullname
            if (!fullname) {
                showError('fullname', 'Please enter your full name');
                isValid = false;
            }

            // Validate email
            if (!email) {
                showError('email', 'Please enter your email address');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }

            // Validate password
            if (!password) {
                showError('password', 'Please create a password');
                isValid = false;
            } else if (password.length < 8) {
                showError('password', 'Password must be at least 8 characters long');
                isValid = false;
            }

            // Validate password confirmation
            if (!confirmPassword) {
                showError('confirm-password', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirm-password', 'Passwords do not match');
                isValid = false;
            }

            // Validate terms agreement
            if (!termsChecked) {
                showError('terms', 'You must agree to the Terms of Service and Privacy Policy');
                isValid = false;
            }

            // If validation fails, stop form submission
            if (!isValid) {
                return;
            }

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            // Simulate registration with delay to show loading state (in a real app, this would be an API call)
            setTimeout(() => {
                register(fullname, email, password);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Logout button handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // Social login buttons
    const googleLoginBtn = document.querySelector('.btn-google');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Simulate Google login (in a real app, this would use OAuth)
            socialLogin('google');
        });
    }

    const facebookLoginBtn = document.querySelector('.btn-facebook');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Simulate Facebook login (in a real app, this would use OAuth)
            socialLogin('facebook');
        });
    }
});

// Authentication Functions

// Check if user is logged in
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Update UI based on auth status
    const loginLinks = document.querySelectorAll('a[href="login.html"]');

    if (isLoggedIn === 'true' && currentUser) {
        // User is logged in
        loginLinks.forEach(link => {
            link.textContent = 'Dashboard';
            link.href = 'dashboard.html';
        });

        // If on dashboard page, update user info
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.querySelector('.user-avatar');

        if (userNameElement && currentUser.fullname) {
            userNameElement.textContent = currentUser.fullname;
        }

        if (userAvatarElement && currentUser.fullname) {
            // Set avatar initials
            const initials = currentUser.fullname.split(' ')
                .map(name => name.charAt(0))
                .join('')
                .toUpperCase();
            userAvatarElement.textContent = initials;
        }
    } else {
        // User is not logged in
        loginLinks.forEach(link => {
            link.textContent = 'Login';
            link.href = 'login.html';
        });

        // Redirect to login if trying to access dashboard while not logged in
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Login function
function login(email, password) {
    // In a real app, this would validate credentials against a server
    // For demo purposes, we'll just simulate a successful login

    // Create a user object
    const user = {
        email: email,
        fullname: email.split('@')[0], // Use part of email as name for demo
        lastLogin: new Date().toISOString()
    };

    // Store in localStorage (in a real app, you'd use secure cookies or tokens)
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Register function
function register(fullname, email, password) {
    // In a real app, this would send data to a server to create an account
    // For demo purposes, we'll just simulate a successful registration

    // Create a user object
    const user = {
        fullname: fullname,
        email: email,
        registeredOn: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Store in localStorage (in a real app, you'd use secure cookies or tokens)
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Logout function
function logout() {
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');

    // Redirect to home page
    window.location.href = 'index.html';
}

// Social login function
function socialLogin(provider) {
    // In a real app, this would use OAuth flow
    // For demo purposes, we'll just simulate a successful login

    let user = {
        fullname: provider === 'google' ? 'Google User' : 'Facebook User',
        email: `user@${provider}.com`,
        provider: provider,
        lastLogin: new Date().toISOString()
    };

    // Store in localStorage (in a real app, you'd use secure cookies or tokens)
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Helper Functions for Form Validation

// Show error message for a specific field
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);

    // Clear any existing error
    clearError(fieldId);

    // Add error class to the input
    field.classList.add('is-invalid');

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '5px';

    // Insert error message after the input
    field.parentNode.appendChild(errorDiv);
}

// Clear error for a specific field
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');

    // Remove any existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Clear all errors in a form
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());

    const invalidFields = document.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
