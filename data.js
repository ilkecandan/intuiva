const QUESTIONS = [
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
];

// Make QUESTIONS available globally
window.QUESTIONS = QUESTIONS;
