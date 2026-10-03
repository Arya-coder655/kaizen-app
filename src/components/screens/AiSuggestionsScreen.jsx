import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Layers,
  Activity,
  Zap
} from 'lucide-react';

export default function AiSuggestionsScreen() {
  const {
    aiSuggestions,
    userBehaviour,
    requestNewAiSuggestion,
    dismissAiSuggestion,
    acceptAiSuggestion,
    tasks
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAi = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      requestNewAiSuggestion();
      setIsRefreshing(false);
    }, 600);
  };

  const highProcrastinationTasks = tasks.filter(t => (t.postponementCount || 0) >= 2);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">AI Suggestions & Intelligence Hub</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 15 & 16: AI Services component analyzes user activities & generates personalized continuous improvement suggestions.
          </p>
        </div>

        <button
          onClick={handleRefreshAi}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Analyze Activity & Generate Suggestions</span>
        </button>
      </div>

      {/* ER Section 19: User Behaviour Analysis Model Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-[#9E7D3B]" />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                User Behaviour Analysis Model (Section 19 ER Entity)
              </h3>
              <p className="text-xs text-stone-500">Synthesized from historical task, habit, and schedule data</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#7A5C24] bg-[#F3E8CB] px-2.5 py-1 rounded-full border border-[#DFCA95]">
            User ID: {userBehaviour.userId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Completion Pattern
            </span>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {userBehaviour.completionPattern}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Routine Pattern
            </span>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {userBehaviour.routinePattern}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Last Preferred Domain
            </span>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {userBehaviour.lastPreferred}
            </p>
            <div className="mt-2 pt-2 border-t border-[#DFCA95]/30 flex items-center justify-between text-[11px]">
              <span className="text-stone-500">Focus Hours:</span>
              <strong className="text-[#9E7D3B]">{userBehaviour.focusHoursThisWeek} hrs</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 18: Procrastination & Priority Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Procrastination Analysis */}
        <div className="p-5 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Procrastination Analysis Engine (Section 18)
            </h3>
          </div>
          <p className="text-xs text-stone-600">
            Maintains postponement counts, suggested alternative times, postponement dates & friction notes.
          </p>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span>Delayed Tasks Monitored:</span>
              <span>{highProcrastinationTasks.length} task(s)</span>
            </div>
            {highProcrastinationTasks.length > 0 ? (
              highProcrastinationTasks.map(t => (
                <div key={t.taskId} className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between font-bold text-stone-900 text-xs">
                    <span>{t.name}</span>
                    <span className="text-amber-800">{t.postponementCount}x delayed</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1">
                    AI Suggested Time: <strong>{t.aiSuggestedTime}</strong>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-stone-500 text-xs">No tasks with severe postponement currently detected.</p>
            )}
          </div>
        </div>

        {/* Smart Task Priority Engine */}
        <div className="p-5 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#9E7D3B]" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Smart Task Priority Architecture (Section 17)
            </h3>
          </div>
          <p className="text-xs text-stone-600">
            Calculates Priority ID, Priority Reason & dynamic schedule updates based on cognitive load.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 space-y-2 text-xs text-stone-700">
            <p className="font-bold text-stone-900">Active Priority Calibration Rule:</p>
            <p className="text-stone-600 leading-relaxed">
              If task deadline &le; 2 days OR postponement &ge; 3, priority escalates to HIGH. Deep cognitive tasks are scheduled into the 08:30 - 11:30 AM golden focus window.
            </p>
            <div className="pt-2 border-t border-[#DFCA95]/30 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Priority Algorithm:</span>
              <strong className="text-[#9E7D3B]">Kaizen Smart-Heuristic v2.4</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Feed (Section 16) */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#C5A059]" />
          <span>Active AI Suggestions ({aiSuggestions.length})</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {aiSuggestions.map(sug => (
            <div
              key={sug.suggestionId}
              className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 hover:border-[#DFCA95] shadow-xs transition space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold text-[#9E7D3B] bg-[#F5EFEB] px-2 py-0.5 rounded">
                    {sug.suggestionId}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]/50">
                    {sug.suggestType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {sug.confidenceScore}% Confidence Score
                  </span>
                </div>

                <span className="text-xs text-stone-400 font-medium">Generated: {sug.generatedDate}</span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-base text-stone-900">{sug.suggestedTask}</h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{sug.reason}</p>
              </div>

              {/* Actionable Steps */}
              {sug.actionableSteps && (
                <div className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A5C24]">
                    AI Recommended Micro-Steps:
                  </p>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {sug.actionableSteps.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9E7D3B] shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Accept or Dismiss */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[#F5EFEB]">
                <button
                  onClick={() => dismissAiSuggestion(sug.suggestionId)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:bg-[#F5EFEB] transition text-center"
                >
                  Dismiss
                </button>

                <button
                  onClick={() => acceptAiSuggestion(sug)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-xs hover:brightness-105 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Accept & Convert to Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {aiSuggestions.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#DFCA95]/50">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No active AI suggestions right now</p>
              <p className="text-xs text-stone-400 mt-1">Click "Analyze Activity & Generate Suggestions" above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
