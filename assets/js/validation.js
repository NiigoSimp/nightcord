// validation.js - Validation realtime nâng cao

// Validation rules
const ValidationRules = {
    title: {
        required: true,
        minLength: 1,
        maxLength: 100,
        message: 'Tiêu đề phải từ 1-100 ký tự'
    },
    description: {
        required: true,
        minLength: 10,
        maxLength: 500,
        message: 'Mô tả phải từ 10-500 ký tự'
    },
    deadline: {
        required: true,
        minDate: getToday(),
        message: 'Deadline không được nhỏ hơn ngày hiện tại'
    }
};

// Validate single field
function validateField(fieldName, value) {
    const rule = ValidationRules[fieldName];
    if (!rule) return { valid: true, message: '' };
    
    if (rule.required && !value) {
        return { valid: false, message: `${fieldName} không được để trống` };
    }
    
    if (rule.minLength && value.length < rule.minLength) {
        return { valid: false, message: `${fieldName} phải có ít nhất ${rule.minLength} ký tự` };
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
        return { valid: false, message: `${fieldName} không được quá ${rule.maxLength} ký tự` };
    }
    
    if (rule.minDate && value < rule.minDate) {
        return { valid: false, message: rule.message };
    }
    
    return { valid: true, message: '' };
}

// Validate all fields
function validateAllFields(task) {
    const errors = {};
    
    for (const field in ValidationRules) {
        const result = validateField(field, task[field]);
        if (!result.valid) {
            errors[field] = result.message;
        }
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors: errors
    };
}

// Show field error
function showFieldError(fieldId, message) {
    $(`#${fieldId}`).addClass('is-invalid');
    $(`#${fieldId}Error`).text(message).show();
}

// Clear field error
function clearFieldError(fieldId) {
    $(`#${fieldId}`).removeClass('is-invalid');
    $(`#${fieldId}Error`).text('').hide();
}

// Setup realtime validation with debounce
function setupAdvancedValidation() {
    const debouncedValidate = debounce(function(field, value) {
        const result = validateField(field, value);
        if (!result.valid) {
            showFieldError(field, result.message);
        } else {
            clearFieldError(field);
        }
    }, 300);
    
    $('#title').on('input', function() {
        debouncedValidate('title', $(this).val());
    });
    
    $('#description').on('input', function() {
        debouncedValidate('description', $(this).val());
    });
    
    $('#deadline').on('change', function() {
        const result = validateField('deadline', $(this).val());
        if (!result.valid) {
            showFieldError('deadline', result.message);
        } else {
            clearFieldError('deadline');
        }
    });
}