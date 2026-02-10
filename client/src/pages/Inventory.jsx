import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Plus, FileText, Trash2, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inventory() {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'subscription', direction: 'expense', amount: '', 
    currency: 'USD', frequency: 'Monthly', renewalDate: '', owner: '', attachment: null
  });

  const fetchContracts = () => {
    axios.get('http://localhost:5000/api/contracts', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data));
  };

  useEffect(() => fetchContracts(), [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving...');
    const formData = new FormData();
    formData.append('data', JSON.stringify(form));
    if (form.attachment) formData.append('attachment', form.attachment);

    try {
      await axios.post('http://localhost:5000/api/contracts', formData, { 
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      toast.dismiss(loadingToast);
      toast.success('Added successfully');
      setShowForm(false);
      fetchContracts();
      setForm({ name: '', type: 'subscription', direction: 'expense', amount: '', currency: 'USD', frequency: 'Monthly', renewalDate: '', owner: '', attachment: null });
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    await axios.delete(`http://localhost:5000/api/contracts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    toast.success("Deleted item");
    fetchContracts();
  };

  const getStatusBadge = (date, direction) => {
    if (direction === 'income') return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">Income</span>;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Expired</span>;
    if (days < 7) return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Expiring Soon</span>;
    return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Active</span>;
  };

  const filteredContracts = filter === 'All' ? contracts : contracts.filter(c => c.type === filter);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-brand-black">Inventory</h2>
            <p className="text-brand-gray">Manage contracts and licenses.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
            <Plus size={18} /> Add New
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'subscription', 'license', 'vendor', 'client'].map((f) => (
            <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === f ? 'bg-brand-black text-white' : 'bg-white border border-gray-200 text-brand-gray hover:bg-gray-50'
                }`}
            >
                {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
        ))}
      </div>

      {/* Elegant Table */}
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-brand-gray">
              <th className="p-5 font-semibold">Name</th>
              <th className="p-5 font-semibold">Cost</th>
              <th className="p-5 font-semibold">Renewal</th>
              <th className="p-5 font-semibold">Status</th>
              <th className="p-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredContracts.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-5">
                  <div className="font-bold text-brand-black">{c.name}</div>
                  <div className="text-xs text-brand-gray capitalize">{c.type}</div>
                </td>
                <td className="p-5 font-medium">
                  {c.amount} <span className="text-xs text-brand-gray">{c.currency}</span>
                </td>
                <td className="p-5 text-sm text-brand-black">
                    {c.renewalDate}
                </td>
                <td className="p-5">
                  {getStatusBadge(c.renewalDate, c.direction)}
                </td>
                <td className="p-5 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.attachmentPath && (
                    <a href={`http://localhost:5000/uploads/${c.attachmentPath}`} target="_blank" className="p-2 text-brand-gray hover:text-brand-primary bg-white border rounded-full hover:shadow-sm">
                        <FileText size={16} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-brand-gray hover:text-red-600 bg-white border rounded-full hover:shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContracts.length === 0 && (
            <div className="p-12 text-center text-brand-gray">No items found. Add your first subscription!</div>
        )}
      </Card>

      {/* Slide-over Form (Modal) */}
      <AnimatePresence>
        {showForm && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                    onClick={() => setShowForm(false)}
                    className="fixed inset-0 bg-black z-40"
                />
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white z-50 shadow-2xl p-8 overflow-y-auto"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">New Item</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-black">Name</label>
                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none" required onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Adobe Creative Cloud"/>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-brand-black">Type</label>
                                <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setForm({...form, type: e.target.value})}>
                                    <option value="subscription">Subscription</option>
                                    <option value="license">License</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-brand-black">Direction</label>
                                <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setForm({...form, direction: e.target.value})}>
                                    <option value="expense">Expense (-)</option>
                                    <option value="income">Income (+)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-brand-black">Amount</label>
                                <input type="number" className="w-full p-3 border rounded-lg" required onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00"/>
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-brand-black">Date</label>
                                <input type="date" className="w-full p-3 border rounded-lg" required onChange={e => setForm({...form, renewalDate: e.target.value})}/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-brand-black">Attachment (PDF)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                <input type="file" onChange={e => setForm({...form, attachment: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <span className="text-brand-primary font-bold">Click to upload</span> or drag and drop
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full py-4 text-lg">Save Record</Button>
                        </div>
                    </form>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}