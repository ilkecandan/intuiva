// translations.js - Complete translation file with all new features
window.TRANSLATIONS = {
    en: {
        // App & Navigation
        'app.title': 'Intuiva - AI Project Manager',
        'nav.brand': 'Intuiva',
        'nav.tagline': 'AI Project Management',
        'nav.home': 'Home',
        'nav.questionnaire': 'Questionnaire',
        'nav.kanban': 'Kanban Board',
        'nav.help': 'Help',
        'nav.savedProjects': 'Saved Projects',
        
        // Onboarding
        'onboarding.title': 'Welcome to Intuiva',
        'onboarding.subtitle': 'AI-powered Smart Project Management',
        'onboarding.description': 'Answer a few questions about your project, and we\'ll automatically create a complete Kanban board with AI-generated tasks optimized for your workflow. Get actionable insights and professional project reports.',
        
        // Stats
        'stats.fast': 'Smart Setup',
        'stats.fastDesc': 'AI analyzes your goals',
        'stats.ai': 'AI-Powered Tasks',
        'stats.aiDesc': 'Intelligent task generation',
        'stats.lean': 'Professional Reports',
        'stats.leanDesc': 'Get PDF project reports',
        'stats.save': 'Auto-Save',
        'stats.saveDesc': 'Projects saved locally',
        
        // Storage Warning
        'storage.warning': 'Important: Local Storage Notice',
        'storage.description': 'Your projects are automatically saved to your browser\'s local storage. This means:',
        'storage.point1': 'Projects are only accessible on this device',
        'storage.point2': 'Clearing browser data will delete your projects',
        'storage.point3': 'Use "Export Project" to create backups',
        'storage.point4': 'Projects sync automatically as you work',
        
        // Buttons
        'button.start': 'Start New Project',
        'button.loadProject': 'Load Saved Project',
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
        'button.exportProject': 'Export Project',
        'button.save': 'Save',
        'button.saveTask': 'Save Task',
        'button.saveProject': 'Save Project',
        'button.cancel': 'Cancel',
        'button.generateBoard': 'Generate Kanban Board',
        'button.generateReport': 'Generate Report',
        'button.downloadPdf': 'Download PDF',
        'button.import': 'Import Project',
        
        // Questions
        'question.number': 'Q{{number}}',
        'question.progress': 'Question {{current}} of {{total}}',
        'question.category': 'Category',
        'question.defaultTitle': 'Question Title',
        'question.defaultText': 'Question text goes here...',
        'question.tip': '💡 Tip: Be specific. Your answers will help generate relevant tasks and create a comprehensive project report.',
        
        // Board
        'board.title': 'Project Board',
        'board.tasks': 'Tasks',
        'board.done': 'Done',
        'board.inProgress': 'In Progress',
        
        // Columns
        'column.todo': 'To Do',
        'column.inProgress': 'In Progress',
        'column.done': 'Done',
        
        // Report
        'report.title': 'AI Project Report',
        'report.placeholder': 'Generate an AI-powered project report based on your answers. Get strategic insights, timelines, and recommendations.',
        
        // Modals
        'modal.addTask': 'Add New Task',
        'modal.editTask': 'Edit Task',
        'modal.saveProject': 'Save Project',
        'modal.loadProject': 'Load Saved Project',
        
        // Forms
        'form.taskTitle': 'Task Title *',
        'form.taskTitlePlaceholder': 'Enter task title',
        'form.description': 'Description',
        'form.descriptionPlaceholder': 'Describe the task details...',
        'form.priority': 'Priority',
        'form.status': 'Status',
        'form.tags': 'Tags (comma-separated)',
        'form.tagsPlaceholder': 'e.g., design, development, testing',
        'form.projectName': 'Project Name *',
        'form.projectNamePlaceholder': 'Enter project name',
        'form.autoSave': 'Enable auto-save',
        'form.autoSaveHelp': 'Project will be saved automatically every 30 seconds',
        
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
        'help.gettingStartedDesc': 'Answer the questionnaire to let AI analyze your project goals and generate relevant tasks. Your work is automatically saved locally.',
        'help.kanbanBoard': 'Kanban Board Features',
        'help.dragDrop': 'Drag & Drop',
        'help.dragDropDesc': 'Move tasks between columns to update status',
        'help.click': 'Task Actions',
        'help.clickDesc': 'Click task title to edit, hover for action buttons',
        'help.delete': 'Delete',
        'help.deleteDesc': 'Click the trash icon on a task',
        'help.add': 'Add',
        'help.addDesc': 'Use the "+ Add Task" button in each column',
        'help.priority': 'Priority Colors',
        'help.priorityDesc': 'Color-coded priorities help focus',
        'help.autoSave': 'Auto-Save',
        'help.autoSaveDesc': 'Projects save automatically every 30 seconds',
        'help.aiFeatures': 'AI Features',
        'help.aiTasks': 'Smart Tasks',
        'help.aiTasksDesc': 'AI generates tasks based on your answers',
        'help.aiReport': 'Project Reports',
        'help.aiReportDesc': 'Generate 1-page professional reports',
        'help.aiRegenerate': 'Regenerate',
        'help.aiRegenerateDesc': 'Get new task suggestions anytime',
        'help.aiPdf': 'PDF Export',
        'help.aiPdfDesc': 'Download project reports as PDF',
        'help.storage': 'Data Storage',
        'help.localStorage': 'Local Storage',
        'help.localStorageDesc': 'Projects save to your browser',
        'help.export': 'Export/Import',
        'help.exportDesc': 'Backup projects as JSON files',
        'help.clearWarning': 'Warning',
        'help.clearWarningDesc': 'Clearing browser data deletes projects',
        'help.multipleProjects': 'Multiple Projects',
        'help.multipleProjectsDesc': 'Save and switch between projects',
        'help.tips': 'Pro Tips',
        'help.tip1': 'Use detailed answers for better AI analysis',
        'help.tip2': 'Export projects regularly for backup',
        'help.tip3': 'Use tags to organize tasks',
        'help.tip4': 'Generate reports before meetings',
        'help.tip5': 'Try both light/dark themes for comfort',
        
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
        'ai.generatingReport': 'Generating Report...',
        'ai.generatedSuccess': 'AI tasks generated successfully!',
        'ai.generatedFallback': 'Generated tasks from your answers.',
        'ai.regeneratedSuccess': 'AI tasks regenerated!',
        'ai.regeneratedFallback': 'Regenerated from your answers.',
        'ai.reportGenerated': 'Project report generated successfully!',
        'ai.reportGeneratedLocal': 'Local report generated from your data.',
        
        // Toast Messages
        'toast.startedEmpty': 'Started with empty board',
        'toast.allCleared': 'All tasks cleared',
        'toast.taskAdded': 'Task added successfully!',
        'toast.taskUpdated': 'Task updated successfully!',
        'toast.taskDeleted': 'Task deleted successfully!',
        'toast.boardExported': 'Board exported successfully!',
        'toast.projectExported': 'Project exported successfully!',
        'toast.projectImported': 'Project imported successfully!',
        'toast.projectSaved': 'Project saved successfully!',
        'toast.projectLoaded': 'Project "{{name}}" loaded!',
        'toast.projectDeleted': 'Project deleted successfully!',
        'toast.newProjectCreated': 'New project created!',
        'toast.themeSwitched': 'Switched to {{theme}} theme',
        'toast.languageChanged': 'Language changed to {{language}}',
        'toast.pdfDownloaded': 'Report downloaded as HTML!',
        
        // Errors & Confirmations
        'error.taskTitleRequired': 'Task title is required',
        'error.projectNameRequired': 'Project name is required',
        'error.projectNotFound': 'Project not found',
        'error.deleteFailed': 'Failed to delete project',
        'error.importFailed': 'Failed to import project',
        'error.noReport': 'No report available. Generate one first.',
        'confirm.clearAll': 'Are you sure you want to clear all tasks? This cannot be undone.',
        'confirm.deleteTask': 'Are you sure you want to delete this task?',
        'confirm.deleteProject': 'Are you sure you want to delete this project? This cannot be undone.',
        
        // Projects
        'project.noProjects': 'No saved projects found',
    },
    
    tr: {
        // App & Navigation
        'app.title': 'Intuiva - AI Proje Yöneticisi',
        'nav.brand': 'Intuiva',
        'nav.tagline': 'AI Proje Yönetimi',
        'nav.home': 'Ana Sayfa',
        'nav.questionnaire': 'Anket',
        'nav.kanban': 'Kanban Panosu',
        'nav.help': 'Yardım',
        'nav.savedProjects': 'Kayıtlı Projeler',
        
        // Onboarding
        'onboarding.title': 'Intuiva\'ya Hoş Geldiniz',
        'onboarding.subtitle': 'AI Destekli Akıllı Proje Yönetimi',
        'onboarding.description': 'Projenizle ilgili birkaç soruyu yanıtlayın, biz de iş akışınız için optimize edilmiş AI tarafından oluşturulmuş görevlerle tam bir Kanban panosu otomatik olarak oluşturalım. Eyleme dönüştürülebilir içgörüler ve profesyonel proje raporları alın.',
        
        // Stats
        'stats.fast': 'Akıllı Kurulum',
        'stats.fastDesc': 'AI hedeflerinizi analiz eder',
        'stats.ai': 'AI Destekli Görevler',
        'stats.aiDesc': 'Akıllı görev oluşturma',
        'stats.lean': 'Profesyonel Raporlar',
        'stats.leanDesc': 'PDF proje raporları alın',
        'stats.save': 'Otomatik Kaydet',
        'stats.saveDesc': 'Projeler yerel olarak kaydedilir',
        
        // Storage Warning
        'storage.warning': 'Önemli: Yerel Depolama Uyarısı',
        'storage.description': 'Projeleriniz tarayıcınızın yerel depolama alanına otomatik olarak kaydedilir. Bu şu anlama gelir:',
        'storage.point1': 'Projeler yalnızca bu cihazda erişilebilir',
        'storage.point2': 'Tarayıcı verilerini temizlemek projelerinizi siler',
        'storage.point3': 'Yedek oluşturmak için "Projeyi Dışa Aktar" kullanın',
        'storage.point4': 'Projeler çalışırken otomatik senkronize olur',
        
        // Buttons
        'button.start': 'Yeni Proje Başlat',
        'button.loadProject': 'Kayıtlı Proje Yükle',
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
        'button.exportProject': 'Projeyi Dışa Aktar',
        'button.save': 'Kaydet',
        'button.saveTask': 'Görevi Kaydet',
        'button.saveProject': 'Projeyi Kaydet',
        'button.cancel': 'İptal',
        'button.generateBoard': 'Kanban Panosu Oluştur',
        'button.generateReport': 'Rapor Oluştur',
        'button.downloadPdf': 'PDF İndir',
        'button.import': 'Proje İçe Aktar',
        
        // Questions
        'question.number': 'S{{number}}',
        'question.progress': 'Soru {{current}} / {{total}}',
        'question.category': 'Kategori',
        'question.defaultTitle': 'Soru Başlığı',
        'question.defaultText': 'Soru metni buraya gelecek...',
        'question.tip': '💡 İpucu: Spesifik olun. Cevaplarınız ilgili görevler oluşturmaya ve kapsamlı bir proje raporu oluşturmaya yardımcı olacaktır.',
        
        // Board
        'board.title': 'Proje Panosu',
        'board.tasks': 'Görev',
        'board.done': 'Tamamlandı',
        'board.inProgress': 'Devam Ediyor',
        
        // Columns
        'column.todo': 'Yapılacak',
        'column.inProgress': 'Devam Ediyor',
        'column.done': 'Tamamlandı',
        
        // Report
        'report.title': 'AI Proje Raporu',
        'report.placeholder': 'Cevaplarınıza dayalı AI destekli bir proje raporu oluşturun. Stratejik içgörüler, zaman çizelgeleri ve öneriler alın.',
        
        // Modals
        'modal.addTask': 'Yeni Görev Ekle',
        'modal.editTask': 'Görevi Düzenle',
        'modal.saveProject': 'Projeyi Kaydet',
        'modal.loadProject': 'Kayıtlı Proje Yükle',
        
        // Forms
        'form.taskTitle': 'Görev Başlığı *',
        'form.taskTitlePlaceholder': 'Görev başlığını girin',
        'form.description': 'Açıklama',
        'form.descriptionPlaceholder': 'Görev detaylarını açıklayın...',
        'form.priority': 'Öncelik',
        'form.status': 'Durum',
        'form.tags': 'Etiketler (virgülle ayrılmış)',
        'form.tagsPlaceholder': 'örn: tasarım, geliştirme, test',
        'form.projectName': 'Proje Adı *',
        'form.projectNamePlaceholder': 'Proje adını girin',
        'form.autoSave': 'Otomatik kaydetmeyi etkinleştir',
        'form.autoSaveHelp': 'Proje her 30 saniyede bir otomatik kaydedilecek',
        
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
        'help.gettingStartedDesc': 'AI\'nın proje hedeflerinizi analiz etmesi ve ilgili görevler oluşturması için anketi yanıtlayın. Çalışmanız yerel olarak otomatik kaydedilir.',
        'help.kanbanBoard': 'Kanban Panosu Özellikleri',
        'help.dragDrop': 'Sürükle & Bırak',
        'help.dragDropDesc': 'Durumu güncellemek için görevleri sütunlar arasında taşıyın',
        'help.click': 'Görev Eylemleri',
        'help.clickDesc': 'Düzenlemek için görev başlığına tıklayın, eylem düğmeleri için üzerine gelin',
        'help.delete': 'Sil',
        'help.deleteDesc': 'Bir görevdeki çöp kutusu simgesine tıklayın',
        'help.add': 'Ekle',
        'help.addDesc': 'Her sütundaki "+ Görev Ekle" düğmesini kullanın',
        'help.priority': 'Öncelik Renkleri',
        'help.priorityDesc': 'Renk kodlu öncelikler odaklanmaya yardımcı olur',
        'help.autoSave': 'Otomatik Kaydet',
        'help.autoSaveDesc': 'Projeler her 30 saniyede bir otomatik kaydedilir',
        'help.aiFeatures': 'AI Özellikleri',
        'help.aiTasks': 'Akıllı Görevler',
        'help.aiTasksDesc': 'AI cevaplarınıza dayalı görevler oluşturur',
        'help.aiReport': 'Proje Raporları',
        'help.aiReportDesc': '1 sayfalık profesyonel raporlar oluşturun',
        'help.aiRegenerate': 'Yeniden Oluştur',
        'help.aiRegenerateDesc': 'İstediğiniz zaman yeni görev önerileri alın',
        'help.aiPdf': 'PDF Dışa Aktarma',
        'help.aiPdfDesc': 'Proje raporlarını PDF olarak indirin',
        'help.storage': 'Veri Depolama',
        'help.localStorage': 'Yerel Depolama',
        'help.localStorageDesc': 'Projeler tarayıcınıza kaydedilir',
        'help.export': 'Dışa/İçe Aktarma',
        'help.exportDesc': 'Projeleri JSON dosyaları olarak yedekleyin',
        'help.clearWarning': 'Uyarı',
        'help.clearWarningDesc': 'Tarayıcı verilerini temizlemek projeleri siler',
        'help.multipleProjects': 'Çoklu Projeler',
        'help.multipleProjectsDesc': 'Projeleri kaydedin ve arasında geçiş yapın',
        'help.tips': 'Profesyonel İpuçları',
        'help.tip1': 'Daha iyi AI analizi için detaylı cevaplar kullanın',
        'help.tip2': 'Yedek için düzenli olarak projeleri dışa aktarın',
        'help.tip3': 'Görevleri düzenlemek için etiketleri kullanın',
        'help.tip4': 'Toplantılardan önce rapor oluşturun',
        'help.tip5': 'Konfor için hem açık hem koyu temaları deneyin',
        
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
        'ai.generatingReport': 'Rapor oluşturuluyor...',
        'ai.generatedSuccess': 'AI görevleri başarıyla oluşturuldu!',
        'ai.generatedFallback': 'Yanıtlarınızdan görevler oluşturuldu.',
        'ai.regeneratedSuccess': 'AI görevleri yeniden oluşturuldu!',
        'ai.regeneratedFallback': 'Yanıtlarınızdan yeniden oluşturuldu.',
        'ai.reportGenerated': 'Proje raporu başarıyla oluşturuldu!',
        'ai.reportGeneratedLocal': 'Verilerinizden yerel rapor oluşturuldu.',
        
        // Toast Messages
        'toast.startedEmpty': 'Boş panoyla başlatıldı',
        'toast.allCleared': 'Tüm görevler temizlendi',
        'toast.taskAdded': 'Görev başarıyla eklendi!',
        'toast.taskUpdated': 'Görev başarıyla güncellendi!',
        'toast.taskDeleted': 'Görev başarıyla silindi!',
        'toast.boardExported': 'Pano başarıyla dışa aktarıldı!',
        'toast.projectExported': 'Proje başarıyla dışa aktarıldı!',
        'toast.projectImported': 'Proje başarıyla içe aktarıldı!',
        'toast.projectSaved': 'Proje başarıyla kaydedildi!',
        'toast.projectLoaded': '"{{name}}" projesi yüklendi!',
        'toast.projectDeleted': 'Proje başarıyla silindi!',
        'toast.newProjectCreated': 'Yeni proje oluşturuldu!',
        'toast.themeSwitched': '{{theme}} temaya geçildi',
        'toast.languageChanged': 'Dil {{language}} olarak değiştirildi',
        'toast.pdfDownloaded': 'Rapor HTML olarak indirildi!',
        
        // Errors & Confirmations
        'error.taskTitleRequired': 'Görev başlığı gereklidir',
        'error.projectNameRequired': 'Proje adı gereklidir',
        'error.projectNotFound': 'Proje bulunamadı',
        'error.deleteFailed': 'Proje silinemedi',
        'error.importFailed': 'Proje içe aktarılamadı',
        'error.noReport': 'Rapor mevcut değil. Önce bir rapor oluşturun.',
        'confirm.clearAll': 'Tüm görevleri temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        'confirm.deleteTask': 'Bu görevi silmek istediğinizden emin misiniz?',
        'confirm.deleteProject': 'Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        
        // Projects
        'project.noProjects': 'Kayıtlı proje bulunamadı',
    }
};
