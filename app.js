// Main Application Controller
class IntuivaApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.tasks = [];
        this.projects = [];
        this.currentProject = null;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadExistingData();
        this.setupTheme();
        this.checkPWAInstall();
        this.showFirstQuestion();
    }
    
    cacheElements() {
        // Questionnaire elements
        this.questionText = document.getElementById('questionText');
        this.answerInput = document.getElementById('answerInput');
        this.charCount = document.getElementById('charCount');
        this.questionCounter = document.getElementById('questionCounter');
        this.categoryBadge = document.getElementById('categoryBadge');
        this.progressFill = document.getElementById('progressFill');
        this.sectionInfo = document.getElementById('sectionInfo');
        
        // Navigation buttons
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.skipBtn = document.getElementById('skipBtn');
        
        // Sections
        this.questionnaireSection = document.getElementById('questionnaireSection');
        this.kanbanSection = document.getElementById('kanbanSection');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        // Controls
        this.newProjectBtn = document.getElementById('newProjectBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        
        // Category pills
        this.categoryPills = document.querySelectorAll('.category-pill');
        
        // Stats
        this.totalTasks = document.getElementById('totalTasks');
        this.inProgressTasks = document.getElementById('inProgressTasks');
        this.doneTasks = document.getElementById('doneTasks');
    }
    
    bindEvents() {
        // Navigation events
        this.prevBtn.addEventListener('click', () => this.showPreviousQuestion());
        this.nextBtn.addEventListener('click', () => this.showNextQuestion());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        
        // Input events
        this.answerInput.addEventListener('input', () => this.updateCharCount());
        this.answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                // Allow Shift+Enter for new lines
                return;
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.showNextQuestion();
            }
        });
        
        // Control events
        this.newProjectBtn.addEventListener('click', () => this.startNewProject());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.addTaskBtn.addEventListener('click', () => window.kanbanBoard?.showTaskModal());
        
        // Category navigation
        this.categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                const categoryId = parseInt(e.target.dataset.category);
                this.jumpToCategory(categoryId);
            });
        });
        
        // Install prompt
        document.getElementById('installBtn')?.addEventListener('click', () => {
            window.serviceWorkerHelpers?.installApp();
        });
        
        document.getElementById('dismissInstall')?.addEventListener('click', () => {
            document.getElementById('installPrompt').classList.remove('active');
        });
        
        // Task modal events
        document.getElementById('cancelTaskBtn')?.addEventListener('click', () => {
            document.getElementById('taskModal').classList.remove('active');
        });
        
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            document.getElementById('taskModal').classList.remove('active');
        });
        
        document.getElementById('saveTaskBtn')?.addEventListener('click', () => {
            window.kanbanBoard?.saveNewTask();
        });
        
        // Search functionality
        document.getElementById('taskSearch')?.addEventListener('input', (e) => {
            window.kanbanBoard?.filterTasks(e.target.value);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N for new project
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.startNewProject();
            }
            
            // Ctrl/Cmd + E for export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportData();
            }
            
            // Escape to close modal
            if (e.key === 'Escape') {
                const modal = document.getElementById('taskModal');
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            }
        });
    }
    
    loadExistingData() {
        // Load existing project if available
        const savedProject = DataUtils.loadFromStorage('current_project');
        const savedAnswers = DataUtils.loadFromStorage('answers');
        const savedTasks = DataUtils.loadFromStorage('tasks');
        
        if (savedProject && savedAnswers && savedAnswers.length > 0) {
            this.currentProject = savedProject;
            this.answers = savedAnswers;
            this.tasks = savedTasks || [];
            
            // If all questions answered, show kanban
            if (this.answers.length >= QUESTIONS.length) {
                this.showKanbanBoard();
            } else {
                // Continue where left off
                this.currentQuestionIndex = this.answers.length;
                this.showQuestion(this.currentQuestionIndex);
            }
        }
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('intuiva_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update toggle button icon
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('intuiva_theme', newTheme);
        
        // Update toggle button icon
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showToast(`Switched to ${newTheme} theme`, 'success');
    }
    
    showFirstQuestion() {
        if (this.answers.length === 0) {
            this.showQuestion(0);
        }
    }
    
    showQuestion(index) {
        if (index < 0 || index >= QUESTIONS.length) return;
        
        this.currentQuestionIndex = index;
        const question = QUESTIONS[index];
        
        // Update question text
        this.questionText.textContent = question.text;
        
        // Update counter
        this.questionCounter.textContent = `Question ${index + 1}/${QUESTIONS.length}`;
        
        // Update category badge
        this.categoryBadge.textContent = question.category;
        
        // Update progress bar
        const progress = ((index + 1) / QUESTIONS.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update section info
        this.sectionInfo.textContent = question.description;
        
        // Load existing answer if any
        const existingAnswer = this.answers.find(a => a.questionId === question.id);
        this.answerInput.value = existingAnswer?.text || '';
        this.updateCharCount();
        
        // Update navigation buttons
        this.prevBtn.disabled = index === 0;
        
        // Update category pills
        this.updateActiveCategory(question.categoryId);
        
        // Focus on input
        setTimeout(() => {
            this.answerInput.focus();
        }, 100);
    }
    
    showNextQuestion() {
        this.saveCurrentAnswer();
        
        if (this.currentQuestionIndex < QUESTIONS.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        } else {
            this.completeQuestionnaire();
        }
    }
    
    showPreviousQuestion() {
        this.saveCurrentAnswer();
        
        if (this.currentQuestionIndex > 0) {
            this.showQuestion(this.currentQuestionIndex - 1);
        }
    }
    
    skipQuestion() {
        this.saveCurrentAnswer(true);
        this.showNextQuestion();
    }
    
    saveCurrentAnswer(skip = false) {
        const question = QUESTIONS[this.currentQuestionIndex];
        const answerText = skip ? '' : this.answerInput.value.trim();
        
        const existingIndex = this.answers.findIndex(a => a.questionId === question.id);
        
        if (existingIndex >= 0) {
            this.answers[existingIndex] = {
                questionId: question.id,
                text: answerText,
                skipped: skip,
                timestamp: new Date().toISOString()
            };
        } else {
            this.answers.push({
                questionId: question.id,
                text: answerText,
                skipped: skip,
                timestamp: new Date().toISOString()
            });
        }
        
        // Save to storage
        DataUtils.saveToStorage('answers', this.answers);
    }
    
    updateCharCount() {
        const count = this.answerInput.value.length;
        this.charCount.textContent = count;
        
        if (count > 500) {
            this.charCount.style.color = 'var(--danger-color)';
        } else if (count > 400) {
            this.charCount.style.color = 'var(--warning-color)';
        } else {
            this.charCount.style.color = '';
        }
    }
    
    updateActiveCategory(categoryId) {
        this.categoryPills.forEach(pill => {
            if (parseInt(pill.dataset.category) === categoryId) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }
    
    jumpToCategory(categoryId) {
        // Find first question in this category
        const firstQuestionInCategory = QUESTIONS.findIndex(q => q.categoryId === categoryId);
        if (firstQuestionInCategory >= 0) {
            this.saveCurrentAnswer();
            this.showQuestion(firstQuestionInCategory);
        }
    }
    
    completeQuestionnaire() {
        this.showLoadingScreen();
        
        // Generate tasks from answers
        setTimeout(() => {
            this.tasks = DataUtils.generateTasksFromAnswers(this.answers);
            
            // Create project
            this.currentProject = {
                id: `project-${Date.now()}`,
                name: 'Lean Project',
                createdAt: new Date().toISOString(),
                answersCount: this.answers.filter(a => !a.skipped).length,
                totalQuestions: QUESTIONS.length
            };
            
            // Save everything
            DataUtils.saveToStorage('current_project', this.currentProject);
            DataUtils.saveToStorage('tasks', this.tasks);
            DataUtils.saveToStorage('answers', this.answers);
            
// Initialize kanban board
window.kanbanBoard = new KanbanBoard(this.tasks);

// Show kanban board
setTimeout(() => {
    this.hideLoadingScreen();
    this.showKanbanBoard();
    this.showToast('Kanban board generated successfully!', 'success');
}, 500);
            
        }, 1500);
    }
    
    showLoadingScreen() {
        this.loadingScreen.classList.add('active');
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            document.getElementById('loadingProgress').style.width = `${progress}%`;
            document.getElementById('loadingPercent').textContent = `${Math.round(progress)}%`;
        }, 100);
    }
    
    hideLoadingScreen() {
        this.loadingScreen.classList.remove('active');
    }
    
    showKanbanBoard() {
        this.questionnaireSection.classList.remove('active');
        this.kanbanSection.classList.add('active');
        
        // Update stats
        this.updateStats();
    }
    
    showQuestionnaire() {
        this.kanbanSection.classList.remove('active');
        this.questionnaireSection.classList.add('active');
    }
    
    startNewProject() {
        if (this.answers.length > 0 && !confirm('Starting a new project will clear current progress. Continue?')) {
            return;
        }
        
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.tasks = [];
        this.currentProject = null;
        
        DataUtils.clearStorage();
        
        this.showQuestionnaire();
        this.showQuestion(0);
        
        this.showToast('New project started', 'success');
    }
    
updateStats() {
    if (!window.kanbanBoard) return;
    
    const stats = window.kanbanBoard.getStats();
    if (stats) {
        this.totalTasks.textContent = stats.total;
        this.inProgressTasks.textContent = stats.inProgress;
        this.doneTasks.textContent = stats.done;
    }
}
    
    exportData() {
        const exportData = {
            project: this.currentProject,
            answers: this.answers,
            tasks: this.tasks,
            exportedAt: new Date().toISOString(),
            app: 'Intuiva',
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `intuiva-project-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        this.showToast('Project data exported', 'success');
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }
    
    checkPWAInstall() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            return;
        }
        
        // Show install prompt after 10 seconds
        setTimeout(() => {
            const installPrompt = document.getElementById('installPrompt');
            if (installPrompt && !localStorage.getItem('intuiva_install_dismissed')) {
                installPrompt.classList.add('active');
            }
        }, 10000);
        
        // Handle dismiss
        document.getElementById('dismissInstall')?.addEventListener('click', () => {
            localStorage.setItem('intuiva_install_dismissed', 'true');
        });
    }
}

// Kanban Board Class
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
            if (!container.querySelector('.empty-state')) {
                container.innerHTML = '';
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
            
            window.app?.showToast(`Task moved to ${newColumn}`, 'success');
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
            
            window.app?.showToast('Task deleted', 'success');
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
        document.getElementById('taskTitle').focus();
    }
    
    saveNewTask() {
        const modal = document.getElementById('taskModal');
        const taskId = modal.dataset.taskId;
        const columnId = modal.dataset.column;
        const isEdit = !!taskId;
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const assignee = document.getElementById('taskAssignee').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        if (isEdit) {
            // Update existing task
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.title = title;
                task.description = description;
                task.priority = priority;
                task.assignee = assignee || 'Unassigned';
                task.dueDate = dueDate;
                
                this.saveTasks();
                this.renderColumns();
                this.renderTasks();
                this.updateStats();
                
                window.app?.showToast('Task updated', 'success');
            }
        } else {
            // Create new task
            const newTask = {
                id: `task-${Date.now()}`,
                title,
                description,
                priority,
                assignee: assignee || 'Unassigned',
                assigneeId: this.getRandomAssigneeId(),
                column: columnId,
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
            
            window.app?.showToast('Task created', 'success');
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
                task.tags?.some(tag => tag.toLowerCase().includes(term))
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
        if (window.app) {
            window.app.updateStats();
        }
    }
    
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
        DataUtils.saveToStorage('tasks', this.tasks);
    }
    
    getAssigneeColor(assigneeId) {
        const member = TEAM_MEMBERS.find(m => m.id === assigneeId);
        return member ? member.color : '#4361ee';
    }
    
    getRandomAssigneeId() {
        const randomIndex = Math.floor(Math.random() * TEAM_MEMBERS.length);
        return TEAM_MEMBERS[randomIndex].id;
    }
    
    getDefaultDueDate() {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    }
}

// Initialize the app when DOM is loaded



// Handle online/offline status
window.addEventListener('online', () => {
    window.app?.showToast('Back online', 'success');
});

window.addEventListener('offline', () => {
    window.app?.showToast('You are offline. Changes will sync when back online.', 'warning');
});

// Prevent leaving page with unsaved changes
window.addEventListener('beforeunload', (e) => {
    const answers = DataUtils.loadFromStorage('answers');
    if (answers && answers.length > 0 && answers.length < QUESTIONS.length) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
});
