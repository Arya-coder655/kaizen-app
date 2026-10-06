// Kaizen Smart Voice Assistant Natural Language Engine
// Maps conversational voice commands to real application actions with rich spoken responses

import { getTodayStr, addDays, formatDateShort, formatDateDisplay } from './dateUtils.js';

// Canonical list of all application tabs and rich voice trigger synonyms
export const APP_TABS = [
  {
    screen: 'planner',
    label: 'Daily Planner',
    iconName: 'CalendarDays',
    keywords: [
      'daily planner',
      'daily',
      'planner',
      'schedule',
      'daily schedule',
      'calendar',
      'time blocking',
      'day timeline',
      'day planner'
    ]
  },
  {
    screen: 'tasks',
    label: 'Task Management',
    iconName: 'CheckSquare',
    keywords: [
      'task management',
      'tasks',
      'task',
      'todo',
      'todos',
      'task list',
      'manage tasks',
      'to do list',
      'to do',
      'work items'
    ]
  },
  {
    screen: 'dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    keywords: [
      'dashboard',
      'home',
      'main',
      'overview',
      'home screen',
      'main screen'
    ]
  },
  {
    screen: 'habits',
    label: 'Habit Tracking',
    iconName: 'Flame',
    keywords: [
      'habit tracking',
      'habits',
      'habit',
      'habit tracker',
      'track habits',
      'habits list',
      'routine'
    ]
  },
  {
    screen: 'expenses',
    label: 'Expense Tracking',
    iconName: 'Wallet',
    keywords: [
      'expense tracking',
      'expenses',
      'expense',
      'budget',
      'spending',
      'personal finance',
      'finances',
      'money'
    ]
  },
  {
    screen: 'reminders',
    label: 'Reminders',
    iconName: 'Bell',
    keywords: [
      'reminders',
      'reminder',
      'reminder list',
      'manage reminders',
      'alerts'
    ]
  },
  {
    screen: 'vice_tasks',
    label: 'Vice Tasks',
    iconName: 'ShieldAlert',
    keywords: [
      'vice tasks',
      'vice task',
      'vice management',
      'vices',
      'vice',
      'bad habits',
      'guardrails'
    ]
  },
  {
    screen: 'activity_history',
    label: 'Activity History',
    iconName: 'History',
    keywords: [
      'activity history',
      'history',
      'activities',
      'activity log',
      'past activities',
      'activity'
    ]
  },
  {
    screen: 'notifications',
    label: 'Notifications',
    iconName: 'Bell',
    keywords: [
      'notifications',
      'notification',
      'notification center'
    ]
  },
  {
    screen: 'ai_suggestions',
    label: 'AI Suggestions',
    iconName: 'Sparkles',
    keywords: [
      'ai suggestions',
      'suggestions',
      'recommendations',
      'ai advice',
      'ai recommendations',
      'insights'
    ]
  },
  {
    screen: 'reports',
    label: 'Reports & Analytics',
    iconName: 'BarChart3',
    keywords: [
      'reports',
      'report',
      'analytics',
      'statistics',
      'stats',
      'performance reports',
      'charts'
    ]
  },
  {
    screen: 'profile',
    label: 'User Profile',
    iconName: 'User',
    keywords: [
      'profile',
      'user profile',
      'my profile',
      'account',
      'my account',
      'user details'
    ]
  },
  {
    screen: 'settings',
    label: 'Settings',
    iconName: 'Settings',
    keywords: [
      'settings',
      'preferences',
      'configuration',
      'system settings',
      'options'
    ]
  },
  {
    screen: 'voice_task',
    label: 'Voice Assistant',
    iconName: 'Mic',
    keywords: [
      'voice task',
      'voice',
      'voice assistant',
      'speech',
      'voice entry'
    ]
  }
];

// Helper to match spoken text against all application tabs
export function matchTabFromVoice(rawText) {
  if (!rawText) return null;
  const lower = rawText.toLowerCase().trim();

  // If this is clearly an action command (creating, scheduling, spending, completing), don't hijack as tab navigation
  if (/^(add|create|new|schedule|plan|spent|spend|log|record|mark|complete|finish)\b/i.test(lower)) {
    return null;
  }

  // Strip all punctuation like trailing periods, commas, questions
  const noPunct = lower.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ');
  const clean = noPunct
    .replace(/\b(please|can you|could you|would you|i want to|want to|take me to|switch to|navigate to|go to|show me|show|open|view|launch|the|my|a)\b/gi, ' ')
    .replace(/\b(tab|screen|page|section|view)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // 1. Direct match with keywords
  for (const tab of APP_TABS) {
    if (tab.keywords.some(k => k === clean)) {
      return tab;
    }
  }

  // 2. Starts with or ends with
  for (const tab of APP_TABS) {
    if (tab.keywords.some(k => clean.startsWith(k) || clean.endsWith(k))) {
      return tab;
    }
  }

  // 3. Word inclusion only for focused short queries (<= 3 words)
  const words = clean.split(' ').filter(w => w.length >= 3);
  if (words.length <= 3) {
    for (const tab of APP_TABS) {
      if (tab.keywords.some(k => words.some(w => k === w || k.includes(w)))) {
        return tab;
      }
    }
  }

  return null;
}

export function parseVoiceIntent(transcript, context = {}) {
  const text = (transcript || '').trim();
  const lower = text.toLowerCase();
  const today = getTodayStr();
  const tomorrow = addDays(today, 1);

  if (!text) {
    return {
      intent: 'EMPTY',
      confidence: 0,
      title: '',
      spokenResponse: "I didn't catch that. Please speak your command or request.",
      actionType: 'none'
    };
  }

  // 0. HIDDEN EASTER EGG: "HOW IS YOUR BOSS" / "WHO IS YOUR BOSS"
  const cleanLower = lower.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ').replace(/\s+/g, ' ').trim();
  const isBossQuery = (
    cleanLower.includes('your boss') ||
    cleanLower.includes('the boss') ||
    cleanLower.includes('about your boss') ||
    cleanLower.includes('about boss') ||
    cleanLower.includes('who is boss') ||
    cleanLower.includes('who s boss') ||
    cleanLower.includes('how s boss') ||
    cleanLower.includes('how is boss') ||
    cleanLower.includes('who created you') ||
    cleanLower.includes('who made you') ||
    cleanLower.includes('who is your creator') ||
    cleanLower.includes('who is your master') ||
    cleanLower.includes('who is your owner') ||
    cleanLower.includes('arya more') ||
    cleanLower === 'who is arya' ||
    cleanLower.includes('about arya') ||
    cleanLower === 'who is your boss' ||
    cleanLower === 'how is your boss'
  );

  if (isBossQuery) {
    return {
      intent: 'BOSS_EASTER_EGG',
      confidence: 1.0,
      actionType: 'boss_easter_egg',
      bossName: 'Arya More',
      spokenResponse: `Arya More is My Boss, he is so smart and handsome. I love you boss!`,
      displayResponse: `Arya More is My Boss, he is so smart and handsome. "I love you boss!" ❤️👑✨`,
      easterEgg: true
    };
  }

  // 1. CONVERSATIONAL GREETING & INTRO
  if (
    lower === 'hello' ||
    lower === 'hi' ||
    lower === 'hey' ||
    lower === 'hey kaizen' ||
    lower.includes('who are you') ||
    lower.includes('what can you do')
  ) {
    return {
      intent: 'GREETING',
      confidence: 0.98,
      actionType: 'chat',
      spokenResponse: `Hello! I am Kaizen, your AI life assistant. You can speak to me to create tasks, schedule focus blocks, log expenses, check off habits, or request your daily productivity briefing.`
    };
  }

  if (lower.includes('thank you') || lower.includes('thanks kaizen') || lower === 'thanks') {
    return {
      intent: 'GRATITUDE',
      confidence: 0.95,
      actionType: 'chat',
      spokenResponse: "You're welcome! Keep up the continuous improvement and momentum today."
    };
  }

  // 2. TAB NAVIGATION COMMANDS ("open daily", "open task management", "switch to habits", etc.)
  const matchedTab = matchTabFromVoice(text);
  if (matchedTab) {
    return {
      intent: 'NAVIGATE',
      confidence: 0.98,
      actionType: 'navigation',
      screen: matchedTab.screen,
      screenLabel: matchedTab.label,
      spokenResponse: `Opening ${matchedTab.label} for you now!`
    };
  }

  // 3. DAILY BRIEFING / STATUS QUERY
  if (
    lower.includes('daily briefing') ||
    lower.includes('what is on my schedule') ||
    lower.includes("what's on my schedule") ||
    lower.includes('what are my tasks') ||
    lower.includes('my tasks today') ||
    lower.includes('how is my day') ||
    lower.includes("how's my day") ||
    lower.includes('give me a briefing') ||
    lower.includes('daily summary') ||
    lower.includes('what should i do')
  ) {
    const userTasks = context.tasks || [];
    const userSchedules = context.schedules || [];
    const pendingTasks = userTasks.filter(t => t.status !== 'completed');
    const todaySchedules = userSchedules.filter(s => (s.startDate === today || s.date === today) && s.status !== 'completed');
    const highPriTask = pendingTasks.find(t => t.priority === 'high');

    const userName = context.currentUser?.name?.split(' ')[0] || 'there';
    let briefingText = `Good day, ${userName}. Today you have ${todaySchedules.length} focus sessions scheduled and ${pendingTasks.length} pending tasks. `;
    if (highPriTask) {
      briefingText += `Your highest priority focus item is "${highPriTask.name}". `;
    }
    briefingText += `Stay focused, and let me know if you would like me to schedule another block.`;

    return {
      intent: 'GET_BRIEFING',
      confidence: 0.96,
      actionType: 'briefing',
      data: {
        pendingCount: pendingTasks.length,
        scheduleCount: todaySchedules.length,
        topTask: highPriTask ? highPriTask.name : null
      },
      spokenResponse: briefingText
    };
  }

  // 4. AI PRODUCTIVITY COACHING / PROCRASTINATION GUIDANCE
  if (
    lower.includes('procrastinat') ||
    lower.includes('overwhelmed') ||
    lower.includes('cannot focus') ||
    lower.includes("can't focus") ||
    lower.includes('distracted') ||
    lower.includes('give me advice') ||
    lower.includes('coach me') ||
    lower.includes('feeling stuck') ||
    lower.includes('help me start')
  ) {
    return {
      intent: 'COACHING_ADVICE',
      confidence: 0.95,
      actionType: 'coaching',
      spokenResponse: `When you feel resistance or overwhelm, remember the Kaizen principle: lower the activation threshold. Commit to just 5 minutes without judging your output. Once initiated, dopamine follows action. Shall I set a 10-minute focus sprint for you?`
    };
  }

  // 5. 10-MINUTE LOOP REMINDER OR WATER DROP ALERT
  if (
    lower.includes('10 minute reminder') ||
    lower.includes('10-minute reminder') ||
    lower.includes('10 min reminder') ||
    lower.includes('loop reminder') ||
    lower.includes('water drop sound') ||
    lower.includes('water drop reminder') ||
    lower.includes('drop sound reminder')
  ) {
    let cleanRemTitle = text
      .replace(/(set|add|create|start)?\s*(a\s+)?(10\s*minute|10-minute|10\s*min|loop|water\s*drop)?\s*reminder\s*(for|to|about)?/i, '')
      .trim();
    if (!cleanRemTitle) cleanRemTitle = "Personal Focus Check-in";

    return {
      intent: 'SET_10MIN_REMINDER',
      confidence: 0.92,
      actionType: 'loop_reminder',
      title: cleanRemTitle,
      spokenResponse: `10-minute recurring reminder activated for "${cleanRemTitle}". You will hear the synthesized water drop chime alert every 10 minutes.`
    };
  }

  // 6. EXPENSE TRACKING INTENT
  // Detects: "Spent $45 on groceries", "Add expense 30 dollars for books", "Log expense $15 lunch"
  const expensePattern1 = /(spent|paid|expense of|log expense|record expense|bought)\s+\$?(\d+(?:\.\d{1,2})?)\s*(?:dollars)?\s*(?:on|for)?\s*(.*)/i;
  const expensePattern2 = /\$?(\d+(?:\.\d{1,2})?)\s*(?:dollars)?\s*(?:for|on)\s+(.*)/i;

  let expMatch = text.match(expensePattern1) || text.match(expensePattern2);
  if (lower.includes('expense') || lower.includes('spent') || lower.includes('cost') || expMatch) {
    let amount = 0;
    let expenseTitle = 'Personal Expense';
    let category = 'General Living';

    const amtMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
    if (amtMatch) {
      amount = parseFloat(amtMatch[1]);
    }

    if (expMatch && expMatch[expMatch.length - 1]) {
      expenseTitle = expMatch[expMatch.length - 1].replace(/(please|today|yesterday)/i, '').trim();
    } else {
      expenseTitle = text
        .replace(/(add|log|record)?\s*expense\s*(of)?\s*\$?\d+/i, '')
        .replace(/(for|on)/i, '')
        .trim();
    }

    if (!expenseTitle || expenseTitle.length < 2) expenseTitle = "Quick Voice Expense";
    expenseTitle = expenseTitle.charAt(0).toUpperCase() + expenseTitle.slice(1);

    const titleLower = expenseTitle.toLowerCase();
    if (titleLower.includes('grocery') || titleLower.includes('food') || titleLower.includes('lunch') || titleLower.includes('dinner') || titleLower.includes('coffee') || titleLower.includes('cafe')) {
      category = 'Food & Dining';
    } else if (titleLower.includes('gym') || titleLower.includes('medicine') || titleLower.includes('health') || titleLower.includes('doctor') || titleLower.includes('pharmacy')) {
      category = 'Health & Fitness';
    } else if (titleLower.includes('uber') || titleLower.includes('gas') || titleLower.includes('fuel') || titleLower.includes('transit') || titleLower.includes('bus')) {
      category = 'Transportation';
    } else if (titleLower.includes('book') || titleLower.includes('course') || titleLower.includes('subscription') || titleLower.includes('software')) {
      category = 'Learning & Tools';
    } else if (titleLower.includes('rent') || titleLower.includes('electric') || titleLower.includes('utility') || titleLower.includes('bill') || titleLower.includes('internet')) {
      category = 'Bills & Utilities';
    }

    if (amount > 0) {
      return {
        intent: 'LOG_EXPENSE',
        confidence: 0.94,
        actionType: 'expense',
        data: {
          title: expenseTitle,
          amount,
          category,
          date: today
        },
        spokenResponse: `Recorded an expense of $${amount.toFixed(2)} for ${expenseTitle} under ${category}.`
      };
    }
  }

  // 7. HABIT COMPLETION INTENT
  // Detects: "Completed my morning run habit", "Mark meditation done", "Checked off drinking water", "Finished reading habit"
  if (
    lower.includes('habit') ||
    lower.includes('checked off') ||
    lower.includes('did my') ||
    lower.includes('finished my')
  ) {
    const habits = context.habits || [];
    let matchedHabit = null;

    // Check against existing habits
    for (const h of habits) {
      const hName = h.name.toLowerCase();
      if (lower.includes(hName) || hName.split(' ').some(w => w.length > 3 && lower.includes(w))) {
        matchedHabit = h;
        break;
      }
    }

    if (matchedHabit) {
      return {
        intent: 'TRACK_HABIT',
        confidence: 0.93,
        actionType: 'habit',
        habit: matchedHabit,
        spokenResponse: `Awesome progress! Marked your habit "${matchedHabit.name}" as completed for today.`
      };
    }
  }

  // 8. TASK COMPLETION INTENT
  // Detects: "Complete task client proposal", "Mark task review budget done", "Finish task desk clean"
  if (
    lower.includes('complete task') ||
    lower.includes('mark task done') ||
    lower.includes('finish task') ||
    lower.includes('task completed')
  ) {
    const tasks = context.tasks || [];
    const query = text
      .replace(/(complete task|mark task done|mark task as done|finish task|task completed)\s*/i, '')
      .toLowerCase()
      .trim();

    let matchedTask = null;
    if (query) {
      matchedTask = tasks.find(t => 
        t.status !== 'completed' && (
          t.name.toLowerCase().includes(query) || 
          query.includes(t.name.toLowerCase()) ||
          t.taskId.toLowerCase() === query
        )
      );
    }

    if (matchedTask) {
      return {
        intent: 'COMPLETE_TASK',
        confidence: 0.94,
        actionType: 'task_complete',
        task: matchedTask,
        spokenResponse: `Excellent job! Marked "${matchedTask.name}" as completed.`
      };
    }
  }

  // 9. SCHEDULE FOCUS BLOCK / DAILY PLANNER INTENT
  // Detects: "Schedule team sync tomorrow at 10am for 45 minutes", "Block focus session today at 2pm"
  const isScheduleCommand = 
    lower.startsWith('schedule') || 
    lower.startsWith('plan') || 
    lower.includes('add to schedule') || 
    lower.includes('add to planner') || 
    lower.includes('block time') ||
    (lower.includes(' at ') && (lower.includes('am') || lower.includes('pm') || lower.includes(':')));

  if (isScheduleCommand && (lower.includes('at ') || lower.includes('tomorrow') || lower.includes('today') || lower.includes('am') || lower.includes('pm'))) {
    // Parse time
    let startTime = "09:30";
    let endTime = "10:30";

    const timeMatch = text.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === 'pm' && h < 12) h += 12;
      if (meridiem === 'am' && h === 12) h = 0;

      startTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const endH = Math.min(23, h + 1);
      endTime = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    // Parse duration
    const durMatch = text.match(/(\d+)\s*(?:minutes|mins|min|hours|hour|hr|hrs)/i);
    if (durMatch && timeMatch) {
      const durVal = parseInt(durMatch[1], 10);
      const isHours = durMatch[0].toLowerCase().includes('h');
      const addMins = isHours ? durVal * 60 : durVal;
      const [sh, sm] = startTime.split(':').map(Number);
      const totalEnd = sh * 60 + sm + addMins;
      const eh = Math.min(23, Math.floor(totalEnd / 60));
      const em = totalEnd % 60;
      endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
    }

    // Target date
    let targetDate = today;
    if (lower.includes('tomorrow')) {
      targetDate = tomorrow;
    } else if (lower.includes('next week')) {
      targetDate = addDays(today, 7);
    }

    // Clean title
    let schTitle = text
      .replace(/^(schedule|plan|add to schedule|add to planner|block time for|block focus)\s+/i, '')
      .replace(/\b(today|tomorrow|next week)\b/i, '')
      .replace(/(?:at\s+)?\d{1,2}(?::\d{2})?\s*(am|pm)?/i, '')
      .replace(/for\s+\d+\s*(?:minutes|mins|min|hours|hour|hr|hrs)/i, '')
      .trim();

    if (!schTitle || schTitle.length < 2) schTitle = "Focus Session";
    schTitle = schTitle.charAt(0).toUpperCase() + schTitle.slice(1);

    return {
      intent: 'SCHEDULE_SLOT',
      confidence: 0.92,
      actionType: 'schedule',
      data: {
        title: schTitle,
        startDate: targetDate,
        endDate: targetDate,
        date: targetDate,
        time: startTime,
        endTime: endTime,
        aiSuggest: `AI Voice Scheduled: Aligned with personal focus schedule for ${formatDateShort(targetDate)}.`,
        loopReminder: true
      },
      spokenResponse: `Scheduled "${schTitle}" for ${formatDateShort(targetDate)} from ${startTime} to ${endTime}. The 10-minute water drop chime reminder is active.`
    };
  }

  // 10. DEFAULT / PRIMARY INTENT: SMART TASK CREATION
  // Detects priority, due date, category, duration
  let priority = "medium";
  if (lower.includes("high priority") || lower.includes("urgent") || lower.includes("important") || lower.includes("critical") || lower.includes("asap")) {
    priority = "high";
  } else if (lower.includes("low priority") || lower.includes("casual") || lower.includes("whenever") || lower.includes("low")) {
    priority = "low";
  }

  let category = "Work & Deep Focus";
  if (lower.includes("health") || lower.includes("workout") || lower.includes("gym") || lower.includes("run") || lower.includes("meditat") || lower.includes("doctor")) {
    category = "Mind & Health";
  } else if (lower.includes("budget") || lower.includes("tax") || lower.includes("bill") || lower.includes("finance") || lower.includes("bank") || lower.includes("audit")) {
    category = "Financial Wellness";
  } else if (lower.includes("book") || lower.includes("read") || lower.includes("study") || lower.includes("learn") || lower.includes("course")) {
    category = "Knowledge & Growth";
  } else if (lower.includes("clean") || lower.includes("grocer") || lower.includes("home") || lower.includes("room") || lower.includes("call family")) {
    category = "Living & Routines";
  }

  let estimatedMinutes = 45;
  const minMatch = text.match(/(\d+)\s*(minutes|mins|min|hours|hour|hr|hrs)/i);
  if (minMatch) {
    const val = parseInt(minMatch[1], 10);
    const unit = (minMatch[2] || '').toLowerCase();
    estimatedMinutes = unit.startsWith("h") ? val * 60 : val;
  }

  let dueDate = today;
  let dateDescription = "today";
  if (lower.includes("tomorrow")) {
    dueDate = tomorrow;
    dateDescription = "tomorrow";
  } else if (lower.includes("next week")) {
    dueDate = addDays(today, 7);
    dateDescription = "next week";
  } else if (lower.includes("by friday") || lower.includes("on friday")) {
    dueDate = addDays(today, 5);
    dateDescription = "by Friday";
  }

  // Clean title
  let cleanTaskTitle = text
    .replace(/^(add task|create task|schedule task|remind me to|please add|new task|todo|add|create)\s+/i, '')
    .replace(/(high priority|urgent|important|low priority|medium priority)/i, '')
    .replace(/\b(tomorrow|today|next week|by friday)\b/i, '')
    .replace(/for\s+\d+\s*(?:minutes|mins|min|hours|hour|hr|hrs)/i, '')
    .trim();

  if (!cleanTaskTitle || cleanTaskTitle.length < 2) {
    cleanTaskTitle = text.slice(0, 40);
  }
  cleanTaskTitle = cleanTaskTitle.charAt(0).toUpperCase() + cleanTaskTitle.slice(1);

  return {
    intent: 'CREATE_TASK',
    confidence: 0.91,
    actionType: 'task',
    data: {
      name: cleanTaskTitle,
      priority,
      category,
      dueDate,
      estimatedMinutes,
      loopReminder: true,
      notes: `Voice input: "${text}"`
    },
    spokenResponse: `Created your ${priority} priority task "${cleanTaskTitle}" due ${dateDescription} for ${estimatedMinutes} minutes.`
  };
}

export function executeVoiceIntent(parsed, transcript, app) {
  if (!parsed || parsed.intent === 'EMPTY') return null;

  const result = {
    executed: false,
    message: parsed.spokenResponse,
    entity: null
  };

  try {
    switch (parsed.actionType) {
      case 'navigation': {
        if (app.setCurrentScreen && parsed.screen) {
          app.setCurrentScreen(parsed.screen);
          if (app.showToast) {
            app.showToast(`Navigated to ${parsed.screenLabel || parsed.screen}!`, 'gold');
          }
          result.executed = true;
        }
        break;
      }

      case 'task': {
        const newTask = app.addTask(parsed.data);
        if (app.addVoiceEntry) {
          app.addVoiceEntry(transcript, {
            name: newTask.name,
            category: newTask.category,
            priority: newTask.priority,
            dueDate: newTask.dueDate,
            estimatedMinutes: newTask.estimatedMinutes,
            notes: newTask.notes
          });
        }
        result.executed = true;
        result.entity = newTask;
        break;
      }

      case 'schedule': {
        const newSch = app.addSchedule(parsed.data);
        result.executed = true;
        result.entity = newSch;
        break;
      }

      case 'expense': {
        const newExp = app.addExpense(parsed.data);
        result.executed = true;
        result.entity = newExp;
        break;
      }

      case 'habit': {
        const today = getTodayStr();
        app.toggleHabitDay(parsed.habit.habitId, today);
        result.executed = true;
        result.entity = parsed.habit;
        break;
      }

      case 'task_complete': {
        app.updateTask(parsed.task.taskId, {
          status: 'completed',
          performance: 100
        });
        result.executed = true;
        result.entity = parsed.task;
        break;
      }

      case 'boss_easter_egg': {
        result.executed = true;
        result.entity = {
          name: 'Arya More (Boss & Creator)',
          status: 'Smart & Handsome Mastermind 👑'
        };
        break;
      }

      case 'loop_reminder': {
        app.trigger10MinLoopAlert(null, `Voice Loop Alert: "${parsed.title}"`);
        result.executed = true;
        break;
      }

      case 'briefing':
      case 'coaching':
      case 'chat':
      default: {
        result.executed = true;
        break;
      }
    }
  } catch (err) {
    console.error("Error executing voice intent:", err);
  }

  return result;
}
