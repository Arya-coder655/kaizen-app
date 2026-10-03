import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarRange,
  ArrowRight,
  RotateCcw,
  Check,
  CheckSquare,
  Volume2,
  Repeat,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Coffee,
  Copy,
  Search,
  Filter,
  FastForward,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getTodayStr,
  addDays,
  formatDateDisplay,
  formatDateShort,
  formatDateFull,
  getDaysDifference,
  getDateRangeArray,
  isScheduleInRange
} from '../../utils/dateUtils';

// Circadian rhythm energy guidelines for human daily productivity
const CIRCADIAN_ZONES = [
  {
    id: 'morning_prime',
    label: 'Morning Priming',
    timeRange: '06:00 - 09:00',
    startTime: '06:30',
    endTime: '08:30',
    icon: Sunrise,
    color: 'from-amber-400/20 to-orange-400/10 border-amber-300 text-amber-900',
    description: 'Movement, hydration, breakfast & day orientation. Low friction.'
  },
  {
    id: 'deep_focus',
    label: 'Deep Work Focus',
    timeRange: '09:00 - 12:30',
    startTime: '09:30',
    endTime: '11:30',
    icon: Sun,
    color: 'from-emerald-400/20 to-teal-400/10 border-emerald-300 text-emerald-900',
    description: 'Peak cognitive window. Tackle hardest problem, no distractions.'
  },
  {
    id: 'midday_recharge',
    label: 'Midday Recharge',
    timeRange: '12:30 - 14:00',
    startTime: '12:30',
    endTime: '13:30',
    icon: Coffee,
    color: 'from-sky-400/20 to-blue-400/10 border-sky-300 text-sky-900',
    description: 'Nutritious lunch, walking, screen break & mental reset.'
  },
  {
    id: 'execution_admin',
    label: 'Execution & Admin',
    timeRange: '14:00 - 18:00',
    startTime: '14:00',
    endTime: '16:00',
    icon: Sunset,
    color: 'from-purple-400/20 to-indigo-400/10 border-purple-300 text-purple-900',
    description: 'Calls, emails, administrative processing, tasks & collaboration.'
  },
  {
    id: 'evening_winddown',
    label: 'Evening Restoration',
    timeRange: '18:00 - 23:00',
    startTime: '19:30',
    endTime: '21:00',
    icon: Moon,
    color: 'from-rose-400/20 to-stone-400/10 border-rose-300 text-rose-900',
    description: 'Family, cooking, reading, review achievements & sleep preparation.'
  }
];

// Hourly timeline slots for day view (06:00 to 22:00)
const TIMELINE_HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, '0')}:00`;
});

export default function DailyPlannerScreen() {
  const {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    tasks,
    showToast,
    trigger10MinLoopAlert,
    toggleScheduleLoopReminder,
    playDropSound
  } = useApp();

  const today = getTodayStr();

  // View mode: 'timeline' (time-blocking grid), 'matrix' (multi-day cards), 'agenda' (stream)
  const [viewMode, setViewMode] = useState('timeline');

  // Active single day selected for timeline view
  const [selectedDay, setSelectedDay] = useState(today);

  // Range Presets & Dates for multi-day planning
  const [rangePreset, setRangePreset] = useState('this_week'); // 'today' | 'tomorrow' | 'next_3_days' | 'this_week' | 'next_14_days' | 'custom'
  const [rangeStart, setRangeStart] = useState(today);
  const [rangeEnd, setRangeEnd] = useState(addDays(today, 6));

  // Search & filter for agenda view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSch, setEditingSch] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    taskId: '',
    startDate: today,
    endDate: today,
    date: today,
    time: '09:30',
    endTime: '11:00',
    aiSuggest: 'AI Suggestion: Aligned with personal focus schedule & natural circadian alertness.',
    status: 'scheduled',
    loopReminder: true,
    loopIntervalMinutes: 10
  });

  // Current real-time clock tracking for live slot banner and current time line
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Handle Preset Change
  const handleSelectPreset = (preset) => {
    setRangePreset(preset);
    if (preset === 'today') {
      setRangeStart(today);
      setRangeEnd(today);
      setSelectedDay(today);
    } else if (preset === 'tomorrow') {
      const tomorrow = addDays(today, 1);
      setRangeStart(tomorrow);
      setRangeEnd(tomorrow);
      setSelectedDay(tomorrow);
    } else if (preset === 'next_3_days') {
      setRangeStart(today);
      setRangeEnd(addDays(today, 2));
    } else if (preset === 'this_week') {
      setRangeStart(today);
      setRangeEnd(addDays(today, 6));
    } else if (preset === 'next_14_days') {
      setRangeStart(today);
      setRangeEnd(addDays(today, 13));
    }
  };

  // Shift range forward or backward
  const handleShiftRange = (direction) => {
    const span = Math.max(1, getDaysDifference(rangeStart, rangeEnd) + 1);
    const offset = direction === 'next' ? span : -span;
    const newStart = addDays(rangeStart, offset);
    const newEnd = addDays(rangeEnd, offset);
    setRangeStart(newStart);
    setRangeEnd(newEnd);
    setSelectedDay(newStart);
    setRangePreset('custom');
  };

  // Open modal with pre-filled parameters
  const handleOpenCreateSlot = ({
    targetDate = selectedDay || today,
    startTime = '09:30',
    endTime = '11:00',
    title = '',
    taskId = ''
  } = {}) => {
    setFormData({
      title,
      taskId,
      startDate: targetDate,
      endDate: targetDate,
      date: targetDate,
      time: startTime,
      endTime: endTime,
      aiSuggest: 'AI Suggestion: Aligned with personal focus schedule & natural circadian alertness.',
      status: 'scheduled',
      loopReminder: true,
      loopIntervalMinutes: 10
    });
    setIsCreateOpen(true);
  };

  const handleTaskSelect = (taskId) => {
    const t = tasks.find(item => item.taskId === taskId);
    if (t) {
      setFormData(prev => ({
        ...prev,
        taskId: t.taskId,
        title: t.name,
        startDate: prev.startDate || t.startDate || today,
        endDate: prev.endDate || t.dueDate || today,
        date: prev.date || t.startDate || today,
        aiSuggest: `AI Suggestion: Linked to Task ${t.taskId} (${t.priority.toUpperCase()} Priority, ~${t.estimatedMinutes || 45}m duration).`
      }));
    } else {
      setFormData(prev => ({ ...prev, taskId: '' }));
    }
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    addSchedule({
      ...formData,
      date: formData.startDate
    });
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (sch) => {
    setEditingSch(sch);
    setFormData({
      title: sch.title,
      taskId: sch.taskId || '',
      startDate: sch.startDate || sch.date || today,
      endDate: sch.endDate || sch.startDate || sch.date || today,
      date: sch.date || sch.startDate || today,
      time: sch.time,
      endTime: sch.endTime,
      aiSuggest: sch.aiSuggest || '',
      status: sch.status,
      loopReminder: sch.loopReminder !== false,
      loopIntervalMinutes: sch.loopIntervalMinutes || 10
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingSch) {
      updateSchedule(editingSch.scheduleId, {
        ...formData,
        date: formData.startDate
      });
      setEditingSch(null);
    }
  };

  // 1-Click Duplicate to Tomorrow
  const handleDuplicateToTomorrow = (sch) => {
    const tomorrow = addDays(sch.startDate || sch.date || today, 1);
    addSchedule({
      ...sch,
      title: `${sch.title} (Follow-up)`,
      startDate: tomorrow,
      endDate: tomorrow,
      date: tomorrow,
      status: 'scheduled',
      aiSuggest: `AI Suggestion: Duplicated follow-up session scheduled for ${formatDateShort(tomorrow)}.`
    });
    showToast(`Duplicated slot to ${formatDateShort(tomorrow)}`, 'gold');
  };

  // 1-Click +30m Quick Extend
  const handleExtendSlot = (sch, extraMinutes = 30) => {
    if (!sch.endTime) return;
    const [eh, em] = sch.endTime.split(':').map(Number);
    const newTotal = eh * 60 + em + extraMinutes;
    const newH = Math.min(23, Math.floor(newTotal / 60));
    const newM = newTotal % 60;
    const newEndStr = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    updateSchedule(sch.scheduleId, { endTime: newEndStr });
    showToast(`Extended ${sch.title} by ${extraMinutes} mins (until ${newEndStr})`, 'gold');
  };

  // Instant Complete with Confetti
  const handleToggleComplete = (sch) => {
    const isCompleted = sch.status === 'completed';
    const nextStatus = isCompleted ? 'scheduled' : 'completed';
    updateSchedule(sch.scheduleId, { status: nextStatus });
    if (!isCompleted) {
      showToast(`Completed focus slot: "${sch.title}"! 🎉`, 'gold');
      try {
        confetti({ particleCount: 50, spread: 65, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#10B981'] });
      } catch (e) {}
    }
  };

  // AI Auto-Scheduler across active date range
  const handleAutoScheduleAi = () => {
    const uncompleted = tasks.filter(t => t.status !== 'completed');
    if (uncompleted.length === 0) {
      showToast("All tasks are already completed! Kaizen recommends planning rest & reflection.", "gold");
      return;
    }

    const datesInRange = getDateRangeArray(rangeStart, rangeEnd);
    let scheduledCount = 0;

    datesInRange.forEach((dateStr, index) => {
      const taskForDay = uncompleted[index % uncompleted.length];
      if (taskForDay) {
        const existing = schedules.some(s => s.taskId === taskForDay.taskId && (s.startDate === dateStr || s.date === dateStr));
        if (!existing) {
          const isMorning = index % 2 === 0;
          addSchedule({
            title: `Focus Sprint: ${taskForDay.name}`,
            taskId: taskForDay.taskId,
            startDate: dateStr,
            endDate: dateStr,
            date: dateStr,
            time: isMorning ? '09:30' : '14:30',
            endTime: isMorning ? '11:30' : '16:00',
            aiSuggest: `AI Optimal Placement: ${isMorning ? 'Peak Morning Cognitive Window' : 'Afternoon Execution Block'} for ${taskForDay.priority.toUpperCase()} priority item.`,
            status: 'scheduled',
            loopReminder: true,
            loopIntervalMinutes: 10
          });
          scheduledCount++;
        }
      }
    });

    if (scheduledCount > 0) {
      showToast(`Kaizen AI auto-scheduled ${scheduledCount} focus sprints across your date range!`, 'gold');
      try {
        confetti({ particleCount: 70, spread: 75, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#FCF9F3'] });
      } catch (e) {}
    } else {
      showToast("Tasks are already scheduled across this horizon.", "info");
    }
  };

  // Find currently active slot (Happening Right Now)
  const todaySchedules = schedules.filter(s => isScheduleInRange(s, today, today));
  const activeNowSlot = todaySchedules.find(s => {
    if (s.status === 'completed') return false;
    if (!s.time || !s.endTime) return false;
    return currentTimeStr >= s.time && currentTimeStr <= s.endTime;
  });

  // Next upcoming slot today
  const nextUpcomingSlot = !activeNowSlot ? todaySchedules
    .filter(s => s.status !== 'completed' && s.time && s.time > currentTimeStr)
    .sort((a, b) => a.time.localeCompare(b.time))[0] : null;

  // Calculate dates in range
  const datesArray = getDateRangeArray(rangeStart, rangeEnd);

  // Group schedules by day for matrix & stats
  const schedulesByDay = datesArray.map(dateStr => {
    const daySlots = schedules
      .filter(s => isScheduleInRange(s, dateStr, dateStr))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    let totalMinutes = 0;
    daySlots.forEach(slot => {
      if (slot.time && slot.endTime) {
        const [sh, sm] = slot.time.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);
        const diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff > 0) totalMinutes += diff;
      }
    });

    const completedSlots = daySlots.filter(s => s.status === 'completed').length;

    return {
      date: dateStr,
      slots: daySlots,
      totalHours: (totalMinutes / 60).toFixed(1),
      completedCount: completedSlots,
      totalCount: daySlots.length
    };
  });

  // Range totals
  const totalSlotsInRange = schedulesByDay.reduce((acc, d) => acc + d.totalCount, 0);
  const totalCompletedInRange = schedulesByDay.reduce((acc, d) => acc + d.completedCount, 0);
  const rangeCompletionRate = totalSlotsInRange > 0 ? Math.round((totalCompletedInRange / totalSlotsInRange) * 100) : 0;

  // Selected Day Slots for Timeline Grid
  const selectedDayGroup = schedulesByDay.find(d => d.date === selectedDay) || {
    date: selectedDay,
    slots: schedules.filter(s => isScheduleInRange(s, selectedDay, selectedDay)).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    totalHours: '0.0',
    completedCount: 0,
    totalCount: 0
  };

  // Filtered schedules for agenda view
  const filteredAgendaSlots = schedules.filter(s => {
    const inRange = isScheduleInRange(s, rangeStart, rangeEnd);
    if (!inRange) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchTask = s.taskId && s.taskId.toLowerCase().includes(q);
      const matchAi = s.aiSuggest && s.aiSuggest.toLowerCase().includes(q);
      if (!matchTitle && !matchTask && !matchAi) return false;
    }
    return true;
  }).sort((a, b) => {
    const dComp = (a.startDate || a.date || '').localeCompare(b.startDate || b.date || '');
    if (dComp !== 0) return dComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Screen Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] via-[#F8F3EA] to-[#F5EFEB] p-5 sm:p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <CalendarDays className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Personal Daily Planner & Time-Blocking</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3E8CB] text-[#7A5C24] px-2.5 py-0.5 rounded-full border border-[#DFCA95]">
              Circadian Flow
            </span>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            Organize personal deep work, study, habits, and daily life routines into clear time blocks. Track active tasks in real-time with recurring 10-minute drop sound reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              playDropSound();
              showToast('Drop sound preview played (Water ripple synthesized chime)');
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 active:scale-95"
            title="Listen to synthesized drop sound alert"
          >
            <Droplets className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Test Drop Chime</span>
          </button>

          <button
            onClick={handleAutoScheduleAi}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 active:scale-95"
            title="Auto-place uncompleted tasks into optimal circadian windows"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>AI Auto-Plan</span>
          </button>

          <button
            onClick={() => handleOpenCreateSlot({ targetDate: selectedDay })}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Time Slot</span>
          </button>
        </div>
      </div>

      {/* HAPPENING RIGHT NOW / NEXT UP BANNER */}
      {activeNowSlot ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FCF9F3] via-amber-50/70 to-emerald-50/60 border-2 border-[#C5A059] p-5 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DFCA95] to-[#C5A059] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Play className="w-6 h-6 fill-white ml-0.5 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    Happening Right Now
                  </span>
                  <span className="text-xs font-bold text-[#9E7D3B] font-mono bg-white px-2 py-0.5 rounded-md border border-[#DFCA95]/40">
                    {activeNowSlot.time} – {activeNowSlot.endTime}
                  </span>
                  {activeNowSlot.loopReminder && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Droplets className="w-2.5 h-2.5 text-amber-600" />
                      10m Loop Alert Active
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {activeNowSlot.title}
                </h3>

                {activeNowSlot.aiSuggest && (
                  <p className="text-xs text-[#7A5C24] mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span>{activeNowSlot.aiSuggest}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Banner Controls */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
              <button
                onClick={() => trigger10MinLoopAlert(activeNowSlot, `In-progress slot: "${activeNowSlot.title}"`)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 transition flex items-center gap-1"
                title="Play 10m drop chime now"
              >
                <Droplets className="w-3.5 h-3.5 text-amber-600" />
                <span>Drop Chime</span>
              </button>

              <button
                onClick={() => handleExtendSlot(activeNowSlot, 15)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-[#F5EFEB] border border-stone-200 transition flex items-center gap-1"
                title="Extend slot by 15 minutes"
              >
                <FastForward className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>+15m</span>
              </button>

              <button
                onClick={() => handleToggleComplete(activeNowSlot)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 shadow-xs transition flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      ) : nextUpcomingSlot ? (
        <div className="rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#9E7D3B] shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C24] block">
                Next Upcoming Focus Slot Today
              </span>
              <span className="font-serif font-bold text-sm text-stone-900">
                {nextUpcomingSlot.title}
              </span>
              <span className="text-xs text-stone-500 ml-2 font-mono">
                starts at {nextUpcomingSlot.time} (until {nextUpcomingSlot.endTime})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                updateSchedule(nextUpcomingSlot.scheduleId, { time: currentTimeStr });
                showToast(`Started "${nextUpcomingSlot.title}" early!`, 'gold');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-[#9E7D3B] transition"
            >
              Start Early Now
            </button>
          </div>
        </div>
      ) : null}

      {/* Circadian Energy Rhythm Flow Guide */}
      <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-serif font-bold text-sm text-stone-900">Circadian Focus & Energy Zones</h3>
            <span className="text-[10px] text-stone-500 font-medium">Click any window to schedule</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            Current Time: <strong>{currentTimeStr}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {CIRCADIAN_ZONES.map(zone => {
            const Icon = zone.icon;
            return (
              <button
                key={zone.id}
                onClick={() => handleOpenCreateSlot({
                  targetDate: selectedDay,
                  startTime: zone.startTime,
                  endTime: zone.endTime,
                  title: `${zone.label}: `
                })}
                className={`text-left p-3 rounded-2xl border bg-gradient-to-b ${zone.color} hover:brightness-95 transition-all group active:scale-98`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold block">{zone.label}</span>
                  <Icon className="w-4 h-4 opacity-75 group-hover:scale-110 transition" />
                </div>
                <span className="text-[10px] font-mono font-semibold block opacity-80 mb-1">
                  {zone.timeRange}
                </span>
                <p className="text-[10px] opacity-75 leading-tight line-clamp-2">
                  {zone.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Horizon & View Mode Toolbar */}
      <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Row 1: View Mode Switcher + Quick Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5EFEB]">
          {/* View Modes */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5EFEB] rounded-2xl self-start">
            {[
              { id: 'timeline', label: 'Day Timeline Grid' },
              { id: 'matrix', label: 'Multi-Day Horizon' },
              { id: 'agenda', label: 'Agenda Stream' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  viewMode === m.id
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Quick Date Stepper (< Previous | Today | Next >) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleShiftRange('prev')}
              className="p-1.5 rounded-xl border border-stone-200 hover:bg-[#F5EFEB] text-stone-600 transition"
              title="Shift Range Backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSelectPreset('today')}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#F5EFEB] text-[#7A5C24] hover:bg-[#EFE7DD] transition"
            >
              Today ({formatDateShort(today)})
            </button>
            <button
              onClick={() => handleShiftRange('next')}
              className="p-1.5 rounded-xl border border-stone-200 hover:bg-[#F5EFEB] text-stone-600 transition"
              title="Shift Range Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Date Range Pickers & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Preset Buttons */}
          <div className="md:col-span-7 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mr-1">
              Horizon:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'next_3_days', label: '3 Days' },
              { id: 'this_week', label: 'This Week' },
              { id: 'next_14_days', label: '14 Days' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                  rangePreset === p.id
                    ? 'bg-[#C5A059] text-white shadow-2xs font-semibold'
                    : 'bg-[#F5EFEB] text-stone-700 hover:bg-[#EFE7DD]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date Range Inputs */}
          <div className="md:col-span-5 flex items-center justify-between sm:justify-end gap-2 text-xs bg-[#FCF9F3] p-2 rounded-2xl border border-[#DFCA95]/40">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-stone-500 uppercase">From:</span>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => {
                  setRangeStart(e.target.value);
                  if (rangeEnd < e.target.value) setRangeEnd(e.target.value);
                  setRangePreset('custom');
                }}
                className="px-2 py-0.5 text-xs rounded-lg border border-stone-200 bg-white font-medium text-stone-800"
              />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-stone-500 uppercase">To:</span>
              <input
                type="date"
                min={rangeStart}
                value={rangeEnd}
                onChange={(e) => {
                  setRangeEnd(e.target.value);
                  setRangePreset('custom');
                }}
                className="px-2 py-0.5 text-xs rounded-lg border border-stone-200 bg-white font-medium text-stone-800"
              />
            </div>
          </div>
        </div>

        {/* Days Tab Bar when in Timeline View */}
        {viewMode === 'timeline' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[#F5EFEB] scrollbar-thin">
            <span className="text-xs font-bold text-stone-600 shrink-0">Viewing Day:</span>
            {datesArray.map(dateStr => {
              const isSelected = dateStr === selectedDay;
              const isToday = dateStr === today;
              const dayGroup = schedulesByDay.find(d => d.date === dateStr);
              const count = dayGroup ? dayGroup.totalCount : 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white shadow-xs'
                      : 'bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700'
                  }`}
                >
                  <span>{formatDateShort(dateStr)}</span>
                  {isToday && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                      isSelected ? 'bg-white text-[#9E7D3B]' : 'bg-[#C5A059] text-white'
                    }`}>
                      Today
                    </span>
                  )}
                  {count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW 1: HOURLY TIMELINE TIME-BLOCKING GRID */}
      {viewMode === 'timeline' && (
        <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#9E7D3B]" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                {formatDateFull(selectedDay)}
              </h3>
              {selectedDay === today && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
              <span className="text-xs text-stone-500 font-medium">
                • {selectedDayGroup.totalCount} slots planned ({selectedDayGroup.totalHours} hrs)
              </span>
            </div>

            <button
              onClick={() => handleOpenCreateSlot({ targetDate: selectedDay })}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-[#9E7D3B] text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Slot</span>
            </button>
          </div>

          {/* Timeline Grid (06:00 to 22:00) */}
          <div className="divide-y divide-stone-100">
            {TIMELINE_HOURS.map(hourStr => {
              const hourNum = parseInt(hourStr.split(':')[0], 10);
              const nextHourStr = `${(hourNum + 1).toString().padStart(2, '0')}:00`;

              // Find schedules that fall in or overlap with this hour
              const matchingSlots = selectedDayGroup.slots.filter(s => {
                if (!s.time) return false;
                const slotH = parseInt(s.time.split(':')[0], 10);
                return slotH === hourNum;
              });

              // Check if current real-time hour is this hour
              const isCurrentHour = selectedDay === today && parseInt(currentTimeStr.split(':')[0], 10) === hourNum;

              return (
                <div
                  key={hourStr}
                  className={`group relative flex items-start gap-3 py-2.5 px-2 rounded-xl transition ${
                    isCurrentHour ? 'bg-amber-50/40' : 'hover:bg-stone-50/60'
                  }`}
                >
                  {/* Hour Label */}
                  <div className="w-16 shrink-0 text-right pr-2 pt-1">
                    <span className="text-xs font-bold font-mono text-stone-500 group-hover:text-stone-900">
                      {hourStr}
                    </span>
                  </div>

                  {/* Hourly Content Box */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {matchingSlots.length > 0 ? (
                      matchingSlots.map(sch => {
                        const linkedTask = tasks.find(t => t.taskId === sch.taskId);
                        const isCompleted = sch.status === 'completed';

                        return (
                          <div
                            key={sch.scheduleId}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isCompleted
                                ? 'bg-stone-50/70 border-stone-200 opacity-65'
                                : 'bg-[#FCF9F3]/70 border-[#DFCA95]/60 hover:border-[#C5A059] shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleComplete(sch)}
                                className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-stone-300 hover:border-[#C5A059] bg-white'
                                }`}
                                title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                              >
                                {isCompleted && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold text-[#9E7D3B] bg-white px-1.5 py-0.5 rounded border border-[#DFCA95]/40">
                                    {sch.time} - {sch.endTime}
                                  </span>

                                  <h4 className={`font-serif font-bold text-sm ${
                                    isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                                  }`}>
                                    {sch.title}
                                  </h4>

                                  {linkedTask && (
                                    <span className="text-[10px] bg-[#F3E8CB] text-[#7A5C24] font-semibold px-2 py-0.5 rounded-full border border-[#DFCA95]/40">
                                      Task: {linkedTask.taskId} ({linkedTask.priority})
                                    </span>
                                  )}

                                  <button
                                    onClick={() => toggleScheduleLoopReminder(sch.scheduleId)}
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                                      sch.loopReminder !== false
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : 'bg-stone-100 text-stone-500 border-stone-200'
                                    }`}
                                    title="Toggle 10-minute water drop chime reminder"
                                  >
                                    <Repeat className="w-2.5 h-2.5" />
                                    <span>{sch.loopReminder !== false ? '10m Loop: Active' : '10m Loop: Off'}</span>
                                  </button>
                                </div>

                                {sch.aiSuggest && (
                                  <p className="text-xs text-[#7A5C24] flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-[#C5A059] shrink-0" />
                                    <span>{sch.aiSuggest}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Slot Quick Operations */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => trigger10MinLoopAlert(sch, `Focus block: "${sch.title}"`)}
                                className="p-1.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                                title="Play Drop Sound & Alert"
                              >
                                <Droplets className="w-3.5 h-3.5 text-amber-600" />
                              </button>

                              <button
                                onClick={() => handleExtendSlot(sch, 30)}
                                className="px-2 py-1 rounded-xl text-[11px] font-semibold text-stone-600 bg-white hover:bg-[#F5EFEB] border border-stone-200 transition"
                                title="Extend duration by 30 mins"
                              >
                                +30m
                              </button>

                              <button
                                onClick={() => handleDuplicateToTomorrow(sch)}
                                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-[#F5EFEB] border border-transparent hover:border-stone-200 transition"
                                title="Duplicate to Tomorrow"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(sch)}
                                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
                                title="Edit Slot"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => deleteSchedule(sch.scheduleId)}
                                className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        onClick={() => handleOpenCreateSlot({
                          targetDate: selectedDay,
                          startTime: hourStr,
                          endTime: nextHourStr
                        })}
                        className="py-1.5 px-3 rounded-xl border border-transparent hover:border-dashed hover:border-[#DFCA95] hover:bg-[#FCF9F3] cursor-pointer text-stone-400 hover:text-[#9E7D3B] text-xs transition flex items-center justify-between"
                      >
                        <span className="text-[11px] font-medium opacity-60 group-hover:opacity-100">
                          Empty slot — Click to schedule focus session
                        </span>
                        <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MULTI-DAY HORIZON MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedulesByDay.map(dayGroup => {
              const isCurrentDay = dayGroup.date === today;
              const hasSlots = dayGroup.slots.length > 0;

              return (
                <div
                  key={dayGroup.date}
                  className={`rounded-3xl border transition-all flex flex-col ${
                    isCurrentDay
                      ? 'bg-white border-[#C5A059] shadow-md ring-1 ring-[#C5A059]/30'
                      : 'bg-white border-[#DFCA95]/60 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-4 rounded-t-3xl border-b flex items-center justify-between ${
                    isCurrentDay ? 'bg-[#FCF9F3] border-[#DFCA95]' : 'bg-[#FCF9F3]/60 border-[#F5EFEB]'
                  }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-sm text-stone-900">
                          {formatDateShort(dayGroup.date)}
                        </span>
                        {isCurrentDay && (
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {dayGroup.totalCount} slots • {dayGroup.totalHours} hrs
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenCreateSlot({ targetDate: dayGroup.date })}
                      className="p-1.5 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-[#9E7D3B] transition"
                      title="Add slot for this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Slots */}
                  <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[360px]">
                    {hasSlots ? (
                      dayGroup.slots.map(sch => {
                        const isCompleted = sch.status === 'completed';
                        return (
                          <div
                            key={sch.scheduleId}
                            className={`p-2.5 rounded-xl border text-xs transition ${
                              isCompleted
                                ? 'bg-stone-50 border-stone-200 opacity-60'
                                : 'bg-[#FCF9F3]/60 border-[#DFCA95]/40 hover:border-[#C5A059]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="font-mono font-bold text-[10px] text-[#9E7D3B]">
                                {sch.time} - {sch.endTime}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleComplete(sch)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                                  }`}
                                >
                                  {isCompleted && <Check className="w-2.5 h-2.5" />}
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(sch)}
                                  className="text-stone-400 hover:text-stone-700"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <h5 className={`font-medium ${isCompleted ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                              {sch.title}
                            </h5>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-stone-400 text-xs">
                        No slots planned
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: AGENDA STREAM WITH SEARCH */}
      {viewMode === 'agenda' && (
        <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-5 shadow-xs space-y-4">
          {/* Agenda Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5EFEB]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schedule activities or tasks..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:border-[#C5A059] focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Agenda Stream List */}
          <div className="space-y-2.5">
            {filteredAgendaSlots.length > 0 ? (
              filteredAgendaSlots.map(sch => {
                const linkedTask = tasks.find(t => t.taskId === sch.taskId);
                const isCompleted = sch.status === 'completed';

                return (
                  <div
                    key={sch.scheduleId}
                    className={`p-3.5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isCompleted ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-[#DFCA95]/40 hover:border-[#DFCA95]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-[120px] p-2 rounded-xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-center shrink-0">
                        <span className="text-xs font-bold text-stone-800 block">
                          {formatDateShort(sch.startDate || sch.date)}
                        </span>
                        <span className="text-[11px] font-mono text-[#9E7D3B] font-semibold block">
                          {sch.time} - {sch.endTime}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#9E7D3B] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                            {sch.scheduleId}
                          </span>
                          <h4 className={`font-serif font-bold text-sm ${
                            isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}>
                            {sch.title}
                          </h4>
                          {linkedTask && (
                            <span className="text-[10px] bg-[#F3E8CB] text-[#7A5C24] font-semibold px-2 py-0.5 rounded-full border border-[#DFCA95]/40">
                              Task: {linkedTask.taskId}
                            </span>
                          )}
                        </div>
                        {sch.aiSuggest && (
                          <p className="text-xs text-[#7A5C24]">
                            {sch.aiSuggest}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleToggleComplete(sch)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F5EFEB] text-stone-700 hover:bg-[#EFE7DD]'
                        }`}
                      >
                        {isCompleted ? 'Completed ✓' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(sch)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSchedule(sch.scheduleId)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-stone-400 text-xs">
                No schedule activities matching your search or filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE SCHEDULE SLOT */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Schedule Focus Slot</h3>
                <p className="text-[11px] text-stone-500">Configure time block, date span, and AI suggestions</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Connect with Task (Optional)
                </label>
                <select
                  value={formData.taskId}
                  onChange={(e) => handleTaskSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                >
                  <option value="">-- No specific task (Custom activity) --</option>
                  {tasks.map(t => (
                    <option key={t.taskId} value={t.taskId}>
                      [{t.taskId}] {t.name} ({t.priority} priority)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Slot Title / Activity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Work: Finalize client proposal slides"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {/* Date Span */}
              <div className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7A5C24] flex items-center gap-1">
                    <CalendarRange className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Slot Date Span</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24]">
                    {Math.max(1, getDaysDifference(formData.startDate, formData.endDate) + 1)} Day(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          startDate: val,
                          endDate: prev.endDate < val ? val : prev.endDate,
                          date: val
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      min={formData.startDate}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  AI Suggest Attribute (ER Schema field)
                </label>
                <input
                  type="text"
                  value={formData.aiSuggest}
                  onChange={(e) => setFormData({ ...formData, aiSuggest: e.target.value })}
                  placeholder="e.g. AI Suggestion: Aligned with personal focus schedule."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {/* 10-Minute Recurring Reminder Loop */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.loopReminder}
                      onChange={(e) => setFormData({ ...formData, loopReminder: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#DFCA95]"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-700" />
                        <span>10-Minute Loop Reminder & Drop Chime</span>
                      </span>
                      <span className="block text-[10px] text-stone-600">
                        Synthesized water drop sound alert repeats every 10 minutes until slot is completed
                      </span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playDropSound();
                      showToast('Drop chime preview played');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-white border border-amber-300 rounded-lg text-amber-900 font-medium hover:bg-amber-100 flex items-center gap-1 shrink-0"
                  >
                    <Volume2 className="w-3 h-3 text-[#C5A059]" />
                    <span>Test Chime</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition"
                >
                  Save Time Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SCHEDULE */}
      {editingSch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Edit Time Block: {editingSch.scheduleId}</h3>
                <p className="text-[11px] text-stone-500">Update slot date span, times, or status</p>
              </div>
              <button onClick={() => setEditingSch(null)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {/* Date Span */}
              <div className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7A5C24] flex items-center gap-1">
                    <CalendarRange className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Slot Date Span</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24]">
                    {Math.max(1, getDaysDifference(formData.startDate, formData.endDate) + 1)} Day(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          startDate: val,
                          endDate: prev.endDate < val ? val : prev.endDate,
                          date: val
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      min={formData.startDate}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">AI Suggest</label>
                <input
                  type="text"
                  value={formData.aiSuggest}
                  onChange={(e) => setFormData({ ...formData, aiSuggest: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {/* 10-Minute Recurring Reminder Loop */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.loopReminder}
                      onChange={(e) => setFormData({ ...formData, loopReminder: e.target.checked })}
                      className="w-4 h-4 rounded text-[#C5A059] focus:ring-[#DFCA95]"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-700" />
                        <span>10-Minute Loop Reminder & Drop Chime</span>
                      </span>
                      <span className="block text-[10px] text-stone-600">
                        Plays synthesized water drop chime alert every 10 minutes until completed
                      </span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playDropSound();
                      showToast('Drop chime preview played');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-white border border-amber-300 rounded-lg text-amber-900 font-medium hover:bg-amber-100 flex items-center gap-1 shrink-0"
                  >
                    <Volume2 className="w-3 h-3 text-[#C5A059]" />
                    <span>Test Chime</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition"
                >
                  Update Time Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
