import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientProjectsList = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/client/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setProjects);
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Projects</h1>
          <p className="text-slate-500 mt-1">Track the progress of your digital solutions.</p>
        </div>
        <Link to="/request" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
          Start New Project
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-0 flex-1">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Briefcase size={48} className="mb-4 text-slate-300" />
              <p>No active projects yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {projects.map(p => (
                <li key={p.id}>
                  <Link to={`/portal/projects/${p.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-lg text-primary mb-1">{p.name}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{p.projectId}</span>
                        <span className="capitalize">{p.type}</span>
                        <span className="capitalize bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-md text-xs font-bold">{p.status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block w-32">
                        <p className="text-sm font-medium text-slate-700">{p.progress}% Complete</p>
                        <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-accent-blue rounded-full transition-all" style={{ width: `${p.progress}%` }}></div>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-400" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
