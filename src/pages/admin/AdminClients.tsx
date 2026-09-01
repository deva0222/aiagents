import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { Users } from 'lucide-react';

export const AdminClients = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/clients', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setClients);
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-8">Clients</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {clients.map(c => (
            <li key={c.id} className="p-6 flex justify-between">
              <div>
                <p className="font-bold text-primary">{c.name}</p>
                <p className="text-sm text-slate-500">{c.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{c.companyName || 'N/A'}</p>
                <p className="text-sm text-slate-500">{c.phone || 'N/A'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
