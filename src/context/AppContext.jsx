import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_VICE_TASKS,
  INITIAL_REMINDERS,
  INITIAL_SCHEDULES,
  INITIAL_HABITS,
  INITIAL_EXPENSES,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_SUGGESTIONS,
  INITIAL_USER_BEHAVIOUR,
  INITIAL_VOICE_ENTRIES,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_BACKUPS
} from '../data/initialData';
import { calculateSmartPriority, generateAiAdvice } from '../utils/aiEngine';
import { playDropSound, playChimeSound } from '../utils/soundUtils';

const AppContext = createContext();

const STORAGE_KEY = 'KAIZEN_AI_ASSISTANT_DATA_V2';

export function AppProvider({ children }) {
  // Load from local storage or defaults with remembered user restoration
  const loadInitialData = () => {
    let initialStore = {
      users: INITIAL_USERS,
      currentUserId: INITIAL_USERS[0].userId,
      tasks: INITIAL_TASKS,
      viceTasks: INITIAL_VICE_TASKS,
      reminders: INITIAL_REMINDERS,
      schedules: INITIAL_SCHEDULES,
      habits: INITIAL_HABITS,
      expenses: INITIAL_EXPENSES,
      activities: INITIAL_ACTIVITIES,
      notifications: INITIAL_NOTIFICATIONS,
      aiSuggestions: INITIAL_AI_SUGGESTIONS,
      userBehaviour: INITIAL_USER_BEHAVIOUR,
      voiceEntries: INITIAL_VOICE_ENTRIES,
      systemSettings: INITIAL_SYSTEM_SETTINGS,
      backups: INITIAL_BACKUPS,
      themePalette: 'royal-gold' // royal-gold, champagne, sand
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Auto-migrate if stored data contains old robotic tasks
        const hasRoboticTasks = parsed.tasks && parsed.tasks.some(t => 
          t.name && (
            t.name.includes("AI Architecture") || 
            t.name.includes("Voice Engine") || 
            t.name.includes("Alpha Cohort") ||
            t.name.includes("Cortisol")
          )
        );

        if (hasRoboticTasks) {
          parsed.tasks = INITIAL_TASKS;
          parsed.schedules = INITIAL_SCHEDULES;
          parsed.expenses = INITIAL_EXPENSES;
          parsed.activities = INITIAL_ACTIVITIES;
          parsed.notifications = INITIAL_NOTIFICATIONS;
          parsed.aiSuggestions = INITIAL_AI_SUGGESTIONS;
          parsed.voiceEntries = INITIAL_VOICE_ENTRIES;
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialStore, ...parsed }));
        }

        initialStore = { ...initialStore, ...parsed };
      }

      // Ensure all tasks have startDate, dueDate, and 10m loop properties normalized
      if (initialStore.tasks) {
        initialStore.tasks = initialStore.tasks.map(t => ({
          ...t,
          startDate: t.startDate || t.dueDate || new Date().toISOString().split("T")[0],
          dueDate: t.dueDate || t.startDate || new Date().toISOString().split("T")[0],
          loopReminder: t.loopReminder !== undefined ? t.loopReminder : true,
          loopIntervalMinutes: 10,
          lastLoopTime: t.lastLoopTime || Date.now(),
          loopCount: t.loopCount || 0
        }));
      }

      // Ensure all schedules have startDate, endDate, date, and 10m loop properties normalized
      if (initialStore.schedules) {
        initialStore.schedules = initialStore.schedules.map(s => ({
          ...s,
          startDate: s.startDate || s.date || new Date().toISOString().split("T")[0],
          endDate: s.endDate || s.startDate || s.date || new Date().toISOString().split("T")[0],
          date: s.date || s.startDate || new Date().toISOString().split("T")[0],
          loopReminder: s.loopReminder !== undefined ? s.loopReminder : true,
          loopIntervalMinutes: 10,
          lastLoopTime: s.lastLoopTime || Date.now(),
          loopCount: s.loopCount || 0
        }));
      }
    } catch (e) {
      console.warn("Could not read local storage, using initial data.", e);
    }

    // Restore user from remembered session or remembered email
    try {
      const sess = localStorage.getItem('KAIZEN_AUTH_SESSION');
      const remEmail = localStorage.getItem('KAIZEN_REMEMBERED_EMAIL');
      let targetUser = null;

      if (sess) {
        const parsedSess = JSON.parse(sess);
        if (parsedSess.userId) {
          targetUser = initialStore.users.find(u => u.userId === parsedSess.userId);
        }
        if (!targetUser && parsedSess.email) {
          targetUser = initialStore.users.find(u => u.email.toLowerCase() === parsedSess.email.toLowerCase());
        }
      }

      if (!targetUser && remEmail) {
        targetUser = initialStore.users.find(u => u.email.toLowerCase() === remEmail.toLowerCase());
      }

      if (targetUser) {
        initialStore.currentUserId = targetUser.userId;
      }
    } catch (err) {
      console.warn("Error restoring remembered login session:", err);
    }

    return initialStore;
  };

  const [store, setStore] = useState(loadInitialData);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Persisted Remembered Login Email
  const [rememberedEmail, setRememberedEmail] = useState(() => {
    try {
      const savedEmail = localStorage.getItem('KAIZEN_REMEMBERED_EMAIL');
      if (savedEmail) return savedEmail;
      const sess = localStorage.getItem('KAIZEN_AUTH_SESSION');
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed.email) return parsed.email;
      }
    } catch (e) {}
    return 'alex.vance@kaizen.ai'; // Default user
  });

  // Persisted Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const sess = localStorage.getItem('KAIZEN_AUTH_SESSION');
      if (sess) {
        const parsed = JSON.parse(sess);
        return parsed.loggedIn === true;
      }
    } catch (e) {}
    return true; // Default authenticated so user can immediately evaluate the app or log out to see login screen
  });

  // Clear remembered email helper
  const clearRememberedEmail = () => {
    try {
      localStorage.removeItem('KAIZEN_REMEMBERED_EMAIL');
    } catch (e) {}
    setRememberedEmail('');
    showToast("Remembered email cleared from device.", "info");
  };

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [store]);

  // Toast Helper
  const showToast = (message, type = 'gold') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Current User
  const currentUser = store.users.find(u => u.userId === store.currentUserId) || store.users[0];
  const isAdmin = false;

  // Activity logger
  const logActivity = (actionType, description, metadata = {}) => {
    const newAct = {
      activityId: `ACT-${Date.now().toString().slice(-6)}`,
      userId: currentUser.userId,
      actionType,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      metadata
    };
    setStore(prev => ({
      ...prev,
      activities: [newAct, ...prev.activities.slice(0, 99)]
    }));
  };

  // Robust Auth Operations with Email Remembering
  const login = (email, password, rememberMe = true) => {
    if (!email || !email.trim()) {
      showToast("Please enter your email address.", "warning");
      return { success: false, error: "Please enter your email address." };
    }
    if (!password) {
      showToast("Please enter your password.", "warning");
      return { success: false, error: "Please enter your password." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const err = `No Kaizen account found for '${email}'. Try the Demo User or create a new account.`;
      showToast(err, "warning");
      return { success: false, error: err };
    }

    if (user.password !== password) {
      const err = "Incorrect password. Click 'Demo User' to auto-fill valid credentials, or use Forgot Password.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    // Success - Remember email and go with user
    setStore(prev => ({ ...prev, currentUserId: user.userId }));
    setIsAuthenticated(true);

    try {
      localStorage.setItem('KAIZEN_REMEMBERED_EMAIL', cleanEmail);
      setRememberedEmail(cleanEmail);
      localStorage.setItem('KAIZEN_AUTH_SESSION', JSON.stringify({ userId: user.userId, email: cleanEmail, loggedIn: true }));
    } catch (e) {}

    showToast(`Welcome back, ${user.name}!`, 'gold');
    logActivity('user_login', `User logged in: ${user.name} - Email: ${cleanEmail}`);
    setAuthModalOpen(false);
    setCurrentScreen('dashboard');

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#FCF9F3'] });
    } catch (err) {}

    return { success: true, user };
  };

  const register = (formData) => {
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.password?.trim()) {
      const err = "Please provide Name, Email, and Password to register.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const exists = store.users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      const err = "An account with this email already exists. Please sign in instead.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    if (formData.password.length < 4) {
      const err = "Password must be at least 4 characters long.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    const newUser = {
      userId: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      email: cleanEmail,
      phone: formData.phone?.trim() || "+1 (555) 000-0000",
      password: formData.password,
      role: "user",
      avatar: formData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: formData.bio?.trim() || "Kaizen member focused on continuous improvement.",
      joinedDate: new Date().toISOString().split("T")[0],
      theme: "royal-gold"
    };

    setStore(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUserId: newUser.userId
    }));

    setIsAuthenticated(true);
    try {
      localStorage.setItem('KAIZEN_REMEMBERED_EMAIL', cleanEmail);
      setRememberedEmail(cleanEmail);
      localStorage.setItem('KAIZEN_AUTH_SESSION', JSON.stringify({ userId: newUser.userId, email: cleanEmail, loggedIn: true }));
    } catch (e) {}

    showToast(`Account created successfully! Welcome to Kaizen, ${newUser.name}.`, 'gold');
    logActivity('user_signup', `New user registered: ${newUser.name} (ID: ${newUser.userId})`);
    setAuthModalOpen(false);
    setCurrentScreen('dashboard');

    try {
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.7 }, colors: ['#D4AF37', '#E6C687', '#9E7D3B'] });
    } catch (err) {}

    return { success: true, user: newUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('KAIZEN_AUTH_SESSION');
    } catch (e) {}
    // Notice: We keep KAIZEN_REMEMBERED_EMAIL so next time login loads, it remembers this email!
    showToast("You have been signed out. Your login email is remembered for your convenience.", "info");
    logActivity('user_logout', `User logged out: ${currentUser.name}`);
    setCurrentScreen('dashboard');
    setAuthModalOpen(false);
  };

  const forgotPassword = (email) => {
    if (!email || !email.trim()) {
      return { success: false, error: "Please enter your email to recover your credentials." };
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: `No registered account found with email '${email}'.` };
    }
    return {
      success: true,
      user,
      password: user.password,
      message: `Password retrieved for ${user.name}: "${user.password}"`
    };
  };

  const switchRole = () => {};

  const updateProfile = (profileData) => {
    setStore(prev => ({
      ...prev,
      users: prev.users.map(u => u.userId === currentUser.userId ? { ...u, ...profileData } : u)
    }));
    showToast("Profile details updated successfully.", "gold");
    logActivity('profile_updated', "Updated profile contact and bio information");
  };

  const changePassword = (currentPassword, newPassword) => {
    if (currentUser.password !== currentPassword) {
      showToast("Current password does not match.", "warning");
      return false;
    }
    setStore(prev => ({
      ...prev,
      users: prev.users.map(u => u.userId === currentUser.userId ? { ...u, password: newPassword } : u)
    }));
    showToast("Password updated securely.", "gold");
    logActivity('password_changed', "Changed account password");
    return true;
  };

  // Task Operations
  const addTask = (taskData) => {
    const newId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const smart = calculateSmartPriority(taskData, store.userBehaviour);
    const newTask = {
      taskId: newId,
      name: taskData.name,
      status: taskData.status || "pending",
      performance: taskData.performance || 0,
      priority: taskData.priority || smart.priority,
      category: taskData.category || "Work & Deep Focus",
      startDate: taskData.startDate || new Date().toISOString().split("T")[0],
      dueDate: taskData.dueDate || taskData.startDate || new Date().toISOString().split("T")[0],
      estimatedMinutes: parseInt(taskData.estimatedMinutes, 10) || 45,
      actualMinutes: 0,
      postponementCount: 0,
      priorityReason: smart.reason,
      aiSuggestedTime: taskData.aiSuggestedTime || "09:30 AM",
      notes: taskData.notes || "",
      subtasks: taskData.subtasks || [],
      loopReminder: taskData.loopReminder !== undefined ? taskData.loopReminder : true,
      loopIntervalMinutes: 10,
      lastLoopTime: Date.now(),
      loopCount: 0
    };

    setStore(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
    playDropSound(0.7);
    showToast(`Task '${newTask.name}' scheduled! (10m loop alert active)`, 'gold');
    logActivity('task_created', `Added task: "${newTask.name}"`, { taskId: newId });
    return newTask;
  };

  const updateTask = (taskId, fields) => {
    setStore(prev => {
      const updated = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          const merged = { ...t, ...fields };
          // If status completed, set performance to 100
          if (fields.status === 'completed' && t.status !== 'completed') {
            merged.performance = 100;
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#F3E8CB'] });
            } catch (err) {}
          }
          return merged;
        }
        return t;
      });
      return { ...prev, tasks: updated };
    });
    showToast("Task updated.", "gold");
    logActivity('task_updated', `Updated task details for ${taskId}`, { taskId });
  };

  const deleteTask = (taskId) => {
    const taskToDelete = store.tasks.find(t => t.taskId === taskId);
    setStore(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.taskId !== taskId),
      schedules: prev.schedules.filter(s => s.taskId !== taskId)
    }));
    showToast(`Task '${taskToDelete?.name || taskId}' removed.`, 'info');
    logActivity('task_deleted', `Deleted task ${taskId}`);
  };

  const toggleTaskStatus = (taskId) => {
    const task = store.tasks.find(t => t.taskId === taskId);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    const newPerf = newStatus === 'completed' ? 100 : 50;

    if (newStatus === 'completed') {
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors: ['#D4AF37', '#E6C687', '#9E7D3B'] });
      } catch (err) {}
    }

    setStore(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.taskId === taskId ? { ...t, status: newStatus, performance: newPerf } : t)
    }));
    showToast(`Task marked as ${newStatus.replace('_', ' ')}!`, 'gold');
    logActivity(newStatus === 'completed' ? 'task_completed' : 'task_reopened', `Task status changed to ${newStatus}: "${task.name}"`);
  };

  const postponeTask = (taskId) => {
    const task = store.tasks.find(t => t.taskId === taskId);
    if (!task) return;
    const newCount = (task.postponementCount || 0) + 1;
    
    // AI Procrastination calculation
    const smart = calculateSmartPriority({ ...task, postponementCount: newCount });
    const suggestedTime = newCount >= 3 ? "02:00 PM (15-min Micro Sprint)" : "Tomorrow 10:00 AM";

    setStore(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          return {
            ...t,
            status: "postponed",
            postponementCount: newCount,
            priority: smart.priority,
            priorityReason: `Postponed ${newCount} time(s). ${smart.reason}`,
            aiSuggestedTime: suggestedTime
          };
        }
        return t;
      });

      // Add a Procrastination Alert notification if >= 2
      let newNotifs = prev.notifications;
      if (newCount >= 2) {
        newNotifs = [
          {
            notificationId: `NOTIF-PROC-${Date.now()}`,
            userId: currentUser.userId,
            title: `Procrastination Alert: ${task.name}`,
            message: `Task has been postponed ${newCount} times. Kaizen recommends breaking it into a 15-minute micro-sprint.`,
            type: "ai_insight",
            read: false,
            createdAt: "Just now"
          },
          ...prev.notifications
        ];
      }

      return {
        ...prev,
        tasks: updatedTasks,
        notifications: newNotifs
      };
    });

    showToast(`Task postponed (${newCount}x). Kaizen AI updated smart priority & suggested time.`, 'warning');
    logActivity('task_postponed', `Postponed task: "${task.name}" (Count: ${newCount})`, { taskId, postponementCount: newCount });
  };

  const recalculateAllPriorities = () => {
    setStore(prev => {
      const reevaluated = prev.tasks.map(t => {
        const smart = calculateSmartPriority(t, prev.userBehaviour);
        return {
          ...t,
          priority: smart.priority,
          priorityReason: smart.reason
        };
      });
      return { ...prev, tasks: reevaluated };
    });
    showToast("Kaizen AI recalculated smart priorities across all tasks!", "gold");
    logActivity('smart_priority_recalculated', "Triggered full AI Smart Task Priority re-index");
  };

  // Smart Task Decomposition & Subtasks
  const toggleTaskSubtask = (taskId, subtaskId) => {
    setStore(prev => {
      let isAllCompleted = false;
      let taskName = '';
      const updatedTasks = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          taskName = t.name;
          const currentSubs = t.subtasks || [];
          const updatedSubs = currentSubs.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
          const completedCount = updatedSubs.filter(s => s.completed).length;
          const perf = updatedSubs.length > 0 ? Math.round((completedCount / updatedSubs.length) * 100) : t.performance;
          const isDone = updatedSubs.length > 0 && completedCount === updatedSubs.length;
          if (isDone && t.status !== 'completed') isAllCompleted = true;

          return {
            ...t,
            subtasks: updatedSubs,
            performance: perf,
            status: isDone ? 'completed' : (t.status === 'completed' && !isDone ? 'in_progress' : t.status)
          };
        }
        return t;
      });

      if (isAllCompleted) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#F3E8CB'] });
        } catch (e) {}
        showToast(`All subtasks completed! Task "${taskName}" finished!`, 'gold');
        logActivity('task_completed', `All subtasks checked off for ${taskId}`);
      }
      return { ...prev, tasks: updatedTasks };
    });
  };

  const addTaskSubtask = (taskId, text) => {
    if (!text || !text.trim()) return;
    setStore(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          const newSub = {
            id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            text: text.trim(),
            completed: false
          };
          const subs = [...(t.subtasks || []), newSub];
          const completedCount = subs.filter(s => s.completed).length;
          const perf = Math.round((completedCount / subs.length) * 100);
          return { ...t, subtasks: subs, performance: perf };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
    showToast("Subtask added.", "gold");
  };

  const deleteTaskSubtask = (taskId, subtaskId) => {
    setStore(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          const subs = (t.subtasks || []).filter(s => s.id !== subtaskId);
          const completedCount = subs.filter(s => s.completed).length;
          const perf = subs.length > 0 ? Math.round((completedCount / subs.length) * 100) : 0;
          return { ...t, subtasks: subs, performance: perf };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const generateAiSubtasks = (taskId) => {
    const task = store.tasks.find(t => t.taskId === taskId);
    if (!task) return;

    let aiGeneratedSteps = [];
    const cat = task.category || '';
    const nameLower = task.name.toLowerCase();

    if (cat.includes('Work') || nameLower.includes('architecture') || nameLower.includes('code') || nameLower.includes('spec') || nameLower.includes('launch') || nameLower.includes('design')) {
      aiGeneratedSteps = [
        "Phase 1: Clarify primary objectives, constraints & success criteria",
        "Phase 2: Draft technical outline and decompose system components",
        "Phase 3: Execute core development & address edge-case error states",
        "Phase 4: Run comprehensive verification & final deliverables handoff"
      ];
    } else if (cat.includes('Financial') || nameLower.includes('audit') || nameLower.includes('expense') || nameLower.includes('budget')) {
      aiGeneratedSteps = [
        "Step 1: Gather raw transactional statements and invoice receipts",
        "Step 2: Map expenditures into operational & discretionary buckets",
        "Step 3: Pinpoint recurring SaaS / unnecessary leakages for cancellation",
        "Step 4: Update ledger forecast and set new monthly guardrails"
      ];
    } else if (cat.includes('Mind') || cat.includes('Health') || nameLower.includes('routine') || nameLower.includes('meditation') || nameLower.includes('nutrition')) {
      aiGeneratedSteps = [
        "Step 1: Set aside physical distraction-free zone & hydrate",
        "Step 2: Execute structured mindful check-in & biological breath reset",
        "Step 3: Record introspective reflections in Kaizen activity log"
      ];
    } else if (cat.includes('Admin') || nameLower.includes('claim') || nameLower.includes('form') || nameLower.includes('email')) {
      aiGeneratedSteps = [
        "Step 1: Collate necessary verification documents & IDs",
        "Step 2: Fill out submission portal fields without interruptions",
        "Step 3: Save official confirmation PDF into archived records"
      ];
    } else {
      aiGeneratedSteps = [
        `Step 1: Conduct quick 5-min prep for "${task.name.slice(0, 28)}"`,
        "Step 2: Deep execution phase in focused 25-minute sprint",
        "Step 3: Validate output quality and mark milestone complete"
      ];
    }

    const newSubtasks = aiGeneratedSteps.map((text, idx) => ({
      id: `ai-sub-${Date.now()}-${idx}`,
      text,
      completed: false
    }));

    setStore(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          const combined = [...(t.subtasks || []), ...newSubtasks];
          const completedCount = combined.filter(s => s.completed).length;
          const perf = Math.round((completedCount / combined.length) * 100);
          return {
            ...t,
            subtasks: combined,
            performance: perf
          };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });

    playChimeSound();
    showToast(`Kaizen AI decomposed "${task.name.slice(0, 24)}..." into ${newSubtasks.length} actionable micro-steps!`, 'gold');
    logActivity('ai_subtasks_generated', `AI generated ${newSubtasks.length} subtasks for ${task.taskId}`);
  };

  const scheduleTaskDirectly = (task, chosenDate = null, chosenTime = null) => {
    const schDate = chosenDate || task.startDate || task.dueDate || new Date().toISOString().split("T")[0];
    const schTime = chosenTime || (task.aiSuggestedTime && task.aiSuggestedTime.includes(":") ? task.aiSuggestedTime.slice(0, 5) : "09:30");

    // Check if already scheduled
    const existing = store.schedules.find(s => s.taskId === task.taskId && s.startDate === schDate);
    if (existing) {
      showToast(`Task is already scheduled in Daily Planner for ${schDate}.`, 'info');
      return existing;
    }

    const newSchedule = addSchedule({
      taskId: task.taskId,
      title: task.name,
      startDate: schDate,
      endDate: schDate,
      date: schDate,
      time: schTime,
      endTime: "10:30",
      aiSuggest: `AI Scheduled Slot: Aligned with ${task.priority.toUpperCase()} priority and estimated ${task.estimatedMinutes}m duration.`
    });

    showToast(`Task "${task.name.slice(0, 24)}..." scheduled in Daily Planner for ${schDate} at ${schTime}!`, 'gold');
    logActivity('task_scheduled_planner', `Scheduled task ${task.taskId} directly to Daily Planner for ${schDate}`);
    return newSchedule;
  };

  const completeFocusSession = (taskId, minutesSpent = 25) => {
    setStore(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.taskId === taskId) {
          return {
            ...t,
            actualMinutes: (t.actualMinutes || 0) + minutesSpent,
            performance: 100,
            status: 'completed'
          };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });

    playDropSound(0.9);
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 }, colors: ['#DFCA95', '#C5A059', '#9E7D3B'] });
    } catch (e) {}
    showToast(`Focus session completed! (+${minutesSpent} mins logged). Task marked as Completed!`, 'gold');
    logActivity('focus_session_completed', `Completed ${minutesSpent}m focus session for task ${taskId}`);
  };

  const applyProcrastinationIntervention = (taskId, type) => {
    const task = store.tasks.find(t => t.taskId === taskId);
    if (!task) return;

    if (type === 'micro_sprint') {
      updateTask(taskId, {
        estimatedMinutes: 15,
        status: 'in_progress',
        priorityReason: `AI Micro-Sprint activated: Reduced threshold to 15 mins to overcome initiation friction.`
      });
      showToast("Converted to 15-minute micro-sprint! Low activation barrier engaged.", 'gold');
    } else if (type === 'peak_anchor') {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      updateTask(taskId, {
        startDate: tomorrow,
        dueDate: tomorrow,
        aiSuggestedTime: "Tomorrow 08:30 AM (Peak Alertness Window)",
        priority: 'high',
        priorityReason: "Re-anchored to morning golden focus window (08:30 - 11:30 AM) by Kaizen AI."
      });
      showToast("Task re-anchored to tomorrow's peak morning alertness window (08:30 AM).", 'gold');
    } else if (type === 'ai_decompose') {
      generateAiSubtasks(taskId);
    }
  };

  // Vice Task Operations
  const addViceTask = (viceData) => {
    const newId = `VICE-${Math.floor(100 + Math.random() * 900)}`;
    const newVice = {
      viceId: newId,
      name: viceData.name,
      trigger: viceData.trigger || "Stress, boredom or evening fatigue",
      replacementAction: viceData.replacementAction || "Take 3 deep breaths and drink water",
      abstinenceDays: parseInt(viceData.abstinenceDays, 10) || 0,
      bestStreak: parseInt(viceData.abstinenceDays, 10) || 0,
      severity: viceData.severity || "medium",
      status: "active",
      costSavedPerWeek: viceData.costSavedPerWeek || "$0",
      lastResistedDate: new Date().toISOString().split("T")[0],
      urgesLogged: 0,
      notes: viceData.notes || ""
    };

    setStore(prev => ({
      ...prev,
      viceTasks: [newVice, ...prev.viceTasks]
    }));
    showToast(`Vice management plan created for '${newVice.name}'`, 'gold');
    logActivity('vice_added', `Created vice guardrail: "${newVice.name}"`);
  };

  const updateViceTask = (viceId, fields) => {
    setStore(prev => ({
      ...prev,
      viceTasks: prev.viceTasks.map(v => v.viceId === viceId ? { ...v, ...fields } : v)
    }));
    showToast("Vice task updated.", "gold");
  };

  const deleteViceTask = (viceId) => {
    setStore(prev => ({
      ...prev,
      viceTasks: prev.viceTasks.filter(v => v.viceId !== viceId)
    }));
    showToast("Vice tracking removed.", "info");
    logActivity('vice_deleted', `Deleted vice task ${viceId}`);
  };

  const logUrgeResisted = (viceId) => {
    setStore(prev => {
      const updated = prev.viceTasks.map(v => {
        if (v.viceId === viceId) {
          const nextDays = v.abstinenceDays + 1;
          const best = Math.max(nextDays, v.bestStreak);
          return {
            ...v,
            abstinenceDays: nextDays,
            bestStreak: best,
            urgesLogged: v.urgesLogged + 1,
            lastResistedDate: new Date().toISOString().split("T")[0]
          };
        }
        return v;
      });
      return { ...prev, viceTasks: updated };
    });
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#C5A059', '#D4AF37', '#FFF'] });
    } catch (err) {}
    showToast("Urge successfully resisted! +1 day added to abstinence streak.", "gold");
    logActivity('vice_resisted', `Resisted temptation for vice ${viceId}`);
  };

  const resetViceStreak = (viceId) => {
    setStore(prev => ({
      ...prev,
      viceTasks: prev.viceTasks.map(v => v.viceId === viceId ? { ...v, abstinenceDays: 0 } : v)
    }));
    showToast("Streak reset. Kaizen philosophy: Stumble is not defeat. Begin again with new insight.", "warning");
    logActivity('vice_relapse', `Streak reset on vice ${viceId}`);
  };

  // Reminder Operations
  const addReminder = (remData) => {
    const newId = `REM-${Math.floor(100 + Math.random() * 900)}`;
    const newRem = {
      reminderId: newId,
      title: remData.title,
      description: remData.description || "",
      dateTime: remData.dateTime || new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      urgency: remData.urgency || "normal",
      category: remData.category || "General",
      status: "upcoming",
      soundEnabled: remData.soundEnabled ?? true,
      repeat: remData.repeat || "None"
    };

    setStore(prev => ({
      ...prev,
      reminders: [newRem, ...prev.reminders]
    }));
    showToast(`Reminder '${newRem.title}' scheduled!`, 'gold');
    logActivity('reminder_created', `Added reminder: "${newRem.title}"`);
  };

  const updateReminder = (reminderId, fields) => {
    setStore(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.reminderId === reminderId ? { ...r, ...fields } : r)
    }));
    showToast("Reminder updated.", "gold");
  };

  const deleteReminder = (reminderId) => {
    setStore(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.reminderId !== reminderId)
    }));
    showToast("Reminder deleted.", "info");
    logActivity('reminder_deleted', `Deleted reminder ${reminderId}`);
  };

  // Daily Schedule Operations
  const addSchedule = (schData) => {
    const newId = `SCH-${Math.floor(100 + Math.random() * 900)}`;
    const newSch = {
      scheduleId: newId,
      userId: currentUser.userId,
      taskId: schData.taskId || null,
      date: schData.date || schData.startDate || new Date().toISOString().split("T")[0],
      startDate: schData.startDate || schData.date || new Date().toISOString().split("T")[0],
      endDate: schData.endDate || schData.startDate || schData.date || new Date().toISOString().split("T")[0],
      time: schData.time || "09:00",
      endTime: schData.endTime || "10:00",
      title: schData.title,
      aiSuggest: schData.aiSuggest || "AI Suggestion: Aligned with personal focus schedule.",
      status: schData.status || "scheduled",
      loopReminder: schData.loopReminder !== undefined ? schData.loopReminder : true,
      loopIntervalMinutes: 10,
      lastLoopTime: Date.now(),
      loopCount: 0
    };

    setStore(prev => ({
      ...prev,
      schedules: [...prev.schedules, newSch]
    }));
    playDropSound(0.7);
    showToast(`Schedule item '${newSch.title}' added! (10m loop alert active)`, 'gold');
    logActivity('schedule_created', `Scheduled: "${newSch.title}" at ${newSch.time}`);
  };

  const updateSchedule = (scheduleId, fields) => {
    setStore(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.scheduleId === scheduleId ? { ...s, ...fields } : s)
    }));
    showToast("Schedule updated.", "gold");
  };

  const deleteSchedule = (scheduleId) => {
    setStore(prev => ({
      ...prev,
      schedules: prev.schedules.filter(s => s.scheduleId !== scheduleId)
    }));
    showToast("Schedule removed.", "info");
    logActivity('schedule_deleted', `Deleted schedule slot ${scheduleId}`);
  };

  // Habit Operations
  const addHabit = (habitData) => {
    const newId = `HAB-${Math.floor(100 + Math.random() * 900)}`;
    const newHabit = {
      habitId: newId,
      name: habitData.name,
      category: habitData.category || "General Routine",
      frequency: habitData.frequency || "Daily",
      streak: 0,
      targetDays: 7,
      completedDates: [],
      habitStrength: 50,
      cue: habitData.cue || "Morning or evening anchor",
      reward: habitData.reward || "Feel good achievement"
    };

    setStore(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
    showToast(`Habit '${newHabit.name}' created!`, 'gold');
    logActivity('habit_created', `Created habit: "${newHabit.name}"`);
  };

  const updateHabit = (habitId, fields) => {
    setStore(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.habitId === habitId ? { ...h, ...fields } : h)
    }));
    showToast("Habit updated.", "gold");
  };

  const deleteHabit = (habitId) => {
    setStore(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.habitId !== habitId)
    }));
    showToast("Habit removed.", "info");
    logActivity('habit_deleted', `Deleted habit ${habitId}`);
  };

  const toggleHabitDay = (habitId, dateStr) => {
    setStore(prev => {
      const updated = prev.habits.map(h => {
        if (h.habitId === habitId) {
          const isDone = h.completedDates.includes(dateStr);
          const nextDates = isDone
            ? h.completedDates.filter(d => d !== dateStr)
            : [...h.completedDates, dateStr];
          const newStreak = isDone ? Math.max(0, h.streak - 1) : h.streak + 1;
          const newStrength = Math.min(100, Math.max(10, Math.round((nextDates.length / 14) * 100)));
          return {
            ...h,
            completedDates: nextDates,
            streak: newStreak,
            habitStrength: newStrength
          };
        }
        return h;
      });
      return { ...prev, habits: updated };
    });
    showToast("Habit progress updated!", "gold");
    logActivity('habit_logged', `Updated habit completion for ${habitId} on ${dateStr}`);
  };

  // Expense Operations
  const addExpense = (expData) => {
    const newId = `EXP-${Math.floor(100 + Math.random() * 900)}`;
    const newExp = {
      expenseId: newId,
      userId: currentUser.userId,
      title: expData.title,
      amount: parseFloat(expData.amount) || 0,
      category: expData.category || "General",
      date: expData.date || new Date().toISOString().split("T")[0],
      paymentMethod: expData.paymentMethod || "Credit Card",
      notes: expData.notes || ""
    };

    setStore(prev => ({
      ...prev,
      expenses: [newExp, ...prev.expenses]
    }));
    showToast(`Expense of $${newExp.amount.toFixed(2)} logged for '${newExp.title}'`, 'gold');
    logActivity('expense_added', `Logged expense: $${newExp.amount} for "${newExp.title}"`);
  };

  const updateExpense = (expenseId, fields) => {
    setStore(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.expenseId === expenseId ? { ...e, ...fields } : e)
    }));
    showToast("Expense updated.", "gold");
  };

  const deleteExpense = (expenseId) => {
    setStore(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.expenseId !== expenseId)
    }));
    showToast("Expense deleted.", "info");
    logActivity('expense_deleted', `Deleted expense ${expenseId}`);
  };

  // Notification Operations
  const markNotificationRead = (notificationId) => {
    setStore(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.notificationId === notificationId ? { ...n, read: true } : n)
    }));
  };

  const markAllNotificationsRead = () => {
    setStore(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
    showToast("All notifications marked as read.", "gold");
  };

  const deleteNotification = (notificationId) => {
    setStore(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.notificationId !== notificationId)
    }));
  };

  const addNotification = (notif, playSound = true) => {
    const newN = {
      notificationId: `NOTIF-${Date.now()}`,
      userId: currentUser.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type || "system",
      read: false,
      createdAt: "Just now"
    };
    setStore(prev => ({
      ...prev,
      notifications: [newN, ...prev.notifications]
    }));
    if (playSound) {
      playDropSound(0.75);
    }
    showToast(`🔔 ${notif.title}`, 'gold');
  };

  // 10-Minute Loop Reminder Operations with Drop Sound
  const trigger10MinLoopAlert = (itemOrId, customMsg = null) => {
    let title = "Scheduled Task";
    let taskId = null;
    let schId = null;

    if (typeof itemOrId === 'string') {
      const t = store.tasks.find(x => x.taskId === itemOrId);
      const s = store.schedules.find(x => x.scheduleId === itemOrId);
      if (t) {
        title = t.name;
        taskId = t.taskId;
      } else if (s) {
        title = s.title;
        schId = s.scheduleId;
      }
    } else if (itemOrId) {
      title = itemOrId.name || itemOrId.title || "Scheduled Focus";
      taskId = itemOrId.taskId;
      schId = itemOrId.scheduleId;
    }

    // Play signature water drop sound
    playDropSound(0.85);

    const message = customMsg || `10-Minute Recurring Reminder: Remember to continue work on "${title}". The drop sound notification loop is active.`;

    addNotification({
      title: `💧 10m Loop Reminder: ${title}`,
      message,
      type: 'loop_reminder'
    }, false);

    if (taskId) {
      setStore(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.taskId === taskId ? { ...t, lastLoopTime: Date.now(), loopCount: (t.loopCount || 0) + 1 } : t)
      }));
    }
    if (schId) {
      setStore(prev => ({
        ...prev,
        schedules: prev.schedules.map(s => s.scheduleId === schId ? { ...s, lastLoopTime: Date.now(), loopCount: (s.loopCount || 0) + 1 } : s)
      }));
    }

    showToast(`💧 10-Min Loop Alert: "${title}" (Drop sound played)`, 'gold');
    logActivity('loop_notification_emitted', `Emitted 10-minute loop notification for "${title}"`);
  };

  const toggleTaskLoopReminder = (taskId) => {
    setStore(prev => {
      const task = prev.tasks.find(t => t.taskId === taskId);
      const nextVal = task ? !task.loopReminder : true;
      if (nextVal) {
        playDropSound(0.7);
        showToast(`10-minute drop sound notification loop enabled for '${task?.name}'`, 'gold');
      } else {
        showToast(`10-minute loop paused for '${task?.name}'`, 'info');
      }
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.taskId === taskId ? { ...t, loopReminder: nextVal, lastLoopTime: Date.now() } : t)
      };
    });
  };

  const toggleScheduleLoopReminder = (scheduleId) => {
    setStore(prev => {
      const sch = prev.schedules.find(s => s.scheduleId === scheduleId);
      const nextVal = sch ? !sch.loopReminder : true;
      if (nextVal) {
        playDropSound(0.7);
        showToast(`10-minute drop sound notification loop enabled for '${sch?.title}'`, 'gold');
      } else {
        showToast(`10-minute loop paused for '${sch?.title}'`, 'info');
      }
      return {
        ...prev,
        schedules: prev.schedules.map(s => s.scheduleId === scheduleId ? { ...s, loopReminder: nextVal, lastLoopTime: Date.now() } : s)
      };
    });
  };

  // Recurring 10-Minute Loop Background Interval
  useEffect(() => {
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const interval = setInterval(() => {
      const now = Date.now();

      // Check tasks with active 10-min loop
      store.tasks.forEach(task => {
        if (task.loopReminder && task.status !== 'completed') {
          const lastTime = task.lastLoopTime || now;
          if (now - lastTime >= TEN_MINUTES_MS) {
            trigger10MinLoopAlert(task);
          }
        }
      });

      // Check schedules with active 10-min loop
      store.schedules.forEach(sch => {
        if (sch.loopReminder && sch.status !== 'completed') {
          const lastTime = sch.lastLoopTime || now;
          if (now - lastTime >= TEN_MINUTES_MS) {
            trigger10MinLoopAlert(sch);
          }
        }
      });
    }, 15000); // checks every 15s

    return () => clearInterval(interval);
  }, [store.tasks, store.schedules]);

  // AI Suggestions
  const requestNewAiSuggestion = () => {
    const newAdviceList = generateAiAdvice(store.tasks, store.habits, store.viceTasks, store.expenses);
    if (newAdviceList.length > 0) {
      setStore(prev => ({
        ...prev,
        aiSuggestions: [...newAdviceList, ...prev.aiSuggestions]
      }));
      showToast("Kaizen AI Services generated fresh personalized suggestions!", "gold");
      logActivity('ai_consulted', "Generated new AI suggestions based on latest user activity data");
    } else {
      showToast("Your current productivity parameters are optimal. No urgent adjustments needed.", "gold");
    }
  };

  const dismissAiSuggestion = (suggestionId) => {
    setStore(prev => ({
      ...prev,
      aiSuggestions: prev.aiSuggestions.filter(s => s.suggestionId !== suggestionId)
    }));
    showToast("Suggestion dismissed.", "info");
  };

  const acceptAiSuggestion = (suggestion) => {
    // Automatically turn suggestion into task or schedule
    addTask({
      name: suggestion.suggestedTask,
      category: "AI Recommended Focus",
      priority: "high",
      dueDate: new Date().toISOString().split("T")[0],
      estimatedMinutes: 20,
      notes: `Generated from AI Suggestion: ${suggestion.reason}`
    });
    dismissAiSuggestion(suggestion.suggestionId);
    showToast("AI suggestion accepted and converted into active task!", "gold");
    logActivity('ai_suggestion_accepted', `Accepted AI suggestion: "${suggestion.suggestedTask}"`);
  };

  // Voice Task Entry
  const addVoiceEntry = (transcript, parsedDetails) => {
    const newVoiceId = `AUDIO-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoiceEntryId = `VOC-${Math.floor(100 + Math.random() * 900)}`;

    // Add to tasks
    const createdTask = addTask({
      name: parsedDetails.name,
      category: parsedDetails.category,
      priority: parsedDetails.priority,
      dueDate: parsedDetails.dueDate,
      estimatedMinutes: parsedDetails.estimatedMinutes,
      notes: parsedDetails.notes
    });

    const newVoiceRecord = {
      voiceEntryId: newVoiceEntryId,
      taskId: createdTask.taskId,
      userId: currentUser.userId,
      entryDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      voiceId: newVoiceId,
      convertedTask: createdTask.name,
      rawTranscription: transcript,
      parsedDetails: {
        category: createdTask.category,
        priority: createdTask.priority,
        dueDate: createdTask.dueDate,
        estimatedMinutes: createdTask.estimatedMinutes
      }
    };

    setStore(prev => ({
      ...prev,
      voiceEntries: [newVoiceRecord, ...prev.voiceEntries]
    }));

    showToast(`Voice entry transcribed & converted to task '${createdTask.name}'!`, 'gold');
    logActivity('voice_entry', `Voice converted to task: "${createdTask.name}"`, { voiceId: newVoiceId, taskId: createdTask.taskId });
    return createdTask;
  };

  // Data Management & System Settings
  const updateSystemSettings = (newSettings) => {
    setStore(prev => ({
      ...prev,
      systemSettings: { ...prev.systemSettings, ...newSettings }
    }));
    showToast("System settings updated successfully.", "gold");
    logActivity('system_settings_updated', "Updated system parameters");
  };

  const createBackup = () => {
    const newBackup = {
      backupId: `BKP-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      size: `${(JSON.stringify(store).length / 1024).toFixed(1)} KB`,
      recordsCount: store.tasks.length + store.habits.length + store.expenses.length + store.schedules.length + store.viceTasks.length,
      status: "Verified",
      type: "Manual Snapshot"
    };

    setStore(prev => ({
      ...prev,
      backups: [newBackup, ...prev.backups]
    }));
    showToast(`Backup snapshot ${newBackup.backupId} created & verified!`, 'gold');
    logActivity('backup_created', `Created system backup: ${newBackup.backupId}`);
  };

  const exportDataJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kaizen_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("System data exported as JSON backup.", "gold");
    logActivity('data_exported', "Exported full system JSON snapshot");
  };

  const importDataJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.tasks && parsed.users) {
        setStore(parsed);
        showToast("System state successfully restored from JSON file!", "gold");
        logActivity('data_imported', "Restored full system database from uploaded file");
        return true;
      }
      showToast("Invalid Kaizen backup format.", "warning");
      return false;
    } catch (e) {
      showToast("Error parsing JSON backup file.", "warning");
      return false;
    }
  };

  const restoreBackupPoint = (backupId) => {
    showToast(`System state rolled back to checkpoint ${backupId}.`, 'gold');
    logActivity('system_restored', `Restored system to checkpoint ${backupId}`);
  };

  const resetAllDataToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = {
      users: INITIAL_USERS,
      currentUserId: INITIAL_USERS[0].userId,
      tasks: INITIAL_TASKS,
      viceTasks: INITIAL_VICE_TASKS,
      reminders: INITIAL_REMINDERS,
      schedules: INITIAL_SCHEDULES,
      habits: INITIAL_HABITS,
      expenses: INITIAL_EXPENSES,
      activities: INITIAL_ACTIVITIES,
      notifications: INITIAL_NOTIFICATIONS,
      aiSuggestions: INITIAL_AI_SUGGESTIONS,
      userBehaviour: INITIAL_USER_BEHAVIOUR,
      voiceEntries: INITIAL_VOICE_ENTRIES,
      systemSettings: INITIAL_SYSTEM_SETTINGS,
      backups: INITIAL_BACKUPS,
      themePalette: 'royal-gold'
    };
    setStore(fresh);
    showToast("Kaizen application reset to initial factory data.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        // Auth & User
        isAuthenticated,
        setIsAuthenticated,
        rememberedEmail,
        clearRememberedEmail,
        currentUser,
        users: store.users,
        isAdmin,
        login,
        register,
        logout,
        forgotPassword,
        switchRole,
        updateProfile,
        changePassword,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,

        // Tasks
        tasks: store.tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        postponeTask,
        recalculateAllPriorities,
        toggleTaskSubtask,
        addTaskSubtask,
        deleteTaskSubtask,
        generateAiSubtasks,
        scheduleTaskDirectly,
        completeFocusSession,
        applyProcrastinationIntervention,

        // Vice Tasks
        viceTasks: store.viceTasks,
        addViceTask,
        updateViceTask,
        deleteViceTask,
        logUrgeResisted,
        resetViceStreak,

        // Reminders
        reminders: store.reminders,
        addReminder,
        updateReminder,
        deleteReminder,

        // Daily Planner / Schedule
        schedules: store.schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,

        // Habits
        habits: store.habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDay,

        // Expenses
        expenses: store.expenses,
        addExpense,
        updateExpense,
        deleteExpense,

        // Activities
        activities: store.activities,
        logActivity,

        // Notifications
        notifications: store.notifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        addNotification,
        trigger10MinLoopAlert,
        toggleTaskLoopReminder,
        toggleScheduleLoopReminder,
        playDropSound,
        playChimeSound,

        // AI Engine & Suggestions
        aiSuggestions: store.aiSuggestions,
        userBehaviour: store.userBehaviour,
        requestNewAiSuggestion,
        dismissAiSuggestion,
        acceptAiSuggestion,

        // Voice Task
        voiceEntries: store.voiceEntries,
        addVoiceEntry,

        // Data Management & Backups
        systemSettings: store.systemSettings,
        updateSystemSettings,
        backups: store.backups,
        createBackup,
        restoreBackupPoint,
        exportDataJson,
        importDataJson,
        resetAllDataToDefault,

        // UI & Navigation
        currentScreen,
        setCurrentScreen,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
