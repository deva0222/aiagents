import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, Menu, X, ArrowRight, Shield, User, LogOut, LayoutDashboard } from 'lucide-react';
import { AIAssistant } from '../AIAssistant';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartProject = () => {
    setMobileMenuOpen(false);
    if (isAuthenticated) {
      navigate('/project-request');
    } else {
      openAuthModal({
        redirectUrl: '/project-request',
        customTitle: 'Login or Create an Account to Start Your Project',
        customMessage: 'To submit a project request and track your project, please log in or create your free client account first.'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-accent-blue" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-primary">
                AI Agents <span className="text-accent-blue">& Web</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Home</Link>
              <Link to="/services" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Services</Link>
              <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Contact</Link>
            </nav>

            {/* Auth / Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to={user?.role === 'ADMIN' ? '/admin' : '/client'} 
                    className="flex items-center gap-2 text-sm font-semibold text-primary bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-accent-blue" />
                    <span>{user?.role === 'ADMIN' ? 'Admin Panel' : 'Client Portal'}</span>
                  </Link>
                  <button 
                    onClick={handleStartProject}
                    className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Request Project</span>
                    <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={logout} 
                    title="Sign Out" 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-slate-600 hover:text-primary transition-colors px-3 py-2"
                  >
                    Client Login
                  </Link>
                  <button 
                    onClick={handleStartProject} 
                    className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Start Your Project</span>
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-primary rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-3">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Services (10 Core Services)
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Contact
            </Link>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={user?.role === 'ADMIN' ? '/admin' : '/client'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 bg-slate-100 text-primary font-semibold rounded-xl text-sm"
                  >
                    Open {user?.role === 'ADMIN' ? 'Admin Panel' : 'Client Portal'}
                  </Link>
                  <button 
                    onClick={handleStartProject}
                    className="block w-full py-2.5 bg-primary text-white font-medium rounded-xl text-sm text-center"
                  >
                    Request Project
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 text-slate-700 font-medium rounded-xl text-sm bg-slate-50"
                  >
                    Client Login
                  </Link>
                  <button 
                    onClick={handleStartProject}
                    className="block w-full py-2.5 bg-primary text-white font-medium rounded-xl text-sm text-center"
                  >
                    Start Your Project
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-slate-300 py-14 border-t border-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                AI Agents & Web Solutions
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-4">
              Build Smarter. Automate Faster. Grow with AI. We build intelligent AI agents, custom websites, mobile applications, and enterprise automation with a secure client portal.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield size={14} className="text-emerald-400" />
              <span>Encrypted Client Portal & Transparent Project Tracking</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/services" className="hover:text-white transition-colors">AI Agents & Automation</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Website Development</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">E-Commerce Development</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Mobile App Development</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Custom Software Development</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Client Access</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/login" className="hover:text-white transition-colors">Client Portal Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Free Client Account</Link></li>
              <li><button onClick={handleStartProject} className="text-left hover:text-white transition-colors">Start Project Request</button></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Technical Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AI Agents & Web Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/services" className="hover:text-white">Services</Link>
            <Link to="/contact" className="hover:text-white">Support</Link>
            <Link to="/login" className="hover:text-white">Client Portal</Link>
          </div>
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};
