import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { TrendingUp, TrendingDown, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/contracts', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setContracts(res.data); setLoading(false); });
  }, [token]);

  // Calculations
  const expenses = contracts.filter(c => c.direction === 'expense' && c.status === 'active');
  const monthlyBurn = expenses.reduce((acc, c) => acc + (c.frequency === 'Yearly' ? c.amount/12 : c.amount), 0);
  const upcomingRenewals = contracts.filter(c => {
     const days = Math.ceil((new Date(c.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
     return days >= 0 && days <= 30;
  });

  const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <p className="text-gray-500 font-medium mb-1 text-sm">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">{value}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          {subtext}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Here's what's happening with your subscriptions today.</p>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* RESPONSIVE GRID: 1 col on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          title="Monthly Burn" 
          value={`$${monthlyBurn.toFixed(2)}`} 
          subtext={<><TrendingDown size={16} className="text-red-500"/> Projected expense</>}
          icon={TrendingDown} 
          color="text-red-500"
        />
        <StatCard 
          title="Active Services" 
          value={contracts.length} 
          subtext="Total tracked items"
          icon={ArrowUpRight} 
          color="text-blue-500"
        />
        <StatCard 
          title="Upcoming Renewals" 
          value={upcomingRenewals.length} 
          subtext={<><AlertCircle size={16} className="text-amber-500"/> Next 30 days</>}
          icon={AlertCircle} 
          color="text-amber-500"
        />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-800">Renewals Alert</h3>
        {upcomingRenewals.length === 0 ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 flex items-center gap-3 text-sm sm:text-base">
             <div className="bg-emerald-100 p-2 rounded-full">✓</div> 
             No urgent renewals in the next 30 days. You're clear!
          </div>
        ) : (
          <div className="grid gap-3">
            {upcomingRenewals.map(c => (
               <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-red-300 transition-colors shadow-sm gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg shrink-0">
                      !
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{c.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{c.type} • {c.amount} {c.currency}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto pl-14 sm:pl-0">
                    <p className="text-red-600 font-bold text-sm">Expires {c.renewalDate}</p>
                    <p className="text-xs text-gray-400">Action Required</p>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}