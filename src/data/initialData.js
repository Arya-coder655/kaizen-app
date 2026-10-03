// KAIZEN Initial Data Store based on ER and Functional Specification
export const INITIAL_USERS = [
  {
    userId: "USR-001",
    name: "Alex Vance",
    email: "alex.vance@kaizen.ai",
    phone: "+1 (555) 234-8901",
    password: "password123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Product Designer & Mindful Productivity Enthusiast striving for 1% daily improvement.",
    joinedDate: "2026-01-15",
    theme: "royal-gold"
  }
];

export const INITIAL_TASKS = [
  {
    taskId: "TSK-101",
    name: "Finalize Client Project Proposal & Presentation Deck",
    status: "in_progress", // pending | in_progress | completed | postponed
    performance: 75, // % performance
    priority: "high", // high | medium | low
    category: "Work & Deep Focus",
    startDate: "2026-09-28",
    dueDate: "2026-10-02",
    estimatedMinutes: 90,
    actualMinutes: 65,
    postponementCount: 1,
    priorityReason: "High priority client deliverable; scheduled during peak morning focus window.",
    aiSuggestedTime: "09:00 AM",
    notes: "Review deliverables, timeline estimates, and budget breakdown before sending.",
    subtasks: [
      { id: "sub-101-1", text: "Outline project scope and key milestones", completed: true },
      { id: "sub-101-2", text: "Calculate cost estimates and timeline phases", completed: true },
      { id: "sub-101-3", text: "Format slide deck design with clean typography", completed: true },
      { id: "sub-101-4", text: "Send final draft to team lead for feedback", completed: false }
    ]
  },
  {
    taskId: "TSK-102",
    name: "Review Monthly Personal Budget & Credit Card Bills",
    status: "postponed",
    performance: 33,
    priority: "medium",
    category: "Financial Wellness",
    startDate: "2026-09-26",
    dueDate: "2026-10-01",
    estimatedMinutes: 45,
    actualMinutes: 15,
    postponementCount: 3,
    priorityReason: "Postponed 3 times: Elevated to medium priority by Kaizen Procrastination Engine.",
    aiSuggestedTime: "02:00 PM (Low friction slot)",
    notes: "Check electricity bills, grocery receipts, and recurring subscriptions.",
    subtasks: [
      { id: "sub-102-1", text: "Download checking account and credit card statements", completed: true },
      { id: "sub-102-2", text: "Review electricity, gas, and internet utilities", completed: false },
      { id: "sub-102-3", text: "Set aside emergency fund savings for this month", completed: false }
    ]
  },
  {
    taskId: "TSK-103",
    name: "Morning 5km Run & Mobility Stretches",
    status: "completed",
    performance: 100,
    priority: "medium",
    category: "Mind & Health",
    startDate: "2026-09-30",
    dueDate: "2026-09-30",
    estimatedMinutes: 45,
    actualMinutes: 45,
    postponementCount: 0,
    priorityReason: "Consistent morning routine; highly correlates with afternoon focus restoration.",
    aiSuggestedTime: "07:00 AM",
    notes: "Park loop run followed by 10-minute hamstring and hip mobility stretches.",
    subtasks: [
      { id: "sub-103-1", text: "5km steady pace outdoor run", completed: true },
      { id: "sub-103-2", text: "Post-run hydration and stretching", completed: true },
      { id: "sub-103-3", text: "Log heart rate and recovery metrics", completed: true }
    ]
  },
  {
    taskId: "TSK-104",
    name: "Weekly Healthy Meal Prep & Grocery Run",
    status: "pending",
    performance: 33,
    priority: "medium",
    category: "Mind & Health",
    startDate: "2026-09-30",
    dueDate: "2026-10-03",
    estimatedMinutes: 90,
    actualMinutes: 30,
    postponementCount: 0,
    priorityReason: "Essential weekly habit to ensure nutritious lunches and save cooking time.",
    aiSuggestedTime: "03:00 PM",
    notes: "Buy fresh vegetables, lean proteins, olive oil, and prepare lunch containers for the week.",
    subtasks: [
      { id: "sub-104-1", text: "Make grocery list of essential pantry items and fresh produce", completed: true },
      { id: "sub-104-2", text: "Supermarket run for vegetables, fruits, and proteins", completed: false },
      { id: "sub-104-3", text: "Batch cook roasted vegetables and quinoa bowls", completed: false }
    ]
  },
  {
    taskId: "TSK-105",
    name: "Deep Clean & Organize Home Workspace Desk",
    status: "postponed",
    performance: 33,
    priority: "low",
    category: "Administrative",
    startDate: "2026-09-24",
    dueDate: "2026-10-02",
    estimatedMinutes: 30,
    actualMinutes: 10,
    postponementCount: 2,
    priorityReason: "Delayed twice. Kaizen recommends a quick 10-minute desk reset sprint.",
    aiSuggestedTime: "04:30 PM",
    notes: "Wipe down monitor and desk surface, sort through physical paper mail, and tidy cables.",
    subtasks: [
      { id: "sub-105-1", text: "Organize paper mail and shred old documents", completed: true },
      { id: "sub-105-2", text: "Clean desk surface, keyboard, and monitor screens", completed: false },
      { id: "sub-105-3", text: "Neatly bundle desk power cables and adapters", completed: false }
    ]
  },
  {
    taskId: "TSK-106",
    name: "Read 20 Pages of Non-Fiction Book",
    status: "in_progress",
    performance: 50,
    priority: "medium",
    category: "Knowledge & Growth",
    startDate: "2026-10-01",
    dueDate: "2026-10-04",
    estimatedMinutes: 30,
    actualMinutes: 15,
    postponementCount: 0,
    priorityReason: "Evening quiet reading time to wind down before bed.",
    aiSuggestedTime: "09:00 PM",
    notes: "Reading Atomic Habits by James Clear.",
    subtasks: [
      { id: "sub-106-1", text: "Read chapter on habit stacking and cues", completed: true },
      { id: "sub-106-2", text: "Jot down 2 key takeaways in reading notes", completed: false }
    ]
  },
  {
    taskId: "TSK-107",
    name: "Call Family & Catch Up Over Weekend",
    status: "pending",
    performance: 0,
    priority: "medium",
    category: "Mind & Health",
    startDate: "2026-10-03",
    dueDate: "2026-10-04",
    estimatedMinutes: 45,
    actualMinutes: 0,
    postponementCount: 0,
    priorityReason: "Family connection anchor for weekend rejuvenation.",
    aiSuggestedTime: "11:00 AM",
    notes: "Catch up with parents and share weekly updates.",
    subtasks: [
      { id: "sub-107-1", text: "Check family schedule and set quiet 45-min window", completed: false },
      { id: "sub-107-2", text: "Call parents and catch up", completed: false }
    ]
  }
];

export const INITIAL_VICE_TASKS = [
  {
    viceId: "VICE-001",
    name: "Late-Night Phone Doomscrolling past 11:30 PM",
    trigger: "Fatigue after work & lying in bed with phone charging beside pillow",
    replacementAction: "Place phone across the room; read 10 pages of a physical book",
    abstinenceDays: 14,
    bestStreak: 21,
    severity: "high",
    status: "active",
    costSavedPerWeek: "$0",
    lastResistedDate: "2026-09-29",
    urgesLogged: 5,
    notes: "Sleep quality improved by +24% when screen-free 45 mins prior to sleep."
  },
  {
    viceId: "VICE-002",
    name: "Impulsive Afternoon Sweet Treats & Sugar Spikes",
    trigger: "3:00 PM energy slump after lunch during spreadsheet tasks",
    replacementAction: "Drink 500ml iced lemon water and perform a 5-minute brisk walk",
    abstinenceDays: 6,
    bestStreak: 12,
    severity: "medium",
    status: "active",
    costSavedPerWeek: "$28",
    lastResistedDate: "2026-09-30",
    urgesLogged: 8,
    notes: "Keeps post-lunch brain fog low and prevents glucose crashes."
  },
  {
    viceId: "VICE-003",
    name: "Multitasking with Social Media during Deep Work",
    trigger: "Facing initial friction on a complex task",
    replacementAction: "Trigger 5-minute Pomodoro timer, write obstacle on paper",
    abstinenceDays: 9,
    bestStreak: 15,
    severity: "high",
    status: "active",
    costSavedPerWeek: "$0",
    lastResistedDate: "2026-09-30",
    urgesLogged: 3,
    notes: "Attention span increased significantly during Morning Focus blocks."
  }
];

export const INITIAL_REMINDERS = [
  {
    reminderId: "REM-001",
    title: "Afternoon Hydration & Posture Reset",
    description: "Drink 400ml water and perform cervical spine decompression stretches.",
    dateTime: "2026-09-30T15:30",
    urgency: "normal",
    category: "Wellness",
    status: "upcoming", // upcoming | completed | dismissed
    soundEnabled: true,
    repeat: "Daily"
  },
  {
    reminderId: "REM-002",
    title: "Review Daily Expenses & Kaizen Budget",
    description: "Reconcile daily card transactions and record any cash outlays.",
    dateTime: "2026-09-30T20:00",
    urgency: "urgent",
    category: "Finance",
    status: "upcoming",
    soundEnabled: true,
    repeat: "Daily"
  },
  {
    reminderId: "REM-003",
    title: "Team Standup & Sprint Synchronization",
    description: "Share completed tasks and discuss potential blockers with team.",
    dateTime: "2026-10-01T10:00",
    urgency: "urgent",
    category: "Work",
    status: "upcoming",
    soundEnabled: true,
    repeat: "Weekdays"
  }
];

export const INITIAL_SCHEDULES = [
  {
    scheduleId: "SCH-001",
    userId: "USR-001",
    taskId: "TSK-103",
    date: "2026-09-30",
    startDate: "2026-09-30",
    endDate: "2026-09-30",
    time: "07:00",
    endTime: "07:45",
    title: "Morning 5km Run & Mobility Stretches",
    aiSuggest: "AI Suggestion: Morning physical movement primes energy and focus for peak daytime productivity.",
    status: "completed"
  },
  {
    scheduleId: "SCH-002",
    userId: "USR-001",
    taskId: "TSK-101",
    date: "2026-09-30",
    startDate: "2026-09-30",
    endDate: "2026-09-30",
    time: "09:00",
    endTime: "10:30",
    title: "Deep Work: Client Project Proposal & Slide Deck",
    aiSuggest: "AI Suggestion: High cognitive demand slot scheduled during morning peak focus window.",
    status: "in_progress"
  },
  {
    scheduleId: "SCH-003",
    userId: "USR-001",
    taskId: null,
    date: "2026-09-30",
    startDate: "2026-09-30",
    endDate: "2026-09-30",
    time: "11:00",
    endTime: "11:45",
    title: "Team Weekly Standup & Priorities Check-in",
    aiSuggest: "AI Suggestion: Collaborative mid-day sync with team on weekly deliverables.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-004",
    userId: "USR-001",
    taskId: "TSK-102",
    date: "2026-09-30",
    startDate: "2026-09-30",
    endDate: "2026-09-30",
    time: "14:00",
    endTime: "15:00",
    title: "Review Monthly Personal Budget & Credit Card Bills",
    aiSuggest: "AI Suggestion: Structured 60m block to reconcile utilities and break procrastination.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-005",
    userId: "USR-001",
    taskId: "TSK-105",
    date: "2026-09-30",
    startDate: "2026-09-30",
    endDate: "2026-09-30",
    time: "16:30",
    endTime: "17:15",
    title: "Deep Clean & Organize Home Workspace Desk",
    aiSuggest: "AI Suggestion: End-of-day physical reset for mental clarity tomorrow.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-006",
    userId: "USR-001",
    taskId: "TSK-104",
    date: "2026-10-01",
    startDate: "2026-10-01",
    endDate: "2026-10-01",
    time: "19:00",
    endTime: "20:00",
    title: "Prepare Healthy Meal Prep & Dinner",
    aiSuggest: "AI Suggestion: Evening culinary session for healthy weekday lunches.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-007",
    userId: "USR-001",
    taskId: "TSK-101",
    date: "2026-10-01",
    startDate: "2026-10-01",
    endDate: "2026-10-01",
    time: "10:00",
    endTime: "11:30",
    title: "Client Follow-up Review & Proposal Presentation",
    aiSuggest: "AI Suggestion: High priority morning client presentation block.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-008",
    userId: "USR-001",
    taskId: "TSK-104",
    date: "2026-10-02",
    startDate: "2026-10-02",
    endDate: "2026-10-02",
    time: "15:00",
    endTime: "16:30",
    title: "Weekly Grocery Run for Fresh Produce & Pantry",
    aiSuggest: "AI Suggestion: Afternoon grocery run ahead of the weekend.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-009",
    userId: "USR-001",
    taskId: "TSK-106",
    date: "2026-10-02",
    startDate: "2026-10-02",
    endDate: "2026-10-02",
    time: "21:00",
    endTime: "21:45",
    title: "Read 20 Pages of Book & Evening Winddown",
    aiSuggest: "AI Suggestion: Screen-free calming routine to prepare for restful sleep.",
    status: "scheduled"
  },
  {
    scheduleId: "SCH-010",
    userId: "USR-001",
    taskId: "TSK-107",
    date: "2026-10-03",
    startDate: "2026-10-03",
    endDate: "2026-10-03",
    time: "11:00",
    endTime: "12:00",
    title: "Call Family & Catch Up Over Weekend",
    aiSuggest: "AI Suggestion: Weekend quality time with family.",
    status: "scheduled"
  }
];

export const INITIAL_HABITS = [
  {
    habitId: "HAB-001",
    name: "Morning Sunlight & 15m Walk",
    category: "Health & Vitality",
    frequency: "Daily",
    streak: 18,
    targetDays: 7,
    completedDates: ["2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"],
    habitStrength: 92,
    cue: "First 20 minutes after waking",
    reward: "Fresh cup of pour-over coffee"
  },
  {
    habitId: "HAB-002",
    name: "Read 20 Pages of Non-Fiction",
    category: "Knowledge & Growth",
    frequency: "Daily",
    streak: 8,
    targetDays: 7,
    completedDates: ["2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"],
    habitStrength: 74,
    cue: "Post-dinner evening winddown",
    reward: "Check off daily reading log in Kaizen"
  },
  {
    habitId: "HAB-003",
    name: "Zero Screens in Bedroom",
    category: "Sleep Architecture",
    frequency: "Daily",
    streak: 14,
    targetDays: 7,
    completedDates: ["2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"],
    habitStrength: 88,
    cue: "10:30 PM reminder alert",
    reward: "Deep REM sleep and refreshed morning energy"
  },
  {
    habitId: "HAB-004",
    name: "Daily Journal & Kaizen 1% Log",
    category: "Mindfulness",
    frequency: "Daily",
    streak: 22,
    targetDays: 7,
    completedDates: ["2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29"],
    habitStrength: 95,
    cue: "Before retiring to sleep",
    reward: "Clarity of mind and peaceful bedtime"
  }
];

export const INITIAL_EXPENSES = [
  {
    expenseId: "EXP-001",
    userId: "USR-001",
    title: "Monthly Gym & Fitness Club Membership",
    amount: 55.00,
    category: "Wellness & Food",
    date: "2026-09-29",
    paymentMethod: "Credit Card",
    notes: "Monthly gym access, swimming pool, and strength training."
  },
  {
    expenseId: "EXP-002",
    userId: "USR-001",
    title: "Weekly Organic Groceries & Fresh Produce",
    amount: 68.50,
    category: "Wellness & Food",
    date: "2026-09-28",
    paymentMethod: "Apple Pay",
    notes: "Fresh vegetables, olive oil, quinoa, and lean proteins for meal prep."
  },
  {
    expenseId: "EXP-003",
    userId: "USR-001",
    title: "Productivity & Personal Growth Books",
    amount: 34.90,
    category: "Education",
    date: "2026-09-25",
    paymentMethod: "Credit Card",
    notes: "Atomic Habits and Deep Work physical editions."
  },
  {
    expenseId: "EXP-004",
    userId: "USR-001",
    title: "Minimalist Ergonomic Desk Lamp",
    amount: 89.00,
    category: "Workspace",
    date: "2026-09-20",
    paymentMethod: "Credit Card",
    notes: "Warm 2700K ambient lighting to reduce evening eye strain."
  }
];

export const INITIAL_ACTIVITIES = [
  {
    activityId: "ACT-001",
    userId: "USR-001",
    actionType: "task_completed",
    description: "Completed morning task: 'Morning 5km Run & Mobility Stretches'",
    timestamp: "2026-09-30 07:45:12",
    metadata: { taskId: "TSK-103", performance: 100 }
  },
  {
    activityId: "ACT-002",
    userId: "USR-001",
    actionType: "vice_resisted",
    description: "Resisted vice urge: 'Late-Night Phone Doomscrolling' (Streak now 14 days)",
    timestamp: "2026-09-29 23:45:00",
    metadata: { viceId: "VICE-001", streak: 14 }
  },
  {
    activityId: "ACT-003",
    userId: "USR-001",
    actionType: "habit_logged",
    description: "Marked habit as completed: 'Morning Sunlight & 15m Walk'",
    timestamp: "2026-09-30 07:45:00",
    metadata: { habitId: "HAB-001" }
  },
  {
    activityId: "ACT-004",
    userId: "USR-001",
    actionType: "voice_entry",
    description: "Converted voice memo into Task 'Weekly Healthy Meal Prep & Grocery Run'",
    timestamp: "2026-09-29 14:10:22",
    metadata: { voiceId: "VOC-881", confidence: 0.96 }
  },
  {
    activityId: "ACT-005",
    userId: "USR-001",
    actionType: "ai_consulted",
    description: "AI Smart Priority engine recalculated priority rankings based on morning alertness.",
    timestamp: "2026-09-30 09:00:00",
    metadata: { updatedTasks: 3 }
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    notificationId: "NOTIF-001",
    userId: "USR-001",
    title: "AI Focus Reminder",
    message: "Task 'Review Monthly Personal Budget & Credit Card Bills' is scheduled for this afternoon at 02:00 PM.",
    type: "ai_insight",
    read: false,
    createdAt: "10 mins ago"
  },
  {
    notificationId: "NOTIF-002",
    userId: "USR-001",
    title: "Upcoming Daily Schedule Slot",
    message: "Scheduled: 'Deep Work: Client Project Proposal & Slide Deck' begins at 09:00 AM.",
    type: "reminder",
    read: false,
    createdAt: "35 mins ago"
  },
  {
    notificationId: "NOTIF-003",
    userId: "USR-001",
    title: "Habit Streak Milestone 🌟",
    message: "Congratulations! You reached a 14-day abstinence streak on 'Zero Screens in Bedroom'.",
    type: "system",
    read: true,
    createdAt: "Yesterday"
  },
  {
    notificationId: "NOTIF-004",
    userId: "USR-001",
    title: "Vice Resistance Encouragement",
    message: "Kaizen AI observed high self-regulation during your 3:00 PM sugar trigger window.",
    type: "vice_warning",
    read: true,
    createdAt: "2 days ago"
  }
];

export const INITIAL_AI_SUGGESTIONS = [
  {
    suggestionId: "SUG-001",
    taskId: "TSK-102",
    suggestedTask: "Micro-Sprint: 15-Minute Budget Review",
    suggestType: "procrastination_breaker",
    confidenceScore: 94,
    generatedDate: "2026-09-30",
    reason: "Postponement count is 3. Reducing cognitive hurdle from 45 min to 15 min drastically increases initiation probability.",
    actionableSteps: [
      "Open your banking app without attempting to categorize yet",
      "Check the 5 most recent transactions only",
      "Assign one tag and stop after 15 minutes"
    ]
  },
  {
    suggestionId: "SUG-002",
    taskId: "TSK-101",
    suggestedTask: "Block 90-min Golden Focus Period tomorrow morning",
    suggestType: "schedule_optimization",
    confidenceScore: 98,
    generatedDate: "2026-09-30",
    reason: "Your User Behaviour Analysis shows 38% higher task completion velocity between 9:00 AM and 11:00 AM.",
    actionableSteps: [
      "Enable Do Not Disturb at 9:00 AM",
      "Keep workspace clear of mobile devices",
      "Utilize Kaizen 25m focus timer"
    ]
  },
  {
    suggestionId: "SUG-003",
    taskId: null,
    suggestedTask: "Substitute Evening Sugar Cravings with Cinnamon Herbal Infusion",
    suggestType: "vice_mitigation",
    confidenceScore: 89,
    generatedDate: "2026-09-29",
    reason: "Data shows dopamine seeking spikes around 3:30 PM when deep work sessions exceed 75 minutes without rest.",
    actionableSteps: [
      "Brew cinnamon-infused rooibos tea at 3:15 PM",
      "Step away from screen for 5 minutes of eye relaxation"
    ]
  }
];

export const INITIAL_USER_BEHAVIOUR = {
  userId: "USR-001",
  completionPattern: "Optimal focus velocity observed between 08:30 AM and 11:30 AM. Productivity dips by 22% between 1:30 PM - 3:00 PM before recovering at 4:30 PM.",
  lastPreferred: "Client Deliverables & Creative Work",
  routinePattern: "Consistent 7:00 AM morning exercise, reliable evening reading habits, occasional postponement on monthly budgeting.",
  analysisTime: "2026-09-30 06:00:00",
  productivityScore: 88,
  weeklyStreakDays: 6,
  focusHoursThisWeek: 28.5,
  procrastinationRisk: "Low-Moderate (1 delayed budget task identified)"
};

export const INITIAL_VOICE_ENTRIES = [
  {
    voiceEntryId: "VOC-881",
    taskId: "TSK-104",
    userId: "USR-001",
    entryDate: "2026-09-29 14:10:22",
    voiceId: "AUDIO-REC-4921",
    convertedTask: "Weekly Healthy Meal Prep & Grocery Run",
    rawTranscription: "Add task weekly grocery shopping and healthy meal prep by Sunday afternoon",
    parsedDetails: {
      category: "Mind & Health",
      priority: "medium",
      dueDate: "2026-10-03",
      estimatedMinutes: 90
    }
  },
  {
    voiceEntryId: "VOC-882",
    taskId: "TSK-103",
    userId: "USR-001",
    entryDate: "2026-09-28 07:15:00",
    voiceId: "AUDIO-REC-4920",
    convertedTask: "Morning 5km Run & Mobility Stretches",
    rawTranscription: "Schedule morning run 5km and mobility stretches at 7am",
    parsedDetails: {
      category: "Mind & Health",
      priority: "medium",
      dueDate: "2026-09-30",
      estimatedMinutes: 45
    }
  }
];

export const INITIAL_SYSTEM_SETTINGS = {
  appName: "KAIZEN AI Life Assistant",
  version: "2.4.0-Golden",
  environment: "Production",
  aiModelEngine: "Kaizen-Core-Neural-v3",
  smartPriorityAutoRecalculate: true,
  procrastinationThresholdAlert: 2, // alert after 2 postponements
  voiceRecognitionSensitivity: "High (DeepSpeech v4.2)",
  backupAutoFrequency: "Daily at 02:00 AM",
  maintenanceMode: false,
  allowNewRegistrations: true,
  dataEncryption: "AES-256 Enabled"
};

export const INITIAL_BACKUPS = [
  {
    backupId: "BKP-20260928",
    createdAt: "2026-09-28 02:00:14",
    size: "1.42 MB",
    recordsCount: 148,
    status: "Verified",
    type: "Automated Nightly"
  },
  {
    backupId: "BKP-20260929",
    createdAt: "2026-09-29 02:00:09",
    size: "1.46 MB",
    recordsCount: 154,
    status: "Verified",
    type: "Automated Nightly"
  }
];
