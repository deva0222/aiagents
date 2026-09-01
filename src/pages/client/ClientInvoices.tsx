import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Receipt, CreditCard } from 'lucide-react';

export const ClientInvoices = () => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/client/invoices', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setInvoices);
  }, [token]);

  const handlePay = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'PAID', amountPaid: i.totalAmount } : i));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-8">Invoices & Payments</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Receipt size={48} className="mb-4 text-slate-300" />
            <p>You have no invoices.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <li key={inv.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <h3 className="font-bold text-primary">{inv.invoiceId}</h3>
                  <p className="text-sm text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{inv.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{inv.status}</span>
                  </div>
                  {inv.status !== 'PAID' && (
                    <button onClick={() => handlePay(inv.id)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
                      <CreditCard size={16} /> Pay Now
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
