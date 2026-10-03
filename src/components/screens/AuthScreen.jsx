import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BrainCircuit,
  Flame,
  Mic,
  Calendar,
  X
} from 'lucide-react';

export default function AuthScreen({ initialMode = 'login' }) {
  const { login, register, forgotPassword, users, rememberedEmail, clearRememberedEmail } = useApp();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password drawer/modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResult, setForgotResult] = useState(null);

  // Login form state: auto-fill with remembered email!
  const [loginEmail, setLoginEmail] = useState(() => rememberedEmail || 'alex.vance@kaizen.ai');
  const [loginPassword, setLoginPassword] = useState('');

  // Keep in sync if rememberedEmail changes
  React.useEffect(() => {
    if (rememberedEmail && !loginEmail) {
      setLoginEmail(rememberedEmail);
    }
  }, [rememberedEmail]);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    bio: ''
  });

  // Demo 1-Click Login Helper
  const handleQuickDemoLogin = (role) => {
    setErrorMessage('');
    setSuccessMessage('');
    const targetUser = users.find(u => u.role === role) || users[0];
    setLoginEmail(targetUser.email);
    setLoginPassword(targetUser.password);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(targetUser.email, targetUser.password, true);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed');
      }
    }, 350);
  };

  // Submit Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(loginEmail, loginPassword, rememberMe);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed');
      } else {
        setSuccessMessage(`Authenticated successfully as ${res.user.name}!`);
      }
    }, 400);
  };

  // Submit Register
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = register(registerData);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
      } else {
        setSuccessMessage(`Account created for ${res.user.name}! Redirecting...`);
      }
    }, 500);
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const res = forgotPassword(forgotEmail);
    setForgotResult(res);
  };

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', color: 'bg-stone-200', pct: 0 };
    if (pwd.length < 5) return { label: 'Weak', color: 'bg-red-500', pct: 30 };
    if (pwd.length < 8) return { label: 'Moderate', color: 'bg-amber-500', pct: 65 };
    return { label: 'Strong', color: 'bg-emerald-500', pct: 100 };
  };

  const strength = getPasswordStrength(registerData.password);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1E1B18] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[#DFCA95]/30 to-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-[#DFCA95]/30 to-[#9E7D3B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#DFCA95] shadow-2xl overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: BRAND HERO & KAIZEN PHILOSOPHY (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FBF8F2] via-[#F6EEDF] to-[#FCF9F3] p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#DFCA95]/60 flex flex-col justify-between relative overflow-hidden">
          {/* Watermark kanji */}
          <div className="absolute -bottom-6 -right-6 font-serif font-black text-9xl text-[#DFCA95]/20 pointer-events-none select-none">
            改善
          </div>

          <div className="relative z-10 space-y-6">
            {/* Logo Emblem */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#D4AF37] p-[2px] shadow-sm">
                <div className="w-full h-full bg-[#FCF9F3] rounded-[14px] flex items-center justify-center">
                  <span className="text-[#9E7D3B] font-serif font-black text-xl">改</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-2xl tracking-wider text-stone-900">KAIZEN</h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                    AI 2.4
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">AI-Based Personal Life Assistant</p>
              </div>
            </div>

            {/* Philosophy Description */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
                The Science of Continuous <span className="gold-text-gradient">1% Daily Improvement</span>
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Kaizen unites classical productivity structures with intelligent neural services to conquer procrastination, eliminate daily friction, and automate high-value habits.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-stone-700 bg-white/70 p-2.5 rounded-2xl border border-[#DFCA95]/40 shadow-2xs">
                <BrainCircuit className="w-4 h-4 text-[#9E7D3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Smart Priority & Procrastination Engine:</strong>
                  <span className="text-[11px] text-stone-500 block">Identifies delayed tasks & schedules them during peak focus.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-700 bg-white/70 p-2.5 rounded-2xl border border-[#DFCA95]/40 shadow-2xs">
                <Flame className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Vice Guardrail Architecture:</strong>
                  <span className="text-[11px] text-stone-500 block">Deconstructs triggers and tracks clean abstinence streaks.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-700 bg-white/70 p-2.5 rounded-2xl border border-[#DFCA95]/40 shadow-2xs">
                <Mic className="w-4 h-4 text-[#9E7D3B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Speech-to-Intent Pipeline:</strong>
                  <span className="text-[11px] text-stone-500 block">Speak your mind; Kaizen parses title, urgency & due date.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inspirational Footer Quote */}
          <div className="mt-8 pt-4 border-t border-[#DFCA95]/30 relative z-10 text-[11px] text-stone-500 italic">
            &ldquo;Be not afraid of going slowly, be afraid only of standing still.&rdquo; — Ancient Proverb
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN & SIGN UP FORMS (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Top Quick Demo Action Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Instant One-Click Demo Access:</span>
              </span>
              <span className="text-[10px] text-stone-500">Zero typing required</span>
            </div>

            <div className="flex">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemoLogin('user')}
                className="w-full p-2.5 rounded-xl bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] transition text-left flex items-center gap-3 shadow-2xs group active:scale-98"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Alex Vance"
                  className="w-9 h-9 rounded-lg object-cover border border-[#DFCA95]"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-900 leading-tight group-hover:text-[#9E7D3B]">Alex Vance</p>
                    <span className="text-[10px] font-semibold text-[#7A5C24] bg-[#F3E8CB] px-2 py-0.5 rounded-full">1-Click Auto Login</span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">alex.vance@kaizen.ai &bull; Demo User</p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Mode Tabs */}
          <div className="flex border-b border-[#F5EFEB] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition border-b-2 ${
                mode === 'login'
                  ? 'border-[#C5A059] text-[#7A5C24]'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Sign In (Screen 1)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition border-b-2 ${
                mode === 'signup'
                  ? 'border-[#C5A059] text-[#7A5C24]'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Create Account (Screen 2)
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
              <button onClick={() => setErrorMessage('')} className="text-amber-500 hover:text-amber-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Remembered Email Notification Pill */}
              {rememberedEmail && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95] text-xs animate-fade-in shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#F3E8CB] flex items-center justify-center text-[#9E7D3B] shrink-0 border border-[#DFCA95]/50">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Remembered Login</span>
                      <strong className="text-stone-900 font-medium">{rememberedEmail}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {loginEmail !== rememberedEmail && (
                      <button
                        type="button"
                        onClick={() => setLoginEmail(rememberedEmail)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#DFCA95] text-[11px] font-bold text-[#7A5C24] hover:bg-[#F5EFEB] shadow-2xs transition"
                      >
                        Auto-fill
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        clearRememberedEmail();
                        setLoginEmail('');
                      }}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Clear remembered email on this browser"
                    >
                      Forget
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.vance@kaizen.ai"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setForgotResult(null);
                      setForgotModalOpen(true);
                    }}
                    className="text-xs text-[#9E7D3B] hover:text-[#7A5C24] font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#C5A059] focus:ring-[#C5A059] accent-[#C5A059]"
                  />
                  <span>Remember this email & keep session active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white font-semibold text-xs shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Authenticate & Go With This Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-stone-500">
                New to Kaizen?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#9E7D3B] font-semibold hover:underline"
                >
                  Create an account now
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: SIGN UP / REGISTRATION FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name (ER User Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kenji Tanaka"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address (ER User Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone (ER User Phone)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-8901"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password (ER User Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {registerData.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 bg-stone-200 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color}`} style={{ width: `${strength.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-stone-500 font-semibold">{strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Bio / Vision (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Striving for 1% daily growth"
                  value={registerData.bio}
                  onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white font-semibold text-xs shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration (FR-01)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-stone-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#9E7D3B] font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#9E7D3B]" />
                <h3 className="font-serif font-bold text-base text-stone-900">Credential Recovery</h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Enter your registered Kaizen email address to retrieve your account credentials securely.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex.vance@kaizen.ai"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              {forgotResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs ${
                    forgotResult.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border border-amber-300 text-amber-900'
                  }`}
                >
                  {forgotResult.success ? (
                    <div className="space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Account Verified!</span>
                      </p>
                      <p>{forgotResult.message}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(forgotResult.user.email);
                          setLoginPassword(forgotResult.password);
                          setForgotModalOpen(false);
                        }}
                        className="mt-2 text-[11px] font-bold text-[#9E7D3B] hover:underline block"
                      >
                        Auto-fill into Login form →
                      </button>
                    </div>
                  ) : (
                    <p>{forgotResult.error}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Find Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
