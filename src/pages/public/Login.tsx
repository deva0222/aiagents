import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Bot, Shield, ArrowRight, Smartphone, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveServiceType } from '../../utils/serviceMapping';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const serviceParam = searchParams.get('service') || searchParams.get('type') || '';
  
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDemoCode, setOtpDemoCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is a project request flow
  const isProjectRequestFlow = redirectParam.includes('project-request') || redirectParam.includes('request') || !!serviceParam;
  
  const preservedService = serviceParam ? resolveServiceType(serviceParam) : (
    redirectParam.includes('service=') 
      ? resolveServiceType(new URLSearchParams(redirectParam.split('?')[1] || '').get('service'))
      : redirectParam.includes('type=')
        ? resolveServiceType(new URLSearchParams(redirectParam.split('?')[1] || '').get('type'))
        : null
  );

  const finalRedirect = redirectParam || (preservedService ? `/project-request?service=${encodeURIComponent(preservedService)}` : '/portal');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user, data.user.role === 'ADMIN' ? '/admin' : finalRedirect);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network connection error');
    }
    setIsLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      setError('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setOtpDemoCode(data.demoOtp || '123456');
      } else {
        setError(data.error || 'Could not send OTP');
      }
    } catch {
      setError('Network error');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, finalRedirect);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Network error');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const demoEmail = 'client.demo@gmail.com';
      const demoName = 'Google Client';
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, name: demoName })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, finalRedirect);
      } else {
        setError('Google login failed');
      }
    } catch {
      setError('Network error');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-bg-light px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Bot size={26} />
          </div>

          <h1 className="text-2xl font-bold text-primary tracking-tight">
            {isProjectRequestFlow 
              ? 'Login or Create an Account to Start Your Project'
              : 'Welcome Back'}
          </h1>
          
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            {isProjectRequestFlow 
              ? 'To submit a project request and track your project, please log in or create your free client account first.'
              : 'Sign in to access your client portal, projects, and invoices.'}
          </p>

          {preservedService && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Selected: <strong>{preservedService}</strong></span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Google Auth */}
        <div className="space-y-3 mb-6">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-700 text-sm transition-all shadow-sm disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button 
            type="button"
            onClick={() => { setAuthMode(authMode === 'password' ? 'otp' : 'password'); setError(''); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Smartphone size={14} />
            <span>{authMode === 'password' ? 'Login with Phone OTP instead' : 'Login with Email & Password'}</span>
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">
              {authMode === 'password' ? 'Or login with email' : 'Phone Verification'}
            </span>
          </div>
        </div>

        {/* EMAIL & PASSWORD LOGIN */}
        {authMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all" 
                  placeholder="client@example.com" 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Password</label>
                <button type="button" onClick={() => alert('Please contact support or use Phone OTP.')} className="text-xs text-accent-blue hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue outline-none transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : isProjectRequestFlow ? 'Sign In & Start Project' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* PHONE OTP FLOW */
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
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="+91 98765 43210" 
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Enter OTP Code</label>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-accent-blue hover:underline">Change</button>
                  </div>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      maxLength={6}
                      required 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)} 
                      placeholder="123456" 
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest font-mono text-center text-lg focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                    />
                  </div>
                  {otpDemoCode && (
                    <p className="text-xs text-accent-blue font-medium mt-1 text-center">Demo OTP code: <strong>{otpDemoCode}</strong></p>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
                  <CheckCircle2 size={16} />
                </button>
              </form>
            )}
          </div>
        )}
        
        {/* Register CTA with preserved parameters */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          New client?{' '}
          <Link 
            to={`/register?redirect=${encodeURIComponent(finalRedirect)}${preservedService ? `&service=${encodeURIComponent(preservedService)}` : ''}`} 
            className="text-accent-blue font-semibold hover:underline"
          >
            Create free account
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Shield size={13} className="text-emerald-500" />
          <span>Client access is encrypted & strictly authenticated</span>
        </div>
      </div>
    </div>
  );
};
