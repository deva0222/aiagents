import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Ticket, Plus, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientSupport = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', category: 'General', priority: 'MEDIUM', message: '' });

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/client/tickets', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTickets(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ subject: '', category: 'General', priority: 'MEDIUM', message: '' });
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Support Tickets</h1>
          <p className="text-slate-500 mt-1">Get help and track your support requests.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
          <Plus size={18} /> New Ticket
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Ticket size={48} className="mb-4 text-slate-300" />
            <p>You have no support tickets.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map(t => (
              <li key={t.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-primary">{t.subject}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>{t.ticketId}</span>
                    <span>•</span>
                    <span>{t.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {t.status}
                  </span>
                  <span className={`text-xs font-bold ${t.priority === 'HIGH' ? 'text-red-500' : t.priority === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500'}`}>
                    {t.priority} PRIORITY
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold text-primary mb-4">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-lg">
                  <option>General</option>
                  <option>Billing</option>
                  <option>Technical</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full p-2 border rounded-lg">
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full p-2 border rounded-lg"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
