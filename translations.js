// translations.js
const TRANSLATIONS = {
    en: {
        // App & Navigation
        'app.title': 'Intuiva - AI Project Manager',
        'nav.brand': 'Intuiva',
        'nav.tagline': 'Lean Project Management',
        'nav.home': 'Home',
        'nav.questionnaire': 'Questionnaire',
        'nav.kanban': 'Kanban Board',
        'nav.help': 'Help',
        
        // Onboarding
        'onboarding.title': 'Welcome to Intuiva',
        'onboarding.subtitle': 'AI-powered Lean Project Management',
        'onboarding.description': 'Answer a few questions about your project, and we\'ll automatically create a Kanban board with AI-generated tasks optimized for Lean workflow.',
        
        // Stats
        'stats.fast': 'Fast Setup',
        'stats.fastDesc': 'Get started in minutes',
        'stats.ai': 'AI-Powered',
        'stats.aiDesc': 'Smart task generation',
        'stats.lean': 'Lean Metrics',
        'stats.leanDesc': 'Track progress visually',
        
        // Buttons
        'button.start': 'Start Project Setup',
        'button.skip': 'Skip to Empty Board',
        'button.next': 'Next',
        'button.prev': 'Previous',
        'button.clear': 'Clear',
        'button.skipQuestion': 'Skip Question',
        'button.notAnswer': 'Not Applicable',
        'button.backToQuestions': 'Back to Questions',
        'button.addTask': 'Add Task',
        'button.clearAll': 'Clear All',
        'button.regenerate': 'Regenerate Tasks',
        'button.export': 'Export',
        'button.save': 'Save Task',
        'button.cancel': 'Cancel',
        'button.generateBoard': 'Generate Kanban Board',
        
        // Questions
        'question.number': 'Q{{number}}',
        'question.progress': 'Question {{current}} of {{total}}',
        'question.placeholder': 'Type your answer here... (Press Enter for new line, Ctrl+Enter to submit)',
        'question.tip': 'Tip: Be specific and concise. Your answers will help generate relevant tasks.',
        
        // Board
        'board.title': 'Project Board',
        'board.tasks': 'Tasks',
        'board.done': 'Done',
        'board.inProgress': 'In Progress',
        
        // Columns
        'column.todo': 'To Do',
        'column.inProgress': 'In Progress',
        'column.done': 'Done',
        
        // Modal
        'modal.addTask': 'Add New Task',
        
        // Forms
        'form.taskTitle': 'Task Title',
        'form.taskTitlePlaceholder': 'Enter task title...',
        'form.description': 'Description',
        'form.descriptionPlaceholder': 'Describe the task...',
        'form.priority': 'Priority',
        'form.status': 'Status',
        'form.tags': 'Tags (comma-separated)',
        'form.tagsPlaceholder': 'e.g., frontend, backend, design',
        
        // Priorities
        'priority.low': 'Low',
        'priority.medium': 'Medium',
        'priority.high': 'High',
        'priority.critical': 'Critical',
        
        // Statuses
        'status.todo': 'To Do',
        'status.inProgress': 'In Progress',
        'status.done': 'Done',
        
        // Help
        'help.title': 'How to Use Intuiva',
        'help.gettingStarted': 'Getting Started',
        'help.gettingStartedDesc': 'Answer the questionnaire to let AI generate relevant tasks for your project. You can skip questions or proceed directly to an empty board.',
        'help.kanbanBoard': 'Kanban Board',
        'help.dragDrop': 'Drag & Drop',
        'help.dragDropDesc': 'Move tasks between columns',
        'help.click': 'Click',
        'help.clickDesc': 'View and edit task details',
        'help.delete': 'Delete',
        'help.deleteDesc': 'Click the trash icon on a task',
        'help.add': 'Add',
        'help.addDesc': 'Use the "+ Add Task" button in each column',
        'help.aiFeatures': 'AI Features',
        'help.aiFeaturesDesc': 'The AI analyzes your answers to generate relevant tasks. Use the "Regenerate Tasks" button to create new tasks based on your responses.',
        
        // Theme
        'theme.toggle': 'Toggle theme',
        'theme.dark': 'dark',
        'theme.light': 'light',
        
        // Language
        'language.en': 'English',
        'language.tr': 'Turkish',
        
        // AI Messages
        'ai.contacting': 'Contacting AI...',
        'ai.generating': 'Generating Tasks...',
        'ai.regenerating': 'Regenerating...',
        'ai.generatedSuccess': 'AI tasks generated successfully!',
        'ai.generatedFallback': 'Generated tasks from your answers.',
        'ai.regeneratedSuccess': 'AI tasks regenerated!',
        'ai.regeneratedFallback': 'Regenerated from your answers.',
        
        // Toast Messages
        'toast.startedEmpty': 'Started with empty board',
        'toast.allCleared': 'All tasks cleared',
        'toast.taskAdded': 'Task added successfully!',
        'toast.boardExported': 'Board exported successfully!',
        'toast.themeSwitched': 'Switched to {{theme}} theme',
        'toast.languageChanged': 'Language changed to {{language}}',
        
        // Errors & Confirmations
        'error.taskTitleRequired': 'Task title is required',
        'confirm.clearAll': 'Are you sure you want to clear all tasks? This cannot be undone.',
    },
    
    tr: {
        // App & Navigation
        'app.title': 'Intuiva - AI Proje Yöneticisi',
        'nav.brand': 'Intuiva',
        'nav.tagline': 'Yalın Proje Yönetimi',
        'nav.home': 'Ana Sayfa',
        'nav.questionnaire': 'Anket',
        'nav.kanban': 'Kanban Panosu',
        'nav.help': 'Yardım',
        
        // Onboarding
        'onboarding.title': 'Intuiva\'ya Hoş Geldiniz',
        'onboarding.subtitle': 'AI Destekli Yalın Proje Yönetimi',
        'onboarding.description': 'Projenizle ilgili birkaç soruyu yanıtlayın, biz de Yalın iş akışı için optimize edilmiş AI tarafından oluşturulmuş görevlerle otomatik olarak bir Kanban panosu oluşturalım.',
        
        // Stats
        'stats.fast': 'Hızlı Kurulum',
        'stats.fastDesc': 'Dakikalar içinde başlayın',
        'stats.ai': 'AI Destekli',
        'stats.aiDesc': 'Akıllı görev oluşturma',
        'stats.lean': 'Yalın Metrikler',
        'stats.leanDesc': 'İlerlemeyi görsel olarak takip edin',
        
        // Buttons
        'button.start': 'Proje Kurulumunu Başlat',
        'button.skip': 'Boş Panoya Geç',
        'button.next': 'İleri',
        'button.prev': 'Geri',
        'button.clear': 'Temizle',
        'button.skipQuestion': 'Soruyu Atla',
        'button.notAnswer': 'Uygulanamaz',
        'button.backToQuestions': 'Sorulara Dön',
        'button.addTask': 'Görev Ekle',
        'button.clearAll': 'Tümünü Temizle',
        'button.regenerate': 'Görevleri Yeniden Oluştur',
        'button.export': 'Dışa Aktar',
        'button.save': 'Görevi Kaydet',
        'button.cancel': 'İptal',
        'button.generateBoard': 'Kanban Panosu Oluştur',
        
        // Questions
        'question.number': 'S{{number}}',
        'question.progress': 'Soru {{current}} / {{total}}',
        'question.placeholder': 'Cevabınızı buraya yazın... (Yeni satır için Enter, göndermek için Ctrl+Enter)',
        'question.tip': 'İpucu: Spesifik ve öz olun. Cevaplarınız ilgili görevlerin oluşturulmasına yardımcı olacaktır.',
        
        // Board
        'board.title': 'Proje Panosu',
        'board.tasks': 'Görev',
        'board.done': 'Tamamlandı',
        'board.inProgress': 'Devam Ediyor',
        
        // Columns
        'column.todo': 'Yapılacak',
        'column.inProgress': 'Devam Ediyor',
        'column.done': 'Tamamlandı',
        
        // Modal
        'modal.addTask': 'Yeni Görev Ekle',
        
        // Forms
        'form.taskTitle': 'Görev Başlığı',
        'form.taskTitlePlaceholder': 'Görev başlığını girin...',
        'form.description': 'Açıklama',
        'form.descriptionPlaceholder': 'Görevi açıklayın...',
        'form.priority': 'Öncelik',
        'form.status': 'Durum',
        'form.tags': 'Etiketler (virgülle ayrılmış)',
        'form.tagsPlaceholder': 'örn: önyüz, arka yüz, tasarım',
        
        // Priorities
        'priority.low': 'Düşük',
        'priority.medium': 'Orta',
        'priority.high': 'Yüksek',
        'priority.critical': 'Kritik',
        
        // Statuses
        'status.todo': 'Yapılacak',
        'status.inProgress': 'Devam Ediyor',
        'status.done': 'Tamamlandı',
        
        // Help
        'help.title': 'Intuiva Nasıl Kullanılır',
        'help.gettingStarted': 'Başlarken',
        'help.gettingStartedDesc': 'AI\'nın projeniz için ilgili görevler oluşturması için anketi yanıtlayın. Soruları atlayabilir veya doğrudan boş bir panoya geçebilirsiniz.',
        'help.kanbanBoard': 'Kanban Panosu',
        'help.dragDrop': 'Sürükle & Bırak',
        'help.dragDropDesc': 'Görevleri sütunlar arasında taşıyın',
        'help.click': 'Tıkla',
        'help.clickDesc': 'Görev detaylarını görüntüleyin ve düzenleyin',
        'help.delete': 'Sil',
        'help.deleteDesc': 'Bir görevdeki çöp kutusu simgesine tıklayın',
        'help.add': 'Ekle',
        'help.addDesc': 'Her sütundaki "+ Görev Ekle" düğmesini kullanın',
        'help.aiFeatures': 'AI Özellikleri',
        'help.aiFeaturesDesc': 'AI, cevaplarınızı analiz ederek ilgili görevler oluşturur. Yanıtlarınıza dayalı yeni görevler oluşturmak için "Görevleri Yeniden Oluştur" düğmesini kullanın.',
        
        // Theme
        'theme.toggle': 'Tema değiştir',
        'theme.dark': 'koyu',
        'theme.light': 'açık',
        
        // Language
        'language.en': 'İngilizce',
        'language.tr': 'Türkçe',
        
        // AI Messages
        'ai.contacting': 'AI\'ye bağlanılıyor...',
        'ai.generating': 'Görevler oluşturuluyor...',
        'ai.regenerating': 'Yeniden oluşturuluyor...',
        'ai.generatedSuccess': 'AI görevleri başarıyla oluşturuldu!',
        'ai.generatedFallback': 'Yanıtlarınızdan görevler oluşturuldu.',
        'ai.regeneratedSuccess': 'AI görevleri yeniden oluşturuldu!',
        'ai.regeneratedFallback': 'Yanıtlarınızdan yeniden oluşturuldu.',
        
        // Toast Messages
        'toast.startedEmpty': 'Boş panoyla başlatıldı',
        'toast.allCleared': 'Tüm görevler temizlendi',
        'toast.taskAdded': 'Görev başarıyla eklendi!',
        'toast.boardExported': 'Pano başarıyla dışa aktarıldı!',
        'toast.themeSwitched': '{{theme}} temaya geçildi',
        'toast.languageChanged': 'Dil {{language}} olarak değiştirildi',
        
        // Errors & Confirmations
        'error.taskTitleRequired': 'Görev başlığı gereklidir',
        'confirm.clearAll': 'Tüm görevleri temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    }
};
