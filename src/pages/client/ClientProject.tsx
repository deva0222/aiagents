import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../App';
import { ArrowLeft, CheckCircle2, Circle, Clock, MessageSquare, FileText, LayoutDashboard, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const ClientProject = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setProject(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    fetchProject();
  }, [id, token]);

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading project details...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found or access denied.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link to="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-mono font-medium">{project.projectId}</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium uppercase tracking-wider">{project.type}</span>
            </div>
            <h1 className="text-3xl font-bold text-primary">{project.name}</h1>
          </div>
          <div className="text-right bg-white p-4 rounded-xl border border-slate-100 shadow-sm min-w-[200px]">
            <p className="text-sm text-slate-500 mb-1">Status</p>
            <p className="font-bold text-primary">{project.status.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-primary">Project Progress</h3>
          <span className="text-2xl font-bold text-accent-blue">{project.progress}%</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-blue rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
            style={{ width: `${project.progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg) translateX(-150%)' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-primary text-lg">Milestones</h3>
            </div>
            <div className="p-6">
              {project.milestones && project.milestones.length > 0 ? (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                  {project.milestones.map((m: any, idx: number) => (
                    <div key={m.id} className="relative pl-6">
                      {m.status === 'COMPLETED' ? (
                        <CheckCircle2 size={24} className="absolute -left-[13px] top-0 text-emerald-500 bg-white" />
                      ) : m.status === 'IN_PROGRESS' ? (
                        <Circle size={24} className="absolute -left-[13px] top-0 text-accent-blue bg-white fill-accent-blue/20" />
                      ) : (
                        <Circle size={24} className="absolute -left-[13px] top-0 text-slate-300 bg-white" />
                      )}
                      <div>
                        <h4 className={`font-medium ${m.status === 'PENDING' ? 'text-slate-500' : 'text-primary'}`}>{m.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {m.status === 'COMPLETED' ? 'Completed' : m.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No milestones defined yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-primary text-lg">Activity Timeline</h3>
            </div>
            <div className="p-0">
               {project.logs && project.logs.length > 0 ? (
                 <ul className="divide-y divide-slate-100">
                   {project.logs.map((log: any) => (
                     <li key={log.id} className="p-4 flex gap-4">
                       <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                         <Clock size={18} />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-slate-700">{log.action}</p>
                         {log.description && <p className="text-sm text-slate-500 mt-1">{log.description}</p>}
                         <p className="text-xs text-slate-400 mt-2">{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}</p>
                       </div>
                     </li>
                   ))}
                 </ul>
               ) : (
                  <p className="text-slate-500 text-sm text-center py-8">No activity recorded yet.</p>
               )}
            </div>
          </div>
        </div>

        {/* Right Col - Details & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-primary mb-4">Project Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Start Date</p>
                <p className="font-medium text-slate-800">{project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'TBD'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Expected Completion</p>
                <p className="font-medium text-slate-800">{project.expectedCompletionDate ? format(new Date(project.expectedCompletionDate), 'MMM d, yyyy') : 'TBD'}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-slate-500 mb-1">Total Value</p>
                <p className="font-bold text-primary text-lg">₹{(project.totalValue || 0).toLocaleString()}</p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-slate-500">Amount Paid</p>
                  <p className="font-medium text-emerald-600">₹{(project.amountPaid || 0).toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-500">Balance</p>
                  <p className="font-medium text-amber-600">₹{((project.totalValue || 0) - (project.amountPaid || 0)).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-primary mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-accent-blue hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 group-hover:text-accent-blue font-medium">
                  <MessageSquare size={18} /> Send Message
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-accent-blue" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-accent-blue hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 group-hover:text-accent-blue font-medium">
                  <FileText size={18} /> View Files
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-accent-blue" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
