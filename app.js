import { LEAN_QUESTIONS, TASK_TEMPLATES, STORAGE_KEYS } from './data.js';

class IntuivaApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.userAnswers = this.loadAnswers();
        this.answerType = 'text';
        this.totalQuestions = LEAN_QUESTIONS.reduce((total, category) => total + category.questions.length, 0);
        
        this.init();
    }

    init() {
        // Initialize event listeners
        this.initEventListeners();
        this.initTheme();
        
        // Check if user has completed questionnaire
        if (this.userAnswers.length > 0 && this.userAnswers.length >= this.totalQuestions) {
            this.showKanbanBoard();
        } else {
            this.showWelcomeModal();
        }
        
        // Update progress
        this.updateProgress();
    }

    initEventListeners() {
        // Navigation buttons
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipQuestion());
        
        // Answer type selector
        document.querySelectorAll('.answer-type').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeAnswerType(e));
        });
        
        // Text input
        document.getElementById('answerInput').addEventListener('input', (e) => this.updateWordCount(e));
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
        
        // Start button in welcome modal
        document.getElementById('startBtn').addEventListener('click', () => this.startQuestionnaire());
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });
        
        // Task modal save
        document.querySelector('.modal-save')?.addEventListener('click', () => this.saveTask());
        
        // Export options
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', (e) => this.exportData(e.target.dataset.format));
        });
        
        // Window events
        window.addEventListener('beforeunload', () => this.saveAnswers());
    }

    initTheme() {
        const savedTheme = localStorage.getItem('intuiva_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('intuiva_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    showWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        modal.classList.add('active');
    }

    startQuestionnaire() {
        this.closeModal(document.getElementById('welcomeModal'));
        this.showQuestionFlow();
        this.loadQuestion();
    }

    showQuestionFlow() {
        document.getElementById('questionFlow').classList.add('active');
        document.getElementById('kanbanBoard').classList.remove('active');
    }

    showKanbanBoard() {
        document.getElementById('questionFlow').classList.remove('active');
        document.getElementById('kanbanBoard').classList.add('active');
        
        // Initialize Kanban board if not already done
        if (typeof window.kanban === 'undefined') {
            window.kanban = new KanbanBoard();
        }
    }

    loadQuestion() {
        const { category, questionIndex } = this.getCurrentQuestionInfo();
        const question = LEAN_QUESTIONS[category.index].questions[questionIndex];
        
        // Update UI
        document.getElementById('categoryTitle').textContent = category.name;
        document.getElementById('categoryDescription').textContent = category.description;
        document.getElementById('currentQuestion').textContent = question;
        document.getElementById('questionNumber').textContent = `Q${this.currentQuestionIndex + 1}`;
        
        // Load saved answer if exists
        const savedAnswer = this.userAnswers[this.currentQuestionIndex];
        if (savedAnswer) {
            document.getElementById('answerInput').value = savedAnswer.text || '';
            this.updateWordCount();
        } else {
            document.getElementById('answerInput').value = '';
        }
        
        // Update progress
        this.updateProgress();
    }

    getCurrentQuestionInfo() {
        let questionCount = 0;
        for (let i = 0; i < LEAN_QUESTIONS.length; i++) {
            const category = LEAN_QUESTIONS[i];
            if (this.currentQuestionIndex < questionCount + category.questions.length) {
                return {
                    category: {
                        index: i,
                        name: category.category,
                        description: category.description
                    },
                    questionIndex: this.currentQuestionIndex - questionCount
                };
            }
            questionCount += category.questions.length;
        }
        return null;
    }

    nextQuestion() {
        this.saveCurrentAnswer();
        
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
        } else {
            this.completeQuestionnaire();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
        }
    }

    skipQuestion() {
        this.userAnswers[this.currentQuestionIndex] = { text: '', skipped: true };
        this.nextQuestion();
    }

    saveCurrentAnswer() {
        const answerText = document.getElementById('answerInput').value.trim();
        this.userAnswers[this.currentQuestionIndex] = {
            text: answerText,
            skipped: false,
            timestamp: new Date().toISOString()
        };
    }

    changeAnswerType(e) {
        const type = e.target.dataset.type;
        this.answerType = type;
        
        // Update UI
        document.querySelectorAll('.answer-type').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Change input type if needed
        // Currently using textarea for all types
    }

    updateWordCount(e) {
        const text = document.getElementById('answerInput').value;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        document.getElementById('wordCount').textContent = `${wordCount} words`;
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        
        const { category } = this.getCurrentQuestionInfo();
        document.getElementById('progressText').textContent = category.name;
        document.getElementById('questionCounter').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.totalQuestions}`;
    }

    async completeQuestionnaire() {
        this.saveCurrentAnswer();
        this.saveAnswers();
        
        // Generate tasks from answers
        const tasks = await this.generateTasksFromAnswers();
        
        // Save tasks
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        
        // Show Kanban board
        this.showKanbanBoard();
        
        // Show notification
        this.showNotification('Questionnaire completed! Tasks have been generated.', 'success');
    }

    async generateTasksFromAnswers() {
        const tasks = [];
        const usedTemplates = new Set();
        
        // Generate tasks for each answered question
        this.userAnswers.forEach((answer, index) => {
            if (!answer.skipped && answer.text.trim().length > 0) {
                const { category } = this.getQuestionInfoByIndex(index);
                const templates = TASK_TEMPLATES[category.name] || [];
                
                if (templates.length > 0) {
                    // Select a random template that hasn't been used for this category
                    const availableTemplates = templates.filter(t => 
                        !usedTemplates.has(`${category.name}-${t.template}`)
                    );
                    
                    if (availableTemplates.length > 0) {
                        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
                        usedTemplates.add(`${category.name}-${template.template}`);
                        
                        // Generate task title by replacing placeholder
                        const title = template.template.replace('{answer}', 
                            this.extractKeyPhrase(answer.text) || 'the process');
                        
                        const task = {
                            id: `task-${Date.now()}-${tasks.length}`,
                            title: title,
                            description: answer.text.substring(0, 200) + (answer.text.length > 200 ? '...' : ''),
                            column: 'todo',
                            priority: template.priority,
                            assignee: this.getRandomAssignee(),
                            estimate: this.getRandomEstimate(template.priority),
                            category: template.category,
                            createdAt: new Date().toISOString(),
                            sourceQuestion: index
                        };
                        
                        tasks.push(task);
                    }
                }
            }
        });
        
        return tasks;
    }

    getQuestionInfoByIndex(index) {
        let questionCount = 0;
        for (let i = 0; i < LEAN_QUESTIONS.length; i++) {
            const category = LEAN_QUESTIONS[i];
            if (index < questionCount + category.questions.length) {
                return {
                    category: {
                        index: i,
                        name: category.category,
                        description: category.description
                    },
                    questionIndex: index - questionCount
                };
            }
            questionCount += category.questions.length;
        }
        return null;
    }

    extractKeyPhrase(text) {
        // Simple key phrase extraction
        const sentences = text.split(/[.!?]+/);
        if (sentences.length > 0) {
            const firstSentence = sentences[0].trim();
            const words = firstSentence.split(/\s+/);
            if (words.length <= 8) {
                return firstSentence;
            } else {
                return words.slice(0, 5).join(' ') + '...';
            }
        }
        return null;
    }

    getRandomAssignee() {
        const assignees = ['Product Owner', 'Project Manager', 'Team Lead', 'Developer', 'QA Engineer', 'Designer'];
        return assignees[Math.floor(Math.random() * assignees.length)];
    }

    getRandomEstimate(priority) {
        const estimates = {
            'low': [1, 2, 3],
            'medium': [2, 3, 5],
            'high': [3, 5, 8],
            'critical': [5, 8, 13]
        };
        const options = estimates[priority] || estimates.medium;
        return options[Math.floor(Math.random() * options.length)];
    }

    loadAnswers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.ANSWERS);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading answers:', error);
            return [];
        }
    }

    saveAnswers() {
        try {
            localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(this.userAnswers));
        } catch (error) {
            console.error('Error saving answers:', error);
        }
    }

    showExportModal() {
        document.getElementById('exportModal').classList.add('active');
    }

    exportData(format) {
        const data = {
            answers: this.userAnswers,
            tasks: JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'),
            metadata: {
                exportedAt: new Date().toISOString(),
                app: 'Intuiva',
                version: '1.0.0'
            }
        };

        let content, mimeType, filename;

        switch (format) {
            case 'json':
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                filename = 'intuiva-export.json';
                break;
                
            case 'csv':
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                filename = 'intuiva-export.csv';
                break;
                
            case 'text':
                content = this.convertToText(data);
                mimeType = 'text/plain';
                filename = 'intuiva-export.txt';
                break;
        }

        this.downloadFile(content, mimeType, filename);
        this.closeModal(document.getElementById('exportModal'));
        this.showNotification('Data exported successfully!', 'success');
    }

    convertToCSV(data) {
        let csv = 'Question,Answer,Skipped\n';
        data.answers.forEach((answer, index) => {
            const questionInfo = this.getQuestionInfoByIndex(index);
            const question = questionInfo ? 
                LEAN_QUESTIONS[questionInfo.category.index].questions[questionInfo.questionIndex] : 
                `Question ${index + 1}`;
            
            const escapedAnswer = answer.text.replace(/"/g, '""');
            csv += `"${question}","${escapedAnswer}",${answer.skipped ? 'Yes' : 'No'}\n`;
        });
        return csv;
    }

    convertToText(data) {
        let text = 'INTUIVA PROJECT EXPORT\n';
        text += '='.repeat(50) + '\n\n';
        
        text += 'QUESTIONNAIRE ANSWERS\n';
        text += '-'.repeat(30) + '\n\n';
        
        data.answers.forEach((answer, index) => {
            const questionInfo = this.getQuestionInfoByIndex(index);
            if (questionInfo) {
                const category = LEAN_QUESTIONS[questionInfo.category.index];
                const question = category.questions[questionInfo.questionIndex];
                
                text += `Category: ${category.category}\n`;
                text += `Question ${index + 1}: ${question}\n`;
                text += `Answer: ${answer.skipped ? '[SKIPPED]' : answer.text}\n`;
                text += '-'.repeat(20) + '\n\n';
            }
        });
        
        return text;
    }

    downloadFile(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.intuivaApp = new IntuivaApp();
});

// Export for use in other modules
export default IntuivaApp;
