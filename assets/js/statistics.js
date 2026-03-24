// statistics.js - Story statistics and charts

function loadStatistics() {
    const stories = StoryService.getAllStories();
    
    // Calculate statistics
    const total = stories.length;
    const exclusive = stories.filter(s => s.exclusive === true).length;
    const userCreated = stories.filter(s => s.userCreated === true).length;
    const defaultStories = stories.filter(s => !s.exclusive && !s.userCreated).length;
    const totalChapters = stories.reduce((sum, s) => sum + (s.chapters || 0), 0);
    
    // Update stats display
    $('#statTotal').text(total);
    $('#statExclusive').text(exclusive);
    $('#statUser').text(userCreated);
    $('#statDefault').text(defaultStories);
    $('#statTotalChapters').text(totalChapters);
    
    // Draw charts
    drawGenreChart(stories);
    drawSourceChart(stories);
    drawChaptersChart(stories);
    
    // Load recent activities
    loadRecentActivities(stories);
}

// Draw genre distribution chart
function drawGenreChart(stories) {
    const genreCount = {
        Romance: stories.filter(s => s.genre === 'Romance' && !s.exclusive).length,
        Fluff: stories.filter(s => s.genre === 'Fluff' && !s.exclusive).length,
        Angst: stories.filter(s => s.genre === 'Angst' && !s.exclusive).length
    };
    
    const ctx = document.getElementById('genreChart').getContext('2d');
    
    if (window.genreChart) {
        window.genreChart.destroy();
    }
    
    window.genreChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Romance', 'Fluff', 'Angst'],
            datasets: [{
                data: [genreCount.Romance, genreCount.Fluff, genreCount.Angst],
                backgroundColor: ['#884499', '#BB5688', '#8888CC'],
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
                        font: { size: 12 }
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

// Draw source distribution chart (Exclusive, User, Default)
function drawSourceChart(stories) {
    const exclusiveCount = stories.filter(s => s.exclusive === true).length;
    const userCount = stories.filter(s => s.userCreated === true).length;
    const defaultCount = stories.filter(s => !s.exclusive && !s.userCreated).length;
    
    const ctx = document.getElementById('sourceChart').getContext('2d');
    
    if (window.sourceChart) {
        window.sourceChart.destroy();
    }
    
    window.sourceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Nightcord Exclusive', 'User Stories', 'Default Stories'],
            datasets: [{
                data: [exclusiveCount, userCount, defaultCount],
                backgroundColor: ['#CCAA88', '#BB5688', '#884499'],
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
                    labels: { font: { size: 12 } }
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

// Draw chapters per story chart
function drawChaptersChart(stories) {
    // Get top 5 stories by chapters
    const topStories = [...stories]
        .sort((a, b) => (b.chapters || 0) - (a.chapters || 0))
        .slice(0, 5);
    
    const ctx = document.getElementById('chaptersChart').getContext('2d');
    
    if (window.chaptersChart) {
        window.chaptersChart.destroy();
    }
    
    window.chaptersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topStories.map(s => s.title.length > 20 ? s.title.substring(0, 17) + '...' : s.title),
            datasets: [{
                label: 'Number of Chapters',
                data: topStories.map(s => s.chapters || 0),
                backgroundColor: '#884499',
                borderRadius: 8,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Chapters: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#eaeaea' },
                    ticks: { stepSize: 1 }
                },
                x: {
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

// Load recent activities
function loadRecentActivities(stories) {
    const sortedStories = [...stories].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.publishDate || 0);
        const dateB = new Date(b.createdAt || b.publishDate || 0);
        return dateB - dateA;
    });
    const recent = sortedStories.slice(0, 5);
    
    let html = '<ul class="list-group list-group-flush">';
    
    recent.forEach(story => {
        const date = new Date(story.createdAt || story.publishDate);
        const timeAgo = getTimeAgo(date);
        
        let sourceIcon = '';
        let sourceText = '';
        if (story.exclusive) {
            sourceIcon = 'fa-crown';
            sourceText = 'Exclusive';
        } else if (story.userCreated) {
            sourceIcon = 'fa-user';
            sourceText = 'User';
        } else {
            sourceIcon = 'fa-book';
            sourceText = 'Default';
        }
        
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center" style="background: transparent; border-color: var(--border-color);">
                <div>
                    <i class="fas ${sourceIcon} me-2" style="color: var(--secondary-2);"></i>
                    <strong>${escapeHtml(story.title)}</strong>
                    <small class="text-muted ms-2">(${sourceText})</small>
                </div>
                <small style="color: var(--text-secondary);">${timeAgo}</small>
            </li>
        `;
    });
    
    if (recent.length === 0) {
        html += '<li class="list-group-item text-center" style="background: transparent; border-color: var(--border-color);">No recent activities</li>';
    }
    
    html += '</ul>';
    $('#recentActivities').html(html);
}

// Helper: Get last 7 days
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
}

// Helper: Count completed stories by day
function getCompletedStoriesByDay(stories) {
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = stories.filter(s => {
            const storyDate = s.publishDate || s.createdAt?.split('T')[0];
            return storyDate === dateStr;
        }).length;
        
        counts.push(count);
    }
    return counts;
}

// Helper: Calculate time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' year ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' month ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' day ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hour ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minute ago';
    
    return 'just now';
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}