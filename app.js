class IntuivaApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.tasks = [];
        this.kanbanBoard = null;
        this.isGeneratingTasks = false;
        this.currentScreen = 'onboarding';
        
        this.init();
    }
    

    init() {
        // Initialize screens
        this.screens = {
            onboarding: document.getElementById('onboarding'),
            questionnaire: document.getElementById('questionnaire'),
            kanbanBoard: document.getElementById('kanbanBoard')
        };
        
        // Initialize buttons
        this.initButtons();
        
        // Initialize navigation
        this.initNavigation();
        
        // Initialize questionnaire
        this.initQuestionnaire();
        
        // Initialize modals
        this.initModals();
        
        // Initialize drag and drop
        this.initDragAndDrop();
        
        // Show onboarding screen
        this.showScreen('onboarding');
        
        // Check for existing data
        this.loadFromLocalStorage();
        
        // Initialize theme
        this.initTheme();
        
        // Update character counter
        this.initCharCounter();
        
        console.log('Intuiva App initialized successfully');
    }

    initButtons() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.navigateTo('questionnaire');
            this.loadQuestion(0);
        });
        
        // Skip to board button
        document.getElementById('skipBtn').addEventListener('click', () => {
            // Clear all data
            this.tasks = []; // Empty array
            this.answers = {}; // Clear answers
            this.currentQuestionIndex = 0; // Reset question index
            
            // Clear localStorage to prevent loading old data
            try {
                localStorage.removeItem('intuiva-data');
            } catch (e) {
                console.warn('Failed to clear localStorage:', e);
            }
            
            // Clear any existing kanban board
            if (this.kanbanBoard) {
                this.kanbanBoard.clearTasks();
            }
            
            // Navigate to kanban board
            this.navigateTo('kanbanBoard');

            // Force an empty board
            if (this.kanbanBoard) {
                this.kanbanBoard.tasks = [];
                this.kanbanBoard.renderTasks();
                this.updateStats();
            }
            
            this.showToast('Started with empty board', 'info');
        });
        
        // Clear All button (if you added it)
        if (document.getElementById('clearAllBtn')) {
            document.getElementById('clearAllBtn').addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
                    this.tasks = [];
                    if (this.kanbanBoard) {
                        this.kanbanBoard.clearTasks();
                    }
                    this.updateStats();
                    this.saveToLocalStorage();
                    this.showToast('All tasks cleared', 'info');
                }
            });
        }
        
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        
        // Question action buttons
        document.getElementById('skipQuestionBtn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('notAnswerBtn').addEventListener('click', () => this.markAsNotApplicable());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAnswer());
        
        // Board action buttons
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('regenerateBtn').addEventListener('click', () => this.regenerateTasks());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportBoard());
        
        // Add task buttons in columns
        document.querySelectorAll('.btn-add-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const column = e.currentTarget.dataset.column;
                this.openTaskModal(column);
            });
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Help button
        document.getElementById('helpBtn').addEventListener('click', () => {
            document.getElementById('helpModal').classList.add('active');
        });
    }

    initNavigation() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.navigateTo(screen);
            });
        });
        
        // Back to questions button
        document.getElementById('backToQuestionsBtn').addEventListener('click', () => {
            this.navigateTo('questionnaire');
        });
        
        // Update active nav button based on current screen
        this.updateActiveNav();
    }

    navigateTo(screenName) {
        // Save current answer if we're leaving questionnaire
        if (this.currentScreen === 'questionnaire') {
            this.saveAnswer(document.getElementById('answerInput').value);
        }
        
        // Show the requested screen
        this.showScreen(screenName);
        
        // Update current screen
        this.currentScreen = screenName;
        
        // Update active nav button
        this.updateActiveNav();
        
        // If navigating to questionnaire, load current question
        if (screenName === 'questionnaire') {
            this.loadQuestion(this.currentQuestionIndex);
        }
        
        // If navigating to kanban, ensure board is initialized WITH CURRENT TASKS
        if (screenName === 'kanbanBoard') {
            if (!this.kanbanBoard) {
                // Initialize with current tasks
                this.kanbanBoard = new KanbanBoard(this.tasks);
            } else {
                // If board already exists, refresh it with current tasks
                this.kanbanBoard.tasks = this.tasks;
                this.kanbanBoard.renderTasks(); // Make sure to re-render
            }
            this.updateStats();
        }
    }

    updateActiveNav() {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.screen === this.currentScreen) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    initQuestionnaire() {
        this.questions = QUESTIONS;
        this.totalQuestions = this.questions.length;
        
        // Initialize answer input event
        const answerInput = document.getElementById('answerInput');
        answerInput.addEventListener('input', (e) => {
            this.saveAnswer(e.target.value);
            this.updateCharCounter();
        });
        
        // Add keyboard shortcuts
        answerInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.nextQuestion();
            } else if (e.key === 'Escape') {
                this.clearAnswer();
            }
        });
    }

    initModals() {
        // Task modal
        this.taskModal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
                this.taskForm.reset();
            });
        });
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    this.taskForm.reset();
                }
            });
        });
        
        // Task form submission
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Help modal
        this.helpModal = document.getElementById('helpModal');
    }
    
    
    initDragAndDrop() {
        // This will be initialized by the KanbanBoard class
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('intuiva-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    initCharCounter() {
        this.updateCharCounter();
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
        
        // Update active nav button
        this.updateActiveNav();
        
        // Initialize kanban board if showing kanban
        if (screenName === 'kanbanBoard' && !this.kanbanBoard) {
            this.kanbanBoard = new KanbanBoard(this.tasks);
        }
    }
    
    loadQuestion(index) {
        if (index < 0 || index >= this.totalQuestions) {
            this.showKanbanBoard();
            return;
        }
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        // Update UI
        document.getElementById('questionNumber').textContent = `Q${index + 1}`;
        document.getElementById('questionTitle').textContent = question.category;
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('categoryTitle').textContent = question.category;
        
        // Update progress
        const progress = ((index + 1) / this.totalQuestions) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Question ${index + 1} of ${this.totalQuestions}`;
        
        // Load saved answer
        const answerInput = document.getElementById('answerInput');
        answerInput.value = this.answers[index] || '';
        answerInput.focus();
        
        // Update character counter
        this.updateCharCounter();
        
        // Update button states
        document.getElementById('prevBtn').disabled = index === 0;
        
        // Update next button text for last question
        document.getElementById('nextBtn').innerHTML = index === this.totalQuestions - 1 
            ? 'Generate Kanban Board <i class="fas fa-arrow-right"></i>' 
            : 'Next <i class="fas fa-arrow-right"></i>';
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.loadQuestion(this.currentQuestionIndex - 1);
        }
    }
    
    nextQuestion() {
        // Save current answer
        this.saveAnswer(document.getElementById('answerInput').value);
        
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        } else {
            // Generate tasks from answers
            this.generateTasksFromAnswers();
        }
    }
    
    skipQuestion() {
        this.answers[this.currentQuestionIndex] = '[Skipped]';
        this.nextQuestion();
    }
    
    markAsNotApplicable() {
        this.answers[this.currentQuestionIndex] = '[Not Applicable]';
        this.nextQuestion();
    }
    
    clearAnswer() {
        document.getElementById('answerInput').value = '';
        delete this.answers[this.currentQuestionIndex];
        this.updateCharCounter();
        document.getElementById('answerInput').focus();
    }
    
    saveAnswer(answer) {
        if (answer && answer.trim()) {
            this.answers[this.currentQuestionIndex] = answer.trim();
        } else {
            delete this.answers[this.currentQuestionIndex];
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
    }
    
    updateCharCounter() {
        const text = document.getElementById('answerInput').value;
        const charCount = text.length;
        const maxChars = 500;
        
        document.getElementById('charCount').textContent = `${charCount}/${maxChars}`;
        
        // Update color based on length
        const charCountElement = document.getElementById('charCount');
        if (charCount > maxChars * 0.9) {
            charCountElement.style.color = 'var(--color-error)';
        } else if (charCount > maxChars * 0.75) {
            charCountElement.style.color = 'var(--color-warning)';
        } else {
            charCountElement.style.color = 'var(--color-text-muted)';
        }
    }
    
    // UPDATED: AI-powered task generation
    async generateTasksFromAnswers() {
        if (this.isGeneratingTasks) return;
        this.isGeneratingTasks = true;

        const nextBtn = document.getElementById('nextBtn');
        const originalHtml = nextBtn.innerHTML;
        nextBtn.innerHTML = '<div class="loading"></div> Contacting AI...';
        nextBtn.disabled = true;

        try {
            // 1. Prepare data to send
            const requestData = {
                answers: this.answers,
                questions: this.questions // Send questions for full context
            };

            // 2. Call YOUR backend endpoint - UPDATE THIS URL
            const response = await fetch('https://intuivabackend-production.up.railway.app/api/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success && result.tasks && result.tasks.length > 0) {
                // 3. Use AI-generated tasks
                this.tasks = result.tasks.map(task => ({
                    ...task,
                    id: this.generateId() // Ensure each task has a unique ID
                }));
                
                // CRITICAL: Update the kanban board with new tasks
                if (this.kanbanBoard) {
                    // Clear existing tasks first
                    this.kanbanBoard.clearTasks();
                    // Add new tasks
                    this.tasks.forEach(task => {
                        this.kanbanBoard.addTask(task);
                    });
                }
                
                this.showToast('AI tasks generated successfully!', 'success');
            } else {
                // 4. Fallback to local logic if AI fails
                throw new Error('AI returned no tasks');
            }

        } catch (error) {
            console.warn('AI generation failed, using fallback:', error);
            this.tasks = this.generateTasksBasedOnAnswers(); // Your existing logic
            
            // CRITICAL: Also update board with fallback tasks
            if (this.kanbanBoard) {
                this.kanbanBoard.clearTasks();
                this.tasks.forEach(task => {
                    this.kanbanBoard.addTask(task);
                });
            }
            
            this.showToast('Generated tasks from your answers.', 'info');
        } finally {
            // 5. Save to localStorage
            this.saveToLocalStorage();
            
            // 6. Navigate to board and update stats
            this.navigateTo('kanbanBoard');
            this.updateStats();
            
            // 7. Reset button state
            nextBtn.innerHTML = originalHtml;
            nextBtn.disabled = false;
            this.isGeneratingTasks = false;
        }
    }
    
    generateTasksBasedOnAnswers() {
        // If there are no answers at all, return empty array
        const hasValidAnswers = Object.values(this.answers).some(answer => 
            answer && answer !== '[Skipped]' && answer !== '[Not Applicable]'
        );
        
        if (!hasValidAnswers) {
            return this.generateDefaultTasks();
        }
        
        const tasks = [];
        
        // Analyze answers and generate relevant tasks
        Object.entries(this.answers).forEach(([index, answer]) => {
            if (answer === '[Skipped]' || answer === '[Not Applicable]') return;
            
            const question = this.questions[parseInt(index)];
            const category = question.category;
            
            // Generate tasks based on category and answer
            const categoryTasks = this.generateTasksForCategory(category, answer);
            tasks.push(...categoryTasks);
        });
        
        // Remove duplicates based on title
        const uniqueTasks = [];
        const titles = new Set();
        
        tasks.forEach(task => {
            if (!titles.has(task.title)) {
                titles.add(task.title);
                uniqueTasks.push({
                    ...task,
                    id: this.generateId() // Ensure unique ID
                });
            }
        });
        
        return uniqueTasks;
    }
    
    generateTasksForCategory(category, answer) {
        const tasks = [];
        
        // Generate tasks based on answer content
        if (answer && answer.trim().length > 10) {
            // Create more personalized tasks based on the actual answer
            tasks.push(
                {
                    id: this.generateId(),
                    title: `Analyze: "${answer.substring(0, 50)}..."`,
                    description: `Review and break down insights from: ${answer}`,
                    status: 'todo',
                    priority: 'medium',
                    tags: ['analysis', 'review']
                },
                {
                    id: this.generateId(),
                    title: `Create action plan based on response`,
                    description: `Develop specific steps from user input: ${answer.substring(0, 100)}`,
                    status: 'todo',
                    priority: 'high',
                    tags: ['planning', 'execution']
                }
            );
        }
        
        // Add category-specific tasks
        if (category.includes('Understanding Value')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: 'Define primary customer personas',
                    description: 'Create detailed profiles for primary and secondary users based on project requirements',
                    status: 'todo',
                    priority: 'high',
                    tags: ['planning', 'research', 'customer']
                },
                {
                    id: this.generateId(),
                    title: 'Document key success metrics',
                    description: 'Define measurable KPIs and success criteria for the project',
                    status: 'todo',
                    priority: 'medium',
                    tags: ['metrics', 'planning']
                }
            );
        } else if (category.includes('VALUE STREAM')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: 'Map current workflow process',
                    description: 'Document existing process steps and identify bottlenecks',
                    status: 'todo',
                    priority: 'high',
                    tags: ['process', 'analysis']
                },
                {
                    id: this.generateId(),
                    title: 'Identify dependencies and risks',
                    description: 'List all external dependencies and potential risks with mitigation strategies',
                    status: 'todo',
                    priority: 'medium',
                    tags: ['risk', 'dependencies']
                }
            );
        } else if (category.includes('FLOW')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: 'Set up Kanban board workflow',
                    description: 'Configure columns, WIP limits, and workflow rules',
                    status: 'todo',
                    priority: 'high',
                    tags: ['setup', 'workflow']
                },
                {
                    id: this.generateId(),
                    title: 'Define Definition of Ready/Done',
                    description: 'Create clear criteria for when work can start and when it is complete',
                    status: 'todo',
                    priority: 'medium',
                    tags: ['quality', 'process']
                }
            );
        } else if (category.includes('PULL')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: 'Establish backlog prioritization process',
                    description: 'Define how work items will be prioritized and pulled into the workflow',
                    status: 'todo',
                    priority: 'medium',
                    tags: ['process', 'prioritization']
                }
            );
        } else if (category.includes('PERFECTION')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: 'Set up feedback collection process',
                    description: 'Create system for gathering and incorporating user feedback',
                    status: 'todo',
                    priority: 'medium',
                    tags: ['feedback', 'improvement']
                },
                {
                    id: this.generateId(),
                    title: 'Define retrospective schedule',
                    description: 'Schedule regular improvement meetings and define format',
                    status: 'todo',
                    priority: 'low',
                    tags: ['retrospective', 'improvement']
                }
            );
        } else if (category.includes('Team & Mindset')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: 'Conduct team skill assessment',
                    description: 'Evaluate current skills and identify training needs',
                    status: 'todo',
                    priority: 'medium',
                    tags: ['team', 'skills']
                },
                {
                    id: this.generateId(),
                    title: 'Create risk mitigation plan',
                    description: 'Document potential risks and create mitigation strategies',
                    status: 'todo',
                    priority: 'high',
                    tags: ['risk', 'planning']
                }
            );
        }
        
        return tasks;
    }
    
    generateDefaultTasks() {
        return [
            {
                id: this.generateId(),
                title: 'Define project scope and objectives',
                description: 'Clearly document what the project will and will not deliver',
                status: 'todo',
                priority: 'high',
                tags: ['planning', 'scope']
            },
            {
                id: this.generateId(),
                title: 'Identify key stakeholders',
                description: 'List all stakeholders and define communication plan',
                status: 'todo',
                priority: 'medium',
                tags: ['stakeholders', 'communication']
            },
            {
                id: this.generateId(),
                title: 'Set up project repository',
                description: 'Create Git repository with proper branching strategy',
                status: 'todo',
                priority: 'high',
                tags: ['setup', 'development']
            },
            {
                id: this.generateId(),
                title: 'Create initial project timeline',
                description: 'Develop high-level timeline with key milestones',
                status: 'todo',
                priority: 'medium',
                tags: ['planning', 'timeline']
            },
            {
                id: this.generateId(),
                title: 'Define success metrics',
                description: 'Establish KPIs to measure project success',
                status: 'todo',
                priority: 'high',
                tags: ['metrics', 'planning']
            }
        ];
    }
    
    showKanbanBoard() {
        this.navigateTo('kanbanBoard');
    }
    
    updateStats() {
        if (!this.kanbanBoard) return;
        
        const stats = this.kanbanBoard.getStats();
        
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('doneTasks').textContent = stats.done;
        document.getElementById('wipTasks').textContent = stats.inProgress;
        
        // Update column counts
        document.getElementById('todoCount').textContent = stats.todo;
        document.getElementById('inprogressCount').textContent = stats.inProgress;
        document.getElementById('doneCount').textContent = stats.done;
    }
    
    openTaskModal(status = 'todo') {
        this.taskModal.classList.add('active');
        document.getElementById('taskStatus').value = status;
        document.getElementById('taskTitle').focus();
    }
    
    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;
        const tags = document.getElementById('taskTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        if (!title) {
            this.showToast('Task title is required', 'error');
            return;
        }
        
        const task = {
            id: this.generateId(),
            title,
            description,
            priority,
            status,
            tags,
            createdAt: new Date().toISOString()
        };
        
        // Add task to board
        this.kanbanBoard.addTask(task);
        
        // Update tasks array
        this.tasks.push(task);
        
        // Update stats
        this.updateStats();
        
        // Close modal and reset form
        this.taskModal.classList.remove('active');
        this.taskForm.reset();
        
        this.showToast('Task added successfully!', 'success');
        
        // Save to localStorage
        this.saveToLocalStorage();
    }
    
    // UPDATED: AI-powered regeneration
    async regenerateTasks() {
        if (this.isGeneratingTasks) return;
        
        this.isGeneratingTasks = true;
        
        // Show loading state
        const btn = document.getElementById('regenerateBtn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<div class="loading"></div> Regenerating...';
        btn.disabled = true;
        
        try {
            // 1. Prepare data to send
            const requestData = {
                answers: this.answers,
                questions: this.questions
            };

            // 2. Call YOUR backend endpoint - UPDATE THIS URL
            const response = await fetch('https://intuivabackend-production.up.railway.app/api/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success && result.tasks && result.tasks.length > 0) {
                // 3. Clear existing tasks and add AI-generated ones
                this.tasks = result.tasks.map(task => ({
                    ...task,
                    id: this.generateId()
                }));
                
                if (this.kanbanBoard) {
                    this.kanbanBoard.clearTasks();
                    this.tasks.forEach(task => {
                        this.kanbanBoard.addTask(task);
                    });
                }
                this.showToast('AI tasks regenerated!', 'success');
            } else {
                throw new Error('AI returned no tasks');
            }
            
        } catch (error) {
            console.warn('AI regeneration failed:', error);
            // Fallback to local logic
            this.tasks = this.generateTasksBasedOnAnswers();
            if (this.kanbanBoard) {
                this.kanbanBoard.clearTasks();
                this.tasks.forEach(task => {
                    this.kanbanBoard.addTask(task);
                });
            }
            this.showToast('Regenerated from your answers.', 'info');
        } finally {
            // Update stats and save
            this.updateStats();
            this.saveToLocalStorage();
            
            // Reset button
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            this.isGeneratingTasks = false;
        }
    }
    
    exportBoard() {
        const data = {
            answers: this.answers,
            tasks: this.tasks,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `intuiva-board-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Board exported successfully!', 'success');
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('intuiva-theme', newTheme);
        
        // Update icon
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.showToast(`Switched to ${newTheme} theme`, 'info');
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        
        // Set color based on type
        switch (type) {
            case 'success':
                toast.style.borderLeftColor = 'var(--color-success)';
                break;
            case 'error':
                toast.style.borderLeftColor = 'var(--color-error)';
                break;
            case 'warning':
                toast.style.borderLeftColor = 'var(--color-warning)';
                break;
            default:
                toast.style.borderLeftColor = 'var(--color-info)';
        }
        
        toast.classList.add('active');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    saveToLocalStorage() {
        const data = {
            answers: this.answers,
            tasks: this.tasks,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('intuiva-data', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('intuiva-data'));
            
            if (data) {
                this.answers = data.answers || {};
                this.tasks = data.tasks || [];
                
                // Only show kanban board if there are actual tasks
                if (this.tasks && this.tasks.length > 0) {
                    // Navigate to kanban board but don't reset screen
                    if (!this.kanbanBoard) {
                        this.kanbanBoard = new KanbanBoard(this.tasks);
                    }
                    this.updateStats();
                }
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.intuivaApp = new IntuivaApp();
});
