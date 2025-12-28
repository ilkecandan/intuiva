class IntuivaApp {
    constructor() {
        this.questions = this.getQuestions();
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.tasks = [];
        this.projectName = "My Project";
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadFromStorage();
    }

    getQuestions() {
        return [
            {
                id: "customer",
                title: "Who is the primary customer for this workflow?",
                description: "Identify the main beneficiary of your work. Is it an end-user, internal team, stakeholder, or someone else?"
            },
            {
                id: "definitionOfDone",
                title: "What is the single, clearest definition of 'Done'?",
                description: "Describe what indicates value was delivered to the customer in concrete terms."
            },
            {
                id: "specificOutcome",
                title: "What specific outcome does this process exist to create?",
                description: "What is the primary result or deliverable this workflow produces?"
            },
            {
                id: "delaySources",
                title: "What are the 3 biggest sources of delay or frustration in our current process?",
                description: "Identify waiting, transport, or other workflow inefficiencies."
            },
            {
                id: "reworkAreas",
                title: "Where do we most often have to do rework?",
                description: "Identify areas where defects or misunderstandings occur."
            },
            {
                id: "unusedWork",
                title: "Do we ever build things that aren't used or requested?",
                description: "Identify overproduction waste in your current process."
            },
            {
                id: "actualSteps",
                title: "Let's walk through the last 3-5 items we completed.",
                description: "What were all the steps they actually went through, from request to delivery?"
            },
            {
                id: "valueAddSteps",
                title: "Which steps add direct value vs. which are overhead?",
                description: "Differentiate between value-add steps and movement/waiting/control steps."
            },
            {
                id: "waitingPoints",
                title: "Where do items typically wait or get queued up?",
                description: "Identify natural bottlenecks in your workflow."
            },
            {
                id: "informalSteps",
                title: "Are there invisible or informal steps?",
                description: "Identify steps like impromptu chats for approval that should be visible."
            },
            {
                id: "workloadPerStage",
                title: "What is our current average workload per person/team at each stage?",
                description: "Help set reasonable WIP limits to prevent overload."
            },
            {
                id: "wipPolicy",
                title: "What is our policy when a WIP limit is reached?",
                description: "Do we stop and swarm, review processes, or take other actions?"
            },
            {
                id: "definitionOfReady",
                title: "What does 'Ready for QA' actually mean?",
                description: "Define explicit policies for moving items between columns."
            },
            {
                id: "blockedItems",
                title: "How will we visualize and handle blocked items?",
                description: "Define process for red stickies, blocker tags, or special columns."
            },
            {
                id: "workTriggers",
                title: "What triggers the start of new work?",
                description: "Is it when a slot opens, or scheduled planning meetings?"
            },
            {
                id: "backlogVisualization",
                title: "How will we visualize and prioritize the backlog?",
                description: "Define how items get 'pulled' into the first value-add column."
            },
            {
                id: "flowMetrics",
                title: "What key metrics will we track to measure flow?",
                description: "Consider Cycle Time, Throughput, or Cumulative Flow Diagrams."
            },
            {
                id: "reviewFrequency",
                title: "How often will we review the board's design and metrics?",
                description: "Weekly? At a dedicated Kanban meeting?"
            },
            {
                id: "escalationPath",
                title: "What is our escalation path for chronic bottlenecks?",
                description: "Define process for addressing broken workflows."
            },
            {
                id: "boardLevel",
                title: "Is this board for a team, service, or portfolio?",
                description: "Determine strategic vs. operational level."
            }
        ];
    }

    initializeApp() {
        this.updateQuestionDisplay();
        this.createNavigationDots();
        this.updateProgressBar();
        
        // Check if onboarding is already complete
        if (localStorage.getItem('intuiva_onboarding_complete')) {
            this.showApp();
        }
    }

    createNavigationDots() {
        const navDots = document.getElementById('navDots');
        navDots.innerHTML = '';
        
        this.questions.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.navigateToQuestion(index));
            navDots.appendChild(dot);
        });
    }

    updateNavigationDots() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentQuestionIndex);
            dot.classList.toggle('answered', !!this.answers[this.questions[index].id]);
        });
    }

    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;
    }

    updateQuestionDisplay() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        document.getElementById('questionTitle').textContent = currentQuestion.title;
        document.getElementById('questionDescription').textContent = currentQuestion.description;
        
        const answerInput = document.getElementById('answerInput');
        answerInput.value = this.answers[currentQuestion.id] || '';
        this.updateWordCount();
        
        this.updateNavigationDots();
        this.updateProgressBar();
        
        // Update button states
        document.getElementById('prevBtn').style.display = 
            this.currentQuestionIndex === 0 ? 'none' : 'flex';
            
        const nextBtn = document.getElementById('nextBtn');
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.innerHTML = 'Generate Board <i class="fas fa-rocket"></i>';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        }
    }

    updateWordCount() {
        const text = document.getElementById('answerInput').value;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        document.getElementById('wordCount').textContent = `${wordCount} words`;
    }

    saveCurrentAnswer() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const answer = document.getElementById('answerInput').value.trim();
        
        if (answer) {
            this.answers[currentQuestion.id] = answer;
        } else {
            delete this.answers[currentQuestion.id];
        }
    }

    navigateToQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        this.saveCurrentAnswer();
        this.currentQuestionIndex = index;
        this.updateQuestionDisplay();
    }

    async submitAnswers() {
        this.saveCurrentAnswer();
        
        // Check if we have enough answers
        const answeredQuestions = Object.keys(this.answers).length;
        if (answeredQuestions < 5) {
            this.showToast('Please answer at least 5 questions for better AI analysis', 'warning');
            return;
        }
        
        // Show AI processing modal
        this.showAIProcessing();
        
        try {
            // Send answers to backend for AI processing
            const response = await fetch(`${this.getBackendUrl()}/api/ai/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: this.answers,
                    projectName: this.projectName
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to analyze answers');
            }
            
            const data = await response.json();
            
            // Generate tasks from AI analysis
            this.generateTasksFromAI(data.tasks || []);
            
            // Save to localStorage
            this.saveToStorage();
            
            // Mark onboarding as complete
            localStorage.setItem('intuiva_onboarding_complete', 'true');
            
            // Hide onboarding and show main app
            setTimeout(() => {
                this.hideAIProcessing();
                this.showApp();
                this.showToast('Kanban board generated successfully!', 'success');
            }, 1000);
            
        } catch (error) {
            console.error('Error submitting answers:', error);
            this.hideAIProcessing();
            
            // Fallback: Generate sample tasks
            this.generateSampleTasks();
            localStorage.setItem('intuiva_onboarding_complete', 'true');
            this.showApp();
            this.showToast('Using sample tasks. AI analysis unavailable.', 'warning');
        }
    }

    generateTasksFromAI(aiTasks) {
        this.tasks = aiTasks.map((task, index) => ({
            id: `task-${Date.now()}-${index}`,
            title: task.title,
            description: task.description || '',
            column: 'todo',
            priority: task.priority || 'medium',
            assignee: task.assignee || 'unassigned',
            dueDate: task.dueDate || this.getFutureDate(7),
            tags: task.tags || [],
            createdAt: new Date().toISOString()
        }));
        
        this.renderTasks();
    }

    generateSampleTasks() {
        this.tasks = [
            {
                id: 'task-1',
                title: 'Define project scope and objectives',
                description: 'Clearly outline what the project will deliver and its success criteria',
                column: 'todo',
                priority: 'high',
                assignee: 'john',
                dueDate: this.getFutureDate(2),
                tags: ['planning', 'strategy'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-2',
                title: 'Set up development environment',
                description: 'Configure all necessary tools, repositories, and access permissions',
                column: 'todo',
                priority: 'high',
                assignee: 'sarah',
                dueDate: this.getFutureDate(1),
                tags: ['setup', 'devops'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-3',
                title: 'Create initial wireframes',
                description: 'Design basic wireframes for key user interfaces',
                column: 'todo',
                priority: 'medium',
                assignee: 'emma',
                dueDate: this.getFutureDate(3),
                tags: ['design', 'ui'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-4',
                title: 'Implement authentication system',
                description: 'Set up user authentication and authorization',
                column: 'todo',
                priority: 'medium',
                assignee: 'mike',
                dueDate: this.getFutureDate(5),
                tags: ['backend', 'security'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-5',
                title: 'Write unit tests for core modules',
                description: 'Create comprehensive test coverage for critical components',
                column: 'todo',
                priority: 'low',
                assignee: 'john',
                dueDate: this.getFutureDate(7),
                tags: ['testing', 'quality'],
                createdAt: new Date().toISOString()
            }
        ];
        
        this.renderTasks();
    }

    getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    showApp() {
        document.getElementById('onboardingModal').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        this.updateStats();
        
        // Initialize drag and drop
        this.initializeDragAndDrop();
    }

    showAIProcessing() {
        const modal = document.getElementById('aiProcessingModal');
        modal.classList.remove('hidden');
        
        // Simulate progress
        let progress = 0;
        const progressBar = document.getElementById('aiProgressBar');
        const statusMessage = document.getElementById('aiStatusMessage');
        
        const messages = [
            "Analyzing your workflow patterns...",
            "Identifying key deliverables...",
            "Generating task structure...",
            "Applying lean principles...",
            "Creating Kanban board..."
        ];
        
        const interval = setInterval(() => {
            progress += 20;
            progressBar.style.width = `${progress}%`;
            
            if (progress <= 100) {
                statusMessage.textContent = messages[Math.floor(progress / 20)] || messages[messages.length - 1];
            }
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 500);
    }

    hideAIProcessing() {
        document.getElementById('aiProcessingModal').classList.add('hidden');
    }

    setupEventListeners() {
        // Question navigation
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.navigateToQuestion(this.currentQuestionIndex - 1);
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex === this.questions.length - 1) {
                this.submitAnswers();
            } else {
                this.navigateToQuestion(this.currentQuestionIndex + 1);
            }
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.navigateToQuestion(this.currentQuestionIndex + 1);
        });
        
        // Answer input
        document.getElementById('answerInput').addEventListener('input', () => {
            this.updateWordCount();
        });
        
        // Task modal
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showTaskModal();
        });
        
        document.querySelectorAll('.add-task-column').forEach(button => {
            button.addEventListener('click', (e) => {
                const column = e.target.closest('button').dataset.column;
                this.showTaskModal(column);
            });
        });
        
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    showTaskModal(column = 'todo', taskId = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('taskModalTitle');
        
        if (taskId) {
            // Edit existing task
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Edit Task';
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskAssignee').value = task.assignee;
                document.getElementById('taskDueDate').value = task.dueDate;
                document.getElementById('taskColumn').value = task.column;
                document.getElementById('taskTags').value = task.tags.join(', ');
                
                // Store task ID for updating
                form.dataset.taskId = taskId;
            }
        } else {
            // Create new task
            title.textContent = 'Add New Task';
            form.reset();
            document.getElementById('taskColumn').value = column;
            delete form.dataset.taskId;
        }
        
        modal.classList.remove('hidden');
    }

    saveTask() {
        const form = document.getElementById('taskForm');
        const taskId = form.dataset.taskId;
        
        const task = {
            id: taskId || `task-${Date.now()}`,
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            column: document.getElementById('taskColumn').value,
            priority: document.getElementById('taskPriority').value,
            assignee: document.getElementById('taskAssignee').value,
            dueDate: document.getElementById('taskDueDate').value,
            tags: document.getElementById('taskTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag),
            createdAt: taskId ? this.tasks.find(t => t.id === taskId)?.createdAt : new Date().toISOString()
        };
        
        if (taskId) {
            // Update existing task
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks[index] = task;
            }
        } else {
            // Add new task
            this.tasks.push(task);
        }
        
        this.renderTasks();
        this.closeAllModals();
        this.showToast(`Task "${task.title}" ${taskId ? 'updated' : 'created'} successfully!`, 'success');
        this.saveToStorage();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.renderTasks();
            this.showToast('Task deleted successfully!', 'success');
            this.saveToStorage();
        }
    }

    moveTask(taskId, newColumn) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.column = newColumn;
            this.renderTasks();
            this.saveToStorage();
            
            // Update stats
            this.updateStats();
        }
    }

    renderTasks() {
        // Clear all columns
        ['todo', 'progress', 'done'].forEach(column => {
            const columnEl = document.getElementById(`${column}Column`);
            columnEl.innerHTML = '';
        });
        
        // Add tasks to their columns
        this.tasks.forEach(task => {
            const columnEl = document.getElementById(`${task.column}Column`);
            if (columnEl) {
                columnEl.appendChild(this.createTaskElement(task));
            }
        });
        
        // Update column counts
        this.updateColumnCounts();
        this.updateStats();
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-card';
        taskEl.dataset.taskId = task.id;
        taskEl.dataset.priority = task.priority;
        taskEl.draggable = true;
        
        // Format due date
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const today = new Date();
        const isOverdue = dueDate && dueDate < today && task.column !== 'done';
        
        taskEl.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="edit-task" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-task" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `
                <div class="task-description">${this.escapeHtml(task.description)}</div>
            ` : ''}
            <div class="task-footer">
                <div class="task-tags">
                    ${task.tags.map(tag => `
                        <span class="task-tag">${this.escapeHtml(tag)}</span>
                    `).join('')}
                </div>
                <div class="task-assignee">
                    <div class="assignee-avatar">
                        ${task.assignee === 'unassigned' ? '?' : task.assignee.charAt(0).toUpperCase()}
                    </div>
                    ${task.assignee === 'unassigned' ? 'Unassigned' : task.assignee}
                </div>
            </div>
            ${dueDate ? `
                <div class="task-due ${isOverdue ? 'overdue' : ''}">
                    <i class="far fa-calendar"></i>
                    ${dueDate.toLocaleDateString()}
                    ${isOverdue ? '<i class="fas fa-exclamation-triangle" style="color: #ef4444; margin-left: 4px;"></i>' : ''}
                </div>
            ` : ''}
        `;
        
        // Add event listeners
        taskEl.querySelector('.edit-task').addEventListener('click', () => {
            this.showTaskModal(null, task.id);
        });
        
        taskEl.querySelector('.delete-task').addEventListener('click', () => {
            this.deleteTask(task.id);
        });
        
        // Drag events
        taskEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            taskEl.classList.add('dragging');
        });
        
        taskEl.addEventListener('dragend', () => {
            taskEl.classList.remove('dragging');
            document.querySelectorAll('.column-content').forEach(col => {
                col.classList.remove('drag-over');
            });
        });
        
        return taskEl;
    }

    initializeDragAndDrop() {
        const columns = document.querySelectorAll('.column-content');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newColumn = column.dataset.column;
                
                this.moveTask(taskId, newColumn);
            });
        });
    }

    updateColumnCounts() {
        const counts = {
            todo: this.tasks.filter(t => t.column === 'todo').length,
            progress: this.tasks.filter(t => t.column === 'progress').length,
            done: this.tasks.filter(t => t.column === 'done').length
        };
        
        document.getElementById('todoColumnCount').textContent = counts.todo;
        document.getElementById('progressColumnCount').textContent = counts.progress;
        document.getElementById('doneColumnCount').textContent = counts.done;
    }

    updateStats() {
        const todoCount = this.tasks.filter(t => t.column === 'todo').length;
        const progressCount = this.tasks.filter(t => t.column === 'progress').length;
        const doneCount = this.tasks.filter(t => t.column === 'done').length;
        const totalCount = this.tasks.length;
        
        document.getElementById('todoCount').textContent = todoCount;
        document.getElementById('progressCount').textContent = progressCount;
        document.getElementById('doneCount').textContent = doneCount;
        document.getElementById('totalCount').textContent = totalCount;
    }

    showSettingsModal() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    saveSettings() {
        this.projectName = document.getElementById('boardName').value || 'My Project';
        document.getElementById('projectName').textContent = this.projectName;
        
        // Save to localStorage
        localStorage.setItem('intuiva_project_name', this.projectName);
        
        this.closeAllModals();
        this.showToast('Settings saved successfully!', 'success');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToStorage() {
        localStorage.setItem('intuiva_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('intuiva_answers', JSON.stringify(this.answers));
        localStorage.setItem('intuiva_project_name', this.projectName);
    }

    loadFromStorage() {
        const savedTasks = localStorage.getItem('intuiva_tasks');
        const savedAnswers = localStorage.getItem('intuiva_answers');
        const savedProjectName = localStorage.getItem('intuiva_project_name');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedAnswers) {
            this.answers = JSON.parse(savedAnswers);
        }
        
        if (savedProjectName) {
            this.projectName = savedProjectName;
            document.getElementById('projectName').textContent = this.projectName;
        }
    }

    getBackendUrl() {
        // In production, this would be your Railway backend URL
        // For development, use localhost
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:3000'
            : 'https://your-railway-app.up.railway.app';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Service Worker Registration - UPDATED FOR GITHUB PAGES
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Get the current path - important for GitHub Pages subdirectory
        const basePath = window.location.pathname.includes('/intuiva') 
            ? '/intuiva' 
            : '';
        
        const swPath = `${basePath}/service-worker.js`;
        
        console.log('Registering Service Worker at:', swPath);
        
        navigator.serviceWorker.register(swPath, {
            scope: basePath || './'
        })
        .then(registration => {
            console.log('✅ ServiceWorker registration successful with scope:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🔄 ServiceWorker update found!');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available
                        console.log('📦 New content is available, please refresh.');
                        if (confirm('New version of Intuiva available! Reload to update?')) {
                            window.location.reload();
                        }
                    }
                });
            });
        })
        .catch(err => {
            console.error('❌ ServiceWorker registration failed: ', err);
            
            // Fallback: Don't break the app if service worker fails
            console.log('Proceeding without Service Worker support');
        });
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.intuivaApp = new IntuivaApp();
});
