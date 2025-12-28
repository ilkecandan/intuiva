// Kanban Board Class - Fix the getStats method
class KanbanBoard {
    constructor(tasks = []) {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        this.draggedTask = null;
        
        this.init();
    }
    
    init() {
        this.renderColumns();
        this.renderTasks();
        this.setupDragAndDrop();
        this.updateStats();
    }
    
    renderColumns() {
        const board = document.getElementById('kanbanBoard');
        if (!board) return;
        
        board.innerHTML = '';
        
        KANBAN_COLUMNS.forEach(column => {
            const columnElement = document.createElement('div');
            columnElement.className = 'kanban-column';
            columnElement.dataset.column = column.id;
            
            const tasksInColumn = this.tasks.filter(task => task.column === column.id);
            
            columnElement.innerHTML = `
                <div class="column-header">
                    <div class="column-title">
                        <h3>${column.title}</h3>
                        <span class="column-count">${tasksInColumn.length}</span>
                    </div>
                    <div class="column-actions">
                        <button class="add-column-task" title="Add task">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="collapse-column" title="Collapse">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                    </div>
                </div>
                <div class="column-tasks" data-column="${column.id}">
                    ${tasksInColumn.length === 0 ? 
                        `<div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>No tasks here</p>
                        </div>` : ''
                    }
                </div>
            `;
            
            board.appendChild(columnElement);
            
            // Add event listener for add button
            columnElement.querySelector('.add-column-task').addEventListener('click', () => {
                this.showTaskModal(column.id);
            });
        });
    }
    
    renderTasks() {
        // Clear all task containers first
        document.querySelectorAll('.column-tasks').forEach(container => {
            if (container.querySelector('.empty-state')) {
                container.innerHTML = '';
            }
        });
        
        // Add empty state to empty columns
        KANBAN_COLUMNS.forEach(column => {
            const columnContainer = document.querySelector(`.column-tasks[data-column="${column.id}"]`);
            if (columnContainer && columnContainer.children.length === 0) {
                const tasksInColumn = this.filteredTasks.filter(task => task.column === column.id);
                if (tasksInColumn.length === 0) {
                    columnContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>No tasks here</p>
                        </div>
                    `;
                }
            }
        });
        
        // Render filtered tasks
        this.filteredTasks.forEach(task => {
            this.renderTask(task);
        });
        
        // Update column counts
        this.updateColumnCounts();
    }
    
    renderTask(task) {
        const columnContainer = document.querySelector(`.column-tasks[data-column="${task.column}"]`);
        if (!columnContainer) return;
        
        // Remove empty state if present
        const emptyState = columnContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.priority}`;
        taskElement.dataset.taskId = task.id;
        taskElement.draggable = true;
        
        const initials = DataUtils.getInitials(task.assignee);
        const dueDate = DataUtils.formatDate(task.dueDate);
        const isOverdue = DataUtils.isOverdue(task.dueDate);
        const priorityLabel = DataUtils.getPriorityLabel(task.priority);
        
        taskElement.innerHTML = `
            <div class="task-header">
                <h4 class="task-title">${task.title}</h4>
                <span class="task-priority ${task.priority}">${priorityLabel}</span>
            </div>
            <p class="task-description">${task.description}</p>
            <div class="task-footer">
                <div class="task-assignee">
                    <div class="assignee-avatar" style="background-color: ${this.getAssigneeColor(task.assigneeId)}">
                        ${initials}
                    </div>
                    <span>${task.assignee}</span>
                </div>
                <div class="task-due ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${dueDate}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-task" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-task" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        columnContainer.appendChild(taskElement);
        
        // Add event listeners
        taskElement.querySelector('.edit-task').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask(task.id);
        });
        
        taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });
        
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-actions')) {
                this.viewTask(task.id);
            }
        });
    }
    
    setupDragAndDrop() {
        // Drag start
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                this.draggedTask = e.target;
                e.target.classList.add('dragging');
                
                // Set drag image
                setTimeout(() => {
                    e.target.style.opacity = '0.4';
                }, 0);
            }
        });
        
        // Drag end
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
                e.target.style.opacity = '1';
                this.draggedTask = null;
                
                // Remove drag-over classes
                document.querySelectorAll('.column-tasks').forEach(col => {
                    col.classList.remove('drag-over');
                });
            }
        });
        
        // Drag over
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            const columnTasks = e.target.closest('.column-tasks');
            if (columnTasks) {
                columnTasks.classList.add('drag-over');
            }
        });
        
        // Drag leave
        document.addEventListener('dragleave', (e) => {
            const columnTasks = e.target.closest('.column-tasks');
            if (columnTasks) {
                columnTasks.classList.remove('drag-over');
            }
        });
        
        // Drop
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const columnTasks = e.target.closest('.column-tasks');
            if (columnTasks && this.draggedTask) {
                const newColumn = columnTasks.dataset.column;
                const taskId = this.draggedTask.dataset.taskId;
                
                this.moveTask(taskId, newColumn);
                columnTasks.appendChild(this.draggedTask);
                columnTasks.classList.remove('drag-over');
                
                // Update task in array
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.column = newColumn;
                    this.saveTasks();
                    this.updateStats();
                    this.updateColumnCounts();
                }
            }
        });
    }
    
    moveTask(taskId, newColumn) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.column = newColumn;
            this.saveTasks();
            this.updateColumnCounts();
            
            if (window.app && window.app.showToast) {
                window.app.showToast(`Task moved to ${newColumn}`, 'success');
            }
        }
    }
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.filteredTasks = this.filteredTasks.filter(task => task.id !== taskId);
            
            this.saveTasks();
            this.renderColumns();
            this.renderTasks();
            this.updateStats();
            
            if (window.app && window.app.showToast) {
                window.app.showToast('Task deleted', 'success');
            }
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.showTaskModal(task.column, task);
    }
    
    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Show detailed view modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${task.title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-detail">
                        <div class="detail-section">
                            <h4>Description</h4>
                            <p>${task.description}</p>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Priority</span>
                                <span class="task-priority ${task.priority}">${DataUtils.getPriorityLabel(task.priority)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Assignee</span>
                                <div class="task-assignee">
                                    <div class="assignee-avatar" style="background-color: ${this.getAssigneeColor(task.assigneeId)}">
                                        ${DataUtils.getInitials(task.assignee)}
                                    </div>
                                    <span>${task.assignee}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Due Date</span>
                                <span class="${DataUtils.isOverdue(task.dueDate) ? 'overdue' : ''}">
                                    ${new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Status</span>
                                <span class="status-badge">${task.column}</span>
                            </div>
                        </div>
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="detail-section">
                                <h4>Tags</h4>
                                <div class="tags-container">
                                    ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${task.estimate ? `
                            <div class="detail-section">
                                <h4>Estimate</h4>
                                <p>${task.estimate}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary close-detail">Close</button>
                    <button class="btn-primary edit-detail">Edit Task</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-detail').addEventListener('click', () => modal.remove());
        modal.querySelector('.edit-detail').addEventListener('click', () => {
            modal.remove();
            this.editTask(taskId);
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    showTaskModal(columnId = 'todo', task = null) {
        const modal = document.getElementById('taskModal');
        if (!modal) return;
        
        const isEdit = !!task;
        
        // Set title
        modal.querySelector('h3').textContent = isEdit ? 'Edit Task' : 'Add New Task';
        
        // Clear or populate form
        if (isEdit) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskAssignee').value = task.assignee;
            document.getElementById('taskDueDate').value = task.dueDate;
        } else {
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskAssignee').value = '';
            document.getElementById('taskDueDate').value = '';
        }
        
        // Store task ID for editing
        modal.dataset.taskId = task?.id || '';
        modal.dataset.column = columnId;
        
        modal.classList.add('active');
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('taskTitle').focus();
        }, 100);
    }
    
    saveNewTask() {
        const modal = document.getElementById('taskModal');
        if (!modal) return;
        
        const taskId = modal.dataset.taskId;
        const columnId = modal.dataset.column;
        const isEdit = !!taskId;
        
        const title = document.getElementById('taskTitle')?.value.trim();
        const description = document.getElementById('taskDescription')?.value.trim();
        const priority = document.getElementById('taskPriority')?.value;
        const assignee = document.getElementById('taskAssignee')?.value.trim();
        const dueDate = document.getElementById('taskDueDate')?.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        if (isEdit) {
            // Update existing task
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.title = title;
                task.description = description || task.description;
                task.priority = priority || task.priority;
                task.assignee = assignee || task.assignee || 'Unassigned';
                task.dueDate = dueDate || task.dueDate;
                
                this.saveTasks();
                this.renderColumns();
                this.renderTasks();
                this.updateStats();
                
                if (window.app && window.app.showToast) {
                    window.app.showToast('Task updated', 'success');
                }
            }
        } else {
            // Create new task
            const newTask = {
                id: `task-${Date.now()}`,
                title,
                description: description || '',
                priority: priority || 'medium',
                assignee: assignee || 'Unassigned',
                assigneeId: this.getRandomAssigneeId(),
                column: columnId || 'todo',
                createdAt: new Date().toISOString(),
                dueDate: dueDate || this.getDefaultDueDate(),
                tags: [],
                estimate: '2h'
            };
            
            this.tasks.push(newTask);
            this.filteredTasks.push(newTask);
            
            this.saveTasks();
            this.renderColumns();
            this.renderTasks();
            this.updateStats();
            
            if (window.app && window.app.showToast) {
                window.app.showToast('Task created', 'success');
            }
        }
        
        modal.classList.remove('active');
    }
    
    filterTasks(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            this.filteredTasks = [...this.tasks];
        } else {
            this.filteredTasks = this.tasks.filter(task => 
                task.title.toLowerCase().includes(term) ||
                task.description.toLowerCase().includes(term) ||
                task.assignee.toLowerCase().includes(term) ||
                (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
            );
        }
        
        this.renderTasks();
    }
    
    updateColumnCounts() {
        KANBAN_COLUMNS.forEach(column => {
            const count = this.tasks.filter(task => task.column === column.id).length;
            const countElement = document.querySelector(`[data-column="${column.id}"] .column-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }
    
    updateStats() {
        if (window.app && window.app.updateStats) {
            window.app.updateStats();
        }
    }
    
    // FIXED: Add getStats method
    getStats() {
        return {
            total: this.tasks.length,
            todo: this.tasks.filter(t => t.column === 'todo').length,
            inProgress: this.tasks.filter(t => t.column === 'inprogress').length,
            review: this.tasks.filter(t => t.column === 'review').length,
            done: this.tasks.filter(t => t.column === 'done').length
        };
    }
    
    saveTasks() {
        if (DataUtils && DataUtils.saveToStorage) {
            DataUtils.saveToStorage('tasks', this.tasks);
        }
    }
    
    getAssigneeColor(assigneeId) {
        if (!TEAM_MEMBERS) return '#4361ee';
        const member = TEAM_MEMBERS.find(m => m.id === assigneeId);
        return member ? member.color : '#4361ee';
    }
    
    getRandomAssigneeId() {
        if (!TEAM_MEMBERS || TEAM_MEMBERS.length === 0) return 1;
        const randomIndex = Math.floor(Math.random() * TEAM_MEMBERS.length);
        return TEAM_MEMBERS[randomIndex].id;
    }
    
    getDefaultDueDate() {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    }
}

// Make KanbanBoard available globally
window.KanbanBoard = KanbanBoard;
