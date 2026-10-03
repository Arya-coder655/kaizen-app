import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Plus,
  Flame,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Sparkles,
  Trash2,
  Edit3,
  HeartHandshake,
  DollarSign,
  X,
  TrendingUp
} from 'lucide-react';

export default function ViceTasksScreen() {
  const {
    viceTasks,
    addViceTask,
    updateViceTask,
    deleteViceTask,
    logUrgeResisted,
    resetViceStreak
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVice, setEditingVice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    replacementAction: '',
    severity: 'medium',
    costSavedPerWeek: '$25',
    notes: ''
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      trigger: '',
      replacementAction: '',
      severity: 'medium',
      costSavedPerWeek: '$20',
      notes: ''
    });
    setIsCreateOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    addViceTask(formData);
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (v) => {
    setEditingVice(v);
    setFormData({
      name: v.name,
      trigger: v.trigger,
      replacementAction: v.replacementAction,
      severity: v.severity,
      costSavedPerWeek: v.costSavedPerWeek || '$0',
      notes: v.notes || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingVice) {
      updateViceTask(editingVice.viceId, formData);
      setEditingVice(null);
    }
  };

  const totalAbstinenceDays = viceTasks.reduce((acc, v) => acc + (v.abstinenceDays || 0), 0);
  const totalUrgesResisted = viceTasks.reduce((acc, v) => acc + (v.urgesLogged || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Vice Task Management</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 6: Eliminate bad habits, identify triggers, build pre-commitment guardrails & track abstinence.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Vice Guardrail</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40">
            <Flame className="w-6 h-6 text-[#C5A059]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Cumulative Clean Days</p>
            <h3 className="text-2xl font-serif font-bold text-stone-900">{totalAbstinenceDays} Days</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Temptation Urges Resisted</p>
            <h3 className="text-2xl font-serif font-bold text-stone-900">{totalUrgesResisted} Times</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40">
            <Sparkles className="w-6 h-6 text-[#9E7D3B]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Protected Habits</p>
            <h3 className="text-2xl font-serif font-bold text-stone-900">{viceTasks.length} Active Vices</h3>
          </div>
        </div>
      </div>

      {/* Vice Task Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {viceTasks.map(vice => (
          <div
            key={vice.viceId}
            className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs hover:border-[#DFCA95] transition space-y-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold text-[#9E7D3B] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                    {vice.viceId}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      vice.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : vice.severity === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {vice.severity} impact
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 mt-1">{vice.name}</h3>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(vice)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteViceTask(vice.viceId)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Streak Counter Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] border border-[#DFCA95]/50 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Clean Streak</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-serif font-black text-[#9E7D3B]">{vice.abstinenceDays}</span>
                  <span className="text-xs font-bold text-stone-600">days without relapse</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-stone-500">
                <p>Best: <strong className="text-stone-800">{vice.bestStreak}d</strong></p>
                <p>Urges logged: <strong className="text-emerald-700">{vice.urgesLogged || 0}</strong></p>
              </div>
            </div>

            {/* Triggers and Replacement Action */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <p className="font-semibold text-stone-600 text-[11px] uppercase tracking-wider mb-0.5">
                  ⚠️ Trigger Environment:
                </p>
                <p className="text-stone-800">{vice.trigger}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FCF9F3] border border-[#DFCA95]/50">
                <p className="font-semibold text-[#7A5C24] text-[11px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Kaizen Replacement Action:</span>
                </p>
                <p className="text-stone-900 font-medium">{vice.replacementAction}</p>
              </div>

              {vice.notes && (
                <p className="text-[11px] text-stone-500 italic px-1">{vice.notes}</p>
              )}
            </div>

            {/* Buttons: Resisted vs Reset */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-2 border-t border-[#F5EFEB]">
              <button
                onClick={() => resetViceStreak(vice.viceId)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition flex items-center justify-center gap-1"
                title="Slip occurred? Reset streak and reflect"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Log Slip & Reset</span>
              </button>

              <button
                onClick={() => logUrgeResisted(vice.viceId)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-bold shadow-xs hover:brightness-105 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resisted Urge (+1 Day)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Vice */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add Vice Guardrail</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Vice / Unwanted Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late-night phone doomscrolling"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Trigger (What sets it off?)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boredom in bed past 11:30 PM"
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Replacement Action (What healthy habit takes its place?)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leave phone in hallway; read 10 pages of book"
                  value={formData.replacementAction}
                  onChange={(e) => setFormData({ ...formData, replacementAction: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Est. Savings / Week</label>
                  <input
                    type="text"
                    placeholder="e.g. $30"
                    value={formData.costSavedPerWeek}
                    onChange={(e) => setFormData({ ...formData, costSavedPerWeek: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Notes & Reflections</label>
                <textarea
                  rows="2"
                  placeholder="Why is curbing this vice vital for your long-term vision?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Save Vice Guardrail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Vice */}
      {editingVice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">Edit Vice: {editingVice.name}</h3>
              <button onClick={() => setEditingVice(null)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Trigger</label>
                <input
                  type="text"
                  required
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Replacement Action</label>
                <input
                  type="text"
                  required
                  value={formData.replacementAction}
                  onChange={(e) => setFormData({ ...formData, replacementAction: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
