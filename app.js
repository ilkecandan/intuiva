class IntuivaApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.tasks = [];
        this.kanbanBoard = null;
        this.isGeneratingTasks = false;
        this.currentScreen = 'onboarding';
        this.currentLanguage = this.detectLanguage();
        
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
        
        this.showScreen('onboarding');
        this.loadFromLocalStorage();
        
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

    initButtons() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.navigateTo('questionnaire');
            this.loadQuestion(0);
        });
        
        // Skip to board button
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.tasks = [];
            this.answers = {};
            this.currentQuestionIndex = 0;
            
            try {
                localStorage.removeItem('intuiva-data');
            } catch (e) {
                console.warn('Failed to clear localStorage:', e);
            }
            
            if (this.kanbanBoard) {
                this.kanbanBoard.clearTasks();
            }
            
            this.navigateTo('kanbanBoard');

            if (this.kanbanBoard) {
                this.kanbanBoard.tasks = [];
                this.kanbanBoard.renderTasks();
                this.updateStats();
            }
            
            this.showToast(this.t('toast.startedEmpty'), 'info');
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
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
                this.taskForm.reset();
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    this.taskForm.reset();
                }
            });
        });
        
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
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
        
        this.saveToLocalStorage();
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
                language: this.currentLanguage
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
            this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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
                language: this.currentLanguage
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
            this.saveToLocalStorage();
            
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
            console.warn('Failed to load from localStorage:', e);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.intuivaApp = new IntuivaApp();
});
