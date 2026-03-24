// main.js - Common functions

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get today's date in YYYY-MM-DD format
function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        $('#toastTitle').text('Deleted');
    } else if (type === 'error') {
        $('#toastHeader').css('background', '#dc3545');
        $('#toastIcon').removeClass().addClass('fas fa-exclamation-circle me-2 text-white');
        $('#toastTitle').text('Error');
    } else {
        $('#toastHeader').css('background', 'var(--primary)');
        $('#toastIcon').removeClass().addClass('fas fa-info-circle me-2 text-white');
        $('#toastTitle').text('Notification');
    }
    
    $('#toastMessage').text(message);
    toast.show();
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength (min 6 characters)
function isValidPassword(password) {
    return password && password.length >= 6;
}

// Truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Format number with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Check if URL is valid image
function isValidImageUrl(url) {
    if (!url) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const ext = getFileExtension(url);
    return imageExtensions.includes(ext);
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Copied to clipboard!');
    }).catch(() => {
        showToast('error', 'Failed to copy!');
    });
}

// Get parameter from URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Set active nav link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    $('.nav-link-custom').each(function() {
        const linkHref = $(this).attr('href');
        if (linkHref === currentPage) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });
}

// Initialize common functionality
$(document).ready(function() {
    // Set active nav link
    setActiveNavLink();
    
    // Add smooth scrolling to anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 500);
        }
    });
    
    // Close modals with escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('.modal').modal('hide');
        }
    });
    
    // Auto-hide alerts after 5 seconds
    $('.alert').not('.alert-permanent').delay(5000).fadeOut(500);
    
    console.log('Main.js loaded successfully');
});