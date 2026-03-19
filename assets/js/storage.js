// Storage Service - Dịch vụ lưu trữ
const STORAGE_KEY = 'doctruyen_tasks';

const TaskService = {
    // Lấy tất cả công việc
    getTasks: function() {
        const tasks = localStorage.getItem(STORAGE_KEY);
        return tasks ? JSON.parse(tasks) : [];
    },
    
    // Lưu công việc
    saveTasks: function(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },
    
    // Thêm công việc mới
    addTask: function(task) {
        const tasks = this.getTasks();
        task.id = Date.now().toString(); // Tạo ID tự động
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    },
    
    // Cập nhật công việc
    updateTask: function(id, updatedTask) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedTask };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },
    
    // Xóa công việc
    deleteTask: function(id) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== id);
        this.saveTasks(filtered);
    },
    
    // Xóa tất cả
    clearAll: function() {
        localStorage.removeItem(STORAGE_KEY);
    },
    
    // Xuất JSON
    exportJSON: function() {
        const tasks = this.getTasks();
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `tasks_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    
    // Nhập JSON
    importJSON: function(jsonData) {
        try {
            const tasks = JSON.parse(jsonData);
            this.saveTasks(tasks);
            return true;
        } catch (e) {
            console.error('JSON không hợp lệ', e);
            return false;
        }
    }
};