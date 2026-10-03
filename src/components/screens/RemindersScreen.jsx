import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Plus,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

export default function RemindersScreen() {
  const { reminders, addReminder, updateReminder, deleteReminder, showToast } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRem, setEditingRem] = useState(null);
  const [testAlertModal, setTestAlertModal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    urgency: 'normal',
    category: 'Wellness',
    repeat: 'Daily',
    soundEnabled: true
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      description: '',
      dateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      urgency: 'normal',
      category: 'Wellness',
      repeat: 'Daily',
      soundEnabled: true
    });
    setIsCreateOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    addReminder(formData);
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (r) => {
    setEditingRem(r);
    setFormData({
      title: r.title,
      description: r.description || '',
      dateTime: r.dateTime || '',
      urgency: r.urgency,
      category: r.category || 'General',
      repeat: r.repeat || 'None',
      soundEnabled: r.soundEnabled ?? true
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingRem) {
      updateReminder(editingRem.reminderId, formData);
      setEditingRem(null);
    }
  };

  const triggerTestSoundAlert = (r) => {
    setTestAlertModal(r);
    showToast(`🔔 Reminder Alert Triggered: "${r.title}"`, 'gold');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Reminder Management</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 7: Create, schedule, trigger audio alerts & manage notification data stores.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map(rem => {
          const isUrgent = rem.urgency === 'urgent';
          const isCompleted = rem.status === 'completed';

          return (
            <div
              key={rem.reminderId}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-stone-50/70 border-stone-200 opacity-60'
                  : isUrgent
                  ? 'bg-amber-50/30 border-amber-300'
                  : 'bg-white border-[#DFCA95]/60 hover:border-[#DFCA95] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-semibold text-[#9E7D3B] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                    {rem.reminderId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isUrgent ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {rem.urgency}
                    </span>
                    <span className="text-[10px] font-bold bg-[#F3E8CB] text-[#7A5C24] px-2 py-0.5 rounded-full border border-[#DFCA95]/50">
                      {rem.repeat}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">{rem.title}</h3>
                {rem.description && (
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">{rem.description}</p>
                )}

                <div className="mt-3 p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#9E7D3B]" />
                    <span>{new Date(rem.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    {rem.soundEnabled ? (
                      <span className="flex items-center gap-1 text-[#7A5C24]">
                        <Volume2 className="w-3.5 h-3.5" /> Audio Chime
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-stone-400">
                        <VolumeX className="w-3.5 h-3.5" /> Silent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#F5EFEB] flex items-center justify-between gap-2">
                <button
                  onClick={() => triggerTestSoundAlert(rem)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F5EFEB] hover:bg-[#EFE7DD] text-[#7A5C24] transition flex items-center gap-1"
                  title="Simulate Audio & Screen Alert"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Trigger</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateReminder(rem.reminderId, {
                        status: rem.status === 'completed' ? 'upcoming' : 'completed'
                      })
                    }
                    className={`p-1.5 rounded-xl transition ${
                      isCompleted ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={isCompleted ? 'Mark upcoming' : 'Mark completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(rem)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteReminder(rem.reminderId)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Reminder */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add Reminder</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon hydration and posture decompression"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Details & Description</label>
                <textarea
                  rows="2"
                  placeholder="Any extra instructions or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Repeat Cadence</label>
                  <select
                    value={formData.repeat}
                    onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="None">Once Only</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Wellness">Wellness</option>
                    <option value="Work">Work</option>
                    <option value="Finance">Finance</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="soundCheck"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="rounded text-[#C5A059] focus:ring-[#C5A059]"
                />
                <label htmlFor="soundCheck" className="text-xs font-medium text-stone-700">
                  Enable Japanese Golden Temple Chime sound
                </label>
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
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Reminder */}
      {editingRem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Edit Reminder: {editingRem.reminderId}
              </h3>
              <button onClick={() => setEditingRem(null)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Details & Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Repeat Cadence</label>
                  <select
                    value={formData.repeat}
                    onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="None">Once Only</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Wellness">Wellness</option>
                    <option value="Work">Work</option>
                    <option value="Finance">Finance</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="soundCheckEdit"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="rounded text-[#C5A059] focus:ring-[#C5A059]"
                />
                <label htmlFor="soundCheckEdit" className="text-xs font-medium text-stone-700">
                  Enable Japanese Golden Temple Chime sound
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simulated Audio/Visual Trigger Alert */}
      {testAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#DFCA95] rounded-3xl max-w-sm w-full p-5 sm:p-6 text-center shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#9E7D3B] to-[#D4AF37] p-1 flex items-center justify-center shadow-md animate-bounce">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <Bell className="w-7 h-7 text-[#9E7D3B]" />
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
              Kaizen Sound Chime Alert
            </span>

            <h3 className="font-serif font-bold text-lg text-stone-900 mt-2">{testAlertModal.title}</h3>
            <p className="text-xs text-stone-600 mt-1">{testAlertModal.description || 'Time to refocus and execute.'}</p>

            <div className="mt-4 p-2 rounded-xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-stone-500 text-[11px]">
              Scheduled for: {new Date(testAlertModal.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <button
              onClick={() => setTestAlertModal(null)}
              className="mt-5 w-full py-2 px-4 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-md transition"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
