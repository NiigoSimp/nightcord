// storage.js - Quản lý dữ liệu truyện
const STORAGE_KEY = 'nightcord_stories';

const StoryService = {
    getStories: function() {
        const stories = localStorage.getItem(STORAGE_KEY);
        if (stories) return JSON.parse(stories);
        
        // Dữ liệu mẫu ban đầu (truyện mẫu - userCreated = false)
        const defaultStories = [
            {
                id: 'romance-1',
                title: 'They say I\'m obsessed with you',
                author: 'EmoEnabler',
                description: 'Câu chuyện tình yêu đầy cảm xúc về sự ám ảnh và tình yêu đích thực.',
                genre: 'Romance',
                rating: 5.0,
                coverImage: 'assets/img/placeholder.png',
                exclusive: false,
                userCreated: false,  // false = truyện mẫu
                createdAt: '2024-01-15T00:00:00.000Z',
                content: 'Chương 1: Khởi đầu\n\nCâu chuyện bắt đầu khi cô gặp anh trong một buổi chiều mưa...'
            },
            {
                id: 'fluff-1',
                title: 'Bite down, right to the bone',
                author: 'EmoEnabler',
                description: 'Câu chuyện ngọt ngào về tình bạn và tình yêu.',
                genre: 'Fluff',
                rating: 4.7,
                coverImage: 'assets/img/placeholder.png',
                exclusive: false,
                userCreated: false,
                createdAt: '2024-02-20T00:00:00.000Z',
                content: 'Chương 1: Gặp gỡ\n\nMột ngày đẹp trời, hai con người xa lạ tình cờ gặp nhau...'
            },
            {
                id: 'angst-1',
                title: 'Searching For Change (in something that\'s dead)',
                author: 'EmoEnabler',
                description: 'Hành trình tìm kiếm sự thay đổi trong những điều đã chết.',
                genre: 'Angst',
                rating: 4.6,
                coverImage: 'assets/img/placeholder.png',
                exclusive: false,
                userCreated: false,
                createdAt: '2024-03-10T00:00:00.000Z',
                content: 'Chương 1: Mất mát\n\nKhi mọi thứ sụp đổ, anh nhận ra rằng...'
            }
        ];
        this.saveStories(defaultStories);
        return defaultStories;
    },
    
    saveStories: function(stories) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    },
    
    getAllStories: function() {
        return this.getStories();
    },
    
    getStoryById: function(id) {
        const stories = this.getStories();
        return stories.find(s => s.id === id);
    },
    
    getExclusiveStories: function() {
        const stories = this.getStories();
        return stories.filter(s => s.exclusive === true);
    },
    
    addStory: function(story) {
        const stories = this.getStories();
        if (!story.id) story.id = Date.now().toString();
        // userCreated = true cho truyện user tạo, false cho truyện mẫu
        if (story.userCreated === undefined) {
            story.userCreated = true;  // Mặc định là truyện user tạo
        }
        stories.push(story);
        this.saveStories(stories);
        return story;
    },
    
    deleteStory: function(id) {
        const stories = this.getStories();
        const filtered = stories.filter(s => s.id !== id);
        this.saveStories(filtered);
    },
    
    getStoriesByGenre: function(genre) {
        const stories = this.getStories();
        return stories.filter(s => s.genre === genre);
    },
    
    // Lấy truyện mẫu (userCreated = false, exclusive = false)
    getSampleStories: function() {
        const stories = this.getStories();
        return stories.filter(s => s.userCreated === false && s.exclusive === false);
    },
    
    // Lấy truyện user tạo (userCreated = true, exclusive = false)
    getUserStories: function() {
        const stories = this.getStories();
        return stories.filter(s => s.userCreated === true && s.exclusive === false);
    }
};