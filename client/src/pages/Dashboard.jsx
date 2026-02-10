import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Card } from '../components/ui/Card';
import { TrendingUp, TrendingDown, AlertCircle, ArrowUpRight } from 'lucide-react';

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
    <Card className="relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <p className="text-brand-gray font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-brand-black mb-2">{value}</h3>
        <p className="text-sm text-brand-gray flex items-center gap-1">
          {subtext}
        </p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-black">Overview</h2>
          <p className="text-brand-gray mt-1">Here's what's happening with your subscriptions today.</p>
        </div>
        <div className="text-sm text-brand-gray">
          Current Date: <span className="font-semibold text-brand-black">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Monthly Burn" 
          value={`$${monthlyBurn.toFixed(2)}`} 
          subtext={<><TrendingDown size={16} className="text-brand-primary"/> Projected expense</>}
          icon={TrendingDown} 
          color="text-brand-primary"
        />
        <StatCard 
          title="Active Services" 
          value={contracts.length} 
          subtext="Total tracked items"
          icon={ArrowUpRight} 
          color="text-brand-teal"
        />
        <StatCard 
          title="Upcoming Renewals" 
          value={upcomingRenewals.length} 
          subtext={<><AlertCircle size={16} className="text-brand-orange"/> Next 30 days</>}
          icon={AlertCircle} 
          color="text-brand-orange"
        />
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Renewals Alert</h3>
        {upcomingRenewals.length === 0 ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-100 flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-full">✓</div> 
             No urgent renewals in the next 30 days. You're clear!
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingRenewals.map(c => (
               <Card key={c.id} className="flex justify-between items-center hover:border-brand-primary/50 cursor-pointer transition-colors !p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-brand-primary flex items-center justify-center font-bold text-lg">
                      !
                    </div>
                    <div>
                      <h4 className="font-bold">{c.name}</h4>
                      <p className="text-sm text-brand-gray">{c.type} • {c.amount} {c.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-primary font-bold text-sm">Expires {c.renewalDate}</p>
                    <p className="text-xs text-brand-gray">Action Required</p>
                  </div>
               </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}