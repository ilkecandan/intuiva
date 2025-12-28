import { INITIAL_TASKS, STORAGE_KEYS } from './data.js';

class KanbanBoard {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentEditTaskId = null;
        
        this.init();
        this.renderBoard();
        this.initDragAndDrop();
    }

    init() {
        this.initEventListeners();
        this.updateSummary();
    }

    initEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showAddTaskModal());
        
        // Reset board button
        document.getElementById('resetBoardBtn').addEventListener('click', () => this.resetBoard());
        
        // Task form submission
        document.getElementById('taskForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
            if (savedTasks) {
                return JSON.parse(savedTasks);
            } else {
                // Return initial tasks if no saved tasks
                return [...INITIAL_TASKS];
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [...INITIAL_TASKS];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    renderBoard() {
        const container = document.querySelector('.kanban-container');
        if (!container) return;

        container.innerHTML = '';
        
        const columns = [
            { id: 'todo', title: 'To Do', icon: 'fas fa-tasks', color: 'todo' },
            { id: 'progress', title: 'In Progress', icon: 'fas fa-spinner', color: 'progress' },
            { id: 'done', title: 'Done', icon: 'fas fa-check-circle', color: 'done' }
        ];
        
        columns.forEach(column => {
            const columnEl = document.createElement('div');
            columnEl.className = 'kanban-column';
            columnEl.dataset.column = column.id;
            
            const tasksInColumn = this.tasks.filter(task => task.column === column.id);
            
            columnEl.innerHTML = `
                <div class="column-header ${column.color}">
                    <h3>
                        <i class="${column.icon}"></i>
                        ${column.title}
                    </h3>
                    <span class="column-count">${tasksInColumn.length}</span>
                </div>
                <div class="column-tasks" data-column="${column.id}">
                    ${tasksInColumn.length > 0 ? 
                        tasksInColumn.map(task => this.createTaskHTML(task)).join('') :
                        this.createEmptyStateHTML(column.id)
                    }
                </div>
            `;
            
            container.appendChild(columnEl);
        });
        
        this.attachTaskEventListeners();
        this.updateSummary();
    }

    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        
        return `
            <div class="task-card" 
                 data-task-id="${task.id}"
                 data-priority="${task.priority}"
                 draggable="true">
                <div class="task-header">
                    <h4 class="task-title">${task.title}</h4>
                    <div class="task-actions">
                        <button class="task-action-btn edit-task" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete-task" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="task-description">${task.description || 'No description provided.'}</p>
                <div class="task-meta">
                    <div class="task-info">
                        <span class="task-priority ${priorityClass}">${priorityLabel}</span>
                        <span class="task-estimate">${task.estimate}h</span>
                    </div>
                    <div class="task-assignee">
                        <i class="fas fa-user"></i>
                        <span>${task.assignee || 'Unassigned'}</span>
                    </div>
                </div>
                ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
            </div>
        `;
    }

    createEmptyStateHTML(columnId) {
        const messages = {
            todo: 'No tasks to do. Add a new task to get started!',
            progress: 'No tasks in progress. Move tasks here when you start working on them.',
            done: 'No tasks completed yet. Great work awaits!'
        };
        
        return `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${messages[columnId]}</p>
            </div>
        `;
    }

    attachTaskEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.editTask(taskId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    initDragAndDrop() {
        let draggedTask = null;
        
        // Drag start
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedTask = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            }
        });
        
        // Drag end
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
                draggedTask = null;
            }
            document.querySelectorAll('.kanban-column').forEach(col => {
                col.classList.remove('drop-over');
            });
        });
        
        // Drag over
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedTask) {
                e.dataTransfer.dropEffect = 'move';
                
                const column = e.target.closest('.kanban-column');
                if (column) {
                    document.querySelectorAll('.kanban-column').forEach(col => {
                        col.classList.remove('drop-over');
                    });
                    column.classList.add('drop-over');
                }
            }
        });
        
        // Drop
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const column = e.target.closest('.kanban-column');
            if (column && draggedTask) {
                const taskId = draggedTask.dataset.taskId;
                const newColumn = column.dataset.column;
                
                this.moveTask(taskId, newColumn);
                
                column.classList.remove('drop-over');
                draggedTask = null;
            }
        });
    }

    moveTask(taskId, newColumn) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].column = newColumn;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderBoard();
            
            window.intuivaApp?.showNotification(`Task moved to ${newColumn}`, 'success');
        }
    }

    showAddTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        this.currentEditTaskId = taskId;
        
        if (taskId) {
            // Edit mode
            title.textContent = 'Edit Task';
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskPriority').value = task.priority || 'medium';
                document.getElementById('taskAssignee').value = task.assignee || '';
                document.getElementById('taskEstimate').value = task.estimate || 2;
                document.getElementById('taskCategory').value = task.category || 'planning';
            }
        } else {
            // Add mode
            title.textContent = 'Add New Task';
            form.reset();
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskEstimate').value = 2;
            document.getElementById('taskCategory').value = 'planning';
        }
        
        modal.classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    editTask(taskId) {
        this.showAddTaskModal(taskId);
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderBoard();
            window.intuivaApp?.showNotification('Task deleted', 'success');
        }
    }

    saveTask() {
        const form = document.getElementById('taskForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const taskData = {
            id: this.currentEditTaskId || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            assignee: document.getElementById('taskAssignee').value || 'Unassigned',
            estimate: parseFloat(document.getElementById('taskEstimate').value) || 2,
            category: document.getElementById('taskCategory').value,
            column: this.currentEditTaskId ? 
                (this.tasks.find(t => t.id === this.currentEditTaskId)?.column || 'todo') : 'todo',
            createdAt: this.currentEditTaskId ? 
                (this.tasks.find(t => t.id === this.currentEditTaskId)?.createdAt || new Date().toISOString()) : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentEditTaskId) {
            // Update existing task
            const taskIndex = this.tasks.findIndex(task => task.id === this.currentEditTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            }
        } else {
            // Add new task
            this.tasks.push(taskData);
        }
        
        this.saveTasks();
        this.renderBoard();
        this.closeModal(document.getElementById('taskModal'));
        
        const message = this.currentEditTaskId ? 'Task updated' : 'Task added';
        window.intuivaApp?.showNotification(message, 'success');
        
        this.currentEditTaskId = null;
    }

    updateSummary() {
        const todoCount = this.tasks.filter(task => task.column === 'todo').length;
        const progressCount = this.tasks.filter(task => task.column === 'progress').length;
        const doneCount = this.tasks.filter(task => task.column === 'done').length;
        const totalCount = this.tasks.length;
        const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        
        document.getElementById('todoCount').textContent = `${todoCount} task${todoCount !== 1 ? 's' : ''}`;
        document.getElementById('progressCount').textContent = `${progressCount} task${progressCount !== 1 ? 's' : ''}`;
        document.getElementById('doneCount').textContent = `${doneCount} task${doneCount !== 1 ? 's' : ''}`;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    resetBoard() {
        if (confirm('Are you sure you want to reset the board? This will clear all tasks.')) {
            this.tasks = [...INITIAL_TASKS];
            this.saveTasks();
            this.renderBoard();
            window.intuivaApp?.showNotification('Board reset to initial state', 'info');
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            this.currentEditTaskId = null;
        }
    }
}

// Initialize Kanban board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('kanbanBoard').classList.contains('active')) {
        window.kanban = new KanbanBoard();
    }
});

// Export for use in other modules
export default KanbanBoard;
