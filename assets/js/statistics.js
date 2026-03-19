// statistics.js - Xử lý thống kê và biểu đồ

function loadStatistics() {
    const tasks = TaskService.getTasks();
    
    // Tính toán thống kê
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    
    // Cập nhật số liệu
    $('#statTotal').text(total);
    $('#statPending').text(pending);
    $('#statDone').text(done);
    $('#statCompletion').text(completion + '%');
    
    // Vẽ biểu đồ độ ưu tiên
    drawPriorityChart(tasks);
    
    // Vẽ biểu đồ tiến độ
    drawProgressChart(tasks);
    
    // Tải hoạt động gần đây
    loadRecentActivities(tasks);
}

// Vẽ biểu đồ tròn độ ưu tiên
function drawPriorityChart(tasks) {
    const priorityCount = {
        Low: tasks.filter(t => t.priority === 'Low').length,
        Medium: tasks.filter(t => t.priority === 'Medium').length,
        High: tasks.filter(t => t.priority === 'High').length
    };
    
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.priorityChart) {
        window.priorityChart.destroy();
    }
    
    window.priorityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Thấp', 'Trung bình', 'Cao'],
            datasets: [{
                data: [priorityCount.Low, priorityCount.Medium, priorityCount.High],
                backgroundColor: [
                    'var(--secondary-2)',
                    'var(--secondary-1)',
                    'var(--primary)'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-primary)',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ đường tiến độ
function drawProgressChart(tasks) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Hủy biểu đồ cũ nếu có
    if (window.progressChart) {
        window.progressChart.destroy();
    }
    
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Số công việc hoàn thành',
                data: getCompletedTasksByDay(tasks),
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(136, 68, 153, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'var(--primary)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'var(--card-bg)',
                    titleColor: 'var(--text-primary)',
                    bodyColor: 'var(--text-secondary)',
                    borderColor: 'var(--border-color)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'var(--border-color)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'var(--text-secondary)'
                    }
                }
            }
        }
    });
}

// Helper: Lấy 7 ngày gần nhất
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
    }
    return days;
}

// Helper: Đếm công việc hoàn thành theo ngày
function getCompletedTasksByDay(tasks) {
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = tasks.filter(t => 
            t.status === 'Done' && 
            t.deadline === dateStr
        ).length;
        
        counts.push(count);
    }
    return counts;
}

// Tải hoạt động gần đây
function loadRecentActivities(tasks) {
    // Sắp xếp công việc theo ngày tạo (dựa vào id)
    const sortedTasks = [...tasks].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    const recent = sortedTasks.slice(0, 5);
    
    let html = '<ul class="list-group list-group-flush">';
    
    recent.forEach(task => {
        const date = new Date(parseInt(task.id));
        const timeAgo = getTimeAgo(date);
        
        const statusText = task.status === 'Done' ? '✅ Hoàn thành' : '⏳ Đang thực hiện';
        
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center" style="background: transparent; border-color: var(--border-color);">
                <div>
                    <i class="fas fa-tasks me-2" style="color: var(--secondary-2);"></i>
                    <strong>${task.title}</strong> - ${statusText}
                </div>
                <small style="color: var(--text-secondary);">${timeAgo}</small>
            </li>
        `;
    });
    
    if (recent.length === 0) {
        html += '<li class="list-group-item text-center" style="background: transparent; border-color: var(--border-color);">Chưa có hoạt động nào</li>';
    }
    
    html += '</ul>';
    $('#recentActivities').html(html);
}

// Helper: Tính thời gian trước
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' năm trước';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' tháng trước';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' ngày trước';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' giờ trước';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' phút trước';
    
    return 'vừa xong';
}