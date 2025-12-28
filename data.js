// Questions Data Structure
const LEAN_QUESTIONS = [
    {
        category: "Understanding VALUE",
        description: "Identify core value and success metrics",
        questions: [
            "Who are the primary and secondary customers/users? (Be specific about roles, not just \"the business.\")",
            "What is the single, most important problem we are solving for them? (Forces focus on the pain point, not a preconceived solution.)",
            "How will we measure value delivered? (Is it revenue, time saved, cost avoided, customer satisfaction (NPS/CSAT), usage metrics?)",
            "What does \"done\" or \"success\" look like, in measurable terms? (Avoid vague goals like \"improve the system.\")",
            "What is the smallest thing we can deliver that provides measurable value? (This defines your Minimum Viable Product (MVP) or first iteration.)"
        ]
    },
    {
        category: "Mapping the VALUE STREAM",
        description: "Identify all steps and eliminate non-value-adding activities",
        questions: [
            "What are the key steps to go from idea to delivered value? (Map the high-level process flow: design, approve, build, test, deploy, support.)",
            "Where are the likely bottlenecks or delays in this process? (e.g., approvals, environment provisioning, third-party dependencies.)",
            "What existing governance, compliance, or reporting steps are required? Can they be streamlined or done in parallel?",
            "What are our dependencies (teams, systems, external vendors)? How can we simplify or decouple them?"
        ]
    },
    {
        category: "Establishing FLOW",
        description: "Ensure work moves smoothly without waiting, rework, or bottlenecks",
        questions: [
            "How will we organize the team to maintain continuous flow? (Will we use Kanban, short Sprints, etc.?)",
            "What is our Work In Progress (WIP) limit? (To prevent multitasking and context switching.)",
            "How will we make our work and progress visible to all stakeholders? (Physical/digital board, metrics dashboard.)",
            "What are our agreed-upon \"Definition of Ready\" (for starting work) and \"Definition of Done\" (for completing work)? (Standardizes quality and prevents half-baked work moving forward.)"
        ]
    },
    {
        category: "Enabling PULL",
        description: "Start work only when there is capacity and demand, avoiding overproduction",
        questions: [
            "What is the trigger for us to start new work? (e.g., When an item is prioritized and the team has capacity, not because a plan says \"start Monday.\")",
            "How will we prioritize the backlog? (By value, cost of delay, risk reduction? Who is the final decision-maker - Product Owner?)",
            "Do we have the authority to delay or reject low-value work that is pushed onto the team?"
        ]
    },
    {
        category: "Pursuing PERFECTION (Continuous Improvement - Kaizen)",
        description: "Continuously learn and improve the process and product",
        questions: [
            "How and when will we gather feedback from customers/users? (Continuous demos, beta releases, analytics?)",
            "How will we conduct retrospectives/improvement cycles? (Regularly, with a focus on process experiments, not just blame.)",
            "What key metrics will we track for the process itself? (e.g., Lead Time, Cycle Time, Throughput, Blocked Time, Rework rate.)",
            "What is our mechanism for incorporating lessons learned during the project, not just at the end?"
        ]
    },
    {
        category: "Team & Mindset",
        description: "Lean requires a cultural shift",
        questions: [
            "Is the leadership/sponsor aligned on a Lean approach? (Are they prepared for early transparency, changing priorities based on learning, and empowering the team?)",
            "How will we empower the team to identify and eliminate waste daily?",
            "Do we have the right mix of skills to deliver the MVP, or do we need to plan for learning/coaching?",
            "What is the biggest risk to delivering value early and often? (Technical, political, resource-based?)"
        ]
    }
];

// AI Task Generator Configuration
const TASK_TEMPLATES = {
    "Understanding VALUE": [
        { template: "Define user personas for {answer}", category: "planning", priority: "high" },
        { template: "Document problem statement: {answer}", category: "documentation", priority: "medium" },
        { template: "Establish success metrics for {answer}", category: "planning", priority: "high" },
        { template: "Define MVP scope based on {answer}", category: "planning", priority: "critical" }
    ],
    "Mapping the VALUE STREAM": [
        { template: "Map process flow for: {answer}", category: "planning", priority: "medium" },
        { template: "Identify bottlenecks in {answer}", category: "analysis", priority: "medium" },
        { template: "Streamline governance steps for {answer}", category: "planning", priority: "low" },
        { template: "Document dependencies from {answer}", category: "documentation", priority: "medium" }
    ],
    "Establishing FLOW": [
        { template: "Establish workflow for {answer}", category: "planning", priority: "high" },
        { template: "Define WIP limits based on {answer}", category: "planning", priority: "medium" },
        { template: "Setup progress visibility for {answer}", category: "development", priority: "medium" },
        { template: "Document Definition of Done for {answer}", category: "documentation", priority: "high" }
    ],
    "Enabling PULL": [
        { template: "Define work triggers from {answer}", category: "planning", priority: "medium" },
        { template: "Establish prioritization process for {answer}", category: "planning", priority: "high" },
        { template: "Create decision framework from {answer}", category: "planning", priority: "medium" }
    ],
    "Pursuing PERFECTION (Continuous Improvement - Kaizen)": [
        { template: "Setup feedback mechanism for {answer}", category: "planning", priority: "medium" },
        { template: "Plan retrospective process from {answer}", category: "planning", priority: "low" },
        { template: "Define metrics tracking for {answer}", category: "planning", priority: "high" },
        { template: "Create learning incorporation process from {answer}", category: "planning", priority: "medium" }
    ],
    "Team & Mindset": [
        { template: "Align leadership on {answer}", category: "planning", priority: "critical" },
        { template: "Establish waste elimination process from {answer}", category: "planning", priority: "medium" },
        { template: "Assess team skills for {answer}", category: "planning", priority: "high" },
        { template: "Mitigate risks from {answer}", category: "planning", priority: "critical" }
    ]
};

// Sample initial tasks for demonstration
const INITIAL_TASKS = [
    {
        id: "task-1",
        title: "Define project stakeholders and roles",
        description: "Identify primary and secondary users, document their roles and responsibilities",
        column: "todo",
        priority: "high",
        assignee: "Product Owner",
        estimate: 4,
        category: "planning",
        createdAt: new Date().toISOString()
    },
    {
        id: "task-2",
        title: "Establish success metrics",
        description: "Define measurable success criteria and key performance indicators",
        column: "todo",
        priority: "high",
        assignee: "Project Manager",
        estimate: 3,
        category: "planning",
        createdAt: new Date().toISOString()
    },
    {
        id: "task-3",
        title: "Map value stream process",
        description: "Document end-to-end process flow from idea to delivery",
        column: "todo",
        priority: "medium",
        assignee: "Business Analyst",
        estimate: 6,
        category: "analysis",
        createdAt: new Date().toISOString()
    }
];

// Local storage keys
const STORAGE_KEYS = {
    ANSWERS: 'intuiva_answers',
    TASKS: 'intuiva_tasks',
    PROGRESS: 'intuiva_progress',
    SETTINGS: 'intuiva_settings'
};

// Export default data
export { LEAN_QUESTIONS, TASK_TEMPLATES, INITIAL_TASKS, STORAGE_KEYS };
