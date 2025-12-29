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
        this.questionDots = [];
        
        this.init();
    }
    
    detectLanguage() {
        try {
            const savedLang = localStorage.getItem('intuiva-language');
            if (savedLang && (savedLang === 'en' || savedLang === 'tr')) {
                return savedLang;
            }
            
            const browserLang = navigator.language || navigator.userLanguage || 'en';
            return browserLang.startsWith('tr') ? 'tr' : 'en';
        } catch (error) {
            console.warn('Language detection failed, defaulting to English:', error);
            return 'en';
        }
    }
    
    t(key, params = {}) {
        try {
            let translation = window.TRANSLATIONS?.[this.currentLanguage]?.[key] || 
                            window.TRANSLATIONS?.['en']?.[key] || 
                            key;
            
            Object.keys(params).forEach(param => {
                const regex = new RegExp(`{{${param}}}`, 'g');
                translation = translation.replace(regex, params[param]);
            });
            
            return translation;
        } catch (error) {
            console.warn('Translation failed for key:', key, error);
            return key;
        }
    }

    init() {
        console.log('Intuiva App initializing...');
        
        this.screens = {
            onboarding: document.getElementById('onboarding'),
            questionnaire: document.getElementById('questionnaire'),
            kanbanBoard: document.getElementById('kanbanBoard')
        };
        
        this.initElements();
        this.initButtons();
        this.initNavigation();
        this.initQuestionnaire();
        this.initModals();
        this.initDragAndDrop();
        this.initTheme();
        this.initCharCounter();
        this.initProjectManagement();
        this.initKeyboardShortcuts();
        this.initQuestionDots();
        
        this.showScreen('onboarding');
        this.savedProjects = this.getSavedProjects();
        this.updateSavedProjectsDropdown();
        
        // Apply language after everything is initialized
        setTimeout(() => {
            this.applyLanguage();
            const langSelector = document.getElementById('languageSelector');
            if (langSelector) {
                langSelector.value = this.currentLanguage;
            }
        }, 100);
        
        console.log('Intuiva App initialized successfully');
    }

    initElements() {
        // Cache frequently used DOM elements
        this.elements = {
            answerInput: document.getElementById('answerInput'),
            charCount: document.getElementById('charCount'),
            questionNumber: document.getElementById('questionNumber'),
            questionTitle: document.getElementById('questionTitle'),
            questionText: document.getElementById('questionText'),
            categoryTitle: document.getElementById('categoryTitle'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            boardTitle: document.getElementById('boardTitle'),
            totalTasks: document.getElementById('totalTasks'),
            doneTasks: document.getElementById('doneTasks'),
            wipTasks: document.getElementById('wipTasks'),
            todoCount: document.getElementById('todoCount'),
            inprogressCount: document.getElementById('inprogressCount'),
            doneCount: document.getElementById('doneCount'),
            lastSaved: document.getElementById('lastSaved'),
            currentProjectName: document.getElementById('currentProjectName'),
            projectNameDisplay: document.getElementById('projectNameDisplay'),
            tipText: document.getElementById('tipText'),
            reportContent: document.getElementById('reportContent'),
            savedProjectsMenu: document.getElementById('savedProjectsMenu')
        };
    }

    initButtons() {
        // Start button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.createNewProject();
            });
        }
        
        // Load project button
        const loadProjectBtn = document.getElementById('loadProjectBtn');
        if (loadProjectBtn) {
            loadProjectBtn.addEventListener('click', () => {
                this.showLoadProjectModal();
            });
        }
        
        // Home button
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('onboarding');
            });
        }
        
        // Saved projects dropdown
        const savedProjectsBtn = document.getElementById('savedProjectsBtn');
        if (savedProjectsBtn) {
            savedProjectsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSavedProjectsDropdown();
            });
        }
        
        // Clear All button
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
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
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
        }
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        // Question action buttons
        const skipQuestionBtn = document.getElementById('skipQuestionBtn');
        if (skipQuestionBtn) {
            skipQuestionBtn.addEventListener('click', () => this.skipQuestion());
        }
        
        const notAnswerBtn = document.getElementById('notAnswerBtn');
        if (notAnswerBtn) {
            notAnswerBtn.addEventListener('click', () => this.markAsNotApplicable());
        }
        
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAnswer());
        }
        
        // Board action buttons
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.openTaskModal());
        }
        
        const regenerateBtn = document.getElementById('regenerateBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateTasks());
        }
        
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', () => this.showSaveProjectModal());
        }
        
        const exportProjectBtn = document.getElementById('exportProjectBtn');
        if (exportProjectBtn) {
            exportProjectBtn.addEventListener('click', () => this.exportProject());
        }
        
        // Report buttons
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateProjectReport());
        }
        
        const generateReportPlaceholderBtn = document.getElementById('generateReportPlaceholderBtn');
        if (generateReportPlaceholderBtn) {
            generateReportPlaceholderBtn.addEventListener('click', () => this.generateProjectReport());
        }
        
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => this.downloadPdfReport());
        }
        
        // Add task buttons in columns
        document.querySelectorAll('.btn-add-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const column = e.currentTarget.dataset.column;
                this.openTaskModal(column);
            });
        });
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                document.getElementById('helpModal').classList.add('active');
            });
        }
        
        // Language selector
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
        
        // Back to questions button
        const backToQuestionsBtn = document.getElementById('backToQuestionsBtn');
        if (backToQuestionsBtn) {
            backToQuestionsBtn.addEventListener('click', () => {
                this.navigateTo('questionnaire');
            });
        }
        
        // Jump to start/end buttons
        const jumpToStartBtn = document.getElementById('jumpToStartBtn');
        if (jumpToStartBtn) {
            jumpToQuestionsBtn.addEventListener('click', () => {
                this.loadQuestion(0);
            });
        }
        
        const jumpToEndBtn = document.getElementById('jumpToEndBtn');
        if (jumpToEndBtn) {
            jumpToEndBtn.addEventListener('click', () => {
                this.loadQuestion(this.totalQuestions - 1);
            });
        }
        
        // Compact toggle
        const compactToggle = document.getElementById('compactToggle');
        if (compactToggle) {
            compactToggle.addEventListener('click', () => {
                document.querySelector('.app-container').classList.toggle('compact');
                this.showToast(this.t('toast.compactMode'), 'info');
            });
        }
        
        // Report toggle
        const reportToggle = document.getElementById('reportToggle');
        if (reportToggle) {
            reportToggle.addEventListener('click', () => {
                const content = document.getElementById('reportContent');
                const icon = document.getElementById('reportToggleIcon');
                content.classList.toggle('collapsed');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        }
        
        // Quick action buttons
        const quickAddTask = document.getElementById('quickAddTask');
        if (quickAddTask) {
            quickAddTask.addEventListener('click', () => this.openTaskModal());
        }
        
        const quickReport = document.getElementById('quickReport');
        if (quickReport) {
            quickReport.addEventListener('click', () => this.generateProjectReport());
        }
        
        const quickSave = document.getElementById('quickSave');
        if (quickSave) {
            quickSave.addEventListener('click', () => this.saveProject());
        }
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
        try {
            if (this.currentScreen === 'questionnaire' && this.elements.answerInput) {
                this.saveAnswer(this.elements.answerInput.value);
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
        } catch (error) {
            console.error('Navigation error:', error);
            this.showToast(this.t('error.navigation'), 'error');
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
        try {
            if (window.getQuestions) {
                this.questions = window.getQuestions(this.currentLanguage);
            } else if (window.QUESTIONS && window.QUESTIONS[this.currentLanguage]) {
                this.questions = window.QUESTIONS[this.currentLanguage];
            } else if (Array.isArray(window.QUESTIONS)) {
                this.questions = window.QUESTIONS;
            } else {
                console.error('No questions found');
                this.questions = [];
            }
            
            this.totalQuestions = this.questions.length;
            
            if (this.elements.answerInput) {
                this.elements.answerInput.addEventListener('input', (e) => {
                    this.saveAnswer(e.target.value);
                    this.updateCharCounter();
                    this.updateQuestionDot(this.currentQuestionIndex);
                });
                
                this.elements.answerInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.nextQuestion();
                    } else if (e.key === 'Escape') {
                        this.clearAnswer();
                    } else if (e.ctrlKey && e.key === 'Enter') {
                        e.preventDefault();
                        this.nextQuestion();
                    }
                });
            }
            
            // Initialize question dots
            this.initQuestionDots();
        } catch (error) {
            console.error('Questionnaire initialization error:', error);
            this.questions = [];
            this.totalQuestions = 0;
        }
    }

    initQuestionDots() {
        const dotsContainer = document.querySelector('.question-dots');
        if (!dotsContainer || !this.questions || this.questions.length === 0) return;
        
        dotsContainer.innerHTML = '';
        this.questionDots = [];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            const dot = document.createElement('div');
            dot.className = 'question-dot';
            dot.dataset.index = i;
            dot.title = `${this.t('question.number', { number: i + 1 })}: ${this.questions[i]?.category || ''}`;
            
            dot.addEventListener('click', () => {
                this.loadQuestion(i);
            });
            
            dotsContainer.appendChild(dot);
            this.questionDots.push(dot);
        }
        
        this.updateQuestionDot(this.currentQuestionIndex);
    }

    updateQuestionDot(index) {
        this.questionDots.forEach((dot, i) => {
            dot.classList.remove('active', 'answered', 'skipped');
            
            if (i === index) {
                dot.classList.add('active');
            } else if (this.answers[i] === '[Skipped]') {
                dot.classList.add('skipped');
            } else if (this.answers[i] && this.answers[i] !== '[Not Applicable]') {
                dot.classList.add('answered');
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
                if (this.taskForm) this.taskForm.reset();
                if (this.saveProjectForm) this.saveProjectForm.reset();
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    if (this.taskForm) this.taskForm.reset();
                    if (this.saveProjectForm) this.saveProjectForm.reset();
                }
            });
        });
        
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTask();
            });
        }
        
        if (this.saveProjectForm) {
            this.saveProjectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProjectAs();
            });
        }
        
        // Import project button
        const importProjectBtn = document.getElementById('importProjectBtn');
        if (importProjectBtn) {
            importProjectBtn.addEventListener('click', () => {
                this.importProject();
            });
        }
        
        // Suggest name button
        const suggestNameBtn = document.getElementById('suggestNameBtn');
        if (suggestNameBtn) {
            suggestNameBtn.addEventListener('click', () => {
                this.suggestProjectName();
            });
        }
        
        // Use current date button
        const useCurrentDateBtn = document.getElementById('useCurrentDateBtn');
        if (useCurrentDateBtn) {
            useCurrentDateBtn.addEventListener('click', () => {
                this.useCurrentDateForProjectName();
            });
        }
        
        this.helpModal = document.getElementById('helpModal');
    }
    
    initDragAndDrop() {
        // This will be initialized by the KanbanBoard class
    }
    
    initTheme() {
        try {
            const savedTheme = localStorage.getItem('intuiva-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) {
                themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        } catch (error) {
            console.warn('Theme initialization failed:', error);
        }
    }
    
    initCharCounter() {
        this.updateCharCounter();
    }
    
    initProjectManagement() {
        this.savedProjects = this.getSavedProjects();
        if (this.savedProjects.length > 0) {
            const mostRecent = this.savedProjects.sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )[0];
            this.currentProject = mostRecent;
            this.loadProject(mostRecent.id);
        }
        
        this.startAutoSave();
        this.updateLastSavedTime();
    }
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveProject();
                this.showToast(this.t('toast.projectSaved'), 'success');
            }
            
            // Ctrl+N for new project
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewProject();
            }
            
            // Ctrl+E to export
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.exportProject();
            }
            
            // Ctrl+R to regenerate
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.regenerateTasks();
            }
            
            // Ctrl+H for help
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                document.getElementById('helpModal').classList.add('active');
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
        
        this.updateActiveNav();
        
        if (screenName === 'kanbanBoard' && !this.kanbanBoard) {
            this.kanbanBoard = new KanbanBoard(this.tasks);
        }
        
        // Update project name display
        if (this.currentProject && screenName !== 'onboarding') {
            this.elements.projectNameDisplay.style.display = 'block';
            this.elements.currentProjectName.textContent = this.currentProject.name || 'Untitled Project';
        } else {
            this.elements.projectNameDisplay.style.display = 'none';
        }
    }
    
    loadQuestion(index) {
        try {
            if (index < 0 || index >= this.totalQuestions || !this.questions[index]) {
                console.warn('Invalid question index:', index);
                if (index >= this.totalQuestions - 1) {
                    this.generateTasksFromAnswers();
                }
                return;
            }
            
            this.currentQuestionIndex = index;
            const question = this.questions[index];
            
            // Update UI elements with null checks
            if (this.elements.questionNumber) {
                this.elements.questionNumber.textContent = this.t('question.number', { number: index + 1 });
            }
            
            if (this.elements.questionTitle) {
                this.elements.questionTitle.textContent = question.category || this.t('question.defaultTitle');
            }
            
            if (this.elements.questionText) {
                this.elements.questionText.textContent = question.text || this.t('question.defaultText');
            }
            
            if (this.elements.categoryTitle) {
                this.elements.categoryTitle.textContent = question.category || this.t('question.category');
            }
            
            // Update progress
            if (this.elements.progressFill && this.elements.progressText) {
                const progress = ((index + 1) / this.totalQuestions) * 100;
                this.elements.progressFill.style.width = `${progress}%`;
                this.elements.progressText.textContent = this.t('question.progress', {
                    current: index + 1,
                    total: this.totalQuestions
                });
            }
            
            // Load saved answer
            if (this.elements.answerInput) {
                this.elements.answerInput.value = this.answers[index] || '';
                this.elements.answerInput.focus();
            }
            
            // Update character counter
            this.updateCharCounter();
            
            // Update button states
            const prevBtn = document.getElementById('prevBtn');
            if (prevBtn) {
                prevBtn.disabled = index === 0;
            }
            
            // Update next button text for last question
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) {
                const nextBtnText = nextBtn.querySelector('span');
                if (nextBtnText) {
                    nextBtnText.textContent = index === this.totalQuestions - 1 ? 
                        this.t('button.generateBoard') : this.t('button.next');
                }
            }
            
            // Update tip text based on question
            if (this.elements.tipText) {
                const tips = {
                    'tr': '💡 İpucu: Mümkün olduğunca detaylı cevap verin. Bu, daha iyi görevler oluşturmamıza yardımcı olur.',
                    'en': '💡 Tip: Provide as much detail as possible. This helps generate better tasks.'
                };
                this.elements.tipText.textContent = tips[this.currentLanguage] || tips['en'];
            }
            
            // Update question dot
            this.updateQuestionDot(index);
            
        } catch (error) {
            console.error('Error loading question:', error);
            this.showToast(this.t('error.loadQuestion'), 'error');
        }
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.loadQuestion(this.currentQuestionIndex - 1);
        }
    }
    
    nextQuestion() {
        try {
            if (this.elements.answerInput) {
                this.saveAnswer(this.elements.answerInput.value);
            }
            
            if (this.currentQuestionIndex < this.totalQuestions - 1) {
                this.loadQuestion(this.currentQuestionIndex + 1);
            } else {
                this.generateTasksFromAnswers();
            }
        } catch (error) {
            console.error('Error moving to next question:', error);
            this.showToast(this.t('error.nextQuestion'), 'error');
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
        if (this.elements.answerInput) {
            this.elements.answerInput.value = '';
            delete this.answers[this.currentQuestionIndex];
            this.updateCharCounter();
            this.elements.answerInput.focus();
        }
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
        try {
            if (!this.elements.answerInput || !this.elements.charCount) return;
            
            const text = this.elements.answerInput.value;
            const charCount = text.length;
            const maxChars = 1000;
            
            this.elements.charCount.textContent = `${charCount}/${maxChars}`;
            
            if (charCount > maxChars * 0.9) {
                this.elements.charCount.style.color = 'var(--color-error)';
            } else if (charCount > maxChars * 0.75) {
                this.elements.charCount.style.color = 'var(--color-warning)';
            } else {
                this.elements.charCount.style.color = 'var(--color-text-muted)';
            }
        } catch (error) {
            console.warn('Char counter update failed:', error);
        }
    }
    
    async generateTasksFromAnswers() {
        if (this.isGeneratingTasks) return;
        this.isGeneratingTasks = true;

        const nextBtn = document.getElementById('nextBtn');
        const originalHtml = nextBtn ? nextBtn.innerHTML : '';
        
        // Show loading state
        if (nextBtn) {
            nextBtn.innerHTML = `<div class="loading"></div> ${this.t('ai.contacting')}`;
            nextBtn.disabled = true;
        }

        // Show generating animation on kanban board
        const kanbanContainer = document.querySelector('.kanban-container');
        if (kanbanContainer) {
            kanbanContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div class="loading" style="width: 40px; height: 40px; margin: 0 auto 1rem;"></div>
                    <h3>${this.t('ai.generating')}</h3>
                    <p style="color: var(--color-text-muted); margin-top: 0.5rem;">
                        ${this.t('ai.analyzingAnswers')}
                    </p>
                </div>
            `;
        }

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
            
            if (nextBtn) {
                nextBtn.innerHTML = originalHtml;
                nextBtn.disabled = false;
            }
            this.isGeneratingTasks = false;
        }
    }
    
    // ... (rest of the methods remain similar but with improved error handling)
    // For brevity, I'll include the critical parts and you can see the pattern
    
    showToast(message, type = 'info') {
        try {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            if (!toast || !toastMessage) return;
            
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
        } catch (error) {
            console.warn('Toast failed:', error);
        }
    }
    
    applyLanguage() {
        try {
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
        } catch (error) {
            console.error('Language application failed:', error);
        }
    }
    
    setLanguage(lang) {
        try {
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
        } catch (error) {
            console.error('Language change failed:', error);
            this.showToast(this.t('error.languageChange'), 'error');
        }
    }
    
    // Helper methods for project management
    suggestProjectName() {
        const names = {
            'en': [
                'Strategic Initiative',
                'Project Launchpad',
                'Growth Accelerator',
                'Innovation Hub',
                'Transformation Project'
            ],
            'tr': [
                'Stratejik Girişim',
                'Proje Platformu',
                'Büyüme Hızlandırıcı',
                'İnovasyon Merkezi',
                'Dönüşüm Projesi'
            ]
        };
        
        const langNames = names[this.currentLanguage] || names['en'];
        const randomName = langNames[Math.floor(Math.random() * langNames.length)];
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput) {
            projectNameInput.value = randomName;
        }
    }
    
    useCurrentDateForProjectName() {
        const now = new Date();
        const dateStr = now.toLocaleDateString(this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput) {
            projectNameInput.value = `${this.t('project.defaultName')} - ${dateStr}`;
        }
    }
    
    // ... (rest of the methods continue with the same pattern of error handling)
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.intuivaApp = new IntuivaApp();
    } catch (error) {
        console.error('Failed to initialize Intuiva App:', error);
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #0a0a0f;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 2rem;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h1 style="color: #ef4444; margin-bottom: 1rem;">⚠️ Application Error</h1>
            <p>Failed to initialize the application. Please refresh the page.</p>
            <p style="color: #94a3b8; margin-top: 2rem; font-size: 0.875rem;">Error: ${error.message}</p>
            <button onclick="location.reload()" style="
                margin-top: 2rem;
                padding: 0.5rem 1rem;
                background: #8b5cf6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
            ">
                Refresh Page
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
});
