class KanbanBoard {
    constructor(tasks = []) {
        this.tasks = tasks;
        this.init();
    }
    
    init() {
        this.columns = {
            todo: document.getElementById('todoColumn'),
            inprogress: document.getElementById('inprogressColumn'),
            done: document.getElementById('doneColumn')
        };
        
        this.renderTasks();
        this.initDragAndDrop();
        this.updateStats();
    }
    
    renderTasks() {
        // Clear all columns
        Object.values(this.columns).forEach(column => {
            column.innerHTML = '';
        });
        
        // Render tasks in appropriate columns
        this.tasks.forEach(task => {
            this.renderTask(task);
        });
        
        // Add empty state if column is empty
        Object.entries(this.columns).forEach(([status, column]) => {
            if (column.children.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks yet</p>
                `;
                column.appendChild(emptyState);
            }
        });
    }
    
    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.setAttribute('draggable', 'true');
        taskElement.dataset.taskId = task.id;
        
        const priorityClass = `task-priority ${task.priority}`;
        
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-footer">
                <div class="task-tags">
                    ${task.tags && task.tags.length > 0 
                        ? task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')
                        : ''
                    }
                </div>
                <div class="${priorityClass}">${task.priority}</div>
            </div>
        `;
        
        // Add event listeners
        taskElement.querySelector('.edit-task').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask(task.id);
        });
        
        taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });
        
        // Add click event to view task details
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-action-btn')) {
                this.viewTask(task.id);
            }
        });
        
        // Append to correct column
        const column = this.columns[task.status];
        if (column) {
            // Remove empty state if present
            const emptyState = column.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
            column.appendChild(taskElement);
        }
    }
    
    addTask(task) {
        this.tasks.push(task);
        this.renderTask(task);
        this.updateStats();
    }
    
    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.renderTasks();
            this.updateStats();
            return true;
        }
        return false;
    }
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.renderTasks();
            this.updateStats();
            
            // Show toast notification
            if (window.intuivaApp) {
                window.intuivaApp.showToast('Task deleted successfully', 'success');
            }
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Populate modal with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Task';
        
        // Show modal
        document.getElementById('taskModal').classList.add('active');
        
        // Update form submission to edit instead of add
        const form = document.getElementById('taskForm');
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = (e) => {
            e.preventDefault();
            
            const updatedTask = {
                title: document.getElementById('taskTitle').value.trim(),
                description: document.getElementById('taskDescription').value.trim(),
                priority: document.getElementById('taskPriority').value,
                status: document.getElementById('taskStatus').value,
                tags: document.getElementById('taskTags').value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag)
            };
            
            if (this.updateTask(taskId, updatedTask)) {
                document.getElementById('taskModal').classList.remove('active');
                form.reset();
                
                if (window.intuivaApp) {
                    window.intuivaApp.showToast('Task updated successfully!', 'success');
                }
            }
            
            // Restore original submit handler
            form.onsubmit = originalSubmit;
        };
    }
    
    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // In a real app, you might show a detailed view modal
        // For now, just show a toast with task info
        if (window.intuivaApp) {
            window.intuivaApp.showToast(`Viewing: ${task.title}`, 'info');
        }
    }
    
    clearTasks() {
        this.tasks = [];
        this.renderTasks();
        this.updateStats();
    }
    
    initDragAndDrop() {
        let draggedTask = null;
        
        // Add drag event listeners to task cards
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedTask = e.target;
                e.target.classList.add('dragging');
                
                // Set drag image
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
                draggedTask = null;
                
                // Remove drag-over styles from all columns
                document.querySelectorAll('.column-content').forEach(col => {
                    col.classList.remove('drag-over');
                });
            }
        });
        
        // Add drop zone event listeners to columns
        Object.entries(this.columns).forEach(([status, column]) => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                if (draggedTask) {
                    const taskId = draggedTask.dataset.taskId;
                    const newStatus = column.parentElement.dataset.status;
                    
                    // Update task status
                    this.updateTask(taskId, { status: newStatus });
                    
                    // Move task element to new column
                    column.appendChild(draggedTask);
                    
                    // Remove empty state if present
                    const emptyState = column.querySelector('.empty-state');
                    if (emptyState) {
                        emptyState.remove();
                    }
                    
                    // Show feedback
                    if (window.intuivaApp) {
                        window.intuivaApp.showToast(`Task moved to ${this.getStatusLabel(newStatus)}`, 'info');
                    }
                }
            });
        });
    }
    
    updateStats() {
        const stats = this.getStats();
        
        // Update global stats if app exists
        if (window.intuivaApp) {
            window.intuivaApp.updateStats();
        }
        
        return stats;
    }
    
    getStats() {
        const total = this.tasks.length;
        const todo = this.tasks.filter(task => task.status === 'todo').length;
        const inProgress = this.tasks.filter(task => task.status === 'inprogress').length;
        const done = this.tasks.filter(task => task.status === 'done').length;
        
        return {
            total,
            todo,
            inProgress,
            done
        };
    }
    
    getStatusLabel(status) {
        const labels = {
            todo: 'To Do',
            inprogress: 'In Progress',
            done: 'Done'
        };
        return labels[status] || status;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make KanbanBoard available globally
window.KanbanBoard = KanbanBoard;
