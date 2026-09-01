import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, Building, User, Mail, Phone, 
  Briefcase, IndianRupee, Shield, Bot, LayoutDashboard, Sparkles 
} from 'lucide-react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_TYPES_LIST, resolveServiceType } from '../../utils/serviceMapping';

export const RequestProject: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  // If user is not authenticated, redirect to login with full search params preserved
  useEffect(() => {
    if (!isAuthenticated) {
      const currentUrl = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  const rawServiceParam = searchParams.get('service') || searchParams.get('type') || '';
  const initialService = resolveServiceType(rawServiceParam);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    projectType: initialService,
    description: '',
    budgetRange: '₹50,000 - ₹1,50,000'
  });

  // Sync when user or searchParams update
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        companyName: prev.companyName || user.companyName || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (rawServiceParam) {
      const resolved = resolveServiceType(rawServiceParam);
      setFormData(prev => ({ ...prev, projectType: resolved }));
    }
  }, [rawServiceParam]);

  const updateForm = (field: string, value: string) => setFormData(p => ({ ...p, [field]: value }));

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setErrorMsg('Please fill in your name, email, and phone number.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        setErrorMsg('Please describe your project needs with at least a few details (min 10 characters).');
        return;
      }
    }
    setStep(p => p + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(p => p - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessId(data.requestId);
      } else {
        setErrorMsg(data.error || 'Failed to submit request');
      }
    } catch {
      setErrorMsg('Network error while submitting request. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-bg-light px-4">
        <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md">
          <Shield size={36} className="text-accent-blue mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl font-bold text-primary">Authentication Required</h2>
          <p className="text-sm text-slate-600 mt-2">Redirecting you to secure login...</p>
        </div>
      </div>
    );
  }

  if (successId) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-bg-light px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/60 text-emerald-800 text-xs font-semibold rounded-full mb-3">
            <Sparkles size={13} />
            <span>Request Submitted Successfully</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Thank You, {user?.name}!</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Your project request for <strong>{formData.projectType}</strong> has been registered directly to your client portal account. Our engineering team is reviewing it now.
          </p>
          
          <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100 text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Tracking Request ID:</span>
              <span className="font-mono text-sm font-bold text-primary bg-white px-2.5 py-1 rounded-lg border border-slate-200">{successId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Selected Service:</span>
              <span className="text-xs font-semibold text-slate-800">{formData.projectType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Account Owner:</span>
              <span className="text-xs text-slate-700">{user?.email}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link 
              to="/client/requests" 
              className="w-full bg-primary text-white py-3.5 px-4 rounded-xl font-medium text-sm hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LayoutDashboard size={18} />
              <span>Track in Client Dashboard</span>
            </Link>

            <Link 
              to="/" 
              className="block w-full py-2.5 text-sm text-slate-600 font-medium hover:text-primary transition-colors"
            >
              Return to Website
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 bg-bg-light px-4">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Top Header with Logged-in User indicator */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.slice(0, 2).toUpperCase() || 'CL'}
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">{user?.name}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Step {step} of 3</span>
            <div className="flex gap-1.5 ml-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= step ? 'bg-accent-blue' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: CONTACT DETAILS */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary">Your Contact Details</h2>
                  <p className="text-sm text-slate-600 mt-1">Verified from your client account. Feel free to adjust phone or company name.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={e => updateForm('name', e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                        placeholder="John Doe" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          required 
                          value={formData.email} 
                          onChange={e => updateForm('email', e.target.value)} 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                          placeholder="client@example.com" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          required 
                          value={formData.phone} 
                          onChange={e => updateForm('phone', e.target.value)} 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                          placeholder="+91 98765 43210" 
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Company / Organization (Optional)</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.companyName} 
                        onChange={e => updateForm('companyName', e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all" 
                        placeholder="Acme Global Inc" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary-light transition-all shadow-sm"
                  >
                    <span>Next: Project Scope</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SERVICE & REQUIREMENTS */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary">Service Selection & Project Details</h2>
                  <p className="text-sm text-slate-600 mt-1">Your requested service has been pre-selected below.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Select Service</label>
                    <div className="relative">
                      <Briefcase size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select 
                        value={formData.projectType} 
                        onChange={e => updateForm('projectType', e.target.value)} 
                        className="w-full pl-11 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all font-medium text-slate-800"
                      >
                        {PROJECT_TYPES_LIST.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Project Overview & Deliverables *</label>
                    <textarea 
                      rows={5} 
                      required 
                      value={formData.description} 
                      onChange={e => updateForm('description', e.target.value)} 
                      placeholder="Please tell us about your goals, key features, target timeline, or tech preferences..." 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <button 
                    type="button" 
                    onClick={prevStep} 
                    className="flex items-center gap-2 text-slate-600 hover:text-primary px-4 py-2.5 font-medium text-sm transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary-light transition-all shadow-sm"
                  >
                    <span>Next: Budget & Finalize</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BUDGET & SUBMIT */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary">Budget & Review</h2>
                  <p className="text-sm text-slate-600 mt-1">Review your request details before submitting.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Estimated Budget Range</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        '₹25,000 - ₹50,000',
                        '₹50,000 - ₹1,50,000',
                        '₹1,50,000 - ₹3,50,000',
                        '₹3,50,000+'
                      ].map(range => (
                        <label 
                          key={range} 
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.budgetRange === range ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                        >
                          <input 
                            type="radio" 
                            name="budget" 
                            value={range} 
                            checked={formData.budgetRange === range} 
                            onChange={e => updateForm('budgetRange', e.target.value)} 
                            className="text-primary focus:ring-primary" 
                          />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <p><strong>Service:</strong> {formData.projectType}</p>
                    <p><strong>Contact:</strong> {formData.name} ({formData.email} • {formData.phone})</p>
                    {formData.companyName && <p><strong>Company:</strong> {formData.companyName}</p>}
                    <p className="line-clamp-2"><strong>Scope:</strong> {formData.description}</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <button 
                    type="button" 
                    onClick={prevStep} 
                    className="flex items-center gap-2 text-slate-600 hover:text-primary px-4 py-2.5 font-medium text-sm transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} 
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium text-sm hover:bg-primary-light transition-all shadow-sm disabled:opacity-70"
                  >
                    {isSubmitting ? 'Submitting Request...' : 'Confirm & Submit Request'}
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
