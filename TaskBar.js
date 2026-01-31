document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks and initial badge
    chrome.storage.local.get(['tasks'], (data) => {
        const tasks = data.tasks || [];
        renderTasks(tasks);
    });

    // Add Task
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        chrome.storage.local.get(['tasks'], (data) => {
            const tasks = data.tasks || [];
            const newTask = { id: Date.now(), text, completed: false };
            const newTasks = [...tasks, newTask];
            
            saveAndRender(newTasks);
            taskInput.value = '';
        });
    }

    // Toggle and Delete (Event Delegation)
    taskList.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        
        chrome.storage.local.get(['tasks'], (data) => {
            let tasks = data.tasks || [];

            if (e.target.classList.contains('check-btn')) {
                tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
            } else if (e.target.classList.contains('delete-btn')) {
                tasks = tasks.filter(t => t.id !== id);
            }

            saveAndRender(tasks);
        });
    });

    function saveAndRender(tasks) {
        chrome.storage.local.set({ tasks }, () => {
            renderTasks(tasks);
        });
    }

    function renderTasks(tasks) {
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <button class="check-btn ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        ${task.completed ? '✓' : ''}
                    </button>
                    <span class="task-text ${task.completed ? 'strikethrough' : ''}">${task.text}</span>
                </div>
                <button class="delete-btn" data-id="${task.id}">🗑</button>
            `;
            taskList.appendChild(li);
        });

        updateBadge(tasks);
    }

    function updateBadge(tasks) {
        const count = tasks.filter(t => !t.completed).length;
        const text = count > 0 ? count.toString() : "";
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color: "#ff8a65" });
    }
});