import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseVoiceIntent, executeVoiceIntent, APP_TABS } from '../../utils/voiceAssistantEngine';
import { speechEngine } from '../../utils/speechSynthesis';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Radio,
  FileAudio,
  Calendar,
  AlertCircle,
  Repeat,
  Droplets,
  DollarSign,
  Flame,
  CheckSquare,
  HelpCircle,
  Play,
  RotateCcw,
  FastForward,
  MessageSquare,
  Compass,
  ExternalLink,
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Bell,
  ShieldAlert,
  History,
  BarChart3,
  User,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VoiceTaskScreen() {
  const app = useApp();
  const {
    tasks,
    schedules,
    habits,
    expenses,
    voiceEntries,
    currentUser,
    showToast,
    playDropSound,
    trigger10MinLoopAlert
  } = app;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [parsedResult, setParsedResult] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const handleExecuteCommandRef = useRef(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // single utterance detection
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let full = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            full += piece;
          } else {
            interim += piece;
          }
        }

        const currentSpeech = (full || interim).trim();
        if (full) setTranscript(full);
        setInterimText(interim);

        // If browser marked utterance final, execute immediately!
        if (full && full.trim().length >= 2) {
          const cleanFull = full.trim();
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          try { recognition.stop(); } catch (e) {}

          if (handleExecuteCommandRef.current) {
            handleExecuteCommandRef.current(cleanFull);
          }
          return;
        }

        // Auto-execute if user pauses speaking for 1.1s
        if (currentSpeech.length >= 3) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            try { recognition.stop(); } catch (e) {}
            if (handleExecuteCommandRef.current) {
              handleExecuteCommandRef.current(currentSpeech);
            }
          }, 1100);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition notice:", err.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    }

    setTtsSupported(speechEngine.isSupported());
  }, []);

  // Whenever transcript changes and reaches meaningful length, parse intent preview
  useEffect(() => {
    const textToParse = (transcript || interimText).trim();
    if (textToParse.length >= 2) {
      const parsed = parseVoiceIntent(textToParse, {
        tasks,
        schedules,
        habits,
        expenses,
        currentUser
      });
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  }, [transcript, interimText, tasks, schedules, habits, expenses]);

  const startRecording = () => {
    speechEngine.stop();
    setIsSpeaking(false);
    setTranscript('');
    setInterimText('');
    setExecutionResult(null);
    setRecordingSeconds(0);
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition already active", e);
      }
    }

    timerRef.current = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);
  };

  const stopRecording = (triggerExecute = false) => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (triggerExecute) {
      const pending = (transcript || interimText || '').trim();
      if (pending && handleExecuteCommandRef.current) {
        handleExecuteCommandRef.current(pending);
      }
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    speechEngine.setMuted(next);
    if (next) {
      speechEngine.stop();
      setIsSpeaking(false);
    }
  };

  const handleRateChange = (newRate) => {
    setSpeechRate(newRate);
    speechEngine.setRate(newRate);
    showToast(`Voice speed set to ${newRate}x`, 'info');
  };

  const handleExecuteCommand = (textToExecute) => {
    const text = (textToExecute || transcript || interimText || '').trim();
    if (!text) return;

    stopRecording(false);
    setTranscript(text);
    setInterimText('');

    const parsed = parseVoiceIntent(text, {
      tasks,
      schedules,
      habits,
      expenses,
      currentUser
    });

    // Speak response aloud immediately
    if (!isMuted && parsed.spokenResponse) {
      setIsSpeaking(true);
      speechEngine.speak(
        parsed.spokenResponse,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }

    // Direct Instant Tab Navigation
    if (parsed.actionType === 'navigation') {
      showToast(parsed.spokenResponse, 'gold');
      if (app.setCurrentScreen && parsed.screen) {
        app.setCurrentScreen(parsed.screen);
      }
      return;
    }

    const exec = executeVoiceIntent(parsed, text, app);

    setExecutionResult({
      query: text,
      intent: parsed.intent,
      actionType: parsed.actionType,
      spokenResponse: parsed.spokenResponse,
      displayResponse: parsed.displayResponse || parsed.spokenResponse,
      entity: exec?.entity || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (parsed.actionType === 'task' || parsed.actionType === 'schedule') {
      try {
        confetti({ particleCount: 50, spread: 65, origin: { y: 0.8 }, colors: ['#DFCA95', '#C5A059', '#10B981'] });
      } catch (e) {}
    } else if (parsed.actionType === 'boss_easter_egg') {
      try {
        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#DFCA95', '#C5A059', '#E11D48', '#FF69B4', '#FFD700']
        });
      } catch (e) {}
    }

    showToast(
      parsed.actionType === 'boss_easter_egg' 
        ? "👑 Secret Boss Easter Egg Discovered!" 
        : `Voice AI: ${parsed.spokenResponse.slice(0, 60)}...`, 
      'gold'
    );
  };

  handleExecuteCommandRef.current = handleExecuteCommand;

  const handleReplaySpokenText = (text) => {
    if (!text) return;
    speechEngine.stop();
    setIsSpeaking(true);
    speechEngine.speak(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] via-[#F8F3EA] to-[#F5EFEB] p-5 sm:p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Mic className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Kaizen Smart Voice Assistant</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3E8CB] text-[#7A5C24] px-2.5 py-0.5 rounded-full border border-[#DFCA95]">
              Section 20 • Natural Voice Action Engine
            </span>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            Speak natural voice commands to open any tab (e.g. &ldquo;Open daily&rdquo; or &ldquo;Open task management&rdquo;), create tasks, block focus time in your daily planner, log expenses, track habits, or hear your daily audio briefing.
          </p>
        </div>

        {/* Engine Diagnostics & Mute Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              isMuted
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-[#DFCA95] text-stone-800 hover:bg-[#F5EFEB]'
            }`}
            title="Toggle Voice Output (Spoken replies)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-[#9E7D3B]" />}
            <span>{isMuted ? 'Voice Muted' : 'Voice Active'}</span>
          </button>

          <button
            onClick={() => {
              playDropSound();
              showToast('Synthesized water drop sound alert played');
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] text-stone-800 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            title="Test 10-Minute Loop Drop Sound"
          >
            <Droplets className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Test Drop Sound</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DFCA95] text-stone-700 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
            <span>{speechSupported ? 'Speech API Ready' : 'Neural Typing Fallback'}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Recording Console */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-sm text-center relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#DFCA95]/20 to-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Main Voice Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={isRecording ? () => stopRecording(true) : startRecording}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-100 scale-105'
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#DFCA95] text-white ring-8 ring-amber-100 animate-pulse'
                  : 'bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#D4AF37] text-white hover:scale-105 ring-4 ring-[#DFCA95]/30'
              }`}
              title={isRecording ? "Listening... Click to stop & execute" : "Click to speak with Kaizen"}
            >
              {isRecording ? (
                <MicOff className="w-12 h-12 animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="w-12 h-12 animate-bounce" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              {isRecording
                ? 'Listening to your voice...'
                : isSpeaking
                ? 'Kaizen is speaking to you...'
                : 'Click Microphone and speak your request'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {isRecording
                ? `Recording duration: ${recordingSeconds}s • Tap microphone when finished speaking`
                : 'Try: "Open daily", "Open task management", "Add task review budget tomorrow 45 mins", or "Give me my daily briefing"'}
            </p>
          </div>

          {/* Dynamic Audio Waveform simulation */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1.5 h-10">
              {[35, 75, 100, 60, 30, 85, 95, 45, 90, 65, 30, 80, 50, 95, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-[#C5A059] to-[#9E7D3B] rounded-full animate-bounce"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i * 0.07).toFixed(2)}s`,
                    animationDuration: '0.7s'
                  }}
                />
              ))}
            </div>
          )}

          {/* Live Transcription Box */}
          <div className="text-left space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#9E7D3B]" />
                <span>Live Voice Transcription / Text Input:</span>
              </label>
              {(transcript || interimText) && (
                <button
                  onClick={() => {
                    setTranscript('');
                    setInterimText('');
                    setParsedResult(null);
                  }}
                  className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              rows="3"
              value={transcript || interimText}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words will transcribe here automatically in real-time, or you can type commands directly..."
              className="w-full p-3.5 text-xs rounded-2xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-[#FCF9F3] text-stone-900 leading-relaxed font-medium"
            />

            {(transcript || interimText) && (
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => handleExecuteCommand(transcript || interimText)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white font-semibold text-xs shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Voice Action Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Intent Breakdown Preview (when user is speaking or typing) */}
          {parsedResult && !executionResult && (
            <div className="p-4 rounded-2xl bg-[#FCF9F3] border-2 border-[#DFCA95] text-left space-y-2 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span className="font-serif font-bold text-xs text-stone-900">
                    Detected Intent: {parsedResult.intent}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-white px-2 py-0.5 rounded-full">
                  Action: {parsedResult.actionType.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-stone-700 italic">
                AI Preview: &ldquo;{parsedResult.spokenResponse}&rdquo;
              </p>
            </div>
          )}

          {/* Last Executed Action Result & Audio Spoken Response */}
          {executionResult && (
            <div className={`p-5 rounded-2xl border-2 text-left space-y-3 animate-scale-in ${
              executionResult.actionType === 'boss_easter_egg'
                ? 'bg-gradient-to-r from-[#FFFDF7] via-[#FFF9EE] to-[#FFF1F2] border-[#E11D48]/50 shadow-md ring-2 ring-[#DFCA95]/40'
                : 'bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] border-[#C5A059]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {executionResult.actionType === 'boss_easter_egg' ? (
                    <>
                      <span className="text-xl animate-bounce">👑</span>
                      <span className="font-serif font-bold text-sm text-[#9E1A2F]">
                        Secret Boss Easter Egg Unlocked
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-serif font-bold text-sm text-stone-900">
                        Voice Action Executed Successfully
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    executionResult.actionType === 'boss_easter_egg'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {executionResult.intent}
                  </span>

                  <button
                    onClick={() => handleReplaySpokenText(executionResult.spokenResponse)}
                    className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-[#F5EFEB] transition flex items-center gap-1 text-xs"
                    title="Listen to spoken response again"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#9E7D3B]" />
                    <span className="text-[11px] font-semibold">Replay</span>
                  </button>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed font-semibold ${
                executionResult.actionType === 'boss_easter_egg'
                  ? 'bg-white/90 border-rose-200 text-[#9E1A2F]'
                  : 'bg-white border-[#DFCA95]/40 text-stone-800 font-medium'
              }`}>
                <p>{executionResult.displayResponse || executionResult.spokenResponse}</p>
              </div>

              {executionResult.entity && (
                <div className="text-[11px] text-[#7A5C24] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {executionResult.entity.name}: {executionResult.entity.status || 'Verified'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Categorized One-Tap Voice Presets */}
          <div className="text-left space-y-3 pt-3 border-t border-[#F5EFEB]">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Or Test Instant Voice Actions:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                {
                  title: "Open Daily Planner",
                  category: "Navigation",
                  icon: CalendarDays,
                  cmd: "Open daily"
                },
                {
                  title: "Open Task Management",
                  category: "Navigation",
                  icon: CheckSquare,
                  cmd: "Open task management"
                },
                {
                  title: "Daily Briefing",
                  category: "Status",
                  icon: MessageSquare,
                  cmd: "Give me my daily briefing"
                },
                {
                  title: "High Priority Task",
                  category: "Task",
                  icon: CheckSquare,
                  cmd: "Add task client proposal presentation tomorrow high priority 45 mins"
                },
                {
                  title: "Schedule Deep Work",
                  category: "Planner",
                  icon: Calendar,
                  cmd: "Schedule deep work session tomorrow at 10am for 90 minutes"
                },
                {
                  title: "Open Habit Tracking",
                  category: "Navigation",
                  icon: Flame,
                  cmd: "Open habits"
                },
                {
                  title: "Log Expense",
                  category: "Finance",
                  icon: DollarSign,
                  cmd: "Spent $35 on organic groceries"
                },
                {
                  title: "Open Expense Tracker",
                  category: "Navigation",
                  icon: Wallet,
                  cmd: "Open expenses"
                },
                {
                  title: "AI Coaching",
                  category: "Mindset",
                  icon: Sparkles,
                  cmd: "I am feeling overwhelmed and procrastinating"
                }
              ].map((sample, idx) => {
                const Icon = sample.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(sample.cmd);
                      handleExecuteCommand(sample.cmd);
                    }}
                    className="p-2.5 rounded-xl bg-[#FCF9F3] hover:bg-[#F5EFEB] border border-[#DFCA95]/50 transition text-left group active:scale-98"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#9E7D3B] uppercase tracking-wider">
                        {sample.category}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-[#C5A059] group-hover:scale-110 transition" />
                    </div>
                    <p className="text-xs font-bold text-stone-900 line-clamp-1">{sample.title}</p>
                    <p className="text-[10px] text-stone-500 italic mt-0.5 line-clamp-1">&ldquo;{sample.cmd}&rdquo;</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Tab Navigation Control Center */}
      <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5EFEB]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#9E7D3B]" />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Voice Tab Navigation: Speak Any Tab Name to Switch
              </h3>
              <p className="text-xs text-stone-500">
                Say &ldquo;Open daily&rdquo;, &ldquo;Open task management&rdquo;, or click any tab below to switch instantly with spoken voice confirmation
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3E8CB] text-[#7A5C24] px-2.5 py-0.5 rounded-full border border-[#DFCA95] self-start sm:self-auto">
            Spoken Tab Switching Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'Daily Planner', screen: 'planner', icon: CalendarDays, voiceCmd: 'open daily' },
            { label: 'Task Management', screen: 'tasks', icon: CheckSquare, voiceCmd: 'open task management' },
            { label: 'Dashboard / Home', screen: 'dashboard', icon: LayoutDashboard, voiceCmd: 'open dashboard' },
            { label: 'Habit Tracking', screen: 'habits', icon: Flame, voiceCmd: 'open habits' },
            { label: 'Expense Tracking', screen: 'expenses', icon: Wallet, voiceCmd: 'open expenses' },
            { label: 'Reminders', screen: 'reminders', icon: Bell, voiceCmd: 'open reminders' },
            { label: 'Vice Guardrails', screen: 'vice_tasks', icon: ShieldAlert, voiceCmd: 'open vice tasks' },
            { label: 'Activity History', screen: 'activity_history', icon: History, voiceCmd: 'open activity history' },
            { label: 'AI Suggestions', screen: 'ai_suggestions', icon: Sparkles, voiceCmd: 'open ai suggestions' },
            { label: 'Reports & Analytics', screen: 'reports', icon: BarChart3, voiceCmd: 'open reports' },
            { label: 'User Profile', screen: 'profile', icon: User, voiceCmd: 'open profile' },
            { label: 'Settings', screen: 'settings', icon: Settings, voiceCmd: 'open settings' }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.screen}
                onClick={() => {
                  setTranscript(tab.voiceCmd);
                  handleExecuteCommand(tab.voiceCmd);
                }}
                className="p-3.5 rounded-2xl bg-[#FCF9F3] hover:bg-[#F5EFEB] border border-[#DFCA95]/60 hover:border-[#C5A059] transition flex flex-col justify-between text-left group active:scale-98 shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#DFCA95]/50 flex items-center justify-center text-[#9E7D3B] group-hover:scale-105 transition">
                    <Icon className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#9E7D3B] transition" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-stone-900">{tab.label}</h4>
                  <span className="text-[10px] font-mono text-[#9E7D3B] font-semibold block mt-0.5">
                    &ldquo;{tab.voiceCmd}&rdquo;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Task Entry Historical Entity Store (Section 20 ER Diagram) */}
      <div className="bg-white border border-[#DFCA95]/60 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-[#9E7D3B]" />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Voice Entry History & Audio Records (Section 20 ER Entity)
              </h3>
              <p className="text-xs text-stone-500">
                Maintains Voice ID, Task ID, User ID, Entry Date, Converted Task, and Audio Replay
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {voiceEntries.length} Recorded Entries
          </span>
        </div>

        <div className="space-y-3">
          {voiceEntries.map(v => (
            <div
              key={v.voiceEntryId}
              className="p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-xs space-y-2 hover:border-[#DFCA95] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-[#9E7D3B] bg-white px-2 py-0.5 rounded border border-[#DFCA95]/30">
                    Voice ID: {v.voiceId}
                  </span>
                  <span className="font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                    Linked Task: {v.taskId}
                  </span>
                  <span className="text-[10px] text-stone-400">User: {v.userId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500">{v.entryDate}</span>
                  <button
                    onClick={() => handleReplaySpokenText(`Voice task recorded: ${v.convertedTask}`)}
                    className="p-1 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition flex items-center gap-1 text-[11px]"
                    title="Listen to converted task audio"
                  >
                    <Volume2 className="w-3 h-3 text-[#9E7D3B]" />
                    <span>Play Audio</span>
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <p className="font-bold text-stone-900 text-sm">{v.convertedTask}</p>
                <p className="text-[11px] text-stone-500 italic mt-0.5">
                  Transcription: &ldquo;{v.rawTranscription}&rdquo;
                </p>
              </div>
            </div>
          ))}

          {voiceEntries.length === 0 && (
            <div className="py-8 text-center text-stone-400 text-xs">
              No voice recordings saved yet. Press the microphone button above to record your first voice command.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
