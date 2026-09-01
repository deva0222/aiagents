import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../App';
import { Briefcase, Clock, FileText, ArrowRight } from 'lucide-react';

export const ClientDashboard = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, reqRes] = await Promise.all([
          fetch('/api/client/projects', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/client/requests', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (projRes.ok) setProjects(await projRes.json());
        if (reqRes.ok) setRequests(await reqRes.json());
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [token]);

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1">Here is the overview of your digital projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-accent-blue rounded-xl flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Projects</p>
            <p className="text-2xl font-bold text-primary">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Requests</p>
            <p className="text-2xl font-bold text-primary">{requests.filter(r => r.status !== 'CLOSED' && r.status !== 'CONVERTED_TO_PROJECT').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-2 border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
          <Link to="/request" className="flex items-center justify-center gap-2 text-primary font-medium">
            + Request New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary">Your Projects</h2>
          </div>
          <div className="p-0 flex-1">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Briefcase size={32} className="mb-2 text-slate-300" />
                <p>No active projects yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {projects.map(p => (
                  <li key={p.id}>
                    <Link to={`/portal/projects/${p.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-primary mb-1">{p.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded-md">{p.projectId}</span>
                          <span className="capitalize">{p.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-slate-700">{p.progress}% Complete</p>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-accent-blue rounded-full" style={{ width: `${p.progress}%` }}></div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary">Recent Requests</h2>
          </div>
          <div className="p-0 flex-1">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <FileText size={32} className="mb-2 text-slate-300" />
                <p>No pending requests.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {requests.slice(0, 5).map(r => (
                  <li key={r.id} className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-primary">{r.projectType}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                        r.status === 'CONVERTED_TO_PROJECT' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{r.description}</p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">{r.requestId}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
