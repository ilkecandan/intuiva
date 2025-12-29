class KanbanBoard {
    constructor(tasks = [], appInstance = null) {
        this.tasks = tasks;
        this.app = appInstance; // Store app instance for translations
        this.columns = {};
        this._autoSaveTimeout = null;
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
        this.initKeyboardNavigation();
    }
    
    renderTasks() {
        // Clear all columns
        Object.values(this.columns).forEach(column => {
            if (column) {
                const emptyState = column.querySelector('.empty-state');
                column.innerHTML = '';
                if (emptyState) {
                    column.appendChild(emptyState.cloneNode(true));
                }
            }
        });
        
        // Render tasks in appropriate columns
        this.tasks.forEach(task => {
            this.renderTask(task);
        });
        
        // Add empty state if column is empty
        Object.entries(this.columns).forEach(([status, column]) => {
            if (column && column.children.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                
                // Safe translation function
                const t = this.app?.t || this.t || ((key) => key);
                
                emptyState.innerHTML = `
                    <i class="fas fa-clipboard-list"></i>
                    <p>${t('board.noTasks') || 'No tasks yet'}</p>
                    <small style="color: var(--color-text-muted); margin-top: 0.5rem; font-size: 0.75rem;">
                        ${t('board.addOrGenerate') || 'Add a task or generate with AI'}
                    </small>
                `;
                column.appendChild(emptyState);
            }
        });
        
        // Update column heights based on content
        this.adjustColumnHeights();
    }
    
    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.setAttribute('draggable', 'true');
        taskElement.dataset.taskId = task.id;
        taskElement.tabIndex = 0;
        
        const priorityClass = `task-priority ${task.priority}`;
        const description = task.description || '';
        
        // Format tags with proper escaping
        const tagsHtml = task.tags && task.tags.length > 0 
            ? task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')
            : '';
        
        // Get translated priority label
        let priorityLabel = task.priority;
        if (this.app?.t) {
            priorityLabel = this.app.t(`priority.${task.priority}`) || task.priority;
        }
        
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" title="${this.app?.t?.('help.click') || 'Edit'}" tabindex="-1">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task" title="${this.app?.t?.('help.delete') || 'Delete'}" tabindex="-1">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${description ? `<div class="task-description">${this.escapeHtml(description)}</div>` : ''}
            <div class="task-footer">
                <div class="task-tags">
                    ${tagsHtml}
                </div>
                <div class="${priorityClass}">${priorityLabel}</div>
            </div>
        `;
        
        // Add event listeners
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editTask(task.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(task.id);
            });
        }
        
        // Add click event to view task details
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-action-btn')) {
                this.viewTask(task.id);
            }
        });
        
        // Add keyboard navigation
        taskElement.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Enter':
                    this.editTask(task.id);
                    break;
                case 'Delete':
                    this.deleteTask(task.id);
                    break;
                case 'ArrowUp':
                    this.focusPreviousTask(task.id);
                    break;
                case 'ArrowDown':
                    this.focusNextTask(task.id);
                    break;
            }
        });
        
        // Append to correct column
        const column = this.columns[task.status];
        if (column) {
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
        this.triggerAutoSave();
        
        // Focus the new task
        setTimeout(() => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                taskElement.focus();
            }
        }, 100);
    }
    
    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            
            // Remove the task from DOM
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
            
            // Re-render the task in correct column
            this.renderTask(this.tasks[taskIndex]);
            this.updateStats();
            this.triggerAutoSave();
            
            // Show success message
            if (this.app) {
                this.app.showToast(this.app.t('toast.taskUpdated'), 'success');
            }
            return true;
        }
        return false;
    }
    
    deleteTask(taskId) {
        // Safe translation function
        const t = this.app?.t || ((key) => key);
        const confirmMessage = t('confirm.deleteTask') || 'Are you sure you want to delete this task?';
        const successMessage = t('toast.taskDeleted') || 'Task deleted successfully';
        
        if (confirm(confirmMessage)) {
            // Remove from data
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            
            // Remove from DOM
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
            
            // Re-render to check for empty states
            this.renderTasks();
            this.updateStats();
            this.triggerAutoSave();
            
            // Show toast notification
            if (this.app) {
                this.app.showToast(successMessage, 'success');
            }
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Get translation function
        const t = this.app?.t || ((key) => key);
        
        // Populate modal with task data
        const titleInput = document.getElementById('taskTitle');
        const descInput = document.getElementById('taskDescription');
        const priorityInput = document.getElementById('taskPriority');
        const statusInput = document.getElementById('taskStatus');
        const tagsInput = document.getElementById('taskTags');
        
        if (titleInput) titleInput.value = task.title;
        if (descInput) descInput.value = task.description || '';
        if (priorityInput) priorityInput.value = task.priority;
        if (statusInput) statusInput.value = task.status;
        if (tagsInput) tagsInput.value = task.tags ? task.tags.join(', ') : '';
        
        // Update modal title
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = t('modal.editTask') || 'Edit Task';
        }
        
        // Show modal
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.add('active');
        }
        
        // Remove any existing submit listeners
        const form = document.getElementById('taskForm');
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // Add new submit listener
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const updatedTask = {
                    title: document.getElementById('taskTitle')?.value?.trim() || '',
                    description: document.getElementById('taskDescription')?.value?.trim() || '',
                    priority: document.getElementById('taskPriority')?.value || 'medium',
                    status: document.getElementById('taskStatus')?.value || 'todo',
                    tags: (document.getElementById('taskTags')?.value || '')
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag)
                };
                
                if (this.updateTask(taskId, updatedTask)) {
                    if (modal) modal.classList.remove('active');
                    newForm.reset();
                }
            });
            
            // Focus on title field
            setTimeout(() => {
                const titleField = document.getElementById('taskTitle');
                if (titleField) titleField.focus();
            }, 100);
        }
    }
    
    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Create a simple toast notification for quick view
        if (this.app) {
            const message = `📋 ${task.title}\n📝 ${task.description || 'No description'}\n🏷️ ${task.tags?.join(', ') || 'No tags'}`;
            this.app.showToast(message, 'info');
        }
    }
    
    clearTasks() {
        this.tasks = [];
        this.renderTasks();
        this.updateStats();
        this.triggerAutoSave();
    }
    
    initDragAndDrop() {
        let draggedTask = null;
        let draggedTaskId = null;
        
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedTask = e.target;
                draggedTaskId = e.target.dataset.taskId;
                e.target.classList.add('dragging');
                
                // Set drag image
                e.dataTransfer.setData('text/plain', draggedTaskId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
                draggedTask = null;
                draggedTaskId = null;
                
                // Remove drag-over styles
                document.querySelectorAll('.column-content').forEach(col => {
                    col.classList.remove('drag-over');
                });
            }
        });
        
        // Add drop zone event listeners to columns
        Object.entries(this.columns).forEach(([status, column]) => {
            if (!column) return;
            
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
                
                if (draggedTaskId) {
                    const taskId = draggedTaskId;
                    const newStatus = column.parentElement?.dataset?.status || status;
                    
                    // Update task status
                    this.updateTask(taskId, { status: newStatus });
                    
                    // Show feedback
                    if (this.app) {
                        const statusLabel = this.getStatusLabel(newStatus);
                        const message = `Task moved to ${statusLabel}`;
                        this.app.showToast(message, 'info');
                    }
                }
            });
        });
    }
    
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const focusedTask = document.querySelector('.task-card:focus');
                if (focusedTask) {
                    focusedTask.blur();
                }
            }
        });
    }
    
    focusPreviousTask(currentTaskId) {
        const tasks = Array.from(document.querySelectorAll('.task-card'));
        const currentIndex = tasks.findIndex(task => task.dataset.taskId === currentTaskId);
        if (currentIndex > 0) {
            tasks[currentIndex - 1].focus();
        }
    }
    
    focusNextTask(currentTaskId) {
        const tasks = Array.from(document.querySelectorAll('.task-card'));
        const currentIndex = tasks.findIndex(task => task.dataset.taskId === currentTaskId);
        if (currentIndex < tasks.length - 1) {
            tasks[currentIndex + 1].focus();
        }
    }
    
    adjustColumnHeights() {
        Object.values(this.columns).forEach(column => {
            if (column) {
                const content = column.querySelector('.column-content') || column;
                const taskCount = content.children.length;
                if (taskCount === 0) {
                    content.style.minHeight = '150px';
                } else if (taskCount < 3) {
                    content.style.minHeight = '200px';
                } else {
                    content.style.minHeight = '250px';
                }
            }
        });
    }
    
    updateStats() {
        const stats = this.getStats();
        
        // Update column counts
        const todoCount = document.getElementById('todoCount');
        const inprogressCount = document.getElementById('inprogressCount');
        const doneCount = document.getElementById('doneCount');
        
        if (todoCount) todoCount.textContent = stats.todo;
        if (inprogressCount) inprogressCount.textContent = stats.inProgress;
        if (doneCount) doneCount.textContent = stats.done;
        
        // Update global stats if app exists
        if (this.app) {
            this.app.updateStats();
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
        if (this.app?.t) {
            return this.app.t(`status.${status}`) || status;
        }
        
        const labels = {
            todo: 'To Do',
            inprogress: 'In Progress',
            done: 'Done'
        };
        return labels[status] || status;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    triggerAutoSave() {
        if (this.app) {
            // Trigger auto-save with a small delay to batch multiple updates
            clearTimeout(this._autoSaveTimeout);
            this._autoSaveTimeout = setTimeout(() => {
                this.app.saveProject();
            }, 500);
        }
    }
    
    // Simple translation function fallback
    t(key) {
        if (this.app?.t) {
            return this.app.t(key);
        }
        return key;
    }
}

// Make KanbanBoard available globally
window.KanbanBoard = KanbanBoard;

// Add CSS for task detail view
const style = document.createElement('style');
style.textContent = `
    .task-detail {
        padding: 0.75rem;
    }
    
    .task-detail h3 {
        margin-bottom: 0.75rem;
        color: var(--color-text);
        font-size: 1rem;
    }
    
    .task-detail-description {
        color: var(--color-text-secondary);
        line-height: 1.5;
        margin-bottom: 1rem;
        white-space: pre-wrap;
        font-size: 0.875rem;
    }
    
    .task-detail-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
    }
    
    .meta-item {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }
    
    .meta-item strong {
        color: var(--color-text-secondary);
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .task-status.todo {
        color: var(--color-warning);
        background-color: rgba(245, 158, 11, 0.1);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-full);
        font-size: 0.6875rem;
        font-weight: 500;
    }
    
    .task-status.inprogress {
        color: var(--color-info);
        background-color: rgba(59, 130, 246, 0.1);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-full);
        font-size: 0.6875rem;
        font-weight: 500;
    }
    
    .task-status.done {
        color: var(--color-success);
        background-color: rgba(16, 185, 129, 0.1);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-full);
        font-size: 0.6875rem;
        font-weight: 500;
    }
    
    .task-card:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
    }
`;
document.head.appendChild(style);
