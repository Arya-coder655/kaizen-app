import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Mic,
  Calendar,
  Wallet,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  ChevronRight
} from 'lucide-react';

export default function DashboardScreen() {
  const {
    currentUser,
    tasks,
    schedules,
    habits,
    viceTasks,
    expenses,
    aiSuggestions,
    userBehaviour,
    setCurrentScreen,
    toggleTaskStatus,
    postponeTask,
    logUrgeResisted,
    toggleHabitDay,
    acceptAiSuggestion
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const chronicProcrastinatedTasks = tasks.filter(t => (t.postponementCount || 0) >= 2 && t.status !== 'completed');
  const totalExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const activeStreakHabits = habits.filter(h => h.streak > 0).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Welcome Banner with Japanese Philosophy */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FBF8F2] via-[#F6EEDF] to-[#FCF9F3] border border-[#DFCA95] p-5 sm:p-6 lg:p-8 shadow-sm">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-2 right-6 font-serif font-black text-7xl lg:text-8xl text-[#DFCA95]/20 pointer-events-none select-none hidden sm:block">
          改善
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#DFCA95]/40 text-[#7A5C24] border border-[#DFCA95]">
              Kaizen Personal Life Assistant
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            Welcome back, <span className="gold-text-gradient">{currentUser.name}</span>
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
            "Small daily disciplines repeated with consistency lead to monumental achievements." Kaizen AI has calibrated your peak cognitive slot between 08:30 AM and 11:30 AM.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <button
              onClick={() => setCurrentScreen('voice_task')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Task Input</span>
            </button>

            <button
              onClick={() => setCurrentScreen('ai_suggestions')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold transition flex items-center justify-center gap-2 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Review AI Suggestions ({aiSuggestions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Procrastination Warning Banner if chronic tasks exist */}
      {chronicProcrastinatedTasks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-stone-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-900">Procrastination Alert Triggered</h4>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  {chronicProcrastinatedTasks.length} task(s) delayed &ge; 2 times
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                '{chronicProcrastinatedTasks[0].name}' has been postponed {chronicProcrastinatedTasks[0].postponementCount} times. Kaizen AI suggests breaking it into a 15-minute micro-action.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen('tasks')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shrink-0 transition"
          >
            Review in Tasks →
          </button>
        </div>
      )}

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Task Velocity */}
        <div className="p-5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 shadow-xs hover:border-[#DFCA95] transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Task Performance</span>
            <div className="p-2 rounded-xl bg-[#F5EFEB] text-[#9E7D3B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-stone-900">{completionRate}%</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {completedTasks.length}/{tasks.length} Done
            </span>
          </div>
          <div className="w-full bg-[#EFE7DD] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#DFCA95] to-[#C5A059] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Habits Consistency */}
        <div className="p-5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 shadow-xs hover:border-[#DFCA95] transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Habit Streaks</span>
            <div className="p-2 rounded-xl bg-[#F5EFEB] text-[#9E7D3B]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-stone-900">{activeStreakHabits} Active</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
              Max {Math.max(...habits.map(h => h.streak), 0)}d
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 truncate">
            {habits.find(h => h.streak > 10)?.name || 'Building daily momentum'}
          </p>
        </div>

        {/* Vice Guardrail Strength */}
        <div className="p-5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 shadow-xs hover:border-[#DFCA95] transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Vice Guardrails</span>
            <div className="p-2 rounded-xl bg-[#F5EFEB] text-[#9E7D3B]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-stone-900">
              {viceTasks.reduce((max, v) => Math.max(max, v.abstinenceDays), 0)} Days
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              Clean Streak
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            {viceTasks.length} habits guarded from relapse
          </p>
        </div>

        {/* Expenses Tracking */}
        <div className="p-5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 shadow-xs hover:border-[#DFCA95] transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Expenses Logged</span>
            <div className="p-2 rounded-xl bg-[#F5EFEB] text-[#9E7D3B]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-stone-900">${totalExpenses.toFixed(2)}</span>
            <span className="text-xs font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md">
              {expenses.length} Records
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Budget on track & reconciled
          </p>
        </div>
      </div>

      {/* Two Column Layout: Main Focus & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's High Priority Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks Card */}
          <div className="bg-[#FFFFFF] border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5EFEB]">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Smart Priority Tasks</h3>
                <p className="text-xs text-stone-500">Ranked dynamically by Kaizen Smart Task Priority Engine</p>
              </div>
              <button
                onClick={() => setCurrentScreen('tasks')}
                className="text-xs font-semibold text-[#9E7D3B] hover:text-[#7A5C24] flex items-center gap-1"
              >
                <span>View All ({tasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 4).map(task => {
                const isCompleted = task.status === 'completed';
                const isPostponed = task.status === 'postponed';

                return (
                  <div
                    key={task.taskId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-stone-50/60 border-stone-200 opacity-60'
                        : isPostponed
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-[#FCF9F3] border-[#DFCA95]/60 hover:border-[#DFCA95]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskStatus(task.taskId)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                            isCompleted
                              ? 'bg-[#C5A059] border-[#C5A059] text-white'
                              : 'border-stone-300 hover:border-[#C5A059] bg-white'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-bold ${
                                isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                              }`}
                            >
                              {task.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.postponementCount > 0 && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                                Postponed {task.postponementCount}x
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                            {task.priorityReason || task.notes}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[10px] text-stone-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#9E7D3B]" />
                              {task.startDate && task.dueDate ? `${task.startDate} ➔ ${task.dueDate}` : `Due: ${task.dueDate}`}
                            </span>
                            <span>•</span>
                            <span>Est: {task.estimatedMinutes}m</span>
                            <span>•</span>
                            <span className="text-[#9E7D3B]">AI Slot: {task.aiSuggestedTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isCompleted && (
                          <button
                            onClick={() => postponeTask(task.taskId)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700 border border-[#DFCA95]/40 transition"
                            title="Postpone & let Kaizen AI recalculate"
                          >
                            Postpone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit Check-In Carousel */}
          <div className="bg-[#FFFFFF] border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5EFEB]">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Today's Habit Check-in</h3>
                <p className="text-xs text-stone-500">Atomic habits compounding towards identity transformation</p>
              </div>
              <button
                onClick={() => setCurrentScreen('habits')}
                className="text-xs font-semibold text-[#9E7D3B] hover:text-[#7A5C24] flex items-center gap-1"
              >
                <span>Manage Habits</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map(habit => {
                const isDoneToday = habit.completedDates.includes(todayStr);

                return (
                  <div
                    key={habit.habitId}
                    className="p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{habit.name}</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Streak: <span className="font-bold text-[#9E7D3B]">{habit.streak} days</span> • Strength: {habit.habitStrength}%
                      </p>
                    </div>

                    <button
                      onClick={() => toggleHabitDay(habit.habitId, todayStr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                        isDoneToday
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-[#F5EFEB] text-stone-700 border border-[#DFCA95]'
                      }`}
                    >
                      {isDoneToday ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </>
                      ) : (
                        <span>Mark Done</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Daily Planner & Vice Management */}
        <div className="space-y-6">
          {/* Daily Schedule Timeline Card */}
          <div className="bg-[#FFFFFF] border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5EFEB]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9E7D3B]" />
                <h3 className="font-serif font-bold text-base text-stone-900">Today's Schedule</h3>
              </div>
              <button
                onClick={() => setCurrentScreen('planner')}
                className="text-xs font-semibold text-[#9E7D3B] hover:underline"
              >
                Planner →
              </button>
            </div>

            <div className="space-y-3">
              {schedules.slice(0, 4).map(sch => (
                <div
                  key={sch.scheduleId}
                  className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-left text-xs"
                >
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="font-bold text-[#9E7D3B]">
                      {sch.startDate && sch.endDate && sch.startDate !== sch.endDate ? `${sch.startDate} ➔ ${sch.endDate} • ` : ''}
                      {sch.time} - {sch.endTime}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#F5EFEB] text-stone-700">
                      {sch.status}
                    </span>
                  </div>
                  <p className="font-bold text-stone-800">{sch.title}</p>
                  {sch.aiSuggest && (
                    <p className="text-[10px] text-[#7A5C24] font-medium mt-1 bg-[#F7E7CE]/60 p-1.5 rounded-lg border border-[#DFCA95]/40">
                      ✨ {sch.aiSuggest}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vice Guardrail Quick-Action Card */}
          <div className="bg-[#FFFFFF] border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5EFEB]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#9E7D3B]" />
                <h3 className="font-serif font-bold text-base text-stone-900">Vice Guardrails</h3>
              </div>
              <button
                onClick={() => setCurrentScreen('vice_tasks')}
                className="text-xs font-semibold text-[#9E7D3B] hover:underline"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {viceTasks.map(vice => (
                <div
                  key={vice.viceId}
                  className="p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 truncate max-w-[160px]">{vice.name}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {vice.abstinenceDays}d streak
                    </span>
                  </div>

                  <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                    Trigger: {vice.trigger}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#7A5C24] italic truncate max-w-[140px]">
                      &ldquo;{vice.replacementAction}&rdquo;
                    </span>
                    <button
                      onClick={() => logUrgeResisted(vice.viceId)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#F3E8CB] hover:bg-[#DFCA95] text-[#7A5C24] border border-[#DFCA95] transition shrink-0"
                    >
                      Resisted Urge +1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Suggestion Card */}
          {aiSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-[#FBF8F2] to-[#F5EFEB] border border-[#DFCA95] rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-[#9E7D3B]" />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Top AI Recommendation</h4>
              </div>
              <p className="text-xs font-bold text-stone-800">{aiSuggestions[0].suggestedTask}</p>
              <p className="text-[11px] text-stone-600 mt-1">{aiSuggestions[0].reason}</p>

              <button
                onClick={() => acceptAiSuggestion(aiSuggestions[0])}
                className="mt-3 w-full py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs transition"
              >
                Apply to My Schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
