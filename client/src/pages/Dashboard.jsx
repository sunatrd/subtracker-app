import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/contracts', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data));
  }, [token]);

  // -- Metrics Logic --
  const expenses = contracts.filter(c => c.direction === 'expense' && c.status === 'active');
  const income = contracts.filter(c => c.direction === 'income' && c.status === 'active');

  const monthlyBurn = expenses.reduce((acc, curr) => acc + (curr.frequency === 'Yearly' ? curr.amount/12 : curr.amount), 0);
  
  // FR-05 Client Revenue at Risk (Income expiring in < 60 days)
  const revenueAtRisk = income.filter(c => {
    const days = Math.ceil((new Date(c.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 60;
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const upcomingRenewals = contracts.filter(c => {
     const days = Math.ceil((new Date(c.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
     return days >= 0 && days <= 30;
  });

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-gray-500">Monthly Burn Rate</p>
          <p className="text-2xl font-bold">${monthlyBurn.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500">Client Revenue at Risk</p>
          <p className="text-2xl font-bold">${revenueAtRisk.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-500">Renewals (30 Days)</p>
          <p className="text-2xl font-bold">{upcomingRenewals.length}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Urgent Actions Required</h3>
      <div className="bg-white rounded shadow overflow-hidden">
        {upcomingRenewals.map(c => (
           <div key={c.id} className="p-4 border-b flex justify-between">
              <span>{c.name} ({c.type})</span>
              <span className="text-red-500 font-bold">Expires: {c.renewalDate}</span>
           </div>
        ))}
      </div>
    </div>
  );
}