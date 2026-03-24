// Biến toàn cục
let currentStories = [];
let filteredStories = [];
let currentPage = 1;
let itemsPerPage = 8; // Hiển thị 8 truyện mỗi trang
let deleteId = null;
let currentView = 'card'; // Mặc định là card view

// Danh sách thể loại
const GENRES = ['Romantic', 'Fluff', 'Angst', 'Hành động', 'Hài hước', 'Kinh dị', 'Fantasy'];

// Danh sách trạng thái
const STORY_STATUS = {
    ONGOING: 'Đang tiến hành',
    COMPLETED: 'Hoàn thành',
    HIATUS: 'Tạm ngưng'
};

// Tải danh sách truyện
function loadStories() {
    currentStories = StoryService.getStories();
    
    // Nếu chưa có dữ liệu, thêm dữ liệu mẫu
    if (currentStories.length === 0) {
        addSampleStories();
        currentStories = StoryService.getStories();
    }
    
    applyFilters();
    updateStats();
}

// Thêm dữ liệu mẫu
function addSampleStories() {
    const sampleStories = [
        {
            id: Date.now().toString() + '1',
            title: 'True Beauty',
            author: 'Yaongyi',
            description: 'Câu chuyện về cô gái trở nên xinh đẹp nhờ trang điểm và hành trình tìm kiếm tình yêu đích thực.',
            genre: 'Romantic',
            publishDate: '2024-01-15',
            status: STORY_STATUS.ONGOING,
            chapters: 150,
            rating: 4.8,
            priority: 'Cao',
            coverImage: 'assets/img/placeholder.png'
        },
        {
            id: Date.now().toString() + '2',
            title: 'Solo Leveling',
            author: 'Chugong',
            description: 'Câu chuyện về thợ săn hạng E Sung Jin-Woo trở nên mạnh mẽ sau khi nhận được sức mạnh đặc biệt.',
            genre: 'Hành động',
            publishDate: '2024-02-10',
            status: STORY_STATUS.COMPLETED,
            chapters: 179,
            rating: 4.9,
            priority: 'Cao',
            coverImage: 'assets/img/placeholder.png'
        },
        {
            id: Date.now().toString() + '3',
            title: 'Gourmet Hound',
            author: 'Park',
            description: 'Câu chuyện ấm áp về cô gái tìm kiếm hương vị tuổi thơ qua những món ăn.',
            genre: 'Fluff',
            publishDate: '2024-03-05',
            status: STORY_STATUS.COMPLETED,
            chapters: 160,
            rating: 4.7,
            priority: 'Trung bình',
            coverImage: 'assets/img/placeholder.png'
        },
        {
            id: Date.now().toString() + '4',
            title: 'Bastard',
            author: 'Carnby Kim',
            description: 'Câu chuyện kinh dị về chàng trai sống với người cha sát nhân hàng loạt.',
            genre: 'Kinh dị',
            publishDate: '2024-01-20',
            status: STORY_STATUS.COMPLETED,
            chapters: 92,
            rating: 4.6,
            priority: 'Thấp',
            coverImage: 'assets/img/placeholder.png'
        }
    ];
    
    sampleStories.forEach(story => StoryService.addStory(story));
}

// Áp dụng bộ lọc và tìm kiếm
function applyFilters() {
    const searchTerm = $('#searchInput').val()?.toLowerCase() || '';
    const genreFilter = $('#filterGenre').val() || 'all';
    const statusFilter = $('#filterStatus').val() || 'all';
    const sortBy = $('#sortBy').val() || 'date_desc';
    
    // Lọc
    filteredStories = currentStories.filter(story => {
        // Tìm kiếm theo tên, tác giả, mô tả
        const matchesSearch = searchTerm === '' || 
            story.title.toLowerCase().includes(searchTerm) ||
            story.author.toLowerCase().includes(searchTerm) ||
            (story.description && story.description.toLowerCase().includes(searchTerm));
        
        // Lọc theo thể loại
        const matchesGenre = genreFilter === 'all' || story.genre === genreFilter;
        
        // Lọc theo trạng thái
        const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
        
        return matchesSearch && matchesGenre && matchesStatus;
    });
    
    // Sắp xếp
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
    
    // Reset về trang 1
    currentPage = 1;
    
    // Cập nhật giao diện
    updatePagination();
    renderStories();
    updateActiveFilters();
}

// Hiển thị truyện theo view hiện tại
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
    
    // Cập nhật thông tin hiển thị
    $('#showingInfo').text(`Hiển thị ${start + 1}-${Math.min(end, filteredStories.length)} của ${filteredStories.length} truyện`);
    $('#totalStories').text(currentStories.length);
}

// Hiển thị dạng bảng
function renderTableView(stories) {
    let html = '';
    stories.forEach((story, index) => {
        const priorityClass = {
            'Cao': 'badge-high',
            'Trung bình': 'badge-medium',
            'Thấp': 'badge-low'
        }[story.priority] || 'badge-medium';
        
        const statusClass = story.status === STORY_STATUS.COMPLETED ? 'status-completed' : 
                           story.status === STORY_STATUS.ONGOING ? 'status-ongoing' : 'status-hiatus';
        
        const rowClass = story.status === STORY_STATUS.COMPLETED ? 'story-completed' : '';
        
        html += `
            <tr class="${rowClass}" data-id="${story.id}">
                <td>${index + 1 + (currentPage - 1) * itemsPerPage}</td>
                <td>
                    <img src="${story.coverImage || 'assets/img/placeholder.png'}" 
                         alt="${story.title}" 
                         class="story-table-img"
                         style="width: 50px; height: 70px; object-fit: cover; border-radius: 6px;"
                         onerror="this.src='assets/img/placeholder.png'">
                </td>
                <td>
                    <div class="story-table-title" style="font-weight: 600; color: var(--primary);">${story.title}</div>
                    <div class="story-table-author" style="font-size: 0.85rem; color: #888;">${story.author}</div>
                </td>
                <td>${story.author}</td>
                <td><span class="badge" style="background: ${getGenreColor(story.genre)};">${story.genre}</span></td>
                <td><span class="story-rating" style="color: #FFB800;">★ ${story.rating || '4.5'}</span></td>
                <td>${story.chapters || 0} chap</td>
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

// Lấy màu theo thể loại
function getGenreColor(genre) {
    const colors = {
        'Romantic': 'var(--primary)',
        'Fluff': 'var(--secondary-1)',
        'Angst': 'var(--secondary-2)',
        'Hành động': 'var(--primary)',
        'Hài hước': 'var(--secondary-1)',
        'Kinh dị': 'var(--secondary-2)',
        'Fantasy': 'var(--accent-1)'
    };
    return colors[genre] || 'var(--primary)';
}

// Hiển thị dạng thẻ
function renderCardView(stories) {
    let html = '';
    stories.forEach((story, index) => {
        const priorityClass = {
            'Cao': 'badge-high',
            'Trung bình': 'badge-medium',
            'Thấp': 'badge-low'
        }[story.priority] || 'badge-medium';
        
        const priorityText = {
            'Cao': 'Cao',
            'Trung bình': 'Trung bình',
            'Thấp': 'Thấp'
        }[story.priority] || 'Trung bình';
        
        const statusClass = story.status === STORY_STATUS.COMPLETED ? 'status-completed' : 
                           story.status === STORY_STATUS.ONGOING ? 'status-ongoing' : 'status-hiatus';
        const statusColor = story.status === STORY_STATUS.COMPLETED ? 'var(--secondary-1)' : 
                           story.status === STORY_STATUS.ONGOING ? 'var(--secondary-2)' : 'var(--accent-1)';
        
        const cardClass = story.status === STORY_STATUS.COMPLETED ? 'story-card-completed' : '';
        
        html += `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="story-card ${cardClass}" data-id="${story.id}" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--webtoon-border); transition: all 0.3s; height: 100%; margin-bottom: 20px;">
                    <div class="story-cover" style="position: relative; aspect-ratio: 3/4; overflow: hidden; background: #f5f5f5;">
                        <span class="story-badge" style="position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; z-index: 2; background: ${getGenreColor(story.genre)};">${story.genre}</span>
                        <span class="story-rank" style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: var(--accent-2); color: #333; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${index + 1 + (currentPage - 1) * itemsPerPage}</span>
                        <img src="${story.coverImage || 'assets/img/placeholder.png'}" 
                             alt="${story.title}"
                             style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;"
                             onerror="this.src='assets/img/placeholder.png'">
                    </div>
                    <div class="story-info" style="padding: 15px;">
                        <h3 class="story-title" style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${story.title}</h3>
                        <div class="story-author" style="font-size: 0.85rem; color: #888; margin-bottom: 8px;">${story.author}</div>
                        <div class="story-meta" style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; margin-bottom: 8px; flex-wrap: wrap;">
                            <span class="story-rating" style="color: #FFB800; font-weight: 600;">★ ${story.rating || '4.5'}</span>
                            <span class="story-chapters" style="color: #888;">${story.chapters || 0} chap</span>
                            <span class="badge ${priorityClass}" style="background: ${story.priority === 'Cao' ? 'var(--primary)' : story.priority === 'Trung bình' ? 'var(--secondary-1)' : 'var(--secondary-2)'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">${priorityText}</span>
                        </div>
                        <div class="story-description" style="font-size: 0.85rem; color: #666; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${story.description || 'Chưa có mô tả'}</div>
                        <div class="story-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; margin-bottom: 10px;">
                            <span class="story-status ${statusClass}" style="padding: 2px 8px; border-radius: 12px; font-weight: 600; background: ${statusColor}; color: white;">${story.status}</span>
                            <span class="story-date" style="color: #888;">📅 ${formatDate(story.publishDate)}</span>
                        </div>
                        <div class="story-actions" style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--webtoon-border); padding-top: 10px; margin-top: 10px;">
                            <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${story.id}')" style="border-color: var(--primary); color: var(--primary);">
                                <i class="fas fa-edit"></i> Sửa
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('${story.id}', '${story.title.replace(/'/g, "\\'")}')" style="border-color: var(--secondary-1); color: var(--secondary-1);">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    $('#storyCardContainer').html(html);
}

// Mở modal thêm mới
function openAddModal() {
    $('#modalTitle').html('<i class="fas fa-plus-circle me-2"></i>Thêm truyện mới');
    $('#storyForm')[0].reset();
    $('#storyId').val('');
    $('#modalHeader').css('background', 'linear-gradient(135deg, var(--primary), var(--secondary-2))');
    $('#saveBtn').html('<i class="fas fa-save me-2"></i>Lưu truyện');
    
    // Đặt ngày đăng mặc định là hôm nay
    $('#publishDate').val(getToday());
    
    // Reset validation
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').hide();
    
    $('#storyModal').modal('show');
}

// Mở modal sửa
function openEditModal(id) {
    const story = currentStories.find(s => s.id === id);
    if (story) {
        $('#modalTitle').html('<i class="fas fa-edit me-2"></i>Sửa thông tin truyện');
        $('#storyId').val(story.id);
        $('#title').val(story.title);
        $('#author').val(story.author);
        $('#description').val(story.description || '');
        $('#publishDate').val(story.publishDate || getToday());
        $('#chapters').val(story.chapters || 0);
        $('#rating').val(story.rating || 4.5);
        $('#priority').val(story.priority || 'Trung bình');
        $('#genre').val(story.genre || '');
        $('#status').val(story.status || STORY_STATUS.ONGOING);
        $('#coverImage').val(story.coverImage || '');
        
        $('#modalHeader').css('background', 'linear-gradient(135deg, var(--secondary-2), var(--accent-2))');
        $('#saveBtn').html('<i class="fas fa-save me-2"></i>Cập nhật');
        
        // Reset validation
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').hide();
        
        $('#storyModal').modal('show');
    }
}

// Lưu truyện (Thêm mới hoặc Cập nhật)
function saveStory() {
    // Kiểm tra validation
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
        // Cập nhật
        StoryService.updateStory(id, storyData);
        showToast('success', 'Cập nhật thông tin truyện thành công!');
    } else {
        // Thêm mới
        StoryService.addStory(storyData);
        showToast('success', 'Thêm truyện mới thành công!');
    }
    
    $('#storyModal').modal('hide');
    loadStories();
}

// Kiểm tra form
function validateForm() {
    let isValid = true;
    const title = $('#title').val();
    const author = $('#author').val();
    const description = $('#description').val();
    const genre = $('#genre').val();
    const publishDate = $('#publishDate').val();
    const today = getToday();
    
    // Reset lỗi
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').hide();
    
    // Kiểm tra tiêu đề
    if (!title || !title.trim()) {
        $('#title').addClass('is-invalid');
        $('#titleError').show();
        isValid = false;
    }
    
    // Kiểm tra tác giả
    if (!author || !author.trim()) {
        $('#author').addClass('is-invalid');
        $('#authorError').show();
        isValid = false;
    }
    
    // Kiểm tra mô tả
    if (!description || description.length < 10) {
        $('#description').addClass('is-invalid');
        $('#descError').show();
        isValid = false;
    }
    
    // Kiểm tra thể loại
    if (!genre) {
        $('#genre').addClass('is-invalid');
        $('#genreError').show();
        isValid = false;
    }
    
    // Kiểm tra ngày đăng
    if (publishDate && publishDate < today) {
        $('#publishDate').addClass('is-invalid');
        $('#dateError').show();
        isValid = false;
    }
    
    return isValid;
}

// Thiết lập validation realtime
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

// Mở modal xóa
function openDeleteModal(id, title) {
    deleteId = id;
    $('#deleteStoryTitle').text(title);
    $('#deleteModal').modal('show');
}

// Xác nhận xóa
function confirmDelete() {
    if (deleteId) {
        StoryService.deleteStory(deleteId);
        showToast('warning', 'Đã xóa truyện!');
        $('#deleteModal').modal('hide');
        loadStories();
    }
}

// Xác nhận xóa tất cả
function confirmClearAll() {
    if (confirm('Bạn có chắc chắn muốn xóa TẤT CẢ truyện? Hành động này không thể hoàn tác!')) {
        StoryService.clearAll();
        showToast('warning', 'Đã xóa tất cả truyện!');
        loadStories();
    }
}

// Xuất JSON
function exportJSON() {
    StoryService.exportJSON();
    showToast('info', 'Xuất dữ liệu thành công!');
}

// Nhập JSON
function importJSON(input) {
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const success = StoryService.importJSON(e.target.result);
        if (success) {
            showToast('success', 'Nhập dữ liệu thành công!');
            loadStories();
        } else {
            showToast('error', 'File JSON không hợp lệ!');
        }
        input.value = ''; // Reset input
    };
    
    reader.readAsText(file);
}

// Cập nhật phân trang
function updatePagination() {
    const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
    let html = '';
    
    if (totalPages > 1) {
        // Nút Previous
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">«</a>
            </li>
        `;
        
        // Các nút số trang
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
        
        // Nút Next
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">»</a>
            </li>
        `;
    }
    
    $('#pagination').html(html);
}

// Đổi trang
function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredStories.length / itemsPerPage)) return;
    currentPage = page;
    renderStories();
}

// Chuyển đổi view
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

// Xóa bộ lọc
function clearFilters() {
    $('#searchInput').val('');
    $('#filterGenre').val('all');
    $('#filterStatus').val('all');
    $('#sortBy').val('date_desc');
    currentPage = 1;
    applyFilters();
}

// Cập nhật hiển thị bộ lọc đang áp dụng
function updateActiveFilters() {
    const searchTerm = $('#searchInput').val();
    const genre = $('#filterGenre').val();
    const status = $('#filterStatus').val();
    
    let html = '<span class="me-2">Bộ lọc đang áp dụng:</span>';
    let hasFilter = false;
    
    if (searchTerm) {
        html += `<span class="badge me-2" style="background: var(--secondary-2);">Tìm: ${searchTerm}</span>`;
        hasFilter = true;
    }
    if (genre !== 'all') {
        html += `<span class="badge me-2" style="background: var(--secondary-1);">Thể loại: ${genre}</span>`;
        hasFilter = true;
    }
    if (status !== 'all') {
        const statusText = status === STORY_STATUS.ONGOING ? 'Đang tiến hành' : 
                          status === STORY_STATUS.COMPLETED ? 'Hoàn thành' : 'Tạm ngưng';
        html += `<span class="badge me-2" style="background: var(--accent-1);">Trạng thái: ${statusText}</span>`;
        hasFilter = true;
    }
    
    if (hasFilter) {
        $('#activeFilters').html(html);
    } else {
        $('#activeFilters').html('');
    }
}

// Cập nhật thống kê
function updateStats() {
    const total = currentStories.length;
    const completed = currentStories.filter(s => s.status === STORY_STATUS.COMPLETED).length;
    const ongoing = currentStories.filter(s => s.status === STORY_STATUS.ONGOING).length;
    const hiatus = currentStories.filter(s => s.status === STORY_STATUS.HIATUS).length;
    const totalChapters = currentStories.reduce((sum, s) => sum + (s.chapters || 0), 0);
    
    $('#totalStories').text(total);
    
    // Nếu có dashboard stats
    if ($('#completedStories').length) {
        $('#completedStories').text(completed);
        $('#ongoingStories').text(ongoing);
        $('#hiatusStories').text(hiatus);
        $('#totalChapters').text(totalChapters);
    }
}

// Thêm truyện nhanh từ trang chủ
function quickAddStory() {
    const title = $('#quickTitle').val();
    if (!title.trim()) {
        alert('Tiêu đề không được để trống!');
        return;
    }
    
    const story = {
        title: title,
        author: $('#quickAuthor').val() || 'Tác giả',
        description: $('#quickDesc').val() || 'Chưa có mô tả',
        genre: $('#quickGenre').val() || 'Romantic',
        publishDate: $('#quickPublishDate').val() || getToday(),
        chapters: parseInt($('#quickChapters').val()) || 1,
        rating: 4.5,
        priority: 'Trung bình',
        status: STORY_STATUS.ONGOING,
        coverImage: 'assets/img/placeholder.png'
    };
    
    StoryService.addStory(story);
    $('#quickAddModal').modal('hide');
    $('#quickAddForm')[0].reset();
    showToast('success', 'Thêm truyện nhanh thành công!');
    
    // Cập nhật truyện gần đây nếu đang ở trang chủ
    if (typeof loadRecentStories === 'function') {
        loadRecentStories();
    }
}

// Tải truyện gần đây cho trang chủ
function loadRecentStories() {
    const stories = StoryService.getStories();
    const recentStories = stories.slice(0, 3);
    
    let html = '';
    recentStories.forEach(story => {
        const priorityClass = {
            'Cao': 'badge-high',
            'Trung bình': 'badge-medium',
            'Thấp': 'badge-low'
        }[story.priority] || 'badge-medium';
        
        const priorityText = {
            'Cao': 'Cao',
            'Trung bình': 'Trung bình',
            'Thấp': 'Thấp'
        }[story.priority] || 'Trung bình';
        
        const statusText = story.status === STORY_STATUS.COMPLETED ? '✅ Hoàn thành' : 
                          story.status === STORY_STATUS.ONGOING ? '⏳ Đang tiến hành' : '⏸️ Tạm ngưng';
        const statusColor = story.status === STORY_STATUS.COMPLETED ? 'var(--secondary-1)' : 
                           story.status === STORY_STATUS.ONGOING ? 'var(--secondary-2)' : 'var(--accent-1)';
        
        html += `
            <div class="col-md-4">
                <div class="story-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--webtoon-border);">
                    <div class="story-cover" style="position: relative; aspect-ratio: 3/4; overflow: hidden;">
                        <span class="story-badge" style="position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; z-index: 2; background: ${getGenreColor(story.genre)};">${story.genre}</span>
                        <img src="${story.coverImage || 'assets/img/placeholder.png'}" alt="${story.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="story-info" style="padding: 15px;">
                        <h3 class="story-title" style="font-weight: 700; font-size: 1rem; margin-bottom: 5px; color: #333;">${story.title}</h3>
                        <div class="story-author" style="font-size: 0.8rem; color: #888; margin-bottom: 8px;">${story.author}</div>
                        <div class="story-meta" style="display: flex; align-items: center; gap: 10px; font-size: 0.75rem;">
                            <span class="story-rating" style="color: #FFB800;">★ ${story.rating || '4.5'}</span>
                            <span class="story-chapters" style="color: #888;">${story.chapters || 0} chap</span>
                        </div>
                        <div class="story-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; margin-top: 10px;">
                            <span class="badge" style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px;">${statusText}</span>
                            <span class="story-date" style="color: #888;">📅 ${formatDate(story.publishDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    $('#recentStoriesPreview').html(html);
}

// Kéo thả
function setupDragDrop() {
    if ($('#storyCardContainer').length) {
        $('#storyCardContainer').sortable({
            items: '.col-lg-3, .col-md-4, .col-sm-6',
            cursor: 'move',
            opacity: 0.6,
            placeholder: 'ui-sortable-placeholder',
            tolerance: 'pointer',
            update: function(event, ui) {
                showToast('info', 'Đã sắp xếp lại thứ tự');
                
                // Cập nhật lại thứ tự trong mảng
                const newOrder = [];
                $('#storyCardContainer .story-card').each(function() {
                    const id = $(this).data('id');
                    const story = currentStories.find(s => s.id === id);
                    if (story) newOrder.push(story);
                });
                
                if (newOrder.length === currentStories.length) {
                    currentStories = newOrder;
                    StoryService.saveStories(currentStories);
                }
            }
        });
    }
}

// Khởi tạo khi trang load
$(document).ready(function() {
    // Các hàm khởi tạo sẽ được gọi từ trang HTML
    console.log('Stories.js loaded');
});