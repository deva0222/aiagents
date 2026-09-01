import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Users, FileText, Briefcase, IndianRupee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ clients: 0, requests: 0, projects: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, you'd have a specific /api/admin/stats endpoint
    // For now, let's just fetch requests and projects to get counts
    const fetchAdminData = async () => {
      try {
        const [reqRes, projRes] = await Promise.all([
          fetch('/api/admin/requests', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (reqRes.ok) {
          const reqs = await reqRes.json();
          setRecentRequests(reqs.slice(0, 5));
          setStats(s => ({ ...s, requests: reqs.length }));
        }
        if (projRes.ok) {
          const projs = await projRes.json();
          setStats(s => ({ ...s, projects: projs.length }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAdminData();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your business operations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Clients', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'New Requests', value: stats.requests, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Active Projects', value: stats.projects, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Revenue (MTD)', value: '₹4.5L', icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.title}</p>
              <p className="text-2xl font-bold text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary">Recent Requests</h2>
            <Link to="/admin/requests" className="text-sm font-medium text-accent-blue flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="p-0">
             {recentRequests.length === 0 ? (
               <p className="text-slate-500 text-sm text-center py-8">No recent requests.</p>
             ) : (
               <ul className="divide-y divide-slate-100">
                 {recentRequests.map(r => (
                   <li key={r.id} className="p-4 hover:bg-slate-50 transition-colors">
                     <div className="flex justify-between items-start mb-1">
                       <p className="font-medium text-primary">{r.name}</p>
                       <span className={`text-xs px-2 py-0.5 rounded font-medium ${r.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                         {r.status}
                       </span>
                     </div>
                     <p className="text-sm text-slate-500 truncate">{r.projectType} - {r.budgetRange}</p>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>

        {/* AI Insights placeholder */}
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl border border-primary-light shadow-sm overflow-hidden flex flex-col text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-accent-blue">✦</span> AI Insights
            </h2>
          </div>
          <div className="p-6 relative z-10">
            <p className="text-slate-300 text-sm mb-4">Your AI assistant has analyzed recent activity.</p>
            <ul className="space-y-3">
              <li className="bg-white/10 rounded-lg p-3 text-sm">
                <span className="font-semibold text-accent-blue">Opportunity:</span> 3 new requests for "E-Commerce" in the last week. Consider updating your portfolio.
              </li>
              <li className="bg-white/10 rounded-lg p-3 text-sm">
                <span className="font-semibold text-emerald-400">Action:</span> Project PRJ-2026-001 is pending invoice generation for Milestone 2.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
