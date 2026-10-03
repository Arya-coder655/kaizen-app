import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Palette,
  Bell,
  Cpu,
  Shield,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  Sliders,
  Moon,
  Volume2
} from 'lucide-react';

export default function SettingsScreen() {
  const { systemSettings, updateSystemSettings, resetAllDataToDefault, showToast } = useApp();

  const [preferences, setPreferences] = useState({
    theme: 'royal-gold',
    focusBlockMinutes: '50',
    morningReviewTime: '07:30',
    eveningReviewTime: '21:30',
    procrastinationSensitivity: '2',
    enableSoundChime: true,
    smartPriorityAuto: true,
    aiModel: 'Kaizen-Neural-v2.4'
  });

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast("Settings and user preferences saved successfully.", "gold");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Application Settings</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 13: Configure personal preferences, AI sensitivity, theme aesthetics & schedule rules.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Theme & Visual Aesthetic (Beige and Gold Theme) */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F5EFEB]">
            <Palette className="w-4 h-4 text-[#9E7D3B]" />
            <h3 className="font-serif font-bold text-base text-stone-900">Beige & Gold Color Scheme</h3>
          </div>

          <p className="text-xs text-stone-600">
            Select the accent palette inspired by mindful luxury and Japanese craftsmanship.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              { id: 'royal-gold', name: 'Imperial Gold', bg: '#FCF9F3', border: '#DFCA95', gold: '#C5A059' },
              { id: 'champagne', name: 'Champagne Silk', bg: '#FDFBF7', border: '#EFE7DD', gold: '#D4AF37' },
              { id: 'sand-bronze', name: 'Warm Sand', bg: '#F5EFEB', border: '#D8C3A5', gold: '#9E7D3B' }
            ].map(pal => (
              <div
                key={pal.id}
                onClick={() => setPreferences({ ...preferences, theme: pal.id })}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition text-center ${
                  preferences.theme === pal.id ? 'border-[#C5A059] shadow-xs' : 'border-stone-200'
                }`}
                style={{ backgroundColor: pal.bg }}
              >
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-2 border border-white shadow-xs"
                  style={{ backgroundColor: pal.gold }}
                />
                <p className="text-xs font-bold text-stone-800">{pal.name}</p>
                {preferences.theme === pal.id && (
                  <span className="text-[10px] text-[#7A5C24] font-semibold flex items-center justify-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: AI & Procrastination Calibration */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F5EFEB]">
            <Cpu className="w-4 h-4 text-[#9E7D3B]" />
            <h3 className="font-serif font-bold text-base text-stone-900">AI Engine Parameters</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Procrastination Intervention Threshold
              </label>
              <select
                value={preferences.procrastinationSensitivity}
                onChange={(e) => setPreferences({ ...preferences, procrastinationSensitivity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              >
                <option value="2">Alert after 2 postponements (Recommended - High Proactivity)</option>
                <option value="3">Alert after 3 postponements (Moderate)</option>
                <option value="4">Alert after 4 postponements (Lenient)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Deep Work Flow Session Target
              </label>
              <select
                value={preferences.focusBlockMinutes}
                onChange={(e) => setPreferences({ ...preferences, focusBlockMinutes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              >
                <option value="25">25 Minutes (Classic Pomodoro)</option>
                <option value="50">50 Minutes (Ultradian Focus)</option>
                <option value="90">90 Minutes (Deep Flow Block)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#FCF9F3] border border-[#DFCA95]/40">
              <div>
                <p className="font-semibold text-stone-800">Auto-Recalculate Smart Priority</p>
                <p className="text-[10px] text-stone-500">Recalculate urgency based on deadline proximity</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.smartPriorityAuto}
                onChange={(e) => setPreferences({ ...preferences, smartPriorityAuto: e.target.checked })}
                className="rounded text-[#C5A059] focus:ring-[#C5A059] accent-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Routine & Daily Schedule Anchors */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F5EFEB]">
            <Sliders className="w-4 h-4 text-[#9E7D3B]" />
            <h3 className="font-serif font-bold text-base text-stone-900">Daily Anchors</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Morning Reflection Time</label>
              <input
                type="time"
                value={preferences.morningReviewTime}
                onChange={(e) => setPreferences({ ...preferences, morningReviewTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Evening Winddown Cutoff</label>
              <input
                type="time"
                value={preferences.eveningReviewTime}
                onChange={(e) => setPreferences({ ...preferences, eveningReviewTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-xs text-stone-600">
            Anchors allow Kaizen to schedule habits and mindful resets at the optimal biological times.
          </div>
        </div>

        {/* Card 4: Factory Reset & Safety Zone */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F5EFEB]">
            <Shield className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-stone-900">Data & Safety Controls</h3>
          </div>

          <p className="text-xs text-stone-600">
            Reset local database to initial factory sample data (re-seeds tasks, habits, schedules, and vices).
          </p>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all data back to the default Kaizen demo dataset?")) {
                resetAllDataToDefault();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-[#9E7D3B]" />
            <span>Reset to Initial Factory Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
