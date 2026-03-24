// stories.js - Story management for the story vault
// Fetches all story data from storage.js

// Global variables
let currentStories = [];
let filteredStories = [];
let currentPage = 1;
let itemsPerPage = 8; // Display 8 stories per page
let deleteId = null;
let currentView = 'card'; // Default is card view

// Genre list
const GENRES = ['Romance', 'Fluff', 'Angst'];

// Story status list
const STORY_STATUS = {
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    HIATUS: 'Hiatus'
};

// Load stories from storage.js
function loadStories() {
    // Fetch all stories from StoryService
    currentStories = StoryService.getAllStories();
    
    // Apply filters and sorting
    applyFilters();
    updateStats();
}

// Apply filters and search
function applyFilters() {
    const searchTerm = $('#searchInput').val()?.toLowerCase() || '';
    const genreFilter = $('#filterGenre').val() || 'all';
    const statusFilter = $('#filterStatus').val() || 'all';
    const sortBy = $('#sortBy').val() || 'date_desc';
    
    // Filter stories
    filteredStories = currentStories.filter(story => {
        // Search by title, author, description
        const matchesSearch = searchTerm === '' || 
            story.title.toLowerCase().includes(searchTerm) ||
            story.author.toLowerCase().includes(searchTerm) ||
            (story.description && story.description.toLowerCase().includes(searchTerm));
        
        // Filter by genre
        const matchesGenre = genreFilter === 'all' || story.genre === genreFilter;
        
        // Filter by status
        const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
        
        return matchesSearch && matchesGenre && matchesStatus;
    });
    
    // Sort stories
    filteredStories.sort((a, b) => {
        if (sortBy === 'date_desc') {
            return new Date(b.publishDate) - new Date(a.publishDate);
        } else if (sortBy === 'date_asc') {
            return new Date(a.publishDate) - new Date(b.publishDate);
        } else if (sortBy === 'title_asc') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'title_desc') {
            return b.title.localeCompare(a.title);
        } else if (sortBy === 'rating_desc') {
            return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
    });
    
    // Reset to page 1
    currentPage = 1;
    
    // Update UI
    updatePagination();
    renderStories();
    updateActiveFilters();
}

// Display stories based on current view
function renderStories() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageStories = filteredStories.slice(start, end);
    
    if (filteredStories.length === 0) {
        $('#emptyState').show();
        $('#tableView, #cardView').hide();
    } else {
        $('#emptyState').hide();
        
        if (currentView === 'table') {
            $('#tableView').show();
            $('#cardView').hide();
            renderTableView(pageStories);
        } else {
            $('#tableView').hide();
            $('#cardView').show();
            renderCardView(pageStories);
        }
    }
    
    // Update display info
    $('#showingInfo').text(`Showing ${start + 1}-${Math.min(end, filteredStories.length)} of ${filteredStories.length} stories`);
    $('#totalStories').text(currentStories.length);
}

// Display table view
function renderTableView(stories) {
    let html = '';
    stories.forEach((story, index) => {
        const priorityClass = {
            'High': 'badge-high',
            'Medium': 'badge-medium',
            'Low': 'badge-low'
        }[story.priority] || 'badge-medium';
        
        const statusClass = story.status === STORY_STATUS.COMPLETED ? 'status-completed' : 
                           story.status === STORY_STATUS.ONGOING ? 'status-ongoing' : 'status-hiatus';
        
        html += `
            <tr data-id="${story.id}">
                <td>${index + 1 + (currentPage - 1) * itemsPerPage}</td>
                <td>
                    <img src="${story.coverImage || 'assets/img/placeholder.png'}" 
                         alt="${story.title}" 
                         class="story-table-img"
                         style="width: 50px; height: 70px; object-fit: cover; border-radius: 6px;"
                         onerror="this.src='assets/img/placeholder.png'">
                </td>
                <td>
                    <div class="story-table-title" style="font-weight: 600; color: var(--primary);">${escapeHtml(story.title)}</div>
                    <div class="story-table-author" style="font-size: 0.85rem; color: #888;">${escapeHtml(story.author)}</div>
                </td>
                <td>${escapeHtml(story.author)}</td>
                <td><span class="badge" style="background: ${getGenreColor(story.genre)};">${story.genre}</span></td>
                <td><span class="story-rating" style="color: #FFB800;">★ ${story.rating || '4.5'}</span></td>
                <td>${story.chapters || 0} ch</td>
                <td><span class="badge ${statusClass}" style="background: ${story.status === STORY_STATUS.COMPLETED ? 'var(--secondary-1)' : 'var(--secondary-2)'};">${story.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${story.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('${story.id}', '${story.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    $('#storyTableBody').html(html);
}

// Get color by genre
function getGenreColor(genre) {
    const colors = {
        'Romance': 'var(--primary)',
        'Fluff': 'var(--secondary-1)',
        'Angst': 'var(--secondary-2)'
    };
    return colors[genre] || 'var(--primary)';
}

// Display card view
function renderCardView(stories) {
    let html = '';
    stories.forEach((story, index) => {
        const priorityClass = {
            'High': 'badge-high',
            'Medium': 'badge-medium',
            'Low': 'badge-low'
        }[story.priority] || 'badge-medium';
        
        const priorityText = {
            'High': 'High',
            'Medium': 'Medium',
            'Low': 'Low'
        }[story.priority] || 'Medium';
        
        const statusClass = story.status === STORY_STATUS.COMPLETED ? 'status-completed' : 
                           story.status === STORY_STATUS.ONGOING ? 'status-ongoing' : 'status-hiatus';
        const statusColor = story.status === STORY_STATUS.COMPLETED ? 'var(--secondary-1)' : 
                           story.status === STORY_STATUS.ONGOING ? 'var(--secondary-2)' : 'var(--accent-1)';
        
        html += `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="story-card" data-id="${story.id}">
                    <div class="story-cover">
                        <span class="story-badge" style="background: ${getGenreColor(story.genre)};">${story.genre}</span>
                        <span class="story-rank">${index + 1 + (currentPage - 1) * itemsPerPage}</span>
                        <img src="${story.coverImage || 'assets/img/placeholder.png'}" 
                             alt="${story.title}"
                             onerror="this.src='assets/img/placeholder.png'">
                    </div>
                    <div class="story-info">
                        <h3 class="story-title">${escapeHtml(story.title)}</h3>
                        <div class="story-author">${escapeHtml(story.author)}</div>
                        <div class="story-meta">
                            <span class="story-rating">★ ${story.rating || '4.5'}</span>
                            <span class="story-chapters">${story.chapters || 0} ch</span>
                            <span class="badge ${priorityClass}">${priorityText}</span>
                        </div>
                        <div class="story-description">${escapeHtml(story.description || 'No description')}</div>
                        <div class="story-footer">
                            <span class="story-status ${statusClass}" style="background: ${statusColor};">${story.status}</span>
                            <span class="story-date">📅 ${formatDate(story.publishDate)}</span>
                        </div>
                        <div class="story-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${story.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('${story.id}', '${story.title.replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    $('#storyCardContainer').html(html);
}

// Open add modal
function openAddModal() {
    $('#modalTitle').html('<i class="fas fa-plus-circle me-2"></i>Add New Story');
    $('#storyForm')[0].reset();
    $('#storyId').val('');
    $('#modalHeader').css('background', 'linear-gradient(135deg, var(--primary), var(--secondary-2))');
    $('#saveBtn').html('<i class="fas fa-save me-2"></i>Save Story');
    
    // Set default publish date to today
    $('#publishDate').val(getToday());
    
    // Reset validation
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').hide();
    
    $('#storyModal').modal('show');
}

// Open edit modal
function openEditModal(id) {
    const story = currentStories.find(s => s.id === id);
    if (story) {
        $('#modalTitle').html('<i class="fas fa-edit me-2"></i>Edit Story');
        $('#storyId').val(story.id);
        $('#title').val(story.title);
        $('#author').val(story.author);
        $('#description').val(story.description || '');
        $('#publishDate').val(story.publishDate || getToday());
        $('#chapters').val(story.chapters || 0);
        $('#rating').val(story.rating || 4.5);
        $('#priority').val(story.priority || 'Medium');
        $('#genre').val(story.genre || '');
        $('#status').val(story.status || STORY_STATUS.ONGOING);
        $('#coverImage').val(story.coverImage || '');
        
        $('#modalHeader').css('background', 'linear-gradient(135deg, var(--secondary-2), var(--accent-2))');
        $('#saveBtn').html('<i class="fas fa-save me-2"></i>Update');
        
        // Reset validation
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').hide();
        
        $('#storyModal').modal('show');
    }
}

// Save story (Create or Update)
function saveStory() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const storyData = {
        title: $('#title').val(),
        author: $('#author').val(),
        description: $('#description').val(),
        publishDate: $('#publishDate').val(),
        chapters: parseInt($('#chapters').val()) || 0,
        rating: parseFloat($('#rating').val()) || 4.5,
        priority: $('#priority').val(),
        genre: $('#genre').val(),
        status: $('#status').val(),
        coverImage: $('#coverImage').val() || 'assets/img/placeholder.png'
    };
    
    const id = $('#storyId').val();
    
    if (id) {
        // Update
        StoryService.updateStory(id, storyData);
        showToast('success', 'Story updated successfully!');
    } else {
        // Create
        StoryService.addStory(storyData);
        showToast('success', 'New story added successfully!');
    }
    
    $('#storyModal').modal('hide');
    loadStories();
}

// Validate form
function validateForm() {
    let isValid = true;
    const title = $('#title').val();
    const author = $('#author').val();
    const description = $('#description').val();
    const genre = $('#genre').val();
    const publishDate = $('#publishDate').val();
    const today = getToday();
    
    // Reset errors
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').hide();
    
    // Validate title
    if (!title || !title.trim()) {
        $('#title').addClass('is-invalid');
        $('#titleError').show();
        isValid = false;
    }
    
    // Validate author
    if (!author || !author.trim()) {
        $('#author').addClass('is-invalid');
        $('#authorError').show();
        isValid = false;
    }
    
    // Validate description
    if (!description || description.length < 10) {
        $('#description').addClass('is-invalid');
        $('#descError').show();
        isValid = false;
    }
    
    // Validate genre
    if (!genre) {
        $('#genre').addClass('is-invalid');
        $('#genreError').show();
        isValid = false;
    }
    
    // Validate publish date
    if (publishDate && publishDate < today) {
        $('#publishDate').addClass('is-invalid');
        $('#dateError').show();
        isValid = false;
    }
    
    return isValid;
}

// Setup realtime validation
function setupRealtimeValidation() {
    $('#title').on('input', function() {
        if ($(this).val().trim()) {
            $(this).removeClass('is-invalid');
            $('#titleError').hide();
        }
    });
    
    $('#author').on('input', function() {
        if ($(this).val().trim()) {
            $(this).removeClass('is-invalid');
            $('#authorError').hide();
        }
    });
    
    $('#description').on('input', function() {
        const len = $(this).val().length;
        if (len >= 10) {
            $(this).removeClass('is-invalid');
            $('#descError').hide();
        }
    });
    
    $('#genre').on('change', function() {
        if ($(this).val()) {
            $(this).removeClass('is-invalid');
            $('#genreError').hide();
        }
    });
    
    $('#publishDate').on('change', function() {
        const today = getToday();
        if ($(this).val() >= today) {
            $(this).removeClass('is-invalid');
            $('#dateError').hide();
        }
    });
}

// Open delete modal
function openDeleteModal(id, title) {
    deleteId = id;
    $('#deleteStoryTitle').text(title);
    $('#deleteModal').modal('show');
}

// Confirm delete
function confirmDelete() {
    if (deleteId) {
        StoryService.deleteStory(deleteId);
        showToast('warning', 'Story deleted!');
        $('#deleteModal').modal('hide');
        loadStories();
    }
}

// Confirm clear all
function confirmClearAll() {
    if (confirm('Are you sure you want to delete ALL stories? This action cannot be undone!')) {
        StoryService.clearAll();
        showToast('warning', 'All stories deleted!');
        loadStories();
    }
}

// Export JSON
function exportJSON() {
    StoryService.exportJSON();
    showToast('info', 'Data exported successfully!');
}

// Import JSON
function importJSON(input) {
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const success = StoryService.importJSON(e.target.result);
        if (success) {
            showToast('success', 'Data imported successfully!');
            loadStories();
        } else {
            showToast('error', 'Invalid JSON file!');
        }
        input.value = ''; // Reset input
    };
    
    reader.readAsText(file);
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
    let html = '';
    
    if (totalPages > 1) {
        // Previous button
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">«</a>
            </li>
        `;
        
        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
            } else {
                html += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                    </li>
                `;
            }
        }
        
        // Next button
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">»</a>
            </li>
        `;
    }
    
    $('#pagination').html(html);
}

// Change page
function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredStories.length / itemsPerPage)) return;
    currentPage = page;
    renderStories();
}

// Toggle view
function toggleView(view) {
    currentView = view;
    if (view === 'table') {
        $('#viewTableBtn').addClass('active');
        $('#viewCardBtn').removeClass('active');
    } else {
        $('#viewCardBtn').addClass('active');
        $('#viewTableBtn').removeClass('active');
    }
    renderStories();
}

// Clear filters
function clearFilters() {
    $('#searchInput').val('');
    $('#filterGenre').val('all');
    $('#filterStatus').val('all');
    $('#sortBy').val('date_desc');
    currentPage = 1;
    applyFilters();
}

// Update active filters display
function updateActiveFilters() {
    const searchTerm = $('#searchInput').val();
    const genre = $('#filterGenre').val();
    const status = $('#filterStatus').val();
    
    let html = '<span class="me-2">Active filters:</span>';
    let hasFilter = false;
    
    if (searchTerm) {
        html += `<span class="badge me-2" style="background: var(--secondary-2);">Search: ${searchTerm}</span>`;
        hasFilter = true;
    }
    if (genre !== 'all') {
        html += `<span class="badge me-2" style="background: var(--secondary-1);">Genre: ${genre}</span>`;
        hasFilter = true;
    }
    if (status !== 'all') {
        const statusText = status === STORY_STATUS.ONGOING ? 'Ongoing' : 
                          status === STORY_STATUS.COMPLETED ? 'Completed' : 'Hiatus';
        html += `<span class="badge me-2" style="background: var(--accent-1);">Status: ${statusText}</span>`;
        hasFilter = true;
    }
    
    if (hasFilter) {
        $('#activeFilters').html(html);
    } else {
        $('#activeFilters').html('');
    }
}

// Update statistics
function updateStats() {
    const total = currentStories.length;
    const completed = currentStories.filter(s => s.status === STORY_STATUS.COMPLETED).length;
    const ongoing = currentStories.filter(s => s.status === STORY_STATUS.ONGOING).length;
    const hiatus = currentStories.filter(s => s.status === STORY_STATUS.HIATUS).length;
    const totalChapters = currentStories.reduce((sum, s) => sum + (s.chapters || 0), 0);
    
    $('#totalStories').text(total);
    
    // If dashboard stats exist
    if ($('#completedStories').length) {
        $('#completedStories').text(completed);
        $('#ongoingStories').text(ongoing);
        $('#hiatusStories').text(hiatus);
        $('#totalChapters').text(totalChapters);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get today's date
function getToday() {
    return new Date().toISOString().split('T')[0];
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

// Initialize when page loads
$(document).ready(function() {
    console.log('Stories.js loaded');
});