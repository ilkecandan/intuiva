// data.js - Contains both English and Turkish questions
const QUESTIONS = {
    en: [
        // Category 1: Understanding Value & Vision
        {
            category: "1. Project Vision & Value Definition",
            text: "What is the main problem or opportunity that initiated this project? Describe the core challenge we're addressing."
        },
        {
            category: "1. Project Vision & Value Definition",
            text: "Who are the primary users/customers of this project? List their roles, needs, and how they'll interact with the solution."
        },
        {
            category: "1. Project Vision & Value Definition",
            text: "What are the top 3 business objectives for this project? (e.g., increase revenue by X%, reduce operational time by Y%, improve customer satisfaction score)"
        },
        {
            category: "1. Project Vision & Value Definition",
            text: "How will we measure project success? List specific Key Performance Indicators (KPIs) with target values."
        },
        {
            category: "1. Project Vision & Value Definition",
            text: "What is the Minimum Viable Product (MVP)? Describe the smallest version that delivers measurable value to users."
        },
        
        // Category 2: Scope & Deliverables
        {
            category: "2. Scope Definition & Deliverables",
            text: "What are the main features or capabilities the project must deliver? (List them in priority order)"
        },
        {
            category: "2. Scope Definition & Deliverables",
            text: "What is explicitly OUT of scope for this project? (To prevent scope creep)"
        },
        {
            category: "2. Scope Definition & Deliverables",
            text: "What are the acceptance criteria for each major deliverable? (How will we know it's complete and working?)"
        },
        {
            category: "2. Scope Definition & Deliverables",
            text: "What are the quality standards for deliverables? (Performance requirements, security standards, accessibility compliance, etc.)"
        },
        
        // Category 3: Stakeholders & Communication
        {
            category: "3. Stakeholder Management",
            text: "Who are the key stakeholders? (Decision-makers, influencers, end-users, support teams)"
        },
        {
            category: "3. Stakeholder Management",
            text: "What are the communication needs for each stakeholder group? (Frequency, format, level of detail)"
        },
        {
            category: "3. Stakeholder Management",
            text: "Who has final approval authority for scope changes? (Change Control Board or individual)"
        },
        {
            category: "3. Stakeholder Management",
            text: "How will we manage stakeholder expectations and keep them engaged throughout the project?"
        },
        
        // Category 4: Team & Resources
        {
            category: "4. Team Structure & Resources",
            text: "What roles are needed on the project team? (Developers, designers, testers, business analysts, etc.)"
        },
        {
            category: "4. Team Structure & Resources",
            text: "What skills are currently available vs. what needs to be acquired/trained?"
        },
        {
            category: "4. Team Structure & Resources",
            text: "What tools and technologies will we use? (Development tools, project management software, communication platforms)"
        },
        {
            category: "4. Team Structure & Resources",
            text: "What is the budget allocation? (People costs, software licenses, hardware, training, contingency)"
        },
        
        // Category 5: Timeline & Milestones
        {
            category: "5. Timeline & Milestone Planning",
            text: "What are the key project milestones? (With target dates for major deliverables)"
        },
        {
            category: "5. Timeline & Milestone Planning",
            text: "What is the estimated timeline for MVP delivery and full project completion?"
        },
        {
            category: "5. Timeline & Milestone Planning",
            text: "What are the critical path activities? (Tasks that directly impact the project end date)"
        },
        {
            category: "5. Timeline & Milestone Planning",
            text: "How will we track and report progress? (Weekly status updates, burndown charts, dashboard metrics)"
        },
        
        // Category 6: Risks & Dependencies
        {
            category: "6. Risk Management & Dependencies",
            text: "What are the top 5 risks to project success? (Technical, resource, timeline, stakeholder, external factors)"
        },
        {
            category: "6. Risk Management & Dependencies",
            text: "What mitigation strategies do we have for each major risk?"
        },
        {
            category: "6. Risk Management & Dependencies",
            text: "What are the key dependencies? (Other teams, third-party vendors, regulatory approvals)"
        },
        {
            category: "6. Risk Management & Dependencies",
            text: "What is our contingency plan if critical resources become unavailable?"
        },
        
        // Category 7: Process & Methodology
        {
            category: "7. Project Process & Methodology",
            text: "What project methodology will we use? (Agile, Scrum, Kanban, Waterfall, Hybrid)"
        },
        {
            category: "7. Project Process & Methodology",
            text: "What is our work cadence? (Sprint length for Agile, phase gates for Waterfall)"
        },
        {
            category: "7. Project Process & Methodology",
            text: "What are our Definition of Ready (DoR) and Definition of Done (DoD) criteria?"
        },
        {
            category: "7. Project Process & Methodology",
            text: "How will we conduct retrospectives and implement process improvements?"
        }
    ],
    
    tr: [
        // Kategori 1: Proje Vizyonu ve Değer Tanımı
        {
            category: "1. Proje Vizyonu ve Değer Tanımı",
            text: "Bu projeyi başlatan ana problem veya fırsat nedir? Ele aldığımız temel zorluğu açıklayın."
        },
        {
            category: "1. Proje Vizyonu ve Değer Tanımı",
            text: "Bu projenin birincil kullanıcıları/müşterileri kimlerdir? Rollerini, ihtiyaçlarını ve çözümle nasıl etkileşime gireceklerini listeleyin."
        },
        {
            category: "1. Proje Vizyonu ve Değer Tanımı",
            text: "Bu projenin ilk 3 iş hedefi nedir? (örn., geliri X% artırmak, operasyonel süreyi Y% azaltmak, müşteri memnuniyet puanını iyileştirmek)"
        },
        {
            category: "1. Proje Vizyonu ve Değer Tanımı",
            text: "Proje başarısını nasıl ölçeceğiz? Hedef değerleriyle birlikte spesifik Ana Performans Göstergelerini (KPI) listeleyin."
        },
        {
            category: "1. Proje Vizyonu ve Değer Tanımı",
            text: "Minimum Uygulanabilir Ürün (MVP) nedir? Kullanıcılara ölçülebilir değer sunan en küçük versiyonu tanımlayın."
        },
        
        // Kategori 2: Kapsam ve Teslimatlar
        {
            category: "2. Kapsam Tanımı ve Teslimatlar",
            text: "Projenin teslim etmesi gereken ana özellikler veya yetenekler nelerdir? (Öncelik sırasına göre listeleyin)"
        },
        {
            category: "2. Kapsam Tanımı ve Teslimatlar",
            text: "Bu projenin kapsamı DIŞINDA neler var? (Kapsam sürünmesini önlemek için)"
        },
        {
            category: "2. Kapsam Tanımı ve Teslimatlar",
            text: "Her ana teslimat için kabul kriterleri nelerdir? (Tamamlandığını ve çalıştığını nasıl bileceğiz?)"
        },
        {
            category: "2. Kapsam Tanımı ve Teslimatlar",
            text: "Teslimatlar için kalite standartları nelerdir? (Performans gereksinimleri, güvenlik standartları, erişilebilirlik uyumluluğu vb.)"
        },
        
        // Kategori 3: Paydaşlar ve İletişim
        {
            category: "3. Paydaş Yönetimi",
            text: "Ana paydaşlar kimlerdir? (Karar vericiler, etkileyiciler, son kullanıcılar, destek ekipleri)"
        },
        {
            category: "3. Paydaş Yönetimi",
            text: "Her paydaş grubu için iletişim ihtiyaçları nelerdir? (Sıklık, format, detay seviyesi)"
        },
        {
            category: "3. Paydaş Yönetimi",
            text: "Kapsam değişiklikleri için son onay yetkisi kime ait? (Değişim Kontrol Kurulu veya birey)"
        },
        {
            category: "3. Paydaş Yönetimi",
            text: "Paydaş beklentilerini nasıl yöneteceğiz ve proje boyunca nasıl ilgili tutacağız?"
        },
        
        // Kategori 4: Ekip ve Kaynaklar
        {
            category: "4. Ekip Yapısı ve Kaynaklar",
            text: "Proje ekibinde hangi rollere ihtiyaç var? (Geliştiriciler, tasarımcılar, testçiler, iş analistleri vb.)"
        },
        {
            category: "4. Ekip Yapısı ve Kaynaklar",
            text: "Hangi beceriler şu anda mevcut vs. hangilerinin kazanılması/eğitilmesi gerekiyor?"
        },
        {
            category: "4. Ekip Yapısı ve Kaynaklar",
            text: "Hangi araç ve teknolojileri kullanacağız? (Geliştirme araçları, proje yönetimi yazılımı, iletişim platformları)"
        },
        {
            category: "4. Ekip Yapısı ve Kaynaklar",
            text: "Bütçe tahsisi nasıl? (Personel maliyetleri, yazılım lisansları, donanım, eğitim, yedek bütçe)"
        },
        
        // Kategori 5: Zaman Çizelgesi ve Kilometre Taşları
        {
            category: "5. Zaman Çizelgesi ve Kilometre Taşı Planlaması",
            text: "Projenin ana kilometre taşları nelerdir? (Büyük teslimatlar için hedef tarihlerle)"
        },
        {
            category: "5. Zaman Çizelgesi ve Kilometre Taşı Planlaması",
            text: "MVP teslimi ve tam proje tamamlanması için tahmini zaman çizelgesi nedir?"
        },
        {
            category: "5. Zaman Çizelgesi ve Kilometre Taşı Planlaması",
            text: "Kritik yol aktiviteleri nelerdir? (Proje bitiş tarihini doğrudan etkileyen görevler)"
        },
        {
            category: "5. Zaman Çizelgesi ve Kilometre Taşı Planlaması",
            text: "İlerlemeyi nasıl takip edip raporlayacağız? (Haftalık durum güncellemeleri, burndown grafikleri, pano metrikleri)"
        },
        
        // Kategori 6: Riskler ve Bağımlılıklar
        {
            category: "6. Risk Yönetimi ve Bağımlılıklar",
            text: "Proje başarısı için ilk 5 risk nedir? (Teknik, kaynak, zaman çizelgesi, paydaş, dış faktörler)"
        },
        {
            category: "6. Risk Yönetimi ve Bağımlılıklar",
            text: "Her ana risk için hangi azaltma stratejilerimiz var?"
        },
        {
            category: "6. Risk Yönetimi ve Bağımlılıklar",
            text: "Ana bağımlılıklar nelerdir? (Diğer ekipler, üçüncü taraf tedarikçiler, düzenleyici onaylar)"
        },
        {
            category: "6. Risk Yönetimi ve Bağımlılıklar",
            text: "Kritik kaynaklar kullanılamaz hale gelirse yedek planımız nedir?"
        },
        
        // Kategori 7: Süreç ve Metodoloji
        {
            category: "7. Proje Süreci ve Metodoloji",
            text: "Hangi proje metodolojisini kullanacağız? (Çevik, Scrum, Kanban, Şelale, Hibrit)"
        },
        {
            category: "7. Proje Süreci ve Metodoloji",
            text: "Çalışma ritmimiz nedir? (Çevik için sprint uzunluğu, Şelale için faz geçişleri)"
        },
        {
            category: "7. Proje Süreci ve Metodoloji",
            text: "Hazır Olma Tanımı (DoR) ve Tamamlanma Tanımı (DoD) kriterlerimiz nelerdir?"
        },
        {
            category: "7. Proje Süreci ve Metodoloji",
            text: "Retrospektifleri nasıl yürüteceğiz ve süreç iyileştirmelerini nasıl uygulayacağız?"
        }
    ]
};

// Helper function to get questions for current language
function getQuestions(language = 'en') {
    return QUESTIONS[language] || QUESTIONS.en;
}

// Make available globally
window.QUESTIONS = QUESTIONS;
window.getQuestions = getQuestions;
