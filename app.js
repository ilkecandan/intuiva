class IntuivaApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.tasks = [];
        this.kanbanBoard = null;
        this.isGeneratingTasks = false;
        this.currentScreen = 'onboarding';
        this.currentLanguage = this.detectLanguage() || 'en'; // 'en' or 'tr'
        
        // Load translations
        this.translations = TRANSLATIONS || {};
        
        this.init();
    }
    
    // Language detection based on browser or user preference
    detectLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('intuiva-language');
        if (savedLang) return savedLang;
        
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('tr')) return 'tr';
        
        // Default to English
        return 'en';
    }
    
    // Get translation with fallback
    t(key, params = {}) {
        let translation = this.translations[this.currentLanguage]?.[key] || 
                        this.translations['en']?.[key] || 
                        key;
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{{${param}}}`, params[param]);
        });
        
        return translation;
    }

    init() {
        // Initialize screens
        this.screens = {
            onboarding: document.getElementById('onboarding'),
            questionnaire: document.getElementById('questionnaire'),
            kanbanBoard: document.getElementById('kanbanBoard')
        };
        
        // Apply language immediately
        this.applyLanguage();
        
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

    // Apply language to UI elements
    applyLanguage() {
        // Update all translatable elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const params = {};
                element.getAttributeNames().forEach(attr => {
                    if (attr.startsWith('data-i18n-')) {
                        const paramName = attr.replace('data-i18n-', '');
                        params[paramName] = element.getAttribute(attr);
                    }
                });
                element.textContent = this.t(key, params);
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.placeholder = this.t(key);
            }
        });
        
        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.title = this.t(key);
            }
        });
        
        // Update page title
        document.title = this.t('app.title');
        
        // Update language selector if exists
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.value = this.currentLanguage;
        }
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
            
            this.showToast(this.t('toast.startedEmpty'), 'info');
        });
        
        // Clear All button (if you added it)
        if (document.getElementById('clearAllBtn')) {
            document.getElementById('clearAllBtn').addEventListener('click', () => {
                if (confirm(this.t('confirm.clearAll'))) {
                    this.tasks = [];
                    if (this.kanbanBoard) {
                        this.kanbanBoard.clearTasks();
                    }
                    this.updateStats();
                    this.saveToLocalStorage();
                    this.showToast(this.t('toast.allCleared'), 'info');
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
        
        // Language toggle button (if exists)
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
        
        // Language selector (if exists)
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
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
        
        // Update question translations if available
        this.applyQuestionTranslations();
    }
    
    applyQuestionTranslations() {
        if (this.questions && this.currentLanguage === 'tr' && TRANSLATIONS?.tr?.questions) {
            this.questions = this.questions.map((question, index) => ({
                ...question,
                text: TRANSLATIONS.tr.questions[index]?.text || question.text,
                category: TRANSLATIONS.tr.questions[index]?.category || question.category
            }));
        }
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
        
        // Update UI with translations
        document.getElementById('questionNumber').textContent = this.t('question.number', { number: index + 1 });
        document.getElementById('questionTitle').textContent = question.category;
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('categoryTitle').textContent = question.category;
        
        // Update progress
        const progress = ((index + 1) / this.totalQuestions) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = this.t('question.progress', {
            current: index + 1,
            total: this.totalQuestions
        });
        
        // Load saved answer
        const answerInput = document.getElementById('answerInput');
        answerInput.value = this.answers[index] || '';
        answerInput.focus();
        
        // Update character counter
        this.updateCharCounter();
        
        // Update button states
        document.getElementById('prevBtn').disabled = index === 0;
        
        // Update next button text for last question
        const nextBtn = document.getElementById('nextBtn');
        if (index === this.totalQuestions - 1) {
            nextBtn.innerHTML = `${this.t('button.generateBoard')} <i class="fas fa-arrow-right"></i>`;
        } else {
            nextBtn.innerHTML = `${this.t('button.next')} <i class="fas fa-arrow-right"></i>`;
        }
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
        nextBtn.innerHTML = `<div class="loading"></div> ${this.t('ai.contacting')}`;
        nextBtn.disabled = true;

        try {
            // 1. Prepare data to send with language context
            const requestData = {
                answers: this.answers,
                questions: this.questions,
                language: this.currentLanguage // Send language to backend
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
                
                this.showToast(this.t('ai.generatedSuccess'), 'success');
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
            
            this.showToast(this.t('ai.generatedFallback'), 'info');
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
        // If there are no answers at all, return default tasks
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
        const isTurkish = this.currentLanguage === 'tr';
        
        // Generate tasks based on answer content
        if (answer && answer.trim().length > 10) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: isTurkish ? `Analiz: "${answer.substring(0, 50)}..."` : `Analyze: "${answer.substring(0, 50)}..."`,
                    description: isTurkish ? 
                        `Bu yanıttan içgörüleri gözden geçirin ve analiz edin: ${answer}` :
                        `Review and break down insights from: ${answer}`,
                    status: 'todo',
                    priority: 'medium',
                    tags: isTurkish ? ['analiz', 'inceleme'] : ['analysis', 'review']
                },
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Yanıta dayalı eylem planı oluştur' : 'Create action plan based on response',
                    description: isTurkish ?
                        `Kullanıcı girdisinden özel adımlar geliştirin: ${answer.substring(0, 100)}` :
                        `Develop specific steps from user input: ${answer.substring(0, 100)}`,
                    status: 'todo',
                    priority: 'high',
                    tags: isTurkish ? ['planlama', 'yürütme'] : ['planning', 'execution']
                }
            );
        }
        
        // Add category-specific tasks with translations
        if (category.includes('Understanding Value') || category.includes('Değeri Anlama')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Birincil müşteri profillerini tanımla' : 'Define primary customer personas',
                    description: isTurkish ?
                        'Proje gereksinimlerine göre birincil ve ikincil kullanıcılar için detaylı profiller oluşturun' :
                        'Create detailed profiles for primary and secondary users based on project requirements',
                    status: 'todo',
                    priority: 'high',
                    tags: isTurkish ? ['planlama', 'araştırma', 'müşteri'] : ['planning', 'research', 'customer']
                },
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Temel başarı metriklerini belgele' : 'Document key success metrics',
                    description: isTurkish ?
                        'Proje için ölçülebilir KPI\'lar ve başarı kriterlerini tanımlayın' :
                        'Define measurable KPIs and success criteria for the project',
                    status: 'todo',
                    priority: 'medium',
                    tags: isTurkish ? ['metrikler', 'planlama'] : ['metrics', 'planning']
                }
            );
        } else if (category.includes('VALUE STREAM')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Mevcut iş akışı sürecini haritala' : 'Map current workflow process',
                    description: isTurkish ?
                        'Mevcut süreç adımlarını belgeleyin ve darboğazları tespit edin' :
                        'Document existing process steps and identify bottlenecks',
                    status: 'todo',
                    priority: 'high',
                    tags: isTurkish ? ['süreç', 'analiz'] : ['process', 'analysis']
                },
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Bağımlılıkları ve riskleri belirle' : 'Identify dependencies and risks',
                    description: isTurkish ?
                        'Tüm harici bağımlılıkları ve azaltma stratejileriyle potansiyel riskleri listeleyin' :
                        'List all external dependencies and potential risks with mitigation strategies',
                    status: 'todo',
                    priority: 'medium',
                    tags: isTurkish ? ['risk', 'bağımlılıklar'] : ['risk', 'dependencies']
                }
            );
        } else if (category.includes('FLOW')) {
            tasks.push(
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Kanban board iş akışını kur' : 'Set up Kanban board workflow',
                    description: isTurkish ?
                        'Sütunları, WIP limitlerini ve iş akışı kurallarını yapılandırın' :
                        'Configure columns, WIP limits, and workflow rules',
                    status: 'todo',
                    priority: 'high',
                    tags: isTurkish ? ['kurulum', 'iş akışı'] : ['setup', 'workflow']
                },
                {
                    id: this.generateId(),
                    title: isTurkish ? 'Hazır/Bitti Tanımını Belirle' : 'Define Definition of Ready/Done',
                    description: isTurkish ?
                        'İşin ne zaman başlayabileceği ve ne zaman tamamlanacağına dair net kriterler oluşturun' :
                        'Create clear criteria for when work can start and when it is complete',
                    status: 'todo',
                    priority: 'medium',
                    tags: isTurkish ? ['kalite', 'süreç'] : ['quality', 'process']
                }
            );
        }
        
        return tasks;
    }
    
    generateDefaultTasks() {
        const isTurkish = this.currentLanguage === 'tr';
        
        return [
            {
                id: this.generateId(),
                title: isTurkish ? 'Proje kapsamını ve hedeflerini tanımla' : 'Define project scope and objectives',
                description: isTurkish ?
                    'Projenin neyi teslim edeceğini ve etmeyeceğini açıkça belgeleyin' :
                    'Clearly document what the project will and will not deliver',
                status: 'todo',
                priority: 'high',
                tags: isTurkish ? ['planlama', 'kapsam'] : ['planning', 'scope']
            },
            {
                id: this.generateId(),
                title: isTurkish ? 'Ana paydaşları belirle' : 'Identify key stakeholders',
                description: isTurkish ?
                    'Tüm paydaşları listeleyin ve iletişim planını tanımlayın' :
                    'List all stakeholders and define communication plan',
                status: 'todo',
                priority: 'medium',
                tags: isTurkish ? ['paydaşlar', 'iletişim'] : ['stakeholders', 'communication']
            },
            {
                id: this.generateId(),
                title: isTurkish ? 'Proje deposunu kur' : 'Set up project repository',
                description: isTurkish ?
                    'Uygun dallanma stratejisiyle Git deposu oluşturun' :
                    'Create Git repository with proper branching strategy',
                status: 'todo',
                priority: 'high',
                tags: isTurkish ? ['kurulum', 'geliştirme'] : ['setup', 'development']
            },
            {
                id: this.generateId(),
                title: isTurkish ? 'Başlangıç proje zaman çizelgesi oluştur' : 'Create initial project timeline',
                description: isTurkish ?
                    'Ana kilometre taşlarıyla yüksek seviyeli zaman çizelgesi geliştirin' :
                    'Develop high-level timeline with key milestones',
                status: 'todo',
                priority: 'medium',
                tags: isTurkish ? ['planlama', 'zaman çizelgesi'] : ['planning', 'timeline']
            },
            {
                id: this.generateId(),
                title: isTurkish ? 'Başarı metriklerini tanımla' : 'Define success metrics',
                description: isTurkish ?
                    'Proje başarısını ölçmek için KPI\'lar belirleyin' :
                    'Establish KPIs to measure project success',
                status: 'todo',
                priority: 'high',
                tags: isTurkish ? ['metrikler', 'planlama'] : ['metrics', 'planning']
            }
        ];
    }
    
    showKanbanBoard() {
        this.navigateTo('kanbanBoard');
    }
    
    updateStats() {
        if (!this.kanbanBoard) return;
        
        const stats = this.kanbanBoard.getStats();
        
        // Update stats with translations
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
            this.showToast(this.t('error.taskTitleRequired'), 'error');
            return;
        }
        
        const task = {
            id: this.generateId(),
            title,
            description,
            priority,
            status,
            tags,
            createdAt: new Date().toISOString(),
            language: this.currentLanguage
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
        
        this.showToast(this.t('toast.taskAdded'), 'success');
        
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
        btn.innerHTML = `<div class="loading"></div> ${this.t('ai.regenerating')}`;
        btn.disabled = true;
        
        try {
            // 1. Prepare data to send
            const requestData = {
                answers: this.answers,
                questions: this.questions,
                language: this.currentLanguage
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
                this.showToast(this.t('ai.regeneratedSuccess'), 'success');
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
            this.showToast(this.t('ai.regeneratedFallback'), 'info');
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
            exportedAt: new Date().toISOString(),
            language: this.currentLanguage
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
        
        this.showToast(this.t('toast.boardExported'), 'success');
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('intuiva-theme', newTheme);
        
        // Update icon
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.showToast(this.t('toast.themeSwitched', { theme: this.t(`theme.${newTheme}`) }), 'info');
    }
    
    // Language switching
    setLanguage(lang) {
        if (lang !== this.currentLanguage && (lang === 'en' || lang === 'tr')) {
            this.currentLanguage = lang;
            localStorage.setItem('intuiva-language', lang);
            
            // Update UI immediately
            this.applyLanguage();
            
            // Reload current screen to update content
            if (this.currentScreen === 'questionnaire') {
                this.loadQuestion(this.currentQuestionIndex);
            }
            
            // Re-render Kanban board if it exists
            if (this.kanbanBoard) {
                this.kanbanBoard.renderTasks();
            }
            
            this.showToast(this.t('toast.languageChanged', { language: this.t(`language.${lang}`) }), 'info');
        }
    }
    
    toggleLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'tr' : 'en';
        this.setLanguage(newLang);
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        
        // Set color based on type
        const colors = {
            success: 'var(--color-success)',
            error: 'var(--color-error)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
        };
        
        toast.style.borderLeftColor = colors[type] || colors.info;
        
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
            lastUpdated: new Date().toISOString(),
            language: this.currentLanguage
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
                this.currentLanguage = data.language || this.currentLanguage;
                
                // Apply language before loading other data
                this.applyLanguage();
                
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

// TRANSLATIONS object - should be in a separate file translations.js
const TRANSLATIONS = {
    en: {
        'app.title': 'Intuiva - AI Project Manager',
        'button.start': 'Get Started',
        'button.next': 'Next',
        'button.prev': 'Previous',
        'button.generateBoard': 'Generate Kanban Board',
        'button.skip': 'Skip to Board',
        'button.clearAll': 'Clear All Tasks',
        'button.addTask': 'Add Task',
        'button.regenerate': 'Regenerate Tasks',
        'button.export': 'Export Board',
        'button.save': 'Save',
        'button.cancel': 'Cancel',
        'button.skipQuestion': 'Skip Question',
        'button.notAnswer': 'Not Applicable',
        'button.clear': 'Clear Answer',
        'question.number': 'Q{{number}}',
        'question.progress': 'Question {{current}} of {{total}}',
        'ai.contacting': 'Contacting AI...',
        'ai.generating': 'Generating Tasks...',
        'ai.regenerating': 'Regenerating...',
        'ai.generatedSuccess': 'AI tasks generated successfully!',
        'ai.generatedFallback': 'Generated tasks from your answers.',
        'ai.regeneratedSuccess': 'AI tasks regenerated!',
        'ai.regeneratedFallback': 'Regenerated from your answers.',
        'toast.startedEmpty': 'Started with empty board',
        'toast.allCleared': 'All tasks cleared',
        'toast.taskAdded': 'Task added successfully!',
        'toast.boardExported': 'Board exported successfully!',
        'toast.themeSwitched': 'Switched to {{theme}} theme',
        'toast.languageChanged': 'Language changed to {{language}}',
        'error.taskTitleRequired': 'Task title is required',
        'confirm.clearAll': 'Are you sure you want to clear all tasks? This cannot be undone.',
        'theme.dark': 'dark',
        'theme.light': 'light',
        'language.en': 'English',
        'language.tr': 'Turkish'
    },
    tr: {
        'app.title': 'Intuiva - AI Proje Yöneticisi',
        'button.start': 'Başla',
        'button.next': 'İleri',
        'button.prev': 'Geri',
        'button.generateBoard': 'Kanban Board Oluştur',
        'button.skip': 'Board\'a Geç',
        'button.clearAll': 'Tüm Görevleri Temizle',
        'button.addTask': 'Görev Ekle',
        'button.regenerate': 'Görevleri Yeniden Oluştur',
        'button.export': 'Board\'u Dışa Aktar',
        'button.save': 'Kaydet',
        'button.cancel': 'İptal',
        'button.skipQuestion': 'Soruyu Atla',
        'button.notAnswer': 'Uygulanamaz',
        'button.clear': 'Yanıtı Temizle',
        'question.number': 'S{{number}}',
        'question.progress': 'Soru {{current}} / {{total}}',
        'ai.contacting': 'AI\'ye bağlanılıyor...',
        'ai.generating': 'Görevler oluşturuluyor...',
        'ai.regenerating': 'Yeniden oluşturuluyor...',
        'ai.generatedSuccess': 'AI görevleri başarıyla oluşturuldu!',
        'ai.generatedFallback': 'Yanıtlarınızdan görevler oluşturuldu.',
        'ai.regeneratedSuccess': 'AI görevleri yeniden oluşturuldu!',
        'ai.regeneratedFallback': 'Yanıtlarınızdan yeniden oluşturuldu.',
        'toast.startedEmpty': 'Boş board ile başlatıldı',
        'toast.allCleared': 'Tüm görevler temizlendi',
        'toast.taskAdded': 'Görev başarıyla eklendi!',
        'toast.boardExported': 'Board başarıyla dışa aktarıldı!',
        'toast.themeSwitched': '{{theme}} temaya geçildi',
        'toast.languageChanged': 'Dil {{language}} olarak değiştirildi',
        'error.taskTitleRequired': 'Görev başlığı gereklidir',
        'confirm.clearAll': 'Tüm görevleri temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        'theme.dark': 'koyu',
        'theme.light': 'açık',
        'language.en': 'İngilizce',
        'language.tr': 'Türkçe'
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.intuivaApp = new IntuivaApp();
});
