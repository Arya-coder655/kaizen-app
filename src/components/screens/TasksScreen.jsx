import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  TrendingUp,
  Brain,
  X,
  ArrowRight,
  CalendarRange,
  RotateCcw,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  Repeat,
  Droplets,
  Play,
  Pause,
  Kanban,
  ArrowUpRight,
  ShieldAlert,
  Award,
  Compass,
  ArrowUpDown,
  Target,
  Flame,
  CheckCheck
} from 'lucide-react';
import {
  getTodayStr,
  addDays,
  formatDateDisplay,
  formatDateShort,
  getDaysDifference,
  getRelativeDateLabel,
  isTaskInRange
} from '../../utils/dateUtils';

export default function TasksScreen() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    postponeTask,
    recalculateAllPriorities,
    trigger10MinLoopAlert,
    toggleTaskLoopReminder,
    playDropSound,
    playChimeSound,
    showToast,
    toggleTaskSubtask,
    addTaskSubtask,
    deleteTaskSubtask,
    generateAiSubtasks,
    scheduleTaskDirectly,
    completeFocusSession,
    applyProcrastinationIntervention
  } = useApp();

  const today = getTodayStr();

  // Search & Basic Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority_desc'); // 'priority_desc' | 'due_asc' | 'due_desc' | 'perf_asc' | 'perf_desc' | 'delay_desc'

  // Date Range Filter States ("From Date -> To Date")
  const [dateRangePreset, setDateRangePreset] = useState('all'); // 'all' | 'today' | 'this_week' | 'next_14_days' | 'this_month' | 'overdue' | 'custom'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // View Mode: 'organized' (Timeline Brackets), 'kanban' (Kanban Board), 'matrix' (Eisenhower Matrix), 'list' (Data Table)
  const [viewMode, setViewMode] = useState('organized');

  // Subtask UI state
  const [expandedSubtasks, setExpandedSubtasks] = useState({});
  const [subtaskInputs, setSubtaskInputs] = useState({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [procrastinationTask, setProcrastinationTask] = useState(null);

  // Live Focus Flow Session (Pomodoro / Focus timer)
  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusInitialMinutes, setFocusInitialMinutes] = useState(25);
  const timerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Work & Deep Focus',
    priority: 'medium',
    startDate: today,
    dueDate: addDays(today, 2),
    estimatedMinutes: 45,
    notes: '',
    performance: 0,
    status: 'pending',
    loopReminder: true,
    loopIntervalMinutes: 10,
    subtasks: []
  });

  // Handle Preset Date Change
  const handleSelectDatePreset = (preset) => {
    setDateRangePreset(preset);
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'today') {
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'this_week') {
      setFromDate(today);
      setToDate(addDays(today, 6));
    } else if (preset === 'next_14_days') {
      setFromDate(today);
      setToDate(addDays(today, 13));
    } else if (preset === 'this_month') {
      setFromDate(today);
      setToDate(addDays(today, 29));
    } else if (preset === 'overdue') {
      setFromDate('');
      setToDate(addDays(today, -1));
    } else if (preset === 'custom') {
      if (!fromDate) setFromDate(today);
      if (!toDate) setToDate(addDays(today, 7));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setSortBy('priority_desc');
    setDateRangePreset('all');
    setFromDate('');
    setToDate('');
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Work & Deep Focus',
      priority: 'medium',
      startDate: today,
      dueDate: addDays(today, 2),
      estimatedMinutes: 45,
      notes: '',
      performance: 0,
      status: 'pending',
      loopReminder: true,
      loopIntervalMinutes: 10,
      subtasks: []
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    addTask(formData);
    setIsCreateModalOpen(false);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      category: task.category,
      priority: task.priority,
      startDate: task.startDate || task.dueDate || today,
      dueDate: task.dueDate || today,
      estimatedMinutes: task.estimatedMinutes,
      performance: task.performance || 0,
      status: task.status,
      notes: task.notes || '',
      loopReminder: task.loopReminder !== false,
      loopIntervalMinutes: task.loopIntervalMinutes || 10,
      subtasks: task.subtasks || []
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.taskId, formData);
      setEditingTask(null);
    }
  };

  const handleQuickAddDays = (days) => {
    const start = formData.startDate || today;
    setFormData(prev => ({
      ...prev,
      dueDate: addDays(start, days)
    }));
  };

  // Subtask helper methods
  const toggleSubtasksExpanded = (taskId) => {
    setExpandedSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleAddInlineSubtask = (taskId) => {
    const text = subtaskInputs[taskId];
    if (text && text.trim()) {
      addTaskSubtask(taskId, text.trim());
      setSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
      setExpandedSubtasks(prev => ({ ...prev, [taskId]: true }));
    }
  };

  // Live Focus Flow Timer Logic
  const startFocusFlow = (task) => {
    const mins = task.estimatedMinutes || 25;
    setActiveFocusTask(task);
    setFocusInitialMinutes(mins);
    setFocusTimeLeft(mins * 60);
    setIsFocusRunning(true);
    playChimeSound();
    showToast(`Focus session started for "${task.name}". Deep work in session.`, 'gold');
  };

  useEffect(() => {
    if (isFocusRunning && activeFocusTask) {
      timerRef.current = setInterval(() => {
        setFocusTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsFocusRunning(false);
            completeFocusSession(activeFocusTask.taskId, focusInitialMinutes);
            setActiveFocusTask(null);
            return 0;
          }

          // 10-Minute recurring drop sound notification check
          const elapsed = focusInitialMinutes * 60 - (prev - 1);
          if (elapsed > 0 && elapsed % 600 === 0 && activeFocusTask.loopReminder !== false) {
            playDropSound();
            showToast(`10-Minute Focus Check-in: You have been in flow for ${Math.round(elapsed / 60)} minutes. Stay anchored.`, 'gold');
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isFocusRunning, activeFocusTask, focusInitialMinutes]);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    // Search
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskId.toLowerCase().includes(searchQuery.toLowerCase());

    // Status & Priority & Category
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    // Date Range Match
    let matchesDate = true;
    if (dateRangePreset === 'overdue') {
      matchesDate = t.dueDate < today && t.status !== 'completed';
    } else if (fromDate || toDate) {
      matchesDate = isTaskInRange(t, fromDate, toDate);
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDate;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority_desc') {
      const pWeights = { high: 3, medium: 2, low: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (sortBy === 'due_asc') return (a.dueDate || '').localeCompare(b.dueDate || '');
    if (sortBy === 'due_desc') return (b.dueDate || '').localeCompare(a.dueDate || '');
    if (sortBy === 'perf_desc') return (b.performance || 0) - (a.performance || 0);
    if (sortBy === 'perf_asc') return (a.performance || 0) - (b.performance || 0);
    if (sortBy === 'delay_desc') return (b.postponementCount || 0) - (a.postponementCount || 0);
    return 0;
  });

  // Timeline brackets for organized view
  const overdueTasks = sortedTasks.filter(t => t.dueDate < today && t.status !== 'completed');
  const todayTasks = sortedTasks.filter(t => t.dueDate === today && t.status !== 'completed');
  const thisWeekTasks = sortedTasks.filter(t => t.dueDate > today && t.dueDate <= addDays(today, 6) && t.status !== 'completed');
  const futureTasks = sortedTasks.filter(t => t.dueDate > addDays(today, 6) && t.status !== 'completed');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  // Overall Performance Calculation
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.dueDate < today && t.status !== 'completed').length;
  const averagePerformance = tasks.length > 0
    ? Math.round(tasks.reduce((acc, t) => acc + (t.performance || 0), 0) / tasks.length)
    : 0;
  const totalEstimatedMins = filteredTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  // Helper renderer for individual task cards
  const renderTaskCard = (task, isOverdueAlert = false) => {
    const isCompleted = task.status === 'completed';
    const isPostponed = task.status === 'postponed';
    const taskStart = task.startDate || task.dueDate || today;
    const taskDue = task.dueDate || today;
    const spanDays = Math.max(1, getDaysDifference(taskStart, taskDue) + 1);
    const daysRemaining = getDaysDifference(today, taskDue);
    const isOverdue = taskDue < today && !isCompleted;
    const subtasks = task.subtasks || [];
    const completedSubs = subtasks.filter(s => s.completed).length;
    const isSubtasksOpen = !!expandedSubtasks[task.taskId];

    return (
      <div
        key={task.taskId}
        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 ${
          isCompleted
            ? 'bg-stone-50/70 border-stone-200 opacity-60'
            : isOverdueAlert || isOverdue
            ? 'bg-red-50/40 border-red-200 shadow-xs'
            : isPostponed
            ? 'bg-amber-50/30 border-amber-200'
            : 'bg-white border-[#DFCA95]/60 hover:border-[#DFCA95] shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Left Details */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Checkbox */}
            <button
              onClick={() => toggleTaskStatus(task.taskId)}
              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 mt-1 cursor-pointer ${
                isCompleted
                  ? 'bg-[#C5A059] border-[#9E7D3B] text-white shadow-2xs'
                  : 'border-stone-300 hover:border-[#C5A059] bg-[#FCF9F3]'
              }`}
              title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <div className="space-y-2 flex-1 min-w-0">
              {/* Top Row Badges */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-[#9E7D3B] bg-[#F5EFEB] px-1.5 py-0.5 rounded font-semibold">
                  {task.taskId}
                </span>

                <h3
                  className={`text-sm sm:text-base font-bold truncate max-w-sm sm:max-w-md ${
                    isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                  }`}
                >
                  {task.name}
                </h3>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isOverdue
                      ? 'bg-red-100 text-red-800 font-black'
                      : isPostponed
                      ? 'bg-amber-100 text-amber-900'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {isOverdue ? 'Overdue' : task.status.replace('_', ' ')}
                </span>

                {/* Priority Badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'medium'
                      ? 'bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {task.priority}
                </span>

                {/* Postponement Flag & AI Assist trigger */}
                {task.postponementCount > 0 && (
                  <button
                    onClick={() => setProcrastinationTask(task)}
                    className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition"
                    title="Click for AI Procrastination Analysis & Intervention"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Delayed {task.postponementCount}x • AI Assist</span>
                  </button>
                )}

                {/* 10-Minute Loop Reminder Status Badge */}
                <button
                  onClick={() => toggleTaskLoopReminder(task.taskId)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                    task.loopReminder !== false
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                  }`}
                  title="Click to toggle 10-minute recurring loop reminder"
                >
                  <Repeat className="w-2.5 h-2.5" />
                  <span>{task.loopReminder !== false ? '10m Loop: On' : '10m Loop: Off'}</span>
                </button>
              </div>

              {/* Date Duration & Timeline Banner: From Date -> Due Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FCF9F3] border border-[#DFCA95]/60 text-xs text-stone-800 font-medium shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>
                    From <strong className="text-stone-900">{formatDateDisplay(taskStart)}</strong>
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#C5A059]" />
                  <span>
                    Due <strong className="text-stone-900">{formatDateDisplay(taskDue)}</strong>
                  </span>
                  <span className="text-[#9E7D3B] font-bold text-[10px] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                    {spanDays} {spanDays === 1 ? 'day' : 'days span'}
                  </span>
                </div>

                {/* Countdown / Relative Status */}
                {!isCompleted && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                      daysRemaining < 0
                        ? 'bg-red-100 text-red-700'
                        : daysRemaining === 0
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : daysRemaining === 1
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {getRelativeDateLabel(taskDue)}
                  </span>
                )}
              </div>

              {/* AI Smart Priority Reason */}
              {task.priorityReason && (
                <p className="text-xs text-stone-600 flex items-start gap-1.5 bg-[#FCF9F3]/70 p-2 rounded-xl border border-[#DFCA95]/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">Smart Reason:</strong> {task.priorityReason}
                  </span>
                </p>
              )}

              {/* Category, Estimated Time, and AI Peak Window */}
              <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  {task.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  Est: {task.estimatedMinutes}m {task.actualMinutes ? `(${task.actualMinutes}m logged)` : ''}
                </span>
                <span className="text-[#9E7D3B] font-semibold">
                  Peak Window: {task.aiSuggestedTime || '09:30 AM'}
                </span>

                {/* Subtask Quick Counter Button */}
                <button
                  type="button"
                  onClick={() => toggleSubtasksExpanded(task.taskId)}
                  className="px-2 py-0.5 rounded-md bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700 font-semibold flex items-center gap-1 text-[10px] transition"
                >
                  <CheckSquare className="w-3 h-3 text-[#9E7D3B]" />
                  <span>Subtasks ({completedSubs}/{subtasks.length})</span>
                  {isSubtasksOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Expandable Subtask Decomposition Section */}
              {isSubtasksOpen && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#DFCA95]/30">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Actionable Micro-Steps</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => generateAiSubtasks(task.taskId)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-[10px] font-bold text-[#7A5C24] transition flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-[#C5A059]" />
                      <span>AI Decompose</span>
                    </button>
                  </div>

                  {/* Subtask list */}
                  <div className="space-y-1.5">
                    {subtasks.map(sub => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white border border-[#DFCA95]/40 hover:border-[#DFCA95] text-xs transition"
                      >
                        <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => toggleTaskSubtask(task.taskId, sub.id)}
                            className="w-3.5 h-3.5 rounded text-[#C5A059] focus:ring-[#DFCA95] accent-[#C5A059]"
                          />
                          <span className={`truncate ${sub.completed ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}`}>
                            {sub.text}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => deleteTaskSubtask(task.taskId, sub.id)}
                          className="p-1 rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition"
                          title="Remove subtask"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {subtasks.length === 0 && (
                      <p className="text-[11px] text-stone-500 italic py-1">
                        No subtasks added yet. Click &ldquo;AI Decompose&rdquo; above or add one below.
                      </p>
                    )}
                  </div>

                  {/* Inline Add Subtask Input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add specific micro-step..."
                      value={subtaskInputs[task.taskId] || ''}
                      onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [task.taskId]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineSubtask(task.taskId);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddInlineSubtask(task.taskId)}
                      className="px-3 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-2xs transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Performance Bar & Smart Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F5EFEB]">
            {/* Performance Progress */}
            <div className="w-full sm:w-auto text-left lg:text-right min-w-[120px]">
              <div className="flex items-center justify-between lg:justify-end gap-1.5 text-xs font-semibold text-stone-700">
                <span>Performance:</span>
                <span className="text-[#9E7D3B] font-bold">{task.performance || 0}%</span>
              </div>
              <div className="w-full sm:w-28 bg-[#EFE7DD] h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-[#DFCA95] to-[#C5A059] h-full rounded-full transition-all duration-300"
                  style={{ width: `${task.performance || 0}%` }}
                />
              </div>
            </div>

            {/* Smart Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Start Focus Flow Session */}
              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => startFocusFlow(task)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white shadow-xs hover:brightness-105 transition flex items-center gap-1 active:scale-95"
                  title="Launch Pomodoro Focus Timer with Water Drop Sound chime"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Focus Flow</span>
                </button>
              )}

              {/* 1-Click Schedule in Daily Planner */}
              <button
                type="button"
                onClick={() => scheduleTaskDirectly(task)}
                className="p-1.5 rounded-xl text-[#7A5C24] bg-[#FCF9F3] hover:bg-[#F5EFEB] border border-[#DFCA95]/60 transition"
                title="Add to Daily Planner Schedule"
              >
                <CalendarRange className="w-4 h-4 text-[#9E7D3B]" />
              </button>

              {/* 10-Minute Recurring Drop Sound alert test */}
              {!isCompleted && task.loopReminder !== false && (
                <button
                  type="button"
                  onClick={() => trigger10MinLoopAlert(task, `Task Reminder: "${task.name}" (${task.priority.toUpperCase()} Priority)`)}
                  className="p-1.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                  title="Trigger 10-Minute Alert & Water Drop Sound Now"
                >
                  <Droplets className="w-4 h-4 text-amber-600" />
                </button>
              )}

              {/* +1 Day Postpone */}
              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => postponeTask(task.taskId)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700 border border-[#DFCA95]/40 transition"
                  title="Postpone & re-evaluate with AI Procrastination Engine"
                >
                  +1 Day
                </button>
              )}

              {/* ER Diagnostics */}
              <button
                type="button"
                onClick={() => setSelectedTaskDetails(task)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-[#F5EFEB] transition"
                title="View ER Diagram Entity Diagnostics"
              >
                <Brain className="w-4 h-4 text-[#9E7D3B]" />
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={() => handleOpenEdit(task)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-[#F5EFEB] transition"
                title="Edit Task"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => deleteTask(task.taskId)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] via-[#F8F3EA] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <CheckSquare className="w-6 h-6 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Task Management & Intelligence Hub</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3E8CB] text-[#7A5C24] px-2.5 py-0.5 rounded-full border border-[#DFCA95]">
              Kaizen v2.4 Active
            </span>
          </div>
          <p className="text-xs text-stone-500 max-w-xl">
            Section 5: Full task lifecycle (Add, Edit, Delete, Status, Performance) with Smart Priority (Sec 17), Procrastination Analysis (Sec 18), and Daily Planner linking (Sec 8).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Drop preview button */}
          <button
            onClick={() => {
              playDropSound(0.9);
              showToast('Drop sound preview played (Synthesized Web Audio)');
            }}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 active:scale-95"
            title="Listen to synthesized water drop sound"
          >
            <Droplets className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Test Drop Sound</span>
          </button>

          {/* AI Priority Recalibrate */}
          <button
            onClick={recalculateAllPriorities}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
            title="AI recalculates urgency & cognitive alertness scores"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>AI Recalibrate</span>
          </button>

          {/* Create Task Button */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task Performance Analytics Bar (Section 5 ER Metric) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Tasks</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-black text-stone-900">{totalTasksCount}</span>
            <span className="text-[11px] text-stone-400">({completedCount} completed)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Average Performance</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-black text-[#9E7D3B]">{averagePerformance}%</span>
          </div>
          <div className="w-full bg-[#EFE7DD] h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-gradient-to-r from-[#DFCA95] to-[#C5A059] h-full rounded-full"
              style={{ width: `${averagePerformance}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Overdue Alerts</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-serif font-black ${overdueCount > 0 ? 'text-red-600' : 'text-stone-800'}`}>
              {overdueCount}
            </span>
            <span className="text-[11px] text-stone-400">tasks delayed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Focus Time In Scope</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-black text-stone-900">
              {Math.round(totalEstimatedMins / 60)}h {totalEstimatedMins % 60}m
            </span>
            <span className="text-[11px] text-stone-400">planned</span>
          </div>
        </div>
      </div>

      {/* Date Range, Search & Organization Control Center */}
      <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Top Row: Date Presets & 4 View Mode Switchers */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F5EFEB]">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1 mr-1">
              <CalendarRange className="w-3.5 h-3.5 text-[#9E7D3B]" />
              <span>Date Scope:</span>
            </span>

            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Due Today' },
              { id: 'this_week', label: 'This Week (7 Days)' },
              { id: 'next_14_days', label: 'Next 14 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'overdue', label: `Overdue (${overdueCount})`, isAlert: overdueCount > 0 },
              { id: 'custom', label: 'Custom Range ➔' }
            ].map(preset => {
              const isActive = dateRangePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectDatePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#DFCA95] to-[#C5A059] text-white shadow-xs'
                      : preset.isAlert
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      : 'bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* 4 View Modes Toggle */}
          <div className="flex items-center bg-[#F5EFEB] p-1 rounded-xl border border-[#DFCA95]/50 self-start lg:self-auto text-xs flex-wrap gap-1">
            <button
              onClick={() => setViewMode('organized')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                viewMode === 'organized'
                  ? 'bg-white text-[#9E7D3B] font-bold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Organized by chronological date brackets"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#9E7D3B] font-bold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Kanban status flow columns"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-white text-[#9E7D3B] font-bold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Eisenhower Matrix: Urgent vs Important"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Eisenhower</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-[#9E7D3B] font-bold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Compact data table view"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Second Row: Explicit From Date -> To Date Inputs & Query / Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Explicit Date Range Inputs: From Date -> To Date */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-tight shrink-0">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] shrink-0 self-center hidden sm:block" />

            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-tight shrink-0">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setDateRangePreset('all');
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] self-end sm:self-center"
                title="Clear date range"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="lg:col-span-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
            />
          </div>

          {/* Status, Priority & Sorting Dropdowns */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-1/3 px-2 py-1.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white text-stone-700 font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="postponed">Postponed</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-1/3 px-2 py-1.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white text-stone-700 font-medium"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-1/3 px-2 py-1.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white text-stone-700 font-medium"
            >
              <option value="priority_desc">Priority: High</option>
              <option value="due_asc">Due: Soonest</option>
              <option value="due_desc">Due: Latest</option>
              <option value="perf_desc">Perf: High</option>
              <option value="delay_desc">Most Delayed</option>
            </select>
          </div>
        </div>

        {/* Active Range Banner */}
        <div className="flex items-center justify-between text-xs text-stone-600 bg-[#FCF9F3] px-3.5 py-2 rounded-xl border border-[#DFCA95]/40 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span>
              Scope:{' '}
              <strong className="text-stone-900">
                {fromDate && toDate
                  ? `${formatDateDisplay(fromDate)}  ➔  ${formatDateDisplay(toDate)}`
                  : fromDate
                  ? `From ${formatDateDisplay(fromDate)} onwards`
                  : toDate
                  ? `Up to ${formatDateDisplay(toDate)}`
                  : 'All Registered Dates'}
              </strong>
            </span>
            <span className="text-stone-400">•</span>
            <span>
              Showing <strong className="text-[#9E7D3B]">{sortedTasks.length}</strong> of {totalTasksCount} tasks
            </span>
          </div>

          {(fromDate || toDate || searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[#9E7D3B] hover:text-[#7A5C24] flex items-center gap-1 underline underline-offset-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: ORGANIZED TIMELINE VIEW */}
      {viewMode === 'organized' && (
        <div className="space-y-6">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h3 className="font-serif font-bold text-base text-red-900">🚨 Overdue Tasks Requiring Attention</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                    {overdueTasks.length}
                  </span>
                </div>
                <span className="text-xs text-stone-500">Deadlines elapsed</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {overdueTasks.map(task => renderTaskCard(task, true))}
              </div>
            </div>
          )}

          {/* Today Section */}
          {todayTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                  <h3 className="font-serif font-bold text-base text-stone-900">⭐ Today&rsquo;s Focus Targets</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                    {todayTasks.length} tasks • Due {formatDateShort(today)}
                  </span>
                </div>
                <span className="text-xs text-stone-500">Highest daily execution priority</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {todayTasks.map(task => renderTaskCard(task))}
              </div>
            </div>
          )}

          {/* This Week Section */}
          {thisWeekTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9E7D3B]" />
                  <h3 className="font-serif font-bold text-base text-stone-900">Upcoming This Week (Next 7 Days)</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5EFEB] text-stone-700">
                    {thisWeekTasks.length}
                  </span>
                </div>
                <span className="text-xs text-stone-500">Scheduled through {formatDateShort(addDays(today, 6))}</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {thisWeekTasks.map(task => renderTaskCard(task))}
              </div>
            </div>
          )}

          {/* Future Section */}
          {futureTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-stone-500" />
                  <h3 className="font-serif font-bold text-base text-stone-900">Later & Next 14 Days</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5EFEB] text-stone-700">
                    {futureTasks.length}
                  </span>
                </div>
                <span className="text-xs text-stone-500">Scheduled beyond 7 days</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {futureTasks.map(task => renderTaskCard(task))}
              </div>
            </div>
          )}

          {/* Completed Archive */}
          {completedTasks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#F5EFEB]">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-serif font-bold text-base text-stone-700">Completed Tasks Archive</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {completedTasks.length}
                  </span>
                </div>
                <span className="text-xs text-stone-400">Accomplished milestones</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {completedTasks.map(task => renderTaskCard(task))}
              </div>
            </div>
          )}

          {sortedTasks.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#DFCA95]/50 shadow-xs">
              <CalendarRange className="w-12 h-12 text-[#DFCA95] mx-auto mb-3" />
              <h4 className="font-serif font-bold text-base text-stone-800">No tasks in this date scope</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                There are no tasks matching your active date range ({fromDate || 'Any'} ➔ {toDate || 'Any'}) or filters.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700 transition"
                >
                  Clear Date Filter
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs transition"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN FLOW BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'pending', title: 'Pending Initiation', color: 'border-[#DFCA95]/60 bg-[#FCF9F3]/60' },
            { id: 'in_progress', title: 'In Active Progress', color: 'border-blue-200 bg-blue-50/40' },
            { id: 'postponed', title: 'Postponed / Friction', color: 'border-amber-200 bg-amber-50/40' },
            { id: 'completed', title: 'Completed', color: 'border-emerald-200 bg-emerald-50/40' }
          ].map(col => {
            const colTasks = sortedTasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`p-4 rounded-3xl border ${col.color} flex flex-col justify-between min-h-[500px]`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                    <h4 className="font-serif font-bold text-sm text-stone-900">{col.title}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-2xs border text-stone-700">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map(task => (
                      <div
                        key={task.taskId}
                        className="p-3.5 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-2 hover:border-[#DFCA95] transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-mono text-[#9E7D3B] font-bold">
                            {task.taskId}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'medium'
                                ? 'bg-[#F3E8CB] text-[#7A5C24]'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-stone-900 leading-snug">{task.name}</h5>

                        <div className="text-[10px] text-stone-500 flex items-center justify-between pt-1 border-t border-[#F5EFEB]">
                          <span>Due: {formatDateShort(task.dueDate)}</span>
                          <span className="font-semibold text-[#9E7D3B]">{task.performance || 0}%</span>
                        </div>

                        {/* Quick Kanban Status Transitions */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          {col.id !== 'in_progress' && (
                            <button
                              onClick={() => updateTask(task.taskId, { status: 'in_progress' })}
                              className="text-[9px] px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold transition"
                            >
                              ➔ In Progress
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              onClick={() => updateTask(task.taskId, { status: 'completed', performance: 100 })}
                              className="text-[9px] px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-semibold transition"
                            >
                              ➔ Complete
                            </button>
                          )}
                          {col.id !== 'postponed' && col.id !== 'completed' && (
                            <button
                              onClick={() => postponeTask(task.taskId)}
                              className="text-[9px] px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-semibold transition"
                            >
                              +1 Day
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <p className="text-center text-[11px] text-stone-400 py-8 italic">No tasks in this lane</p>
                    )}
                  </div>
                </div>

                {col.id === 'pending' && (
                  <button
                    onClick={handleOpenCreate}
                    className="w-full mt-3 py-2 border-2 border-dashed border-[#DFCA95] hover:border-[#9E7D3B] text-stone-700 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: EISENHOWER PRIORITY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Q1: Do First (Urgent & Important) */}
          <div className="p-5 rounded-3xl bg-red-50/50 border-2 border-red-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-red-200">
              <div>
                <h4 className="font-serif font-bold text-sm text-red-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>Q1: DO FIRST (Urgent & Important)</span>
                </h4>
                <p className="text-[10px] text-red-700">High priority tasks due within 48 hours or overdue</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                {sortedTasks.filter(t => t.priority === 'high' && (t.dueDate <= addDays(today, 1) || t.dueDate < today) && t.status !== 'completed').length}
              </span>
            </div>

            <div className="space-y-2">
              {sortedTasks
                .filter(t => t.priority === 'high' && (t.dueDate <= addDays(today, 1) || t.dueDate < today) && t.status !== 'completed')
                .map(t => (
                  <div key={t.taskId} className="p-3 bg-white rounded-2xl border border-red-200 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-red-700 font-bold">{t.taskId}</span>
                        <h5 className="text-xs font-bold text-stone-900 truncate">{t.name}</h5>
                      </div>
                      <p className="text-[10px] text-red-600 mt-0.5">Due: {formatDateShort(t.dueDate)} • {t.estimatedMinutes}m</p>
                    </div>
                    <button
                      onClick={() => startFocusFlow(t)}
                      className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Execute</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Q2: Schedule / Deep Flow (Important, Not Urgent) */}
          <div className="p-5 rounded-3xl bg-[#FCF9F3] border-2 border-[#DFCA95] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFCA95]/50">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#7A5C24] flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#C5A059]" />
                  <span>Q2: SCHEDULE / DEEP FLOW (Strategic & Important)</span>
                </h4>
                <p className="text-[10px] text-stone-600">High / Medium priority tasks with generous timeline</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                {sortedTasks.filter(t => (t.priority === 'high' || t.priority === 'medium') && t.dueDate > addDays(today, 1) && t.status !== 'completed').length}
              </span>
            </div>

            <div className="space-y-2">
              {sortedTasks
                .filter(t => (t.priority === 'high' || t.priority === 'medium') && t.dueDate > addDays(today, 1) && t.status !== 'completed')
                .map(t => (
                  <div key={t.taskId} className="p-3 bg-white rounded-2xl border border-[#DFCA95]/40 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#9E7D3B] font-bold">{t.taskId}</span>
                        <h5 className="text-xs font-bold text-stone-900 truncate">{t.name}</h5>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5">Due: {formatDateShort(t.dueDate)} • {t.estimatedMinutes}m</p>
                    </div>
                    <button
                      onClick={() => scheduleTaskDirectly(t)}
                      className="px-2.5 py-1 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Planner</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Q3: Delegate / Fast Track (Urgent, Less Critical) */}
          <div className="p-5 rounded-3xl bg-amber-50/50 border-2 border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <div>
                <h4 className="font-serif font-bold text-sm text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Q3: FAST TRACK / STREAMLINE (Due Soon, Low Impact)</span>
                </h4>
                <p className="text-[10px] text-amber-700">Quick turnaround tasks requiring fast dispatch</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {sortedTasks.filter(t => t.priority === 'low' && t.dueDate <= addDays(today, 2) && t.status !== 'completed').length}
              </span>
            </div>

            <div className="space-y-2">
              {sortedTasks
                .filter(t => t.priority === 'low' && t.dueDate <= addDays(today, 2) && t.status !== 'completed')
                .map(t => (
                  <div key={t.taskId} className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-800 font-bold">{t.taskId}</span>
                        <h5 className="text-xs font-bold text-stone-900 truncate">{t.name}</h5>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5">Due: {formatDateShort(t.dueDate)} • {t.estimatedMinutes}m</p>
                    </div>
                    <button
                      onClick={() => toggleTaskStatus(t.taskId)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-800 text-[11px] font-semibold hover:bg-stone-50"
                    >
                      Done
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Q4: Eliminate / Re-evaluate (Neither Urgent nor Important) */}
          <div className="p-5 rounded-3xl bg-stone-50 border-2 border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-stone-500" />
                  <span>Q4: RE-EVALUATE / PRUNE (Low Strategic Value)</span>
                </h4>
                <p className="text-[10px] text-stone-500">Chronic postponements or low priority items</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                {sortedTasks.filter(t => (t.status === 'postponed' && t.postponementCount >= 3) || (t.priority === 'low' && t.dueDate > addDays(today, 2) && t.status !== 'completed')).length}
              </span>
            </div>

            <div className="space-y-2">
              {sortedTasks
                .filter(t => (t.status === 'postponed' && t.postponementCount >= 3) || (t.priority === 'low' && t.dueDate > addDays(today, 2) && t.status !== 'completed'))
                .map(t => (
                  <div key={t.taskId} className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-500 font-bold">{t.taskId}</span>
                        <h5 className="text-xs font-bold text-stone-600 truncate">{t.name}</h5>
                      </div>
                      <p className="text-[10px] text-amber-700 mt-0.5">{t.postponementCount}x delayed</p>
                    </div>
                    <button
                      onClick={() => setProcrastinationTask(t)}
                      className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold"
                    >
                      Intervene
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: DATA TABLE / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white border border-[#DFCA95]/60 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCF9F3] border-b border-[#DFCA95]/50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Done</th>
                  <th className="py-3.5 px-3">ID</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Task Name</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Timeline (From ➔ Due)</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Perf</th>
                  <th className="py-3.5 px-3">Subtasks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFEB]">
                {sortedTasks.map(t => {
                  const isDone = t.status === 'completed';
                  const subs = t.subtasks || [];
                  const doneSubs = subs.filter(s => s.completed).length;

                  return (
                    <tr key={t.taskId} className="hover:bg-[#FCF9F3]/50 transition">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleTaskStatus(t.taskId)}
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isDone ? 'bg-[#C5A059] border-[#9E7D3B] text-white' : 'border-stone-300'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#9E7D3B]">{t.taskId}</td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        <span className={isDone ? 'line-through text-stone-400' : ''}>{t.name}</span>
                      </td>
                      <td className="py-3 px-3 text-stone-600">{t.category}</td>
                      <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                        {formatDateShort(t.startDate || t.dueDate)} ➔ {formatDateShort(t.dueDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'medium'
                              ? 'bg-[#F3E8CB] text-[#7A5C24]'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : t.status === 'postponed'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#9E7D3B]">{t.performance || 0}%</td>
                      <td className="py-3 px-3 text-stone-600">{doneSubs}/{subs.length}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startFocusFlow(t)}
                            className="p-1 rounded text-[#C5A059] hover:bg-[#F5EFEB]"
                            title="Focus Session"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1 rounded text-stone-400 hover:text-stone-700"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(t.taskId)}
                            className="p-1 rounded text-stone-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: LIVE FOCUS FLOW SESSION (Pomodoro / Focus Mode) */}
      {activeFocusTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#DFCA95] rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl animate-scale-in relative space-y-6">
            <button
              onClick={() => {
                setIsFocusRunning(false);
                setActiveFocusTask(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                Kaizen Deep Focus Flow
              </span>
              <h3 className="font-serif font-bold text-xl text-stone-900 mt-2">{activeFocusTask.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{activeFocusTask.category} • Peak Flow Anchor</p>
            </div>

            {/* Giant Circular Countdown Display */}
            <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center rounded-full bg-[#FCF9F3] border-4 border-[#DFCA95] shadow-inner">
              <span className="text-4xl font-serif font-black text-stone-900 font-mono tracking-wider">
                {String(Math.floor(focusTimeLeft / 60)).padStart(2, '0')}:
                {String(focusTimeLeft % 60).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E7D3B] mt-1 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isFocusRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
                <span>{isFocusRunning ? 'In Session' : 'Paused'}</span>
              </span>
            </div>

            {/* Sound indicator & 10m drop notification badge */}
            <div className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/50 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-amber-700" />
                <span>10-Minute Recurring Drop Chime:</span>
              </div>
              <span className="font-bold text-[#7A5C24]">Active</span>
            </div>

            {/* Focus Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsFocusRunning(!isFocusRunning)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                  isFocusRunning
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-[#C5A059] hover:bg-[#9E7D3B] text-white shadow-md'
                }`}
              >
                {isFocusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isFocusRunning ? 'Pause Session' : 'Resume Flow'}</span>
              </button>

              <button
                onClick={() => {
                  completeFocusSession(activeFocusTask.taskId, Math.max(5, Math.round((focusInitialMinutes * 60 - focusTimeLeft) / 60)));
                  setActiveFocusTask(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Finish & Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI PROCRASTINATION INTERVENTION (Section 18) */}
      {procrastinationTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
          <div className="bg-white border-2 border-amber-300 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    AI Procrastination Intervention
                  </h3>
                  <p className="text-[11px] text-stone-500">Section 18 ER Entity: Diagnostic breakdown & anti-avoidance protocols</p>
                </div>
              </div>
              <button
                onClick={() => setProcrastinationTask(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic stats */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2 text-xs">
              <p className="font-bold text-amber-900 text-sm">{procrastinationTask.name}</p>
              <div className="grid grid-cols-2 gap-2 text-amber-900 text-[11px]">
                <div>Postponement Count: <strong>{procrastinationTask.postponementCount}x</strong></div>
                <div>Estimated Friction: <strong>{procrastinationTask.estimatedMinutes} minutes</strong></div>
              </div>
              <p className="text-stone-600 pt-1 text-[11px] leading-relaxed">
                Kaizen Engine analysis: Tasks with over 60m duration and abstract boundaries experience high initiation friction. Engage one of the 3 continuous improvement countermeasures below:
              </p>
            </div>

            {/* 3 Countermeasure Action Cards */}
            <div className="space-y-2.5">
              <div
                onClick={() => {
                  applyProcrastinationIntervention(procrastinationTask.taskId, 'micro_sprint');
                  setProcrastinationTask(null);
                }}
                className="p-3.5 rounded-2xl bg-[#FCF9F3] hover:bg-[#F5EFEB] border border-[#DFCA95] cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <h5 className="font-serif font-bold text-xs text-stone-900 group-hover:text-[#7A5C24] transition">
                    1. 15-Minute Micro-Sprint (Low-Activation Protocol)
                  </h5>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Reduces time expectation to 15m and shifts status to &ldquo;In Progress&rdquo;. Overcomes the initial cognitive threshold.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition shrink-0" />
              </div>

              <div
                onClick={() => {
                  applyProcrastinationIntervention(procrastinationTask.taskId, 'ai_decompose');
                  setProcrastinationTask(null);
                }}
                className="p-3.5 rounded-2xl bg-[#FCF9F3] hover:bg-[#F5EFEB] border border-[#DFCA95] cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <h5 className="font-serif font-bold text-xs text-stone-900 group-hover:text-[#7A5C24] transition flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>2. AI Deconstruct into Bite-Sized Micro-Steps</span>
                  </h5>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Decomposes the task into 4 effortless sequential check-boxes so you only focus on step 1 right now.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition shrink-0" />
              </div>

              <div
                onClick={() => {
                  applyProcrastinationIntervention(procrastinationTask.taskId, 'peak_anchor');
                  setProcrastinationTask(null);
                }}
                className="p-3.5 rounded-2xl bg-[#FCF9F3] hover:bg-[#F5EFEB] border border-[#DFCA95] cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <h5 className="font-serif font-bold text-xs text-stone-900 group-hover:text-[#7A5C24] transition">
                    3. Re-anchor to Tomorrow Peak Morning Slot (08:30 AM)
                  </h5>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Postponing past afternoon fatigue. Aligns with your highest biological willpower window.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE TASK */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Add New Kaizen Task</h3>
                <p className="text-[11px] text-stone-500">Define task name, category, and date span (From ➔ Due Date)</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct deep focus architectural audit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Work & Deep Focus">Work & Deep Focus</option>
                    <option value="Mind & Health">Mind & Health</option>
                    <option value="Financial Wellness">Financial Wellness</option>
                    <option value="Knowledge & Growth">Knowledge & Growth</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Date Span Configuration: Start Date ➔ Due Date */}
              <div className="p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7A5C24] flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Date Span (From Date ➔ Due Date)</span>
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                    {Math.max(1, getDaysDifference(formData.startDate, formData.dueDate) + 1)} Day(s) Total
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          startDate: newStart,
                          dueDate: prev.dueDate < newStart ? newStart : prev.dueDate
                        }));
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Due / Target Date</label>
                    <input
                      type="date"
                      required
                      min={formData.startDate}
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-stone-500 font-semibold">Quick Span:</span>
                  {[
                    { label: 'Today (1 Day)', days: 0 },
                    { label: '+2 Days', days: 2 },
                    { label: '+1 Week', days: 7 },
                    { label: '+2 Weeks', days: 14 }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleQuickAddDays(item.days)}
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-[10px] font-medium text-stone-700 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Focus Minutes</label>
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes & Context</label>
                <textarea
                  rows="2"
                  placeholder="Key sub-steps, references, or blockers..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {/* 10-Minute Recurring Reminder Loop with Water Drop Sound */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.loopReminder}
                      onChange={(e) => setFormData({ ...formData, loopReminder: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#DFCA95]"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-700" />
                        <span>10-Minute Loop Reminder & Drop Sound</span>
                      </span>
                      <span className="block text-[10px] text-stone-600">
                        Plays synthesized water drop sound every 10 minutes until completed
                      </span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playDropSound();
                      showToast('Drop sound preview played');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-white border border-amber-300 rounded-lg text-amber-900 font-medium hover:bg-amber-100 flex items-center gap-1 shrink-0"
                    title="Test synthesized water drop sound"
                  >
                    <Volume2 className="w-3 h-3 text-[#C5A059]" />
                    <span>Test Drop</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT TASK */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Edit Task: {editingTask.taskId}</h3>
                <p className="text-[11px] text-stone-500">Update date span, progress percentage, or priority</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="postponed">Postponed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Date Span Configuration: Start Date ➔ Due Date */}
              <div className="p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7A5C24] flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Date Span (From Date ➔ Due Date)</span>
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                    {Math.max(1, getDaysDifference(formData.startDate, formData.dueDate) + 1)} Day(s) Total
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          startDate: newStart,
                          dueDate: prev.dueDate < newStart ? newStart : prev.dueDate
                        }));
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Due / Target Date</label>
                    <input
                      type="date"
                      required
                      min={formData.startDate}
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-stone-500 font-semibold">Quick Span:</span>
                  {[
                    { label: 'Today (1 Day)', days: 0 },
                    { label: '+2 Days', days: 2 },
                    { label: '+1 Week', days: 7 },
                    { label: '+2 Weeks', days: 14 }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleQuickAddDays(item.days)}
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-[10px] font-medium text-stone-700 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Performance Progress ({formData.performance || 0}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.performance || 0}
                  onChange={(e) => setFormData({ ...formData, performance: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {/* 10-Minute Recurring Reminder Loop */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.loopReminder}
                      onChange={(e) => setFormData({ ...formData, loopReminder: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#DFCA95]"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-700" />
                        <span>10-Minute Loop Reminder & Drop Sound</span>
                      </span>
                      <span className="block text-[10px] text-stone-600">
                        Plays synthesized water drop sound every 10 minutes until completed
                      </span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playDropSound();
                      showToast('Drop sound preview played');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-white border border-amber-300 rounded-lg text-amber-900 font-medium hover:bg-amber-100 flex items-center gap-1 shrink-0"
                    title="Test synthesized water drop sound"
                  >
                    <Volume2 className="w-3 h-3 text-[#C5A059]" />
                    <span>Test Drop</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DETAILED ER DIAGNOSTICS */}
      {selectedTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#9E7D3B]" />
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  AI Entity Diagnostics: {selectedTaskDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskDetails(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* ER Section 1: Core Task Data */}
              <div className="p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-2">
                  Task Entity Attributes (ER Model)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-stone-600">
                  <div><strong>Task ID:</strong> {selectedTaskDetails.taskId}</div>
                  <div><strong>Task Name:</strong> {selectedTaskDetails.name}</div>
                  <div><strong>Start Date:</strong> {selectedTaskDetails.startDate || selectedTaskDetails.dueDate}</div>
                  <div><strong>Due Date:</strong> {selectedTaskDetails.dueDate}</div>
                  <div><strong>Status:</strong> {selectedTaskDetails.status}</div>
                  <div><strong>Performance:</strong> {selectedTaskDetails.performance || 0}%</div>
                </div>
              </div>

              {/* ER Section 2: Smart Task Priority Entity */}
              <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#DFCA95]/60">
                <h4 className="font-bold text-[#7A5C24] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Smart Task Priority Entity (Section 17)</span>
                </h4>
                <div className="space-y-1.5 text-stone-700">
                  <div><strong>Priority ID:</strong> PRIO-{selectedTaskDetails.taskId}</div>
                  <div><strong>Assigned Priority:</strong> {selectedTaskDetails.priority.toUpperCase()}</div>
                  <div><strong>Priority Reason:</strong> {selectedTaskDetails.priorityReason}</div>
                  <div><strong>AI Suggested Time Slot:</strong> {selectedTaskDetails.aiSuggestedTime || '09:30 AM'}</div>
                </div>
              </div>

              {/* ER Section 3: Procrastination Analysis Entity */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Procrastination Analysis Entity (Section 18)</span>
                </h4>
                <div className="space-y-1.5 text-amber-900">
                  <div><strong>Task ID:</strong> {selectedTaskDetails.taskId}</div>
                  <div><strong>Postponement Count:</strong> {selectedTaskDetails.postponementCount || 0} times</div>
                  <div><strong>Suggested Time:</strong> {selectedTaskDetails.aiSuggestedTime || 'Tomorrow 09:30 AM'}</div>
                  <div><strong>Target Due Date:</strong> {selectedTaskDetails.dueDate}</div>
                  <div>
                    <strong>Analysis Notes:</strong>{' '}
                    {selectedTaskDetails.postponementCount >= 2
                      ? "High friction detected. Recommendation: Break cognitive threshold down to a 10-minute micro-start."
                      : "Task progressing within normal initiation boundaries."}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedTaskDetails(null)}
                className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs transition"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
