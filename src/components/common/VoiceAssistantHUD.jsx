import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseVoiceIntent, executeVoiceIntent } from '../../utils/voiceAssistantEngine';
import { speechEngine } from '../../utils/speechSynthesis';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Play,
  Square,
  Radio,
  Send,
  Calendar,
  DollarSign,
  Flame,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VoiceAssistantHUD({ isOpen, onClose }) {
  const app = useApp();
  const { tasks, schedules, habits, expenses, currentUser, showToast } = app;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += piece;
          } else {
            interim += piece;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          handleProcessCommand(final);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermissionDenied(true);
          showToast("Microphone access denied. You can still type commands directly!", "warning");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    speechEngine.stop();
    setIsSpeaking(false);
    setTranscript('');
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition already active", e);
      }
    } else {
      showToast("Speech recognition is not available in this browser. Try Chrome/Edge or type below.", "warning");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
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

  // Process text command (from speech or typing)
  const handleProcessCommand = (commandText) => {
    const clean = (commandText || transcript).trim();
    if (!clean) return;

    stopListening();

    const parsed = parseVoiceIntent(clean, {
      tasks,
      schedules,
      habits,
      expenses,
      currentUser
    });

    // Play Voice Audio via TTS immediately
    if (!isMuted && parsed.spokenResponse) {
      setIsSpeaking(true);
      speechEngine.speak(
        parsed.spokenResponse,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }

    if (parsed.actionType === 'navigation') {
      if (app.setCurrentScreen && parsed.screen) {
        app.setCurrentScreen(parsed.screen);
      }
      setLastResponse({
        query: clean,
        intent: parsed.intent,
        actionType: parsed.actionType,
        spokenResponse: parsed.spokenResponse,
        entity: { name: `Opened ${parsed.screenLabel || parsed.screen}` },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      showToast(parsed.spokenResponse, 'gold');
      setTimeout(() => {
        onClose();
      }, 1400);
      return;
    }

    const execution = executeVoiceIntent(parsed, clean, app);

    setLastResponse({
      query: clean,
      intent: parsed.intent,
      actionType: parsed.actionType,
      spokenResponse: parsed.spokenResponse,
      displayResponse: parsed.displayResponse || parsed.spokenResponse,
      entity: execution?.entity || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (parsed.actionType === 'task' || parsed.actionType === 'schedule') {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#DFCA95', '#C5A059', '#10B981'] });
      } catch (e) {}
    } else if (parsed.actionType === 'boss_easter_egg') {
      try {
        confetti({
          particleCount: 85,
          spread: 85,
          origin: { y: 0.6 },
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

  const handleReplayAudio = () => {
    if (lastResponse?.spokenResponse) {
      speechEngine.stop();
      setIsSpeaking(true);
      speechEngine.speak(
        lastResponse.spokenResponse,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white border-2 border-[#DFCA95] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#FCF9F3] via-[#F8F3EA] to-[#F5EFEB] border-b border-[#DFCA95]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9E7D3B] to-[#C5A059] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-base text-stone-900">Kaizen Smart Voice Assistant</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full border border-emerald-300">
                  Live Voice
                </span>
              </div>
              <p className="text-[11px] text-stone-500">Continuous voice actions & spoken replies</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Voice Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-[#DFCA95] text-stone-700 hover:bg-[#F5EFEB]'
              }`}
              title={isMuted ? "Voice is Muted (Click to unmute spoken responses)" : "Voice is Active (Click to mute)"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#9E7D3B]" />}
            </button>

            <button
              onClick={() => {
                speechEngine.stop();
                stopListening();
                onClose();
              }}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Assistant Visualizer Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Animated Central Voice Orb */}
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-100 scale-105'
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#DFCA95] text-white ring-8 ring-amber-100 animate-pulse'
                  : 'bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#DFCA95] text-white hover:scale-105 ring-4 ring-[#DFCA95]/30'
              }`}
              title={isListening ? "Listening... Click to stop" : "Click to speak with Kaizen"}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            {/* Status indicator */}
            <div className="mt-3 text-center">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isListening
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : isSpeaking
                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                  : 'bg-[#F5EFEB] text-stone-700'
              }`}>
                {isListening
                  ? 'Listening... Speak naturally'
                  : isSpeaking
                  ? 'Kaizen is speaking aloud...'
                  : 'Tap Microphone & Speak'}
              </span>
            </div>

            {/* Audio Waveform Animation when listening */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 h-8 mt-3">
                {[30, 65, 90, 50, 25, 80, 100, 40, 85, 60, 30, 70, 45].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-[#C5A059] to-[#9E7D3B] rounded-full animate-bounce"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i * 0.08).toFixed(2)}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Live Transcript / Interim Display */}
          {(interimTranscript || transcript) && (
            <div className="p-3.5 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E7D3B] block mb-1">
                You Spoke:
              </span>
              <p className="text-stone-800 font-medium italic">
                &ldquo;{transcript || interimTranscript}&rdquo;
              </p>
            </div>
          )}

          {/* Last Response & Spoken Reply Card */}
          {lastResponse && (
            <div className={`p-4 rounded-2xl border-2 space-y-2.5 animate-scale-in ${
              lastResponse.actionType === 'boss_easter_egg'
                ? 'bg-gradient-to-r from-[#FFFDF7] via-[#FFF8EC] to-[#FFF1F2] border-[#E11D48]/50 shadow-md ring-2 ring-[#DFCA95]/40'
                : 'bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] border-[#DFCA95]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {lastResponse.actionType === 'boss_easter_egg' ? (
                    <>
                      <span className="text-base animate-bounce">👑</span>
                      <span className="font-serif font-bold text-xs text-[#9E1A2F]">
                        Secret Boss Easter Egg Unlocked
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <span className="font-serif font-bold text-xs text-stone-900">
                        Kaizen Spoken Response
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    lastResponse.actionType === 'boss_easter_egg'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-[#F3E8CB] text-[#7A5C24] border-[#DFCA95]'
                  }`}>
                    {lastResponse.intent.replace('_', ' ')}
                  </span>

                  <button
                    onClick={handleReplayAudio}
                    className="p-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-[#F5EFEB] transition"
                    title="Listen to response again"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed font-semibold ${
                lastResponse.actionType === 'boss_easter_egg' ? 'text-[#9E1A2F]' : 'text-stone-800'
              }`}>
                {lastResponse.displayResponse || lastResponse.spokenResponse}
              </p>

              {lastResponse.entity && (
                <div className="pt-2 border-t border-[#DFCA95]/40 flex items-center gap-2 text-[11px] text-[#7A5C24]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">
                    {lastResponse.entity.name}: {lastResponse.entity.status || 'Verified'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Voice Command Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight block">
              Try Saying or Clicking:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Open daily",
                "Open task management",
                "Give me my daily briefing",
                "Open habits",
                "Open expenses",
                "Add task client proposal tomorrow high priority 45 mins",
                "Schedule gym workout at 5pm for 1 hour",
                "Spent $35 on groceries",
                "Mark habit morning run done",
                "I am feeling overwhelmed with work",
                "Set a 10 minute reminder for laundry"
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(sample);
                    handleProcessCommand(sample);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-[#F5EFEB] hover:bg-[#EFE7DD] text-stone-700 border border-[#DFCA95]/40 transition text-left"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Input Fallback Bar */}
        <div className="p-3 bg-[#FCF9F3] border-t border-[#DFCA95]/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCommand();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type voice command here e.g. 'Schedule team sync at 2pm'..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:border-[#C5A059] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!transcript.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-xs hover:brightness-105 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
