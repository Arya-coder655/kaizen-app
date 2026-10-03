import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { authMode, setAuthMode, login, register, forgotPassword, users, rememberedEmail, clearRememberedEmail } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password sub-state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResult, setForgotResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: rememberedEmail || '',
    phone: '',
    password: '',
    role: 'user',
    bio: ''
  });

  React.useEffect(() => {
    if (rememberedEmail && !formData.email) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
    }
  }, [rememberedEmail]);

  if (!isOpen) return null;

  const handleQuickDemo = (role) => {
    setErrorMessage('');
    setSuccessMessage('');
    const demoUser = users.find(u => u.role === role) || users[0];
    setFormData(prev => ({
      ...prev,
      email: demoUser.email,
      password: demoUser.password
    }));

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(demoUser.email, demoUser.password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed');
      } else {
        onClose();
      }
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (authMode === 'login') {
        const res = login(formData.email, formData.password);
        setIsSubmitting(false);
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed');
        } else {
          onClose();
        }
      } else {
        const res = register(formData);
        setIsSubmitting(false);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed');
        } else {
          onClose();
        }
      }
    }, 350);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const res = forgotPassword(forgotEmail);
    setForgotResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#DFCA95] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-stone-900 relative animate-scale-in max-h-[90vh] flex flex-col">
        {/* Golden top band */}
        <div className="h-2 bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] shrink-0" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8 overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FCF9F3] border border-[#DFCA95] flex items-center justify-center shadow-xs mb-2">
              <span className="text-[#9E7D3B] font-serif font-black text-xl">改</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {showForgot
                ? 'Recover Password'
                : authMode === 'login'
                ? 'Welcome to Kaizen'
                : 'Create Kaizen Account'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {showForgot
                ? 'Retrieve credentials registered with your email'
                : authMode === 'login'
                ? 'Sign in to access your AI Personal Life Assistant'
                : 'Begin your journey of continuous daily 1% improvement'}
            </p>
          </div>

          {/* Quick Demo Login Pills (visible on Login mode) */}
          {authMode === 'login' && !showForgot && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/60">
              <p className="text-[11px] font-semibold text-stone-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Instant 1-Click Demo Login:</span>
              </p>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('user')}
                  className="w-full py-2 px-3 bg-white hover:bg-[#F5EFEB] border border-[#DFCA95] rounded-xl text-xs font-semibold text-stone-800 transition flex items-center justify-center gap-2 shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>Log in as Demo User (Elena Vance)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Switcher (if not in forgot password mode) */}
          {!showForgot && (
            <div className="flex border-b border-[#F5EFEB] mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold tracking-wide transition border-b-2 ${
                  authMode === 'login'
                    ? 'border-[#C5A059] text-[#7A5C24]'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold tracking-wide transition border-b-2 ${
                  authMode === 'signup'
                    ? 'border-[#C5A059] text-[#7A5C24]'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                New Registration
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {showForgot ? (
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.vance@kaizen.ai"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>
              </div>

              {forgotResult && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    forgotResult.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border border-amber-300 text-amber-900'
                  }`}
                >
                  <p>{forgotResult.message || forgotResult.error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white font-semibold text-xs shadow-md transition"
              >
                Find Credentials
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotResult(null);
                }}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-800 pt-1"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            /* LOGIN / REGISTER MAIN FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kenji Vance"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-stone-600">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(formData.email);
                        setShowForgot(true);
                      }}
                      className="text-[11px] text-[#9E7D3B] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>



              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white font-semibold text-xs shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : authMode === 'login'
                    ? 'Authenticate & Sign In'
                    : 'Complete Registration'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Switch toggle message */}
          {!showForgot && (
            <p className="text-center text-xs text-stone-500 mt-4">
              {authMode === 'login' ? "Don't have an account yet?" : "Already registered?"}{' '}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[#9E7D3B] font-semibold hover:underline"
              >
                {authMode === 'login' ? 'Sign up here' : 'Log in here'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
