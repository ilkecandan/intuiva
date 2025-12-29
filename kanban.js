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
            // Keep only the empty state if present, remove everything else
            const emptyState = column.querySelector('.empty-state');
            column.innerHTML = '';
            if (emptyState) {
                column.appendChild(emptyState);
            }
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
                const t = window.intuivaApp ? window.intuivaApp.t : (key) => key;
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
    }
    
    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.setAttribute('draggable', 'true');
        taskElement.dataset.taskId = task.id;
        
        const priorityClass = `task-priority ${task.priority}`;
        const description = task.description || '';
        
        // Format tags with proper escaping
        const tagsHtml = task.tags && task.tags.length > 0 
            ? task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')
            : '';
        
        // Get translated priority label
        let priorityLabel = task.priority;
        if (window.intuivaApp) {
            const t = window.intuivaApp.t;
            priorityLabel = t(`priority.${task.priority}`) || task.priority;
        }
        
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" title="${window.intuivaApp ? window.intuivaApp.t('help.click') : 'Edit'}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task" title="${window.intuivaApp ? window.intuivaApp.t('help.delete') : 'Delete'}">
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
        this.triggerAutoSave();
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
            return true;
        }
        return false;
    }
    
    deleteTask(taskId) {
        const t = window.intuivaApp ? window.intuivaApp.t : (key) => key;
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
            if (window.intuivaApp) {
                window.intuivaApp.showToast(successMessage, 'success');
            }
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Get translation function
        const t = window.intuivaApp ? window.intuivaApp.t : (key) => key;
        
        // Populate modal with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
        
        // Update modal title
        document.getElementById('modalTitle').textContent = t('modal.editTask') || 'Edit Task';
        
        // Update form placeholders if they exist
        const titleInput = document.getElementById('taskTitle');
        const descInput = document.getElementById('taskDescription');
        const tagsInput = document.getElementById('taskTags');
        
        if (titleInput && titleInput.getAttribute('data-i18n-placeholder')) {
            titleInput.placeholder = t(titleInput.getAttribute('data-i18n-placeholder'));
        }
        if (descInput && descInput.getAttribute('data-i18n-placeholder')) {
            descInput.placeholder = t(descInput.getAttribute('data-i18n-placeholder'));
        }
        if (tagsInput && tagsInput.getAttribute('data-i18n-placeholder')) {
            tagsInput.placeholder = t(tagsInput.getAttribute('data-i18n-placeholder'));
        }
        
        // Show modal
        document.getElementById('taskModal').classList.add('active');
        
        // Remove any existing submit listeners
        const form = document.getElementById('taskForm');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add new submit listener
        newForm.addEventListener('submit', (e) => {
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
                newForm.reset();
                
                if (window.intuivaApp) {
                    const successMessage = t('toast.taskUpdated') || 'Task updated successfully!';
                    window.intuivaApp.showToast(successMessage, 'success');
                }
            }
        });
        
        // Focus on title field
        setTimeout(() => {
            document.getElementById('taskTitle').focus();
        }, 100);
    }
    
    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Create a detailed view modal
        const modalContent = `
            <div class="task-detail">
                <h3>${this.escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-detail-description">${this.escapeHtml(task.description)}</p>` : ''}
                <div class="task-detail-meta">
                    <div class="meta-item">
                        <strong>Status:</strong>
                        <span class="task-status ${task.status}">${this.getStatusLabel(task.status)}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Priority:</strong>
                        <span class="task-priority ${task.priority}">${window.intuivaApp ? window.intuivaApp.t(`priority.${task.priority}`) : task.priority}</span>
                    </div>
                    ${task.tags && task.tags.length > 0 ? `
                    <div class="meta-item">
                        <strong>Tags:</strong>
                        <div class="task-tags">${task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')}</div>
                    </div>` : ''}
                    ${task.createdAt ? `
                    <div class="meta-item">
                        <strong>Created:</strong>
                        <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
        
        // Show in a modal or toast
        if (window.intuivaApp) {
            window.intuivaApp.showToast(`Viewing: ${task.title}`, 'info');
            
            // Optional: You could create a detailed view modal here
            // For now, we'll just show the toast
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
        
        // Add drag event listeners to task cards
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
                
                if (draggedTaskId) {
                    const taskId = draggedTaskId;
                    const newStatus = column.parentElement.dataset.status;
                    
                    // Remove the dragged element from DOM
                    if (draggedTask) {
                        draggedTask.remove();
                    }
                    
                    // Update task status in data model
                    this.updateTask(taskId, { status: newStatus });
                    
                    // Show feedback
                    if (window.intuivaApp) {
                        const t = window.intuivaApp.t;
                        const statusLabel = this.getStatusLabel(newStatus);
                        const message = t ? `Task moved to ${statusLabel}` : `Task moved to ${this.getStatusLabel(newStatus)}`;
                        window.intuivaApp.showToast(message, 'info');
                    }
                }
            });
        });
    }
    
    updateStats() {
        const stats = this.getStats();
        
        // Update column counts
        document.getElementById('todoCount').textContent = stats.todo;
        document.getElementById('inprogressCount').textContent = stats.inProgress;
        document.getElementById('doneCount').textContent = stats.done;
        
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
        if (window.intuivaApp) {
            const t = window.intuivaApp.t;
            return t(`status.${status}`) || status;
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
        if (window.intuivaApp) {
            // Trigger auto-save with a small delay to batch multiple updates
            clearTimeout(this._autoSaveTimeout);
            this._autoSaveTimeout = setTimeout(() => {
                window.intuivaApp.saveProject();
            }, 1000);
        }
    }
}

// Make KanbanBoard available globally
window.KanbanBoard = KanbanBoard;

// Add CSS for task detail view
const style = document.createElement('style');
style.textContent = `
    .task-detail {
        padding: 1rem;
    }
    
    .task-detail h3 {
        margin-bottom: 1rem;
        color: var(--color-text);
        font-size: 1.25rem;
    }
    
    .task-detail-description {
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin-bottom: 1.5rem;
        white-space: pre-wrap;
    }
    
    .task-detail-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    .meta-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .meta-item strong {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .task-status.todo {
        color: var(--color-warning);
        background-color: rgba(245, 158, 11, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .task-status.inprogress {
        color: var(--color-info);
        background-color: rgba(59, 130, 246, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .task-status.done {
        color: var(--color-success);
        background-color: rgba(16, 185, 129, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);
