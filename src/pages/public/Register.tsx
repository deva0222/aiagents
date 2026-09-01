import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, Bot, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveServiceType } from '../../utils/serviceMapping';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const serviceParam = searchParams.get('service') || searchParams.get('type') || '';
  
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isProjectRequestFlow = redirectParam.includes('project-request') || redirectParam.includes('request') || !!serviceParam;

  const preservedService = serviceParam ? resolveServiceType(serviceParam) : (
    redirectParam.includes('service=') 
      ? resolveServiceType(new URLSearchParams(redirectParam.split('?')[1] || '').get('service'))
      : redirectParam.includes('type=')
        ? resolveServiceType(new URLSearchParams(redirectParam.split('?')[1] || '').get('type'))
        : null
  );

  const finalRedirect = redirectParam || (preservedService ? `/project-request?service=${encodeURIComponent(preservedService)}` : '/portal');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user, finalRedirect);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network connection error');
    }
    setIsLoading(false);
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError('');
    try {
      const demoEmail = 'client.demo@gmail.com';
      const demoName = 'Google Registered Client';
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, name: demoName })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user, finalRedirect);
      } else {
        setError('Google registration failed');
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
              : 'Create Free Client Account'}
          </h1>
          
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            {isProjectRequestFlow 
              ? 'To submit a project request and track your project, please log in or create your free client account first.'
              : 'Sign up to request services, track delivery milestones, and collaborate in real-time.'}
          </p>

          {preservedService && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Preserved Service: <strong>{preservedService}</strong></span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Google signup */}
        <button 
          type="button"
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full mb-6 flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-700 text-sm transition-all shadow-sm disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Or register with details</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Full Name *</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                placeholder="Jane Doe" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Email Address *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData(p => ({...p, email: e.target.value}))} 
                  className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                  placeholder="jane@example.com" 
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
                  value={formData.phone} 
                  onChange={e => setFormData(p => ({...p, phone: e.target.value}))} 
                  className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                  placeholder="+91 98765 43210" 
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
                value={formData.companyName} 
                onChange={e => setFormData(p => ({...p, companyName: e.target.value}))} 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                placeholder="Acme Global Ltd" 
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
                  value={formData.password} 
                  onChange={e => setFormData(p => ({...p, password: e.target.value}))} 
                  className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                  placeholder="Min 6 chars" 
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
                  value={formData.confirmPassword} 
                  onChange={e => setFormData(p => ({...p, confirmPassword: e.target.value}))} 
                  className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                  placeholder="Re-type password" 
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full mt-2 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            {isLoading ? 'Creating Account...' : isProjectRequestFlow ? 'Create Account & Continue to Project' : 'Create Free Account'}
            <ArrowRight size={16} />
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link 
            to={`/login?redirect=${encodeURIComponent(finalRedirect)}${preservedService ? `&service=${encodeURIComponent(preservedService)}` : ''}`} 
            className="text-accent-blue font-semibold hover:underline"
          >
            Sign in
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
