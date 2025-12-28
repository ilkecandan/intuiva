// Questions Database
const QUESTIONS = [
    // Category 1: Customer Focus
    {
        id: 1,
        category: "Customer Focus",
        categoryId: 1,
        text: "Who are the primary and secondary customers/users? (Be specific about roles, not just 'the business.')",
        description: "Identify the main users and beneficiaries of your project",
        placeholder: "e.g., Primary: Product Managers at SaaS companies; Secondary: Development Team Leads",
        maxLength: 500
    },
    {
        id: 2,
        category: "Customer Focus",
        categoryId: 1,
        text: "What is the single, most important problem we are solving for them? (Forces focus on the pain point, not a preconceived solution.)",
        description: "Define the core problem clearly",
        placeholder: "e.g., Inefficient sprint planning leading to missed deadlines",
        maxLength: 500
    },
    {
        id: 3,
        category: "Customer Focus",
        categoryId: 1,
        text: "How will we measure value delivered? (Is it revenue, time saved, cost avoided, customer satisfaction (NPS/CSAT), usage metrics?)",
        description: "Define your success metrics",
        placeholder: "e.g., 30% reduction in sprint planning time, 20% increase in feature delivery rate",
        maxLength: 500
    },
    {
        id: 4,
        category: "Customer Focus",
        categoryId: 1,
        text: "What does 'done' or 'success' look like, in measurable terms? (Avoid vague goals like 'improve the system.')",
        description: "Define clear, measurable success criteria",
        placeholder: "e.g., Achieve 95% on-time delivery rate for sprint commitments",
        maxLength: 500
    },
    {
        id: 5,
        category: "Customer Focus",
        categoryId: 1,
        text: "What is the smallest thing we can deliver that provides measurable value? (This defines your Minimum Viable Product (MVP) or first iteration.)",
        description: "Identify your MVP scope",
        placeholder: "e.g., Basic Kanban board with task creation and movement functionality",
        maxLength: 500
    },

    // Category 2: Value Stream
    {
        id: 6,
        category: "Value Stream",
        categoryId: 2,
        text: "What are the key steps to go from idea to delivered value? (Map the high-level process flow: design, approve, build, test, deploy, support.)",
        description: "Outline your value stream process",
        placeholder: "e.g., 1. Requirement gathering → 2. Design review → 3. Development → 4. QA testing → 5. Deployment → 6. User feedback",
        maxLength: 500
    },
    {
        id: 7,
        category: "Value Stream",
        categoryId: 2,
        text: "Where are the likely bottlenecks or delays in this process? (e.g., approvals, environment provisioning, third-party dependencies.)",
        description: "Identify potential bottlenecks",
        placeholder: "e.g., Design approval stage, QA resource availability, production deployment approvals",
        maxLength: 500
    },
    {
        id: 8,
        category: "Value Stream",
        categoryId: 2,
        text: "What existing governance, compliance, or reporting steps are required? Can they be streamlined or done in parallel?",
        description: "Identify mandatory compliance steps",
        placeholder: "e.g., Security review, architecture approval, change management documentation",
        maxLength: 500
    },
    {
        id: 9,
        category: "Value Stream",
        categoryId: 2,
        text: "What are our dependencies (teams, systems, external vendors)? How can we simplify or decouple them?",
        description: "Map dependencies and integration points",
        placeholder: "e.g., API dependencies on external service, design system team deliverables",
        maxLength: 500
    },

    // Category 3: Flow
    {
        id: 10,
        category: "Flow",
        categoryId: 3,
        text: "How will we organize the team to maintain continuous flow? (Will we use Kanban, short Sprints, etc.?)",
        description: "Define your workflow methodology",
        placeholder: "e.g., Two-week sprints with daily standups, Kanban for bug fixes",
        maxLength: 500
    },
    {
        id: 11,
        category: "Flow",
        categoryId: 3,
        text: "What is our Work In Progress (WIP) limit? (To prevent multitasking and context switching.)",
        description: "Set WIP limits for each stage",
        placeholder: "e.g., Development: 3 tasks max per person, Code Review: 2 tasks max per reviewer",
        maxLength: 500
    },
    {
        id: 12,
        category: "Flow",
        categoryId: 3,
        text: "How will we make our work and progress visible to all stakeholders? (Physical/digital board, metrics dashboard.)",
        description: "Define visibility and communication methods",
        placeholder: "e.g., Digital Kanban board, weekly progress reports, real-time dashboard",
        maxLength: 500
    },
    {
        id: 13,
        category: "Flow",
        categoryId: 3,
        text: "What are our agreed-upon 'Definition of Ready' (for starting work) and 'Definition of Done' (for completing work)? (Standardizes quality and prevents half-baked work moving forward.)",
        description: "Define clear entry and exit criteria",
        placeholder: "e.g., DoR: Clear acceptance criteria, design approved; DoD: Code reviewed, tests passing, documented",
        maxLength: 500
    },

    // Category 4: Pull
    {
        id: 14,
        category: "Pull",
        categoryId: 4,
        text: "What is the trigger for us to start new work? (e.g., When an item is prioritized and the team has capacity, not because a plan says 'start Monday.')",
        description: "Define pull-based workflow triggers",
        placeholder: "e.g., When a slot opens in 'In Progress' column and priority task is ready",
        maxLength: 500
    },
    {
        id: 15,
        category: "Pull",
        categoryId: 4,
        text: "How will we prioritize the backlog? (By value, cost of delay, risk reduction? Who is the final decision-maker - Product Owner?)",
        description: "Define prioritization framework",
        placeholder: "e.g., Weighted Shortest Job First (WSJF), Product Owner as final decision-maker",
        maxLength: 500
    },
    {
        id: 16,
        category: "Pull",
        categoryId: 4,
        text: "Do we have the authority to delay or reject low-value work that is pushed onto the team?",
        description: "Define team autonomy and empowerment",
        placeholder: "e.g., Team can challenge low-priority work, requires Product Owner approval for urgent changes",
        maxLength: 500
    },

    // Category 5: Perfection
    {
        id: 17,
        category: "Perfection",
        categoryId: 5,
        text: "How and when will we gather feedback from customers/users? (Continuous demos, beta releases, analytics?)",
        description: "Define feedback collection mechanisms",
        placeholder: "e.g., Bi-weekly demos, user analytics tracking, monthly NPS surveys",
        maxLength: 500
    },
    {
        id: 18,
        category: "Perfection",
        categoryId: 5,
        text: "How will we conduct retrospectives/improvement cycles? (Regularly, with a focus on process experiments, not just blame.)",
        description: "Define continuous improvement process",
        placeholder: "e.g., End-of-sprint retrospectives, focus on one process improvement per sprint",
        maxLength: 500
    },
    {
        id: 19,
        category: "Perfection",
        categoryId: 5,
        text: "What key metrics will we track for the process itself? (e.g., Lead Time, Cycle Time, Throughput, Blocked Time, Rework rate.)",
        description: "Define process metrics",
        placeholder: "e.g., Cycle Time (target: < 3 days), Throughput (target: 5-7 tasks/week), Rework Rate (target: < 10%)",
        maxLength: 500
    },
    {
        id: 20,
        category: "Perfection",
        categoryId: 5,
        text: "What is our mechanism for incorporating lessons learned during the project, not just at the end?",
        description: "Define real-time learning integration",
        placeholder: "e.g., Ad-hoc process adjustments, mid-sprint check-ins, knowledge sharing sessions",
        maxLength: 500
    },

    // Category 6: Team & Mindset
    {
        id: 21,
        category: "Team & Mindset",
        categoryId: 6,
        text: "Is the leadership/sponsor aligned on a Lean approach? (Are they prepared for early transparency, changing priorities based on learning, and empowering the team?)",
        description: "Assess leadership alignment",
        placeholder: "e.g., Leadership committed to Lean principles, open to priority changes based on feedback",
        maxLength: 500
    },
    {
        id: 22,
        category: "Team & Mindset",
        categoryId: 6,
        text: "How will we empower the team to identify and eliminate waste daily?",
        description: "Define waste elimination process",
        placeholder: "e.g., Daily standup waste identification, weekly process improvement sessions",
        maxLength: 500
    },
    {
        id: 23,
        category: "Team & Mindset",
        categoryId: 6,
        text: "Do we have the right mix of skills to deliver the MVP, or do we need to plan for learning/coaching?",
        description: "Assess team capabilities and gaps",
        placeholder: "e.g., Need frontend expertise, plan for pair programming and knowledge transfer",
        maxLength: 500
    },
    {
        id: 24,
        category: "Team & Mindset",
        categoryId: 6,
        text: "What is the biggest risk to delivering value early and often? (Technical, political, resource-based?)",
        description: "Identify key risks",
        placeholder: "e.g., Technical: Legacy system integration; Political: Changing stakeholder requirements",
        maxLength: 500
    }
];

// AI Task Generation Patterns
const TASK_PATTERNS = {
    // Patterns for customer-focused questions
    customer: [
        { pattern: /primary.*customer|secondary.*user/i, task: "Define user personas and roles" },
        { pattern: /problem.*solving|pain point/i, task: "Conduct user problem analysis" },
        { pattern: /measure.*value|success metric/i, task: "Define success metrics dashboard" },
        { pattern: /MVP|minimum viable/i, task: "Scope MVP features" }
    ],
    
    // Patterns for value stream questions
    valueStream: [
        { pattern: /process flow|key steps/i, task: "Map value stream process" },
        { pattern: /bottleneck|delay/i, task: "Identify and analyze bottlenecks" },
        { pattern: /compliance.*reporting|governance/i, task: "Document compliance requirements" },
        { pattern: /dependencies|external.*vendor/i, task: "Create dependency map" }
    ],
    
    // Patterns for flow questions
    flow: [
        { pattern: /continuous flow|sprint|kanban/i, task: "Set up workflow methodology" },
        { pattern: /WIP.*limit|work in progress/i, task: "Define WIP limits per stage" },
        { pattern: /visible.*progress|dashboard/i, task: "Create project visibility board" },
        { pattern: /definition.*ready|definition.*done/i, task: "Document DoR and DoD criteria" }
    ],
    
    // Patterns for pull questions
    pull: [
        { pattern: /trigger.*work|start new/i, task: "Define pull workflow triggers" },
        { pattern: /prioritize.*backlog/i, task: "Establish prioritization framework" },
        { pattern: /authority.*reject|low-value work/i, task: "Define team decision authority" }
    ],
    
    // Patterns for perfection questions
    perfection: [
        { pattern: /gather.*feedback|customer.*feedback/i, task: "Set up feedback collection system" },
        { pattern: /retrospective|improvement cycle/i, task: "Schedule regular retrospectives" },
        { pattern: /track.*metric|cycle time|throughput/i, task: "Implement metrics tracking" },
        { pattern: /lessons learned|incorporate.*learning/i, task: "Create knowledge sharing process" }
    ],
    
    // Patterns for team questions
    team: [
        { pattern: /leadership.*aligned|sponsor/i, task: "Schedule leadership alignment session" },
        { pattern: /eliminate.*waste/i, task: "Implement waste identification process" },
        { pattern: /skills.*mix|learning.*coaching/i, task: "Conduct skills gap analysis" },
        { pattern: /biggest.*risk|technical.*risk|political.*risk/i, task: "Create risk mitigation plan" }
    ]
};

// Sample team members for assignment
const TEAM_MEMBERS = [
    { id: 1, name: "Alex Chen", role: "Product Manager", color: "#4361ee" },
    { id: 2, name: "Sam Johnson", role: "Tech Lead", color: "#7209b7" },
    { id: 3, name: "Taylor Swift", role: "UX Designer", color: "#06d6a0" },
    { id: 4, name: "Jordan Lee", role: "Frontend Dev", color: "#ffd166" },
    { id: 5, name: "Casey Smith", role: "Backend Dev", color: "#ef476f" },
    { id: 6, name: "Morgan Wong", role: "QA Engineer", color: "#4cc9f0" }
];

// Task priorities with weights
const TASK_PRIORITIES = [
    { id: "critical", label: "Critical", weight: 4, color: "#ff2e63" },
    { id: "high", label: "High", weight: 3, color: "#ef476f" },
    { id: "medium", label: "Medium", weight: 2, color: "#ffd166" },
    { id: "low", label: "Low", weight: 1, color: "#06d6a0" }
];

// Kanban columns
const KANBAN_COLUMNS = [
    { id: "todo", title: "To Do", color: "#4361ee", limit: 10 },
    { id: "inprogress", title: "In Progress", color: "#ffd166", limit: 4 },
    { id: "review", title: "Review", color: "#7209b7", limit: 3 },
    { id: "done", title: "Done", color: "#06d6a0", limit: null }
];

// Utility functions
const DataUtils = {
    // Generate tasks from answers
    generateTasksFromAnswers(answers) {
        const tasks = [];
        
        answers.forEach((answer, index) => {
            if (!answer.text || answer.text.trim().length === 0) return;
            
            const question = QUESTIONS.find(q => q.id === answer.questionId);
            const category = question.category.toLowerCase().replace(' & ', '').replace(' ', '');
            
            // Find matching task patterns
            let matchedTasks = [];
            
            // Check category-specific patterns
            if (TASK_PATTERNS[category]) {
                TASK_PATTERNS[category].forEach(pattern => {
                    if (pattern.pattern.test(answer.text) || pattern.pattern.test(question.text)) {
                        matchedTasks.push(pattern.task);
                    }
                });
            }
            
            // Generate intelligent tasks based on answer content
            if (matchedTasks.length === 0) {
                matchedTasks = this.generateIntelligentTasks(answer.text, question);
            }
            
            // Create tasks from matched patterns
            matchedTasks.forEach((taskTitle, taskIndex) => {
                const priority = this.determinePriority(answer.text, index);
                const assignee = this.assignTeamMember(index + taskIndex);
                const dueDate = this.calculateDueDate(index);
                
                tasks.push({
                    id: `task-${Date.now()}-${index}-${taskIndex}`,
                    title: taskTitle,
                    description: this.generateTaskDescription(answer.text, question),
                    priority: priority.id,
                    assignee: assignee.name,
                    assigneeId: assignee.id,
                    column: "todo",
                    createdAt: new Date().toISOString(),
                    dueDate: dueDate,
                    questionId: answer.questionId,
                    category: question.category,
                    tags: this.extractTags(answer.text),
                    estimate: this.generateEstimate(answer.text)
                });
            });
        });
        
        // Add some general project management tasks
        tasks.push(
            {
                id: `task-${Date.now()}-setup-1`,
                title: "Set up project kickoff meeting",
                description: "Schedule and prepare for project kickoff with all stakeholders",
                priority: "high",
                assignee: "Alex Chen",
                assigneeId: 1,
                column: "todo",
                createdAt: new Date().toISOString(),
                dueDate: this.calculateDueDate(0),
                tags: ["meeting", "planning"],
                estimate: "2h"
            },
            {
                id: `task-${Date.now()}-setup-2`,
                title: "Create project documentation structure",
                description: "Set up documentation repository and template structure",
                priority: "medium",
                assignee: "Taylor Swift",
                assigneeId: 3,
                column: "todo",
                createdAt: new Date().toISOString(),
                dueDate: this.calculateDueDate(1),
                tags: ["documentation"],
                estimate: "4h"
            }
        );
        
        return tasks;
    },
    
    // Generate intelligent tasks based on answer content
    generateIntelligentTasks(answerText, question) {
        const tasks = [];
        const sentences = answerText.match(/[^.!?]+[.!?]+/g) || [answerText];
        
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase();
            
            // Identify action items
            if (lowerSentence.includes("need to") || lowerSentence.includes("should") || 
                lowerSentence.includes("must") || lowerSentence.includes("require")) {
                
                // Extract the action item
                const actionMatch = sentence.match(/(?:need to|should|must|require)\s+(.+?)(?:\.|,|$)/i);
                if (actionMatch && actionMatch[1]) {
                    tasks.push(`Action: ${this.capitalizeFirst(actionMatch[1].trim())}`);
                }
            }
            
            // Identify metrics mentioned
            if (lowerSentence.match(/\d+%/g) || lowerSentence.includes("metric") || 
                lowerSentence.includes("measure") || lowerSentence.includes("track")) {
                
                const metricMatch = sentence.match(/(?:increase|reduce|improve|achieve)\s+(\d+%)/i);
                if (metricMatch) {
                    tasks.push(`Setup tracking for ${metricMatch[1]} target`);
                }
            }
            
            // Identify risks mentioned
            if (lowerSentence.includes("risk") || lowerSentence.includes("challenge") || 
                lowerSentence.includes("bottleneck") || lowerSentence.includes("dependency")) {
                
                tasks.push(`Mitigate ${question.category.toLowerCase()} risks`);
            }
        });
        
        // If no specific tasks found, generate based on question category
        if (tasks.length === 0) {
            tasks.push(`Address ${question.category} requirements`);
        }
        
        return tasks.slice(0, 3); // Limit to 3 tasks per answer
    },
    
    // Generate task description based on answer
    generateTaskDescription(answerText, question) {
        const keyPoints = this.extractKeyPoints(answerText);
        
        if (keyPoints.length > 0) {
            return `Based on: "${question.text}"\n\nKey considerations:\n${keyPoints.map(point => `• ${point}`).join('\n')}`;
        }
        
        return `Task related to: ${question.text}\n\nUser input: ${answerText.substring(0, 100)}${answerText.length > 100 ? '...' : ''}`;
    },
    
    // Extract key points from answer
    extractKeyPoints(text) {
        const points = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length > 10 && trimmed.length < 150) {
                points.push(trimmed);
            }
        });
        
        return points.slice(0, 3); // Return top 3 points
    },
    
    // Extract tags from answer
    extractTags(text) {
        const tags = [];
        const commonTags = ["planning", "analysis", "documentation", "meeting", "review", "setup", "testing"];
        
        commonTags.forEach(tag => {
            if (text.toLowerCase().includes(tag)) {
                tags.push(tag);
            }
        });
        
        // Add category-based tags
        if (text.toLowerCase().includes("risk")) tags.push("risk");
        if (text.toLowerCase().includes("metric")) tags.push("metrics");
        if (text.toLowerCase().includes("user")) tags.push("user-research");
        if (text.toLowerCase().includes("m v p")) tags.push("mvp");
        
        return tags.length > 0 ? tags : ["general"];
    },
    
    // Determine task priority
    determinePriority(text, questionIndex) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes("critical") || lowerText.includes("urgent") || 
            lowerText.includes("blocker") || questionIndex < 3) {
            return TASK_PRIORITIES.find(p => p.id === "critical") || TASK_PRIORITIES[1];
        }
        
        if (lowerText.includes("high priority") || lowerText.includes("important") || 
            questionIndex < 8) {
            return TASK_PRIORITIES.find(p => p.id === "high") || TASK_PRIORITIES[1];
        }
        
        if (lowerText.includes("medium") || questionIndex < 16) {
            return TASK_PRIORITIES.find(p => p.id === "medium") || TASK_PRIORITIES[2];
        }
        
        return TASK_PRIORITIES.find(p => p.id === "low") || TASK_PRIORITIES[3];
    },
    
    // Assign team member
    assignTeamMember(index) {
        const memberIndex = index % TEAM_MEMBERS.length;
        return TEAM_MEMBERS[memberIndex];
    },
    
    // Calculate due date
    calculateDueDate(offset) {
        const date = new Date();
        date.setDate(date.getDate() + 7 + (offset * 2)); // 7 days + offset
        return date.toISOString().split('T')[0];
    },
    
    // Generate time estimate
    generateEstimate(text) {
        const length = text.length;
        if (length > 300) return "1-2 days";
        if (length > 150) return "4-8h";
        if (length > 50) return "2-4h";
        return "1-2h";
    },
    
    // Capitalize first letter
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays === -1) return "Yesterday";
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays < 7) return `In ${diffDays} days`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },
    
    // Check if date is overdue
    isOverdue(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return date < now;
    },
    
    // Get priority color
    getPriorityColor(priority) {
        const pri = TASK_PRIORITIES.find(p => p.id === priority);
        return pri ? pri.color : TASK_PRIORITIES[2].color;
    },
    
    // Get priority label
    getPriorityLabel(priority) {
        const pri = TASK_PRIORITIES.find(p => p.id === priority);
        return pri ? pri.label : "Medium";
    },
    
    // Save to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`intuiva_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    // Load from localStorage
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`intuiva_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    },
    
    // Clear storage
    clearStorage() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('intuiva_'));
        keys.forEach(key => localStorage.removeItem(key));
    }
};

// Export for use in other files
window.DataUtils = DataUtils;
window.QUESTIONS = QUESTIONS;
window.TEAM_MEMBERS = TEAM_MEMBERS;
window.TASK_PRIORITIES = TASK_PRIORITIES;
window.KANBAN_COLUMNS = KANBAN_COLUMNS;
