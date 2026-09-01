import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, LogOut, LayoutDashboard, Briefcase, FileText, 
  MessageSquare, Ticket, Users, PlusCircle, ArrowUpRight 
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DashboardLayout = ({ role }: { role: 'ADMIN' | 'CLIENT' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Requests & Quotes', path: '/admin/requests', icon: FileText },
    { name: 'Active Projects', path: '/admin/projects', icon: Briefcase },
    { name: 'Client Directory', path: '/admin/clients', icon: Users },
  ];

  const clientLinks = [
    { name: 'Overview', path: '/client', icon: LayoutDashboard },
    { name: 'Project Requests', path: '/client/requests', icon: FileText },
    { name: 'My Projects', path: '/client/projects', icon: Briefcase },
    { name: 'Messages & Updates', path: '/client/messages', icon: MessageSquare },
    { name: 'Invoices & Billing', path: '/client/invoices', icon: FileText },
    { name: 'Support Tickets', path: '/client/support', icon: Ticket },
  ];

  const links = role === 'ADMIN' ? adminLinks : clientLinks;

  return (
    <div className="min-h-screen flex bg-bg-light">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-100 justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-primary">
              {role === 'ADMIN' ? 'Admin Portal' : 'Client Portal'}
            </span>
          </Link>
          <Link to="/" title="View Public Website" className="text-slate-400 hover:text-primary transition-colors">
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {role === 'CLIENT' && (
          <div className="px-4 pt-4 pb-1">
            <Link
              to="/project-request"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-light transition-all shadow-sm"
            >
              <PlusCircle size={15} />
              <span>New Project Request</span>
            </Link>
          </div>
        )}

        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path !== '/admin' && link.path !== '/client' && location.pathname.startsWith(link.path));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-accent-blue/10 text-accent-blue font-semibold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-sm text-primary">
              {role === 'ADMIN' ? 'Admin' : 'Client Portal'}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {role === 'CLIENT' && (
              <Link 
                to="/project-request" 
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg"
              >
                + New Request
              </Link>
            )}
            <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex overflow-x-auto bg-white border-b border-slate-100 p-2 gap-1 scrollbar-none">
          {links.map(l => (
            <Link 
              key={l.path} 
              to={l.path} 
              className={cn(
                "px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg transition-colors",
                location.pathname === l.path ? "bg-accent-blue text-white" : "text-slate-600 bg-slate-50"
              )}
            >
              {l.name}
            </Link>
          ))}
        </div>

        <div className="flex-1 p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
