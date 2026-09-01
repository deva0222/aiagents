import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Shield, Zap, Sparkles, CheckCircle2, Bot, Layers, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getServiceSlug } from '../../utils/serviceMapping';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleStartProject = (serviceSlug?: string, serviceTitle?: string) => {
    const targetUrl = serviceSlug ? `/project-request?service=${encodeURIComponent(serviceSlug)}` : '/project-request';
    if (isAuthenticated) {
      navigate(targetUrl);
    } else {
      openAuthModal({
        redirectUrl: targetUrl,
        serviceTitle: serviceTitle,
        customTitle: 'Login or Create an Account to Start Your Project',
        customMessage: 'To submit a project request and track your project, please log in or create your free client account first.'
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-28">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-blue/10 text-accent-blue font-semibold text-xs mb-6 border border-accent-blue/20">
                <Sparkles size={14} />
                <span>Enterprise AI Agents & Web Solutions</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-[1.1] mb-6">
                Build Smarter. <br />
                Automate Faster. <br />
                <span className="text-accent-blue">Grow with AI.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
                We build intelligent AI agents, high-performance websites, mobile applications, and business automation systems. Track every deliverable and quotation through our secure client portal.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => handleStartProject()} 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-medium text-sm sm:text-base hover:bg-primary-light transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Start Your Project</span>
                  <ArrowRight size={18} />
                </button>
                <Link 
                  to="/services" 
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium text-sm sm:text-base hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  Explore 10 Core Services
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>AI Agent Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>TypeScript & Cloud Native</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Secure Client Portal</span>
                </div>
              </div>
            </motion.div>

            {/* Visual preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block h-[480px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/15 to-emerald-500/10 rounded-3xl border border-slate-200/80 backdrop-blur-3xl shadow-xl overflow-hidden flex items-center justify-center p-8">
                 {/* Live preview simulated interface */}
                 <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
                    <div className="h-11 border-b border-slate-100 flex items-center px-4 justify-between bg-slate-50/70">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">client-portal.aiagents.dev</span>
                      <div className="w-4"></div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase">Project Pipeline</p>
                          <p className="text-base font-bold text-primary">AI Automation & Web Portal</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                          Active Milestone
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[11px] text-slate-400 font-medium">Estimated Delivery</p>
                          <p className="text-sm font-bold text-primary mt-0.5">3 Weeks</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[11px] text-slate-400 font-medium">Quotation Status</p>
                          <p className="text-sm font-bold text-emerald-600 mt-0.5">Approved</p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-3">
                        <Bot size={20} className="text-accent-blue shrink-0" />
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          AI agent workflow ready: Automated lead response, CRM syncing, and customer support triage.
                        </p>
                      </div>
                    </div>
                 </div>
                 
                 {/* Floating badge */}
                 <motion.div 
                   animate={{ y: [-6, 6, -6] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                   className="absolute bottom-6 -left-4 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                 >
                   <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue">
                     <Zap size={20} />
                   </div>
                   <div>
                     <p className="text-[11px] text-slate-500 font-medium">Authentication-First</p>
                     <p className="text-xs font-bold text-primary">Private Client Portal</p>
                   </div>
                 </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Services Snippet */}
      <section className="py-20 bg-bg-light border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-primary mb-3">Popular Digital Capabilities</h2>
            <p className="text-slate-600 text-sm sm:text-base">Browse our top services or open our comprehensive 10-service catalog.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'AI Agents & AI Automation', 
                desc: 'Intelligent AI agents, assistants, chatbots, and automated workflows that scale your business.', 
                icon: Bot, 
                slug: 'ai-agents',
                color: 'bg-indigo-50 text-indigo-600',
                actionLabel: 'Request AI Agent'
              },
              { 
                title: 'Website Development', 
                desc: 'Modern, ultra-fast, responsive web platforms built with clean TypeScript and modern frameworks.', 
                icon: Code, 
                slug: 'website-development',
                color: 'bg-blue-50 text-blue-600',
                actionLabel: 'Build My Website'
              },
              { 
                title: 'Custom Software Development', 
                desc: 'Purpose-built CRM systems, client dashboards, SaaS platforms, and internal business tools.', 
                icon: Layers, 
                slug: 'custom-software',
                color: 'bg-amber-50 text-amber-600',
                actionLabel: 'Discuss Software'
              },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${s.color}`}>
                    <s.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2.5">{s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{s.desc}</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => handleStartProject(s.slug, s.title)}
                    className="w-full py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-light transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{s.actionLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                  <Link to="/services" className="block text-center text-xs text-accent-blue font-semibold hover:underline">
                    View full service specs
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Banner to view all 10 services */}
          <div className="mt-12 text-center">
            <Link 
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>View All 10 Core Services & Packages</span>
              <ArrowRight size={16} className="text-accent-blue" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
