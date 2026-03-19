// Main.js - Các hàm dùng chung

// Định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
}

// Lấy ngày hiện tại định dạng YYYY-MM-DD
function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Tạo ID duy nhất
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Hiển thị thông báo toast
function showToast(type, message) {
    const toast = new bootstrap.Toast($('#liveToast')[0]);
    
    if (type === 'success') {
        $('#toastHeader').css('background', 'var(--secondary-2)');
        $('#toastIcon').removeClass().addClass('fas fa-check-circle me-2 text-white');
        $('#toastTitle').text('Thành công');
    } else if (type === 'warning') {
        $('#toastHeader').css('background', 'var(--secondary-1)');
        $('#toastIcon').removeClass().addClass('fas fa-trash me-2 text-white');
        $('#toastTitle').text('Đã xóa');
    } else if (type === 'error') {
        $('#toastHeader').css('background', '#dc3545');
        $('#toastIcon').removeClass().addClass('fas fa-exclamation-circle me-2 text-white');
        $('#toastTitle').text('Lỗi');
    } else {
        $('#toastHeader').css('background', 'var(--primary)');
        $('#toastIcon').removeClass().addClass('fas fa-info-circle me-2 text-white');
        $('#toastTitle').text('Thông báo');
    }
    
    $('#toastMessage').text(message);
    toast.show();
}

// Debounce function cho tìm kiếm
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

// Chuyển đổi chế độ tối/sáng
$(document).ready(function() {
    // Kiểm tra chế độ tối từ localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        $('body').addClass('dark-mode');
        $('#darkModeToggle i').removeClass('fa-moon').addClass('fa-sun');
    }
    
    $('#darkModeToggle').click(function() {
        $('body').toggleClass('dark-mode');
        
        if ($('body').hasClass('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            $(this).html('<i class="fas fa-sun"></i>');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            $(this).html('<i class="fas fa-moon"></i>');
        }
    });
});