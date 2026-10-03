import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wallet,
  Printer,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function ReportsScreen() {
  const { tasks, habits, viceTasks, expenses, userBehaviour, showToast } = useApp();
  const [timeRange, setTimeRange] = useState('month'); // 'week' | 'month' | 'quarter'

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const postponedTasks = tasks.filter(t => (t.postponementCount || 0) > 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const avgHabitStrength = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + (h.habitStrength || 0), 0) / habits.length)
    : 0;

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Task ID,Name,Status,Priority,Performance,Postponement Count\n" +
      tasks.map(t => `"${t.taskId}","${t.name}","${t.status}","${t.priority}",${t.performance},${t.postponementCount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kaizen_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("Report exported successfully as CSV.", "gold");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Reports & Analytics</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 14: Comprehensive multi-dimensional productivity synthesis, expense audit & habit trends.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white text-stone-700 font-semibold"
          >
            <option value="week">Past 7 Days</option>
            <option value="month">Current Month</option>
            <option value="quarter">Quarter to Date</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="p-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-700 shadow-2xs transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-[#9E7D3B]" />
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Level Productivity Index Score Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]/40">
                Kaizen Index Score
              </span>
              <span className="text-xs text-stone-400">Continuous 1% compound standard</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Personal Velocity: <span className="gold-text-gradient">Optimal Trajectory</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your overall productivity benchmark sits at <strong>{userBehaviour.productivityScore}/100</strong>. Task initiation friction decreased by 18% over the past 14 days, supported by rigorous morning sunlight anchors and screen curfews.
            </p>
          </div>

          <div className="flex items-center justify-around sm:justify-start gap-4 sm:gap-6 shrink-0 border-t md:border-t-0 md:border-l border-[#F5EFEB] pt-4 md:pt-0 md:pl-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#9E7D3B]">{userBehaviour.productivityScore}</div>
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider">Score</span>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-serif font-black text-stone-800">{completionRate}%</div>
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider">Task Rate</span>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#C5A059]">{avgHabitStrength}%</div>
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider">Habit Index</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Task Completion Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9E7D3B]" />
              <span>Task Status Distribution</span>
            </h3>
            <span className="text-xs font-semibold text-stone-500">{tasks.length} Total</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Completed', count: completedTasks.length, color: 'bg-emerald-500' },
              { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'bg-blue-500' },
              { label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, color: 'bg-[#C5A059]' },
              { label: 'Postponed', count: tasks.filter(t => t.status === 'postponed').length, color: 'bg-amber-500' }
            ].map(item => {
              const pct = tasks.length > 0 ? Math.round((item.count / tasks.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-stone-700">
                    <span>{item.label}</span>
                    <span className="font-bold text-stone-900">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#EFE7DD] h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Procrastination & Avoidance Diagnostics */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Procrastination Analysis Trends</span>
            </h3>
            <span className="text-xs font-semibold text-stone-500">{postponedTasks.length} Postponed</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-3">
            <p className="text-amber-900 font-medium leading-relaxed">
              Kaizen Procrastination Engine observed that tasks exceeding 60 minutes with vague initial instructions experience a <strong>3.4x higher postponement frequency</strong>.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-amber-900">
                <span>Friction Point: High Cognitive Planning</span>
                <span>45% of delays</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-amber-900">
                <span>Friction Point: Afternoon Energy Dip (2:00 PM)</span>
                <span>35% of delays</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-amber-900">
                <span>Friction Point: Administrative / Tedious</span>
                <span>20% of delays</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Habit Consistency Streaks */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#9E7D3B]" />
              <span>Habit Formation Index</span>
            </h3>
            <span className="text-xs font-semibold text-stone-500">Neuro-Plasticity</span>
          </div>

          <div className="space-y-3">
            {habits.map(h => (
              <div key={h.habitId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-800">{h.name}</span>
                  <span className="font-bold text-[#9E7D3B]">{h.streak}d streak ({h.habitStrength}%)</span>
                </div>
                <div className="w-full bg-[#EFE7DD] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#DFCA95] to-[#C5A059] h-full rounded-full"
                    style={{ width: `${h.habitStrength}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Financial Wellness & Outlays */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#9E7D3B]" />
              <span>Expense Distribution</span>
            </h3>
            <span className="text-xs font-bold text-stone-900">${totalExpenses.toFixed(2)} Total</span>
          </div>

          <p className="text-xs text-stone-600">
            Expenses tracked in Kaizen correlate with productivity investments (Compute, ergonomic tools, books).
          </p>

          <div className="space-y-2 pt-2">
            {expenses.map(e => (
              <div
                key={e.expenseId}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FCF9F3] border border-[#DFCA95]/30"
              >
                <div>
                  <p className="font-bold text-stone-800">{e.title}</p>
                  <p className="text-[10px] text-stone-500">{e.category} • {e.date}</p>
                </div>
                <span className="font-serif font-bold text-stone-900">${parseFloat(e.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
