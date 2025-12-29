class IntuivaApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.tasks = [];
        this.kanbanBoard = null;
        this.isGeneratingTasks = false;
        this.isGeneratingReport = false;
        this.currentScreen = 'onboarding';
        this.currentLanguage = this.detectLanguage();
        this.currentProject = null;
        this.savedProjects = [];
        this.autoSaveInterval = null;
        this.autoSaveEnabled = true;
        
        this.init();
    }
    
    detectLanguage() {
        const savedLang = localStorage.getItem('intuiva-language');
        if (savedLang) return savedLang;
        
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('tr')) return 'tr';
        
        return 'en';
    }
    
    t(key, params = {}) {
        let translation = window.TRANSLATIONS[this.currentLanguage]?.[key] || 
                        window.TRANSLATIONS['en']?.[key] || 
                        key;
        
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{{${param}}}`, params[param]);
        });
        
        return translation;
    }

    init() {
        this.screens = {
            onboarding: document.getElementById('onboarding'),
            questionnaire: document.getElementById('questionnaire'),
            kanbanBoard: document.getElementById('kanbanBoard')
        };
        
        this.initButtons();
        this.initNavigation();
        this.initQuestionnaire();
        this.initModals();
        this.initDragAndDrop();
        this.initTheme();
        this.initCharCounter();
        this.initProjectManagement();
        
        this.showScreen('onboarding');
        this.loadSavedProjects();
        this.updateSavedProjectsDropdown();
        
        // Apply language after everything is initialized
        setTimeout(() => {
            this.applyLanguage();
            // Update language selector
            const langSelector = document.getElementById('languageSelector');
            if (langSelector) {
                langSelector.value = this.currentLanguage;
            }
        }, 100);
        
        console.log('Intuiva App initialized successfully');
    }

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
        
        // Update language selector
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.value = this.currentLanguage;
        }
        
        // Update question if on questionnaire screen
        if (this.currentScreen === 'questionnaire' && this.questions) {
            this.loadQuestion(this.currentQuestionIndex);
        }
        
        // Update kanban board if it exists
        if (this.kanbanBoard) {
            this.kanbanBoard.renderTasks();
        }
        
        // Update stats
        this.updateStats();
    }
    
    initProjectManagement() {
        // Load the most recent project if exists
        this.savedProjects = this.getSavedProjects();
        if (this.savedProjects.length > 0) {
            const mostRecent = this.savedProjects.sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )[0];
            this.currentProject = mostRecent;
            this.loadProject(mostRecent.id);
        }
        
        // Start auto-save interval
        this.startAutoSave();
        
        // Update saved time display
        this.updateLastSavedTime();
    }
    
    initButtons() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.createNewProject();
        });
        
        // Load project button
        document.getElementById('loadProjectBtn').addEventListener('click', () => {
            this.showLoadProjectModal();
        });
        
        // Home button
        document.getElementById('homeBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateTo('onboarding');
        });
        
        // Saved projects dropdown
        document.getElementById('savedProjectsBtn').addEventListener('click', () => {
            this.toggleSavedProjectsDropdown();
        });
        
        // Clear All button
        if (document.getElementById('clearAllBtn')) {
            document.getElementById('clearAllBtn').addEventListener('click', () => {
                if (confirm(this.t('confirm.clearAll'))) {
                    this.tasks = [];
                    if (this.kanbanBoard) {
                        this.kanbanBoard.clearTasks();
                    }
                    this.updateStats();
                    this.saveProject();
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
        document.getElementById('saveProjectBtn').addEventListener('click', () => this.showSaveProjectModal());
        document.getElementById('exportProjectBtn').addEventListener('click', () => this.exportProject());
        
        // Report buttons
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateProjectReport());
        document.getElementById('generateReportPlaceholderBtn').addEventListener('click', () => this.generateProjectReport());
        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadPdfReport());
        
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
        
        // Language selector
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
        
        // Back to questions button
        document.getElementById('backToQuestionsBtn').addEventListener('click', () => {
            this.navigateTo('questionnaire');
        });
    }

    initNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.navigateTo(screen);
            });
        });
        
        this.updateActiveNav();
    }

    navigateTo(screenName) {
        if (this.currentScreen === 'questionnaire') {
            this.saveAnswer(document.getElementById('answerInput').value);
        }
        
        this.showScreen(screenName);
        this.currentScreen = screenName;
        this.updateActiveNav();
        
        if (screenName === 'questionnaire') {
            this.loadQuestion(this.currentQuestionIndex);
        }
        
        if (screenName === 'kanbanBoard') {
            if (!this.kanbanBoard) {
                this.kanbanBoard = new KanbanBoard(this.tasks);
            } else {
                this.kanbanBoard.tasks = this.tasks;
                this.kanbanBoard.renderTasks();
            }
            this.updateStats();
            this.updateLastSavedTime();
        }
    }

    updateActiveNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.screen === this.currentScreen) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    initQuestionnaire() {
        if (window.getQuestions) {
            this.questions = window.getQuestions(this.currentLanguage);
        } else if (window.QUESTIONS && window.QUESTIONS[this.currentLanguage]) {
            this.questions = window.QUESTIONS[this.currentLanguage];
        } else if (Array.isArray(window.QUESTIONS)) {
            this.questions = window.QUESTIONS;
        } else {
            this.questions = [];
        }
        
        this.totalQuestions = this.questions.length;
        
        const answerInput = document.getElementById('answerInput');
        answerInput.addEventListener('input', (e) => {
            this.saveAnswer(e.target.value);
            this.updateCharCounter();
        });
        
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
        this.taskModal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.saveProjectModal = document.getElementById('saveProjectModal');
        this.saveProjectForm = document.getElementById('saveProjectForm');
        this.loadProjectModal = document.getElementById('loadProjectModal');
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
                this.taskForm.reset();
                this.saveProjectForm.reset();
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    this.taskForm.reset();
                    this.saveProjectForm.reset();
                }
            });
        });
        
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        this.saveProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProjectAs();
        });
        
        // Import project button
        document.getElementById('importProjectBtn').addEventListener('click', () => {
            this.importProject();
        });
        
        this.helpModal = document.getElementById('helpModal');
    }
    
    initDragAndDrop() {
        // This will be initialized by the KanbanBoard class
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('intuiva-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    initCharCounter() {
        this.updateCharCounter();
    }
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
        
        this.updateActiveNav();
        
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
        
        if (!question) return;
        
        // Update UI elements
        document.getElementById('questionNumber').textContent = this.t('question.number', { number: index + 1 });
        document.getElementById('questionTitle').textContent = question.category || this.t('question.defaultTitle');
        document.getElementById('questionText').textContent = question.text || this.t('question.defaultText');
        document.getElementById('categoryTitle').textContent = question.category || this.t('question.category');
        
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
        const nextBtnText = nextBtn.querySelector('span');
        if (index === this.totalQuestions - 1) {
            nextBtnText.textContent = this.t('button.generateBoard');
        } else {
            nextBtnText.textContent = this.t('button.next');
        }
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.loadQuestion(this.currentQuestionIndex - 1);
        }
    }
    
    nextQuestion() {
        this.saveAnswer(document.getElementById('answerInput').value);
        
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        } else {
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
        
        // Auto-save if project exists
        if (this.currentProject) {
            this.saveProject();
        }
    }
    
    updateCharCounter() {
        const text = document.getElementById('answerInput').value;
        const charCount = text.length;
        const maxChars = 500;
        
        document.getElementById('charCount').textContent = `${charCount}/${maxChars}`;
        
        const charCountElement = document.getElementById('charCount');
        if (charCount > maxChars * 0.9) {
            charCountElement.style.color = 'var(--color-error)';
        } else if (charCount > maxChars * 0.75) {
            charCountElement.style.color = 'var(--color-warning)';
        } else {
            charCountElement.style.color = 'var(--color-text-muted)';
        }
    }
    
    async generateTasksFromAnswers() {
        if (this.isGeneratingTasks) return;
        this.isGeneratingTasks = true;

        const nextBtn = document.getElementById('nextBtn');
        const originalHtml = nextBtn.innerHTML;
        nextBtn.innerHTML = `<div class="loading"></div> ${this.t('ai.contacting')}`;
        nextBtn.disabled = true;

        try {
            const requestData = {
                answers: this.answers,
                questions: this.questions,
                language: this.currentLanguage,
                generateReport: true // Request report as well
            };

            const response = await fetch('https://intuivabackend-production.up.railway.app/api/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success && result.tasks && result.tasks.length > 0) {
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
                
                // Store report if provided
                if (result.report) {
                    this.storeProjectReport(result.report);
                }
                
                this.showToast(this.t('ai.generatedSuccess'), 'success');
            } else {
                throw new Error('AI returned no tasks');
            }

        } catch (error) {
            console.warn('AI generation failed, using fallback:', error);
            this.tasks = this.generateTasksBasedOnAnswers();
            
            if (this.kanbanBoard) {
                this.kanbanBoard.clearTasks();
                this.tasks.forEach(task => {
                    this.kanbanBoard.addTask(task);
                });
            }
            
            this.showToast(this.t('ai.generatedFallback'), 'info');
        } finally {
            this.saveProject();
            this.navigateTo('kanbanBoard');
            this.updateStats();
            
            nextBtn.innerHTML = originalHtml;
            nextBtn.disabled = false;
            this.isGeneratingTasks = false;
        }
    }
    
    generateTasksBasedOnAnswers() {
        const hasValidAnswers = Object.values(this.answers).some(answer => 
            answer && answer !== '[Skipped]' && answer !== '[Not Applicable]'
        );
        
        if (!hasValidAnswers) {
            return this.generateDefaultTasks();
        }
        
        const tasks = [];
        
        Object.entries(this.answers).forEach(([index, answer]) => {
            if (answer === '[Skipped]' || answer === '[Not Applicable]') return;
            
            const question = this.questions[parseInt(index)];
            const category = question.category;
            
            const categoryTasks = this.generateTasksForCategory(category, answer);
            tasks.push(...categoryTasks);
        });
        
        const uniqueTasks = [];
        const titles = new Set();
        
        tasks.forEach(task => {
            if (!titles.has(task.title)) {
                titles.add(task.title);
                uniqueTasks.push({
                    ...task,
                    id: this.generateId()
                });
            }
        });
        
        return uniqueTasks;
    }
    
    generateTasksForCategory(category, answer) {
        const tasks = [];
        const isTurkish = this.currentLanguage === 'tr';
        
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
        
        document.getElementById('todoCount').textContent = stats.todo;
        document.getElementById('inprogressCount').textContent = stats.inProgress;
        document.getElementById('doneCount').textContent = stats.done;
    }
    
    openTaskModal(status = 'todo') {
        document.getElementById('modalTitle').textContent = this.t('modal.addTask');
        document.getElementById('taskStatus').value = status;
        this.taskModal.classList.add('active');
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
        
        this.kanbanBoard.addTask(task);
        this.tasks.push(task);
        this.updateStats();
        this.taskModal.classList.remove('active');
        this.taskForm.reset();
        
        this.showToast(this.t('toast.taskAdded'), 'success');
        this.saveProject();
    }
    
    async regenerateTasks() {
        if (this.isGeneratingTasks) return;
        
        this.isGeneratingTasks = true;
        
        const btn = document.getElementById('regenerateBtn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<div class="loading"></div> ${this.t('ai.regenerating')}`;
        btn.disabled = true;
        
        try {
            const requestData = {
                answers: this.answers,
                questions: this.questions,
                language: this.currentLanguage,
                generateReport: true
            };

            const response = await fetch('https://intuivabackend-production.up.railway.app/api/generate-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success && result.tasks && result.tasks.length > 0) {
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
                
                // Store report if provided
                if (result.report) {
                    this.storeProjectReport(result.report);
                }
                
                this.showToast(this.t('ai.regeneratedSuccess'), 'success');
            } else {
                throw new Error('AI returned no tasks');
            }
            
        } catch (error) {
            console.warn('AI regeneration failed:', error);
            this.tasks = this.generateTasksBasedOnAnswers();
            if (this.kanbanBoard) {
                this.kanbanBoard.clearTasks();
                this.tasks.forEach(task => {
                    this.kanbanBoard.addTask(task);
                });
            }
            this.showToast(this.t('ai.regeneratedFallback'), 'info');
        } finally {
            this.updateStats();
            this.saveProject();
            
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            this.isGeneratingTasks = false;
        }
    }
    
    exportProject() {
        const project = this.saveProject();
        const data = {
            ...project,
            exportedAt: new Date().toISOString(),
            exportedFrom: 'Intuiva Project Manager'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `intuiva-project-${project.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(this.t('toast.projectExported'), 'success');
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('intuiva-theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.showToast(this.t('toast.themeSwitched', { theme: this.t(`theme.${newTheme}`) }), 'info');
    }
    
    setLanguage(lang) {
        if (lang !== this.currentLanguage && (lang === 'en' || lang === 'tr')) {
            this.currentLanguage = lang;
            localStorage.setItem('intuiva-language', lang);
            
            // Reload questions in new language
            if (window.getQuestions) {
                this.questions = window.getQuestions(this.currentLanguage);
            } else if (window.QUESTIONS && window.QUESTIONS[this.currentLanguage]) {
                this.questions = window.QUESTIONS[this.currentLanguage];
            }
            this.totalQuestions = this.questions.length;
            
            // Update UI
            this.applyLanguage();
            
            // Reload current screen
            if (this.currentScreen === 'questionnaire') {
                this.loadQuestion(this.currentQuestionIndex);
            }
            
            this.showToast(this.t('toast.languageChanged', { language: this.t(`language.${lang}`) }), 'info');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        
        const colors = {
            success: 'var(--color-success)',
            error: 'var(--color-error)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
        };
        
        toast.style.borderLeftColor = colors[type] || colors.info;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    createNewProject() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.tasks = [];
        this.currentProject = {
            id: this.generateId(),
            name: `Project ${new Date().toLocaleDateString()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tasks: [],
            answers: {},
            language: this.currentLanguage
        };
        
        this.navigateTo('questionnaire');
        this.loadQuestion(0);
        
        this.showToast(this.t('toast.newProjectCreated'), 'success');
    }
    
    saveProject() {
        if (!this.currentProject) {
            this.currentProject = {
                id: this.generateId(),
                name: `Project ${new Date().toLocaleDateString()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tasks: this.tasks,
                answers: this.answers,
                language: this.currentLanguage
            };
        }
        
        this.currentProject.tasks = this.tasks;
        this.currentProject.answers = this.answers;
        this.currentProject.updatedAt = new Date().toISOString();
        this.currentProject.language = this.currentLanguage;
        
        // Update board title if set
        const boardTitle = document.getElementById('boardTitle').textContent;
        if (boardTitle && boardTitle !== 'Project Board') {
            this.currentProject.name = boardTitle;
        }
        
        this.saveProjectToStorage(this.currentProject);
        this.updateLastSavedTime();
        this.updateSavedProjectsDropdown();
        
        return this.currentProject;
    }
    
    saveProjectAs() {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const tags = document.getElementById('projectTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        if (!name) {
            this.showToast(this.t('error.projectNameRequired'), 'error');
            return;
        }
        
        if (!this.currentProject) {
            this.currentProject = {
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tasks: this.tasks,
                answers: this.answers,
                language: this.currentLanguage
            };
        }
        
        this.currentProject.name = name;
        this.currentProject.description = description;
        this.currentProject.tags = tags;
        this.currentProject.tasks = this.tasks;
        this.currentProject.answers = this.answers;
        this.currentProject.updatedAt = new Date().toISOString();
        this.currentProject.language = this.currentLanguage;
        
        // Update auto-save setting
        this.autoSaveEnabled = document.getElementById('autoSave').checked;
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
        
        this.saveProjectToStorage(this.currentProject);
        this.updateSavedProjectsDropdown();
        this.saveProjectModal.classList.remove('active');
        
        document.getElementById('boardTitle').textContent = name;
        this.showToast(this.t('toast.projectSaved'), 'success');
    }
    
    saveProjectToStorage(project) {
        const projects = this.getSavedProjects();
        const existingIndex = projects.findIndex(p => p.id === project.id);
        
        if (existingIndex !== -1) {
            projects[existingIndex] = project;
        } else {
            projects.push(project);
        }
        
        // Keep only last 20 projects
        const recentProjects = projects
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 20);
        
        try {
            localStorage.setItem('intuiva-projects', JSON.stringify(recentProjects));
            localStorage.setItem('intuiva-last-project', project.id);
        } catch (e) {
            console.warn('Failed to save project to localStorage:', e);
            // Try to clear some space
            try {
                localStorage.setItem('intuiva-projects', JSON.stringify(recentProjects.slice(0, 10)));
            } catch (e2) {
                console.error('Could not save project:', e2);
            }
        }
    }
    
    getSavedProjects() {
        try {
            const projects = JSON.parse(localStorage.getItem('intuiva-projects') || '[]');
            return Array.isArray(projects) ? projects : [];
        } catch (e) {
            console.warn('Failed to load projects from localStorage:', e);
            return [];
        }
    }
    
    loadProject(projectId) {
        const projects = this.getSavedProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            this.showToast(this.t('error.projectNotFound'), 'error');
            return;
        }
        
        this.currentProject = project;
        this.tasks = project.tasks || [];
        this.answers = project.answers || {};
        this.currentLanguage = project.language || this.currentLanguage;
        
        // Update language selector
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.value = this.currentLanguage;
        }
        
        // Apply language
        this.applyLanguage();
        
        // Load kanban board
        if (this.kanbanBoard) {
            this.kanbanBoard.tasks = this.tasks;
            this.kanbanBoard.renderTasks();
        }
        
        // Update UI
        document.getElementById('boardTitle').textContent = project.name || 'Project Board';
        this.updateStats();
        this.navigateTo('kanbanBoard');
        
        this.showToast(this.t('toast.projectLoaded', { name: project.name }), 'success');
    }
    
    showSaveProjectModal() {
        if (this.currentProject) {
            document.getElementById('projectName').value = this.currentProject.name || '';
            document.getElementById('projectDescription').value = this.currentProject.description || '';
            document.getElementById('projectTags').value = (this.currentProject.tags || []).join(', ');
        }
        document.getElementById('autoSave').checked = this.autoSaveEnabled;
        document.getElementById('saveProjectModal').classList.add('active');
    }
    
    showLoadProjectModal() {
        const list = document.getElementById('savedProjectsList');
        const noProjects = document.getElementById('noProjectsMessage');
        const projects = this.getSavedProjects();
        
        if (projects.length === 0) {
            list.style.display = 'none';
            noProjects.style.display = 'block';
        } else {
            list.style.display = 'block';
            noProjects.style.display = 'none';
            
            list.innerHTML = projects
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map(project => `
                    <div class="project-item" data-project-id="${project.id}">
                        <div class="project-info">
                            <div class="project-name">${this.escapeHtml(project.name || 'Unnamed Project')}</div>
                            <div class="project-meta">
                                <span>${project.tasks?.length || 0} tasks</span>
                                <span>•</span>
                                <span>${this.formatDate(project.updatedAt)}</span>
                                ${project.description ? `<span>•</span><span>${this.escapeHtml(project.description.substring(0, 30))}...</span>` : ''}
                            </div>
                        </div>
                        <button class="btn-icon delete-project" data-project-id="${project.id}" title="Delete project">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            
            // Add event listeners
            list.querySelectorAll('.project-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.delete-project')) {
                        const projectId = e.currentTarget.dataset.projectId;
                        this.loadProject(projectId);
                        document.getElementById('loadProjectModal').classList.remove('active');
                    }
                });
            });
            
            // Add delete button listeners
            list.querySelectorAll('.delete-project').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const projectId = e.currentTarget.dataset.projectId;
                    this.deleteProject(projectId);
                });
            });
        }
        
        document.getElementById('loadProjectModal').classList.add('active');
    }
    
    deleteProject(projectId) {
        if (confirm(this.t('confirm.deleteProject'))) {
            const projects = this.getSavedProjects();
            const updatedProjects = projects.filter(p => p.id !== projectId);
            
            try {
                localStorage.setItem('intuiva-projects', JSON.stringify(updatedProjects));
                
                // If deleting current project, clear it
                if (this.currentProject && this.currentProject.id === projectId) {
                    this.currentProject = null;
                    this.tasks = [];
                    this.answers = {};
                    if (this.kanbanBoard) {
                        this.kanbanBoard.clearTasks();
                    }
                    this.updateStats();
                    this.navigateTo('onboarding');
                }
                
                this.updateSavedProjectsDropdown();
                this.showLoadProjectModal(); // Refresh the list
                this.showToast(this.t('toast.projectDeleted'), 'success');
            } catch (e) {
                console.warn('Failed to delete project:', e);
                this.showToast(this.t('error.deleteFailed'), 'error');
            }
        }
    }
    
    importProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Validate project data
                    if (!data.tasks || !Array.isArray(data.tasks)) {
                        throw new Error('Invalid project file format');
                    }
                    
                    // Create new project from import
                    const project = {
                        id: this.generateId(),
                        name: data.name || `Imported ${new Date().toLocaleDateString()}`,
                        description: data.description || '',
                        tags: data.tags || [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        tasks: data.tasks,
                        answers: data.answers || {},
                        language: data.language || this.currentLanguage
                    };
                    
                    // Save the imported project
                    this.saveProjectToStorage(project);
                    this.loadProject(project.id);
                    document.getElementById('loadProjectModal').classList.remove('active');
                    
                    this.showToast(this.t('toast.projectImported'), 'success');
                } catch (error) {
                    console.error('Import failed:', error);
                    this.showToast(this.t('error.importFailed'), 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    startAutoSave() {
        this.stopAutoSave(); // Clear any existing interval
        
        this.autoSaveInterval = setInterval(() => {
            if (this.autoSaveEnabled && (this.tasks.length > 0 || Object.keys(this.answers).length > 0)) {
                this.saveProject();
                console.log('Auto-saved project');
            }
        }, 30000); // Every 30 seconds
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    updateLastSavedTime() {
        if (this.currentProject) {
            const element = document.getElementById('lastSaved');
            if (element) {
                element.textContent = this.formatDate(this.currentProject.updatedAt);
            }
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }
    
    toggleSavedProjectsDropdown() {
        const menu = document.getElementById('savedProjectsMenu');
        menu.classList.toggle('active');
        
        // Close dropdown when clicking outside
        if (menu.classList.contains('active')) {
            const closeHandler = (e) => {
                if (!menu.contains(e.target) && e.target.id !== 'savedProjectsBtn') {
                    menu.classList.remove('active');
                    document.removeEventListener('click', closeHandler);
                }
            };
            setTimeout(() => {
                document.addEventListener('click', closeHandler);
            }, 0);
        }
    }
    
    updateSavedProjectsDropdown() {
        const menu = document.getElementById('savedProjectsMenu');
        const projects = this.getSavedProjects();
        
        if (projects.length === 0) {
            menu.innerHTML = `
                <div class="project-item" style="justify-content: center; color: var(--color-text-muted);">
                    <i class="fas fa-folder-open"></i>
                    <span style="margin-left: 0.5rem;">No saved projects</span>
                </div>
            `;
            return;
        }
        
        menu.innerHTML = projects
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map(project => `
                <div class="project-item" data-project-id="${project.id}">
                    <div class="project-info">
                        <div class="project-name">${this.escapeHtml(project.name || 'Unnamed Project')}</div>
                        <div class="project-meta">
                            <span>${project.tasks?.length || 0} tasks</span>
                            <span>•</span>
                            <span>${this.formatDate(project.updatedAt)}</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right" style="color: var(--color-text-muted);"></i>
                </div>
            `).join('');
        
        // Add event listeners
        menu.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const projectId = e.currentTarget.dataset.projectId;
                this.loadProject(projectId);
                menu.classList.remove('active');
            });
        });
    }
    
    async generateProjectReport() {
        if (this.isGeneratingReport) return;
        this.isGeneratingReport = true;
        
        const btn = document.getElementById('generateReportBtn');
        const placeholderBtn = document.getElementById('generateReportPlaceholderBtn');
        const originalHtml = btn ? btn.innerHTML : placeholderBtn.innerHTML;
        
        if (btn) {
            btn.innerHTML = `<div class="loading"></div> ${this.t('ai.generatingReport')}`;
            btn.disabled = true;
        }
        if (placeholderBtn) {
            placeholderBtn.innerHTML = `<div class="loading"></div> ${this.t('ai.generatingReport')}`;
            placeholderBtn.disabled = true;
        }
        
        try {
            const requestData = {
                answers: this.answers,
                tasks: this.tasks,
                questions: this.questions,
                language: this.currentLanguage,
                generateReport: true
            };

            const response = await fetch('https://intuivabackend-production.up.railway.app/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success && result.report) {
                this.storeProjectReport(result.report);
                this.showToast(this.t('ai.reportGenerated'), 'success');
            } else {
                throw new Error('AI failed to generate report');
            }
            
        } catch (error) {
            console.warn('Report generation failed:', error);
            
            // Generate a simple report locally
            const localReport = this.generateLocalReport();
            this.storeProjectReport(localReport);
            this.showToast(this.t('ai.reportGeneratedLocal'), 'info');
            
        } finally {
            if (btn) {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
            if (placeholderBtn) {
                placeholderBtn.innerHTML = originalHtml;
                placeholderBtn.disabled = false;
            }
            this.isGeneratingReport = false;
        }
    }
    
    storeProjectReport(report) {
        if (!this.currentProject) {
            this.currentProject = {
                id: this.generateId(),
                name: `Project ${new Date().toLocaleDateString()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tasks: this.tasks,
                answers: this.answers,
                language: this.currentLanguage
            };
        }
        
        this.currentProject.report = report;
        this.currentProject.reportGeneratedAt = new Date().toISOString();
        this.saveProjectToStorage(this.currentProject);
        
        // Display the report
        this.displayProjectReport(report);
        
        // Enable PDF download button
        document.getElementById('downloadPdfBtn').disabled = false;
    }
    
    displayProjectReport(report) {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = `
            <div style="font-family: inherit;">
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--color-primary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chart-line"></i>
                        ${this.currentProject?.name || 'Project'} Analysis Report
                    </h4>
                    <div style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
                        Generated on ${new Date().toLocaleDateString()} • ${this.tasks.length} tasks • ${Object.keys(this.answers).length} answers analyzed
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    ${report.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
                </div>
                
                <div style="background-color: var(--color-surface-light); padding: 1rem; border-radius: var(--radius-md); margin-top: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary); font-size: 0.875rem;">
                        <i class="fas fa-lightbulb"></i>
                        <span>AI-generated insights based on your project data. Use these recommendations to optimize your workflow.</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateLocalReport() {
        const completedTasks = this.tasks.filter(t => t.status === 'done').length;
        const totalTasks = this.tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const highPriorityTasks = this.tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;
        const answeredQuestions = Object.values(this.answers).filter(a => 
            a && a !== '[Skipped]' && a !== '[Not Applicable]'
        ).length;
        
        return `
**Executive Summary**
Based on your ${answeredQuestions} detailed answers and ${totalTasks} generated tasks, your project shows strong potential. Completion rate is currently at ${completionRate}%.

**Key Findings**
1. **Project Scope**: Well-defined with clear objectives based on your responses
2. **Task Distribution**: ${highPriorityTasks} high-priority tasks identified for immediate focus
3. **Progress Tracking**: ${completedTasks} of ${totalTasks} tasks completed
4. **Resource Allocation**: Tasks are properly prioritized for efficient workflow

**Recommendations**
1. Focus on completing high-priority tasks first
2. Consider breaking down larger tasks if progress stalls
3. Regular review of task priorities as project evolves
4. Use the Kanban board to visualize workflow bottlenecks

**Next Steps**
1. Review and adjust task priorities weekly
2. Set realistic deadlines for critical tasks
3. Regular progress reviews every 3-5 days
4. Export this report for stakeholder updates

**Risk Assessment**
- Low risk of scope creep based on current task structure
- Good task distribution across priority levels
- Clear path to completion visible in current board layout

*This report was generated based on your project data. For more detailed analysis, continue adding tasks and updating progress.*
        `;
    }
    
    downloadPdfReport() {
        if (!this.currentProject?.report) {
            this.showToast(this.t('error.noReport'), 'error');
            return;
        }
        
        // Create a simple HTML download for now
        const reportHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${this.currentProject.name} - Project Report</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { color: #2d3748; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
                    h2 { color: #4a5568; margin-top: 30px; }
                    h3 { color: #718096; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .meta { color: #718096; font-size: 14px; margin-bottom: 20px; }
                    .section { margin-bottom: 30px; }
                    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #8b5cf6; }
                    .stat-label { font-size: 12px; color: #718096; text-transform: uppercase; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${this.escapeHtml(this.currentProject.name)}</h1>
                    <div class="meta">
                        Generated by Intuiva AI Project Manager • ${new Date().toLocaleDateString()}
                    </div>
                </div>
                
                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-value">${this.tasks.length}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${this.tasks.filter(t => t.status === 'done').length}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${this.tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length}</div>
                        <div class="stat-label">High Priority</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${Object.keys(this.answers).length}</div>
                        <div class="stat-label">Questions Answered</div>
                    </div>
                </div>
                
                ${this.currentProject.report.split('\n').map(para => {
                    if (para.trim().startsWith('**') && para.trim().endsWith('**')) {
                        const title = para.trim().replace(/\*\*/g, '');
                        return `<h2>${this.escapeHtml(title)}</h2>`;
                    } else if (para.trim().match(/^\d+\./)) {
                        return `<p style="margin-left: 20px;">${this.escapeHtml(para)}</p>`;
                    } else {
                        return `<p>${this.escapeHtml(para)}</p>`;
                    }
                }).join('')}
                
                <div class="footer">
                    <p>This report was generated by Intuiva AI Project Manager.</p>
                    <p>Creator: Ilke Candan Bengi • <a href="https://www.linkedin.com/in/ilkecandan/">LinkedIn Profile</a></p>
                    <p>Report generated on: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;
        
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `intuiva-report-${this.currentProject.name.replace(/\s+/g, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(this.t('toast.pdfDownloaded'), 'success');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Backward compatibility methods
    saveToLocalStorage() {
        // This is now handled by saveProject()
        this.saveProject();
    }
    
    loadFromLocalStorage() {
        // This is now handled by initProjectManagement()
        // Load any existing data for backward compatibility
        try {
            const oldData = JSON.parse(localStorage.getItem('intuiva-data'));
            if (oldData && !this.currentProject) {
                // Migrate old data to new project format
                this.tasks = oldData.tasks || [];
                this.answers = oldData.answers || {};
                this.currentLanguage = oldData.language || this.currentLanguage;
                
                // Create a project from old data
                this.currentProject = {
                    id: this.generateId(),
                    name: `Migrated Project`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tasks: this.tasks,
                    answers: this.answers,
                    language: this.currentLanguage
                };
                
                this.saveProjectToStorage(this.currentProject);
                
                // Update language selector
                const langSelector = document.getElementById('languageSelector');
                if (langSelector) {
                    langSelector.value = this.currentLanguage;
                }
                
                if (this.tasks && this.tasks.length > 0) {
                    if (!this.kanbanBoard) {
                        this.kanbanBoard = new KanbanBoard(this.tasks);
                    }
                    this.updateStats();
                }
            }
        } catch (e) {
            console.warn('Failed to load old data from localStorage:', e);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.intuivaApp = new IntuivaApp();
});
