import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setProjects);
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-8">All Projects</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {projects.map(p => (
            <li key={p.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between">
              <div>
                <p className="font-bold text-primary">{p.name}</p>
                <p className="text-sm text-slate-500">{p.projectId} - {p.type}</p>
              </div>
              <div className="text-right">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{p.status}</span>
                <p className="text-sm mt-1">{p.progress}%</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
