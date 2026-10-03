import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Send,
  Sliders,
  Check,
  Droplets,
  Repeat,
  Volume2
} from 'lucide-react';

export default function NotificationsScreen() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    addNotification,
    playDropSound,
    trigger10MinLoopAlert,
    tasks,
    schedules,
    showToast
  } = useApp();

  const [preferences, setPreferences] = useState({
    smartPriority: true,
    procrastinationIntervention: true,
    viceGuardrailAlerts: true,
    dailyMorningBrief: true,
    audioChimes: true,
    loopReminder10Min: true
  });

  const [testTitle, setTestTitle] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testType, setTestType] = useState('loop_reminder');

  const handleSendTestNotification = (e) => {
    e.preventDefault();
    if (!testTitle.trim()) return;
    if (testType === 'loop_reminder') {
      playDropSound();
    }
    addNotification({
      title: testTitle,
      message: testMessage || 'Real-time notification emitted from Kaizen AI Engine.',
      type: testType
    });
    setTestTitle('');
    setTestMessage('');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'loop_reminder':
        return <Droplets className="w-4 h-4 text-amber-600" />;
      case 'ai_insight':
        return <Sparkles className="w-4 h-4 text-[#C5A059]" />;
      case 'vice_warning':
        return <ShieldAlert className="w-4 h-4 text-amber-700" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#9E7D3B]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-[#C5A059] text-white px-2 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500">
            Section 12: Notification store, real-time message feeds, delivery preferences & alert dispatch.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#C5A059]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Notifications Feed */}
        <div className="lg:col-span-2 space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.notificationId}
              onClick={() => markNotificationRead(notif.notificationId)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                !notif.read
                  ? 'bg-white border-[#DFCA95] shadow-xs'
                  : 'bg-stone-50/70 border-stone-200/80 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-sm text-stone-900">{notif.title}</h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#F5EFEB] text-[#7A5C24]">
                        {notif.type.replace('_', ' ')}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed break-words">{notif.message}</p>
                    <p className="text-[10px] text-stone-400 mt-2 font-medium">{notif.createdAt}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.notificationId);
                  }}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#DFCA95]/50">
              <Bell className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">Notification inbox is clear</p>
              <p className="text-xs text-stone-400 mt-1">New alerts will appear here automatically</p>
            </div>
          )}
        </div>

        {/* Right (1 col): Preferences & Dispatch Simulation */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F5EFEB]">
              <Sliders className="w-4 h-4 text-[#9E7D3B]" />
              <h3 className="font-serif font-bold text-base text-stone-900">Notification Channels</h3>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { key: 'smartPriority', label: 'Smart Priority Recalculations', desc: 'Alert when task urgency escalates' },
                { key: 'procrastinationIntervention', label: 'Procrastination Interventions', desc: 'Trigger breakdown on >=2 postponements' },
                { key: 'viceGuardrailAlerts', label: 'Vice Guardrail Prompts', desc: 'Evening alerts during high temptation windows' },
                { key: 'dailyMorningBrief', label: 'Morning Kaizen Briefing', desc: 'Review top 3 focus priorities at 07:30 AM' },
                { key: 'loopReminder10Min', label: '10-Minute Recurring Drop Loop', desc: 'Synthesized water drop audio repeat every 10 min' },
                { key: 'audioChimes', label: 'Audio Bell Chime Simulation', desc: 'Play gentle sound with reminders' }
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-[#FCF9F3] transition">
                  <div>
                    <p className="font-semibold text-stone-800">{item.label}</p>
                    <p className="text-[10px] text-stone-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                    className="mt-1 rounded text-[#C5A059] focus:ring-[#C5A059] accent-[#C5A059]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 10-Minute Recurring Notification Loop Monitor */}
          <div className="bg-gradient-to-br from-[#FCF9F3] to-[#F5EFEB] border border-[#DFCA95] rounded-3xl p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFCA95]/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  <Droplets className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900">10-Minute Loop Monitor</h3>
                  <p className="text-[10px] text-stone-500">Autonomous interval recurring sound alerts</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Running</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#DFCA95]/20">
                <span className="text-stone-600">Loop Cadence:</span>
                <strong className="text-stone-900 font-mono">Every 10 Minutes</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DFCA95]/20">
                <span className="text-stone-600">Audio Engine:</span>
                <span className="font-semibold text-amber-900">Synthesized Water Drop</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#DFCA95]/20">
                <span className="text-stone-600">Active Scheduled Tasks:</span>
                <strong className="text-[#9E7D3B]">
                  {tasks.filter(t => t.loopReminder !== false && t.status !== 'completed').length} Tasks
                </strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-600">Active Planner Slots:</span>
                <strong className="text-[#9E7D3B]">
                  {schedules.filter(s => s.loopReminder !== false && s.status !== 'completed').length} Slots
                </strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playDropSound();
                  showToast('Drop sound preview played (Synthesized Web Audio)');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Test Sound</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  trigger10MinLoopAlert(
                    { name: '10-Minute Loop Live Test' },
                    '10-Minute Recurring Notification Loop: Scheduled focus check-in with water drop audio.'
                  );
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-xs hover:brightness-105 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Trigger Loop Alert</span>
              </button>
            </div>
          </div>

          {/* Simulate New Notification Dispatch */}
          <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#F5EFEB]">
              <Send className="w-4 h-4 text-[#9E7D3B]" />
              <h3 className="font-serif font-bold text-base text-stone-900">Dispatch Test Alert</h3>
            </div>

            <form onSubmit={handleSendTestNotification} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaizen Weekly Reflection Ready"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Message</label>
                <textarea
                  rows="2"
                  placeholder="e.g. You maintained an 86% focus velocity this week..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Category Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                >
                  <option value="loop_reminder">10-Min Loop Reminder (Drop Sound)</option>
                  <option value="ai_insight">AI Insight</option>
                  <option value="reminder">Reminder</option>
                  <option value="vice_warning">Vice Warning</option>
                  <option value="system">System Notification</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-xs hover:brightness-105 transition"
              >
                Send Notification
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
