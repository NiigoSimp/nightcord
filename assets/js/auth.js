// auth.js - Authentication system

// Hardcoded accounts
const ACCOUNTS = {
    'niigo@nightcord.com': { 
        password: 'niigo25', 
        role: 'admin', 
        name: 'Admin' 
    },
    'hkzi@nightcord.com': { 
        password: 'hkzi25', 
        role: 'user', 
        name: 'User' 
    }
};

const SESSION_KEY = 'currentUser';

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem(SESSION_KEY) !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem(SESSION_KEY);
    return user ? JSON.parse(user) : null;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Login function
function login(email, password) {
    const account = ACCOUNTS[email];
    
    if (!account) {
        return { success: false, message: 'Email not found!' };
    }
    
    if (account.password !== password) {
        return { success: false, message: 'Incorrect password!' };
    }
    
    const user = {
        email: email,
        role: account.role,
        name: account.name,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    
    return { success: true, user: user };
}

// Logout function
function logout() {
    localStorage.removeItem(SESSION_KEY);
    updateUIForAuth();
    window.location.href = 'index.html';
}

// Open login modal
function openLoginModal() {
    $('#loginModal').modal('show');
}

// Handle login form submission
function handleLogin() {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();
    
    if (!email || !password) {
        alert('Please enter both email and password!');
        return;
    }
    
    const result = login(email, password);
    
    if (result.success) {
        $('#loginModal').modal('hide');
        updateUIForAuth();
        showToast('success', `Welcome back, ${result.user.name}!`);
        setTimeout(() => location.reload(), 500);
    } else {
        alert(result.message);
    }
}

// Update UI based on auth state
function updateUIForAuth() {
    const user = getCurrentUser();
    const loggedIn = isLoggedIn();
    const admin = isAdmin();
    
    // Update body classes
    if (loggedIn) {
        document.body.classList.add('logged-in');
        if (admin) {
            document.body.classList.add('role-admin');
        } else {
            document.body.classList.remove('role-admin');
        }
    } else {
        document.body.classList.remove('logged-in', 'role-admin');
    }
    
    // Update navbar elements
    if (loggedIn && user) {
        $('.login-btn').hide();
        $('.logout-btn').show();
        $('#userName').text(user.name);
        
        if (admin) {
            $('.admin-only').show();
        } else {
            $('.admin-only').hide();
        }
    } else {
        $('.login-btn').show();
        $('.logout-btn').hide();
        $('.admin-only').hide();
    }
}

// Show toast notification
function showToast(type, message) {
    const toast = new bootstrap.Toast($('#liveToast')[0]);
    if (type === 'success') {
        $('#toastHeader').css('background', 'var(--secondary-2)');
        $('#toastIcon').removeClass().addClass('fas fa-check-circle me-2 text-white');
        $('#toastTitle').text('Success');
    } else if (type === 'warning') {
        $('#toastHeader').css('background', 'var(--secondary-1)');
        $('#toastIcon').removeClass().addClass('fas fa-trash me-2 text-white');
        $('#toastTitle').text('Warning');
    } else {
        $('#toastHeader').css('background', 'var(--primary)');
        $('#toastIcon').removeClass().addClass('fas fa-info-circle me-2 text-white');
        $('#toastTitle').text('Notification');
    }
    $('#toastMessage').text(message);
    toast.show();
}

// Protect admin pages
function protectAdminPage() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Initialize auth on page load
$(document).ready(function() {
    updateUIForAuth();
});