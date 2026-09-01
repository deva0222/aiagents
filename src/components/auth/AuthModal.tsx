import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Lock, User, Phone, Building, ArrowRight, 
  Bot, CheckCircle2, Shield, Smartphone, KeyRound 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveServiceType } from '../../utils/serviceMapping';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';

export const AuthModal: React.FC = () => {
  const { authModal, closeAuthModal, login } = useAuth();
  const { isOpen, options } = authModal;

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp'>('login');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');

  // Phone OTP state
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDemoHint, setOtpDemoHint] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(options.initialTab || 'login');
      setError('');
      setSuccessMsg('');
      setOtpSent(false);
      setOtpCode('');
    }
  }, [isOpen, options]);

  if (!isOpen) return null;

  const resolvedService = options.serviceTitle ? resolveServiceType(options.serviceTitle) : null;
  const redirectTarget = options.redirectUrl || (resolvedService ? `/project-request?service=${encodeURIComponent(resolvedService)}` : '/portal');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, redirectTarget);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    if (!regPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          companyName: regCompany
        })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, redirectTarget);
      } else {
        setError(data.error || 'Registration failed. Try a different email.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpPhone.trim() || otpPhone.trim().length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpDemoHint(data.demoOtp || '123456');
        setSuccessMsg(`OTP sent to ${otpPhone}. Enter 123456 to verify.`);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Network error');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone, otp: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, redirectTarget);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error');
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, redirectTarget);
      } else {
        setError(data.error || 'Google sign-in could not be completed');
      }
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show an error
        setError('');
      } else {
        console.error(e);
        setError('Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100 relative">
          <button 
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-sm">
              <Bot size={22} />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-full border border-accent-blue/20">
              <Shield size={12} />
              <span>Secure Client Portal</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            {options.customTitle || 'Login or Create an Account to Start Your Project'}
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            {options.customMessage || 'To submit a project request and track your project, please log in or create your free client account first.'}
          </p>

          {resolvedService && (
            <div className="mt-3.5 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Target Service: <strong>{resolvedService}</strong> (Preserved)</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-white">
          <button 
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-semibold text-center transition-all border-b-2 ${activeTab === 'login' ? 'border-primary text-primary bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Client Login
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-semibold text-center transition-all border-b-2 ${activeTab === 'register' ? 'border-primary text-primary bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Create Account
          </button>
          <button 
            onClick={() => { setActiveTab('otp'); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-semibold text-center transition-all border-b-2 ${activeTab === 'otp' ? 'border-primary text-primary bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Phone OTP
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick OAuth Button */}
          <div className="mb-6">
            <button 
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium text-slate-700 text-sm transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    placeholder="client@example.com" 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Password</label>
                  <button type="button" onClick={() => alert('For password reset, please contact support or login via Phone OTP / Google.')} className="text-xs text-accent-blue hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign In & Continue to Project'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Full Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={regName} 
                    onChange={e => setRegName(e.target.value)} 
                    placeholder="Jane Doe" 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Email *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      value={regEmail} 
                      onChange={e => setRegEmail(e.target.value)} 
                      placeholder="jane@example.com" 
                      className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      value={regPhone} 
                      onChange={e => setRegPhone(e.target.value)} 
                      placeholder="+91 98765 43210" 
                      className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Company / Organization (Optional)</label>
                <div className="relative">
                  <Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={regCompany} 
                    onChange={e => setRegCompany(e.target.value)} 
                    placeholder="Acme Global Ltd" 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      minLength={6} 
                      value={regPassword} 
                      onChange={e => setRegPassword(e.target.value)} 
                      placeholder="Min 6 chars" 
                      className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      minLength={6} 
                      value={regConfirmPassword} 
                      onChange={e => setRegConfirmPassword(e.target.value)} 
                      placeholder="Re-type password" 
                      className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-3 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {isLoading ? 'Creating Your Account...' : 'Create Account & Start Project'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* TAB 3: PHONE OTP */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Mobile Phone Number</label>
                    <div className="relative">
                      <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="tel" 
                        required 
                        value={otpPhone} 
                        onChange={e => setOtpPhone(e.target.value)} 
                        placeholder="+91 98765 43210" 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">We will send a 6-digit one-time password to verify your account.</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Enter 6-Digit OTP</label>
                      <button 
                        type="button" 
                        onClick={() => setOtpSent(false)} 
                        className="text-xs text-accent-blue hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        maxLength={6} 
                        required 
                        value={otpCode} 
                        onChange={e => setOtpCode(e.target.value)} 
                        placeholder="123456" 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest font-mono text-center text-lg focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                      />
                    </div>
                    {otpDemoHint && (
                      <p className="text-xs text-accent-blue font-medium mt-1 text-center">Demo environment code: <strong>{otpDemoHint}</strong></p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
                    <CheckCircle2 size={16} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500 gap-1 text-center">
          <Shield size={14} className="text-emerald-500 shrink-0" />
          <span>Your information is private and encrypted with 256-bit security.</span>
        </div>
      </motion.div>
    </div>
  );
};
