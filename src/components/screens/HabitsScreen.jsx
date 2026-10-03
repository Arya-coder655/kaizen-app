import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trash2,
  Edit3,
  Award,
  TrendingUp,
  X
} from 'lucide-react';

export default function HabitsScreen() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitDay } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Health & Vitality',
    frequency: 'Daily',
    cue: '',
    reward: ''
  });

  // Generate last 7 days dates array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate()
    };
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Health & Vitality',
      frequency: 'Daily',
      cue: 'Morning anchor or evening transition',
      reward: 'Check off in Kaizen & feel energetic'
    });
    setIsCreateOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    addHabit(formData);
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (h) => {
    setEditingHabit(h);
    setFormData({
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      cue: h.cue || '',
      reward: h.reward || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingHabit) {
      updateHabit(editingHabit.habitId, formData);
      setEditingHabit(null);
    }
  };

  const totalStreakDays = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const averageStrength = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + (h.habitStrength || 0), 0) / habits.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Habit Tracking</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 9: Atomic rituals, 7-day consistency grids, neural habit strength & cue-routine-reward loops.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Habit</span>
        </button>
      </div>

      {/* Habit Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40">
            <Flame className="w-6 h-6 text-[#C5A059]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Cumulative Streaks</p>
            <h3 className="text-2xl font-serif font-bold text-stone-900">{totalStreakDays} Days</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40">
            <Award className="w-6 h-6 text-[#9E7D3B]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Average Habit Strength</p>
            <h3 className="text-2xl font-serif font-bold text-stone-900">{averageStrength}%</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Monitored Routines</p>
            <h3 className="text-2xl font-serif font-bold text-stone-900">{habits.length} Habits</h3>
          </div>
        </div>
      </div>

      {/* Habits List with 7-Day Heatmap Matrix */}
      <div className="space-y-4">
        {habits.map(habit => (
          <div
            key={habit.habitId}
            className="p-5 rounded-3xl bg-white border border-[#DFCA95]/60 hover:border-[#DFCA95] shadow-xs transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold text-[#9E7D3B] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                    {habit.habitId}
                  </span>
                  <h3 className="font-serif font-bold text-base text-stone-900">{habit.name}</h3>
                  <span className="text-[10px] font-semibold bg-[#F5EFEB] text-stone-700 px-2 py-0.5 rounded-full">
                    {habit.category}
                  </span>
                  <span className="text-[10px] font-bold text-[#7A5C24] bg-[#F3E8CB] px-2 py-0.5 rounded-full border border-[#DFCA95]/50 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#9E7D3B]" />
                    <span>{habit.streak} Day Streak</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                  {habit.cue && (
                    <p className="text-[11px]">
                      <strong className="text-stone-800">Cue Anchor:</strong> {habit.cue}
                    </p>
                  )}
                  {habit.reward && (
                    <p className="text-[11px]">
                      <strong className="text-stone-800">Positive Reward:</strong> {habit.reward}
                    </p>
                  )}
                </div>

                {/* Habit Strength Progress bar */}
                <div className="pt-1 flex items-center gap-2 max-w-xs">
                  <span className="text-[10px] font-medium text-stone-500 whitespace-nowrap">
                    Strength: {habit.habitStrength}%
                  </span>
                  <div className="w-full bg-[#EFE7DD] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#DFCA95] to-[#C5A059] h-full rounded-full"
                      style={{ width: `${habit.habitStrength}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Center/Right: 7-Day Checklist Matrix */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F5EFEB] min-w-0">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {last7Days.map(day => {
                    const isChecked = habit.completedDates.includes(day.dateStr);

                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => toggleHabitDay(habit.habitId, day.dateStr)}
                        className={`w-9 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center transition border ${
                          isChecked
                            ? 'bg-[#C5A059] border-[#9E7D3B] text-white shadow-xs'
                            : 'bg-[#FCF9F3] border-[#DFCA95]/50 text-stone-600 hover:bg-[#F5EFEB]'
                        }`}
                        title={`${day.dateStr}: Click to toggle`}
                      >
                        <span className="text-[9px] font-medium uppercase opacity-80">{day.dayName}</span>
                        <span className="text-xs font-bold">{day.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Edit / Delete actions */}
                <div className="flex items-center justify-end gap-1 pl-0 sm:pl-2 sm:border-l border-[#F5EFEB]">
                  <button
                    onClick={() => handleOpenEdit(habit)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.habitId)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Habit */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add Daily Habit</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages of non-fiction book"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Health & Vitality">Health & Vitality</option>
                    <option value="Knowledge & Growth">Knowledge & Growth</option>
                    <option value="Sleep Architecture">Sleep Architecture</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Focus & Work">Focus & Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Cue Anchor (When/Where does this happen?)</label>
                <input
                  type="text"
                  placeholder="e.g. Right after pouring my morning coffee"
                  value={formData.cue}
                  onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Reward (How do you feel good immediately?)</label>
                <input
                  type="text"
                  placeholder="e.g. Savor a peaceful moment in sunlight"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
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
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Start Tracking Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Habit */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">Edit Habit: {editingHabit.name}</h3>
              <button onClick={() => setEditingHabit(null)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Habit Name</label>
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
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Health & Vitality">Health & Vitality</option>
                    <option value="Knowledge & Growth">Knowledge & Growth</option>
                    <option value="Sleep Architecture">Sleep Architecture</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Focus & Work">Focus & Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Cue Anchor</label>
                <input
                  type="text"
                  value={formData.cue}
                  onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Reward</label>
                <input
                  type="text"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Update Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
