import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Mail, Phone, Building, Search, ArrowRight, FileText, FileSpreadsheet } from 'lucide-react';

export const AdminRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  
  // Modals state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  
  const [quoteData, setQuoteData] = useState({ clientId: '', totalAmount: '', items: '', validUntil: '' });
  const [convertData, setConvertData] = useState({ clientId: '', totalValue: '', startDate: '', expectedCompletionDate: '' });

  useEffect(() => {
    fetchRequests();
    fetchClients();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setClients(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      await fetch(`/api/admin/requests/${selectedReq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchRequests();
      setSelectedReq({ ...selectedReq, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemsArr = quoteData.items.split('\n').map(i => ({ description: i, amount: 0 }));
      const res = await fetch(`/api/admin/requests/${selectedReq.id}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: quoteData.clientId,
          totalAmount: Number(quoteData.totalAmount),
          items: itemsArr,
          validUntil: quoteData.validUntil
        })
      });
      if (res.ok) {
        setShowQuoteModal(false);
        fetchRequests();
        setSelectedReq({ ...selectedReq, status: 'PROPOSAL_SENT' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/requests/${selectedReq.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: convertData.clientId,
          name: selectedReq.projectType + ' for ' + selectedReq.name,
          type: selectedReq.projectType,
          description: selectedReq.description,
          totalValue: convertData.totalValue,
          startDate: convertData.startDate,
          expectedCompletionDate: convertData.expectedCompletionDate
        })
      });
      if (res.ok) {
        setShowConvertModal(false);
        fetchRequests();
        setSelectedReq({ ...selectedReq, status: 'CONVERTED_TO_PROJECT' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* List */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-primary mb-3">All Requests</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          <ul className="divide-y divide-slate-100">
            {requests.map(r => (
              <li 
                key={r.id} 
                onClick={() => setSelectedReq(r)}
                className={`p-4 cursor-pointer transition-colors ${selectedReq?.id === r.id ? 'bg-blue-50/50 border-l-4 border-accent-blue' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-primary truncate pr-2">{r.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 bg-slate-100`}>
                    {r.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{r.projectType}</p>
                <p className="text-xs text-slate-400 mt-2 font-mono">{r.requestId}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {selectedReq ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">Request Details</h2>
                <p className="text-sm font-mono text-slate-500">{selectedReq.requestId}</p>
              </div>
              <select 
                className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 font-medium outline-none"
                value={selectedReq.status}
                onChange={handleStatusChange}
              >
                <option value="NEW">NEW</option>
                <option value="DISCUSSION">DISCUSSION</option>
                <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                <option value="CONVERTED_TO_PROJECT">CONVERTED TO PROJECT</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Client Info */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Client Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Mail size={16} className="text-slate-400" /> {selectedReq.email}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Phone size={16} className="text-slate-400" /> {selectedReq.phone || 'N/A'}
                  </div>
                </div>
              </section>

              {/* Project Info */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Project Requirements</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Type</p>
                      <p className="font-medium text-primary">{selectedReq.projectType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Budget Range</p>
                      <p className="font-medium text-primary">{selectedReq.budgetRange || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedReq.description}</p>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowQuoteModal(true)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <FileSpreadsheet size={16} /> Send Quotation
              </button>
              <button onClick={() => setShowConvertModal(true)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light flex items-center gap-2 shadow-sm">
                Convert to Project <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-500">Select a request</p>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-primary mb-4">Send Quotation</h2>
            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Client Account</label>
                <select required value={quoteData.clientId} onChange={e => setQuoteData({...quoteData, clientId: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">If client isn't listed, they need to register first.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount (₹)</label>
                <input required type="number" value={quoteData.totalAmount} onChange={e => setQuoteData({...quoteData, totalAmount: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Items (One per line)</label>
                <textarea required rows={3} value={quoteData.items} onChange={e => setQuoteData({...quoteData, items: e.target.value})} className="w-full p-2 border rounded-lg"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid Until</label>
                <input required type="date" value={quoteData.validUntil} onChange={e => setQuoteData({...quoteData, validUntil: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Send Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-primary mb-4">Convert to Project</h2>
            <form onSubmit={handleConvert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Client Account</label>
                <select required value={convertData.clientId} onChange={e => setConvertData({...convertData, clientId: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Agreed Value (₹)</label>
                <input required type="number" value={convertData.totalValue} onChange={e => setConvertData({...convertData, totalValue: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input required type="date" value={convertData.startDate} onChange={e => setConvertData({...convertData, startDate: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Completion</label>
                <input required type="date" value={convertData.expectedCompletionDate} onChange={e => setConvertData({...convertData, expectedCompletionDate: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowConvertModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Convert Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
