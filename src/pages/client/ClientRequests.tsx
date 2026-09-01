import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FileText, PlusCircle, CheckCircle2, Clock, AlertCircle, 
  ArrowRight, ShieldCheck, Check, X, RefreshCw 
} from 'lucide-react';

interface Quotation {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  scope: string;
  deliverables: string[];
  timeline: string;
  validUntil: string;
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

interface ProjectRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName?: string;
  projectType: string;
  description: string;
  budgetRange: string;
  status: 'NEW' | 'REVIEWING' | 'QUOTATION_SENT' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS';
  createdAt: string;
  quotation?: Quotation;
}

export const ClientRequests: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleQuotationAction = async (quotationId: string, action: 'accept' | 'reject') => {
    setActionLoading(quotationId);
    setMessage(null);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: action === 'accept' 
            ? 'Quotation accepted! Our engineering team will initiate project kickoff immediately.' 
            : 'Quotation updated.'
        });
        await fetchRequests();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update quotation.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while processing request.' });
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            <span>{status === 'ACCEPTED' ? 'Accepted' : 'In Progress'}</span>
          </span>
        );
      case 'QUOTATION_SENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-accent-blue border border-blue-200">
            <Clock size={13} />
            <span>Quotation Available</span>
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} />
            <span>Under Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock size={13} />
            <span>Received</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Your Project Requests</h1>
          <p className="text-sm text-slate-600 mt-1">
            Track submitted requests, review scope estimations, and accept quotations to kick off development.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRequests} 
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-primary rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/project-request"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-light transition-all shadow-sm"
          >
            <PlusCircle size={16} />
            <span>New Request</span>
          </Link>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-accent-blue" />
          Loading your project requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 bg-blue-50 text-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">No Project Requests Yet</h3>
          <p className="text-sm text-slate-600 mb-6">
            You haven't submitted any project requests yet. Click below to specify your goals and get a custom proposal.
          </p>
          <Link
            to="/project-request"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-all shadow-sm"
          >
            <PlusCircle size={16} />
            <span>Start Your First Project</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7 hover:border-slate-200 transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {req.id}
                    </span>
                    <h2 className="text-lg font-bold text-primary">{req.projectType}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted on {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="md:col-span-2">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Project Scope / Overview</p>
                  <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">{req.description}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase">Budget Range</span>
                    <span className="text-slate-800 font-bold text-sm">{req.budgetRange}</span>
                  </div>
                  {req.companyName && (
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase">Company</span>
                      <span className="text-slate-800">{req.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quotation Attached Section */}
              {req.quotation && (
                <div className="mt-4 pt-4 border-t border-slate-100 bg-blue-50/40 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-blue-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-accent-blue" />
                      <div>
                        <h4 className="text-sm font-bold text-primary">Official Engineering Quotation</h4>
                        <p className="text-xs text-slate-600">Estimate & Milestones from our Technical Director</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Total Investment</span>
                      <span className="text-xl font-extrabold text-primary">
                        {req.quotation.currency} {req.quotation.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-blue-100/80 mb-4 space-y-2 text-xs">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      <strong>Scope:</strong> {req.quotation.scope}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1 text-slate-600">
                      <span><strong>Timeline:</strong> {req.quotation.timeline}</span>
                      <span><strong>Valid until:</strong> {new Date(req.quotation.validUntil).toLocaleDateString()}</span>
                      <span><strong>Status:</strong> <span className="uppercase font-bold text-accent-blue">{req.quotation.status}</span></span>
                    </div>
                  </div>

                  {req.quotation.status === 'SENT' && (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleQuotationAction(req.quotation!.id, 'reject')}
                        disabled={actionLoading === req.quotation.id}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <X size={14} />
                        <span>Decline Quote</span>
                      </button>
                      <button
                        onClick={() => handleQuotationAction(req.quotation!.id, 'accept')}
                        disabled={actionLoading === req.quotation.id}
                        className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Check size={14} />
                        <span>Accept Quotation & Initiate</span>
                      </button>
                    </div>
                  )}

                  {req.quotation.status === 'ACCEPTED' && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 size={16} />
                      <span>Quotation Accepted. Our team has scheduled the development sprint.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
