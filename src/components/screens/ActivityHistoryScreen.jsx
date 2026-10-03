import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Mic,
  Sparkles,
  Wallet,
  Clock,
  Filter,
  Brain,
  Trash2
} from 'lucide-react';

export default function ActivityHistoryScreen() {
  const { activities, userBehaviour } = useApp();
  const [filterType, setFilterType] = useState('all');

  const filteredActivities = activities.filter(act => {
    if (filterType === 'all') return true;
    if (filterType === 'tasks') return act.actionType.startsWith('task');
    if (filterType === 'vices') return act.actionType.startsWith('vice');
    if (filterType === 'habits') return act.actionType.startsWith('habit');
    if (filterType === 'ai') return act.actionType.startsWith('ai') || act.actionType === 'voice_entry';
    if (filterType === 'expenses') return act.actionType.startsWith('expense');
    return true;
  });

  const getActionIcon = (type) => {
    if (type.startsWith('task')) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (type.startsWith('vice')) return <ShieldAlert className="w-4 h-4 text-amber-700" />;
    if (type.startsWith('habit')) return <Flame className="w-4 h-4 text-[#9E7D3B]" />;
    if (type === 'voice_entry') return <Mic className="w-4 h-4 text-[#C5A059]" />;
    if (type.startsWith('ai')) return <Sparkles className="w-4 h-4 text-[#C5A059]" />;
    if (type.startsWith('expense')) return <Wallet className="w-4 h-4 text-blue-600" />;
    return <Clock className="w-4 h-4 text-stone-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Activity History</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 11: Real-time chronological audit trail feeding into the AI User Behaviour Analysis model.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full min-w-0">
          {['all', 'tasks', 'vices', 'habits', 'ai', 'expenses'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap shrink-0 ${
                filterType === type
                  ? 'bg-[#C5A059] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F5EFEB] text-stone-700 border border-[#DFCA95]/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Connection with ER Model: User Behaviour Analysis */}
      <div className="p-5 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40 shrink-0">
            <Brain className="w-6 h-6 text-[#C5A059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-stone-900">
                User Behaviour Analysis Linkage (ER Entity)
              </h3>
              <span className="text-[10px] bg-[#F3E8CB] text-[#7A5C24] font-bold px-2 py-0.5 rounded-full border border-[#DFCA95]/50">
                Real-Time Synthesis
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Every activity logged below recalculates your <strong>Routine Pattern</strong>, <strong>Peak Velocity Time (08:30 - 11:30 AM)</strong>, and <strong>Procrastination Threshold</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider block">Productivity Score</span>
            <span className="text-2xl font-serif font-black text-[#9E7D3B]">86 / 100</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="relative border-l-2 border-[#DFCA95]/50 ml-2 sm:ml-4 space-y-6 my-2">
          {filteredActivities.map(act => (
            <div key={act.activityId} className="relative pl-4 sm:pl-6 group">
              {/* Bullet icon */}
              <div className="absolute -left-[14px] sm:-left-[17px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FCF9F3] border-2 border-[#DFCA95] flex items-center justify-center shadow-xs group-hover:scale-110 transition">
                {getActionIcon(act.actionType)}
              </div>

              {/* Card content */}
              <div className="p-4 rounded-2xl bg-[#FCF9F3]/60 border border-[#DFCA95]/40 hover:bg-[#FCF9F3] transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-[#9E7D3B] bg-white px-1.5 py-0.5 rounded border border-[#DFCA95]/30">
                      {act.activityId}
                    </span>
                    <span className="text-xs font-bold text-stone-900 capitalize">
                      {act.actionType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#9E7D3B]" />
                    {act.timestamp}
                  </span>
                </div>

                <p className="text-xs text-stone-700 mt-1 leading-relaxed">{act.description}</p>

                {act.metadata && Object.keys(act.metadata).length > 0 && (
                  <div className="mt-2 text-[10px] text-stone-500 font-mono bg-white/80 p-1.5 rounded-lg border border-[#DFCA95]/30 block max-w-full overflow-x-auto">
                    Metadata: {JSON.stringify(act.metadata)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="pl-6 py-6 text-stone-400 text-xs">
              No activity logs recorded under this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
