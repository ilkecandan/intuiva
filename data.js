// data.js - Contains both English and Turkish questions
const QUESTIONS = {
    en: [
        // Category 1: Understanding Value
        {
            category: "Category 1: Understanding Value",
            text: "Who are the primary and secondary customers/users? (Be specific about roles, not just 'the business.')"
        },
        {
            category: "Category 1: Understanding Value",
            text: "What is the single, most important problem we are solving for them? (Forces focus on the pain point, not a preconceived solution.)"
        },
        {
            category: "Category 1: Understanding Value",
            text: "How will we measure value delivered? (Is it revenue, time saved, cost avoided, customer satisfaction (NPS/CSAT), usage metrics?)"
        },
        {
            category: "Category 1: Understanding Value",
            text: "What does 'done' or 'success' look like, in measurable terms? (Avoid vague goals like 'improve the system.')"
        },
        {
            category: "Category 1: Understanding Value",
            text: "What is the smallest thing we can deliver that provides measurable value? (This defines your Minimum Viable Product (MVP) or first iteration.)"
        },
        
        // Category 2: Mapping the VALUE STREAM
        {
            category: "Category 2: Mapping the VALUE STREAM",
            text: "What are the key steps to go from idea to delivered value? (Map the high-level process flow: design, approve, build, test, deploy, support.)"
        },
        {
            category: "Category 2: Mapping the VALUE STREAM",
            text: "Where are the likely bottlenecks or delays in this process? (e.g., approvals, environment provisioning, third-party dependencies.)"
        },
        {
            category: "Category 2: Mapping the VALUE STREAM",
            text: "What existing governance, compliance, or reporting steps are required? Can they be streamlined or done in parallel?"
        },
        {
            category: "Category 2: Mapping the VALUE STREAM",
            text: "What are our dependencies (teams, systems, external vendors)? How can we simplify or decouple them?"
        },
        
        // Category 3: Establishing FLOW
        {
            category: "Category 3: Establishing FLOW",
            text: "How will we organize the team to maintain continuous flow? (Will we use Kanban, short Sprints, etc.?)"
        },
        {
            category: "Category 3: Establishing FLOW",
            text: "What is our Work In Progress (WIP) limit? (To prevent multitasking and context switching.)"
        },
        {
            category: "Category 3: Establishing FLOW",
            text: "How will we make our work and progress visible to all stakeholders? (Physical/digital board, metrics dashboard.)"
        },
        {
            category: "Category 3: Establishing FLOW",
            text: "What are our agreed-upon 'Definition of Ready' (for starting work) and 'Definition of Done' (for completing work)? (Standardizes quality and prevents half-baked work moving forward.)"
        },
        
        // Category 4: Enabling PULL
        {
            category: "Category 4: Enabling PULL",
            text: "What is the trigger for us to start new work? (e.g., When an item is prioritized and the team has capacity, not because a plan says 'start Monday.')"
        },
        {
            category: "Category 4: Enabling PULL",
            text: "How will we prioritize the backlog? (By value, cost of delay, risk reduction? Who is the final decision-maker - Product Owner?)"
        },
        {
            category: "Category 4: Enabling PULL",
            text: "Do we have the authority to delay or reject low-value work that is pushed onto the team?"
        },
        
        // Category 5: Pursuing PERFECTION (Continuous Improvement - Kaizen)
        {
            category: "Category 5: Pursuing PERFECTION",
            text: "How and when will we gather feedback from customers/users? (Continuous demos, beta releases, analytics?)"
        },
        {
            category: "Category 5: Pursuing PERFECTION",
            text: "How will we conduct retrospectives/improvement cycles? (Regularly, with a focus on process experiments, not just blame.)"
        },
        {
            category: "Category 5: Pursuing PERFECTION",
            text: "What key metrics will we track for the process itself? (e.g., Lead Time, Cycle Time, Throughput, Blocked Time, Rework rate.)"
        },
        {
            category: "Category 5: Pursuing PERFECTION",
            text: "What is our mechanism for incorporating lessons learned during the project, not just at the end?"
        },
        
        // Category 6: Team & Mindset
        {
            category: "Category 6: Team & Mindset",
            text: "Is the leadership/sponsor aligned on a Lean approach? (Are they prepared for early transparency, changing priorities based on learning, and empowering the team?)"
        },
        {
            category: "Category 6: Team & Mindset",
            text: "How will we empower the team to identify and eliminate waste daily?"
        },
        {
            category: "Category 6: Team & Mindset",
            text: "Do we have the right mix of skills to deliver the MVP, or do we need to plan for learning/coaching?"
        },
        {
            category: "Category 6: Team & Mindset",
            text: "What is the biggest risk to delivering value early and often? (Technical, political, resource-based?)"
        }
    ],
    
    tr: [
        // Kategori 1: Değeri Anlama
        {
            category: "Kategori 1: Değeri Anlama",
            text: "Birincil ve ikincil müşteriler/kullanıcılar kimlerdir? (Roller hakkında spesifik olun, sadece 'iş' değil.)"
        },
        {
            category: "Kategori 1: Değeri Anlama",
            text: "Onlar için çözdüğümüz tek, en önemli sorun nedir? (Önceden belirlenmiş bir çözüme değil, acı noktasına odaklanmayı zorunlu kılar.)"
        },
        {
            category: "Kategori 1: Değeri Anlama",
            text: "Teslim edilen değeri nasıl ölçeceğiz? (Gelir, tasarruf edilen zaman, önlenen maliyet, müşteri memnuniyeti (NPS/CSAT), kullanım metrikleri mi?)"
        },
        {
            category: "Kategori 1: Değeri Anlama",
            text: "Ölçülebilir terimlerle 'tamamlandı' veya 'başarı' neye benziyor? ('Sistemi iyileştir' gibi belirsiz hedeflerden kaçının.)"
        },
        {
            category: "Kategori 1: Değeri Anlama",
            text: "Ölçülebilir değer sağlayan sunabileceğimiz en küçük şey nedir? (Bu, Minimum Uygulanabilir Ürününüzü (MVP) veya ilk yinelemenizi tanımlar.)"
        },
        
        // Kategori 2: DEĞER AKIŞINI Haritalama
        {
            category: "Kategori 2: DEĞER AKIŞINI Haritalama",
            text: "Fikirden teslim edilen değere gitmek için anahtar adımlar nelerdir? (Üst düzey süreç akışını haritalayın: tasarım, onay, inşa, test, dağıtım, destek.)"
        },
        {
            category: "Kategori 2: DEĞER AKIŞINI Haritalama",
            text: "Bu süreçte olası darboğazlar veya gecikmeler nerede? (örn., onaylar, ortam sağlama, üçüncü taraf bağımlılıkları.)"
        },
        {
            category: "Kategori 2: DEĞER AKIŞINI Haritalama",
            text: "Hangi mevcut yönetişim, uyumluluk veya raporlama adımları gereklidir? Basitleştirilebilir veya paralel yapılabilir mi?"
        },
        {
            category: "Kategori 2: DEĞER AKIŞINI Haritalama",
            text: "Bağımlılıklarımız neler (ekipler, sistemler, harici satıcılar)? Bunları nasıl basitleştirebilir veya ayırabiliriz?"
        },
        
        // Kategori 3: AKIŞ'ı Oluşturma
        {
            category: "Kategori 3: AKIŞ'ı Oluşturma",
            text: "Sürekli akışı sürdürmek için ekibi nasıl organize edeceğiz? (Kanban, kısa Sprint'ler vb. kullanacak mıyız?)"
        },
        {
            category: "Kategori 3: AKIŞ'ı Oluşturma",
            text: "Devam Eden İş (WIP) limitimiz nedir? (Çoklu görev ve bağlam değiştirmeyi önlemek için.)"
        },
        {
            category: "Kategori 3: AKIŞ'ı Oluşturma",
            text: "İşimizi ve ilerlememizi tüm paydaşlara nasıl görünür kılacağız? (Fiziksel/dijital pano, metrikler panosu.)"
        },
        {
            category: "Kategori 3: AKIŞ'ı Oluşturma",
            text: "Üzerinde anlaştığımız 'Hazır Tanımı' (işe başlamak için) ve 'Tamamlandı Tanımı' (işi tamamlamak için) nedir? (Kaliteyi standartlaştırır ve yarı pişmiş işin ilerlemesini önler.)"
        },
        
        // Kategori 4: ÇEKME'yi Etkinleştirme
        {
            category: "Kategori 4: ÇEKME'yi Etkinleştirme",
            text: "Yeni işe başlamamız için tetikleyici nedir? (örn., Bir öğe önceliklendirildiğinde ve ekip kapasitesi olduğunda, bir plan 'Pazartesi başla' dediği için değil.)"
        },
        {
            category: "Kategori 4: ÇEKME'yi Etkinleştirme",
            text: "İş listesini nasıl önceliklendireceğiz? (Değere, gecikme maliyetine, risk azaltmaya göre? Son karar verici kim - Ürün Sahibi?)"
        },
        {
            category: "Kategori 4: ÇEKME'yi Etkinleştirme",
            text: "Ekibe zorla yaptırılan düşük değerli işi geciktirme veya reddetme yetkimiz var mı?"
        },
        
        // Kategori 5: MÜKEMMELLİK Peşinde (Sürekli İyileştirme - Kaizen)
        {
            category: "Kategori 5: MÜKEMMELLİK Peşinde",
            text: "Müşterilerden/kullanıcılardan geri bildirimi nasıl ve ne zaman toplayacağız? (Sürekli demolar, beta sürümleri, analitikler?)"
        },
        {
            category: "Kategori 5: MÜKEMMELLİK Peşinde",
            text: "Geriye dönük değerlendirmeleri/iyileştirme döngülerini nasıl yürüteceğiz? (Düzenli olarak, sadece suçlamaya değil, süreç deneylerine odaklanarak.)"
        },
        {
            category: "Kategori 5: MÜKEMMELLİK Peşinde",
            text: "Sürecin kendisi için hangi anahtar metrikleri takip edeceğiz? (örn., Teslim Süresi, Döngü Süresi, Verim, Bloke Süre, Yeniden Çalışma oranı.)"
        },
        {
            category: "Kategori 5: MÜKEMMELLİK Peşinde",
            text: "Proje sırasında öğrenilen dersleri dahil etme mekanizmamız nedir, sadece sonunda değil?"
        },
        
        // Kategori 6: Ekip & Zihniyet
        {
            category: "Kategori 6: Ekip & Zihniyet",
            text: "Liderlik/sponsor Yalın bir yaklaşımda hizalanmış mı? (Erken şeffaflık, öğrenmeye dayalı öncelikleri değiştirme ve ekibi güçlendirme konusunda hazırlar mı?)"
        },
        {
            category: "Kategori 6: Ekip & Zihniyet",
            text: "Ekibi günlük olarak israfı belirlemeye ve ortadan kaldırmaya nasıl yetkilendireceğiz?"
        },
        {
            category: "Kategori 6: Ekip & Zihniyet",
            text: "MVP'yi teslim etmek için doğru beceri karışımına sahip miyiz yoksa öğrenme/koçluk için plan yapmamız gerekiyor mu?"
        },
        {
            category: "Kategori 6: Ekip & Zihniyet",
            text: "Değeri erken ve sık teslim etmenin en büyük riski nedir? (Teknik, politik, kaynak temelli?)"
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
