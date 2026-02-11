import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { 
  Upload, Search, ChevronUp, ChevronDown, 
  Pencil, Trash2, Download, Plus, X, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inventory() {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [globalCurrency, setGlobalCurrency] = useState('USD');
  const EXCHANGE_RATE = 34;

  const initialFormState = {
    id: null, name: '', type: 'subscription', direction: 'expense', amount: '', 
    currency: 'USD', frequency: 'Monthly', renewalDate: '', owner: '', notes: '', attachment: null
  };
  const [form, setForm] = useState(initialFormState);

  const fetchContracts = () => {
    axios.get('http://localhost:5000/api/contracts', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data));
  };

  useEffect(() => fetchContracts(), [token]);

  // Helper & CRUD Logic (No changes needed here, it's all in the JSX below)
  const toggleExpand = (id) => setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const convertPrice = (amount, itemCurrency) => {
    const val = parseFloat(amount);
    if (!val) return 0;
    if (itemCurrency === globalCurrency) return val;
    if (itemCurrency === 'USD' && globalCurrency === 'THB') return val * EXCHANGE_RATE;
    if (itemCurrency === 'THB' && globalCurrency === 'USD') return val / EXCHANGE_RATE;
    return val;
  };
  const getTypeStyle = (type) => {
    switch(type) {
        case 'subscription': return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case 'license': return "bg-purple-50 text-purple-700 border-purple-200";
        case 'vendor': return "bg-orange-50 text-orange-800 border-orange-200";
        case 'client': return "bg-emerald-50 text-emerald-700 border-emerald-200";
        default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };
  const calculateStatus = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
    if (days <= 30) return { label: 'Due soon', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    return { label: 'Active', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' };
  };
  const handleEdit = (contract) => {
    setForm({
        id: contract.id, name: contract.name, type: contract.type, direction: contract.direction, amount: contract.amount,
        currency: contract.currency, frequency: contract.frequency, renewalDate: contract.renewalDate,
        owner: contract.owner, notes: contract.notes || '', attachment: null
    });
    setShowForm(true);
  };
  const handleAddNew = () => { setForm(initialFormState); setShowForm(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving...');
    const formData = new FormData();
    formData.append('data', JSON.stringify(form));
    if (form.attachment) formData.append('attachment', form.attachment);
    try {
      if (form.id) {
        await axios.put(`http://localhost:5000/api/contracts/${form.id}`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        toast.success('Updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/contracts', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        toast.success('Created successfully');
      }
      toast.dismiss(loadingToast);
      setShowForm(false);
      fetchContracts();
    } catch (err) { toast.dismiss(loadingToast); toast.error('Failed to save'); }
  };
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this contract?")) return;
    await axios.delete(`http://localhost:5000/api/contracts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    toast.success("Deleted");
    fetchContracts();
  };
  const filteredContracts = contracts.filter(c => 
    (filter === '' || c.type === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.owner?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalValue = filteredContracts.reduce((acc, c) => acc + convertPrice(c.amount, c.currency), 0);

  return (
    <div className="font-sans text-brand-black pb-24">
      
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-brand-black tracking-tight">Contracts & Licenses</h2>
            <p className="text-brand-gray mt-1 font-medium text-sm md:text-base">
              Total Active Value: <span className="font-mono text-brand-teal font-bold">
                {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} {globalCurrency}
              </span>
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative group flex-1 md:flex-none">
                <div className="flex items-center justify-between md:justify-start gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <Globe className="w-4 h-4 text-brand-gray" />
                    <select value={globalCurrency} onChange={(e) => setGlobalCurrency(e.target.value)} className="bg-transparent font-medium text-sm text-brand-black outline-none w-full appearance-none pr-6">
                        <option value="USD">USD ($)</option>
                        <option value="THB">THB (฿)</option>
                    </select>
                </div>
            </div>
            <button 
                onClick={handleAddNew}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-soft hover:bg-brand-dark active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add New</span><span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mb-4 md:mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 text-sm outline-none bg-transparent placeholder-gray-400"
              placeholder="Search by name, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4 md:mb-6">
          <div className="flex gap-2 overflow-x-auto p-1 no-scrollbar">
             {['All', 'subscription', 'license', 'vendor', 'client'].map(type => (
                 <button 
                    key={type}
                    onClick={() => setFilter(type === 'All' ? '' : type)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        (filter === type || (filter === '' && type === 'All')) 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-white border border-gray-200 text-brand-gray hover:bg-gray-100'
                    }`}
                 >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                 </button>
             ))}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px] md:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Type", "Renewal", "Frequency", "Cost", "Owner", "Status", "Actions"].map((header) => (
                    <th key={header} className="px-4 md:px-6 py-4 font-bold text-xs uppercase tracking-wider text-brand-gray">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContracts.map((contract) => {
                  const status = calculateStatus(contract.renewalDate);
                  const isExpanded = expandedIds.includes(contract.id);
                  const convertedAmount = convertPrice(contract.amount, contract.currency);
                  return (
                  <div key={contract.id} className="contents group">
                    <tr className={`transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-4 md:px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleExpand(contract.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <span className="font-semibold text-brand-black text-sm md:text-base">{contract.name}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] md:text-[11px] font-bold uppercase tracking-wide border ${getTypeStyle(contract.type)}`}>{contract.type}</span></td>
                      <td className="px-4 md:px-6 py-4 text-brand-black font-medium whitespace-nowrap">{contract.renewalDate}</td>
                      <td className="px-4 md:px-6 py-4 text-brand-gray capitalize">{contract.frequency}</td>
                      <td className="px-4 md:px-6 py-4 text-brand-black font-mono font-medium whitespace-nowrap">{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-brand-gray">{globalCurrency}</span></td>
                      <td className="px-4 md:px-6 py-4 text-brand-gray">
                         {contract.owner ? (<div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-brand-black shrink-0">{contract.owner.charAt(0).toUpperCase()}</div><span className="truncate max-w-[100px]">{contract.owner}</span></div>) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-4 md:px-6 py-4"><div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${status.color}`}><div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div><span>{status.label}</span></div></td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(contract)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(contract.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <td colSpan="8" className="p-0">
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-6 py-6 pl-14 flex flex-col md:flex-row gap-6 md:gap-10">
                                <div className="max-w-xl"><h4 className="text-xs font-bold uppercase text-brand-gray tracking-wider mb-2">Description / Notes</h4><p className="text-sm text-brand-black leading-relaxed">{contract.notes || "No notes provided."}</p></div>
                                {contract.attachmentPath && (<div className="md:ml-auto"><a href={`http://localhost:5000/uploads/${contract.attachmentPath}`} target="_blank" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 w-fit"><Download className="w-4 h-4" /> Download Contract</a></div>)}
                           </motion.div>
                        </td>
                      </tr>
                    )}
                  </div>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      
      {/* FORM MODAL */}
      <AnimatePresence>
        {showForm && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 md:inset-auto md:top-0 md:right-0 md:h-full w-full md:w-[500px] bg-white z-50 shadow-2xl flex flex-col">
                    <div className="p-4 md:p-6 border-b flex justify-between items-center bg-gray-50 border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold text-brand-black">{form.id ? 'Edit Contract' : 'Add New Contract'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={24}/></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-5 flex-1 overflow-y-auto">
                        <div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Contract Name</label><input className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Adobe Creative Cloud"/></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Category</label><select className="w-full p-3 border border-gray-200 rounded-lg bg-white outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="subscription">Subscription</option><option value="license">License</option><option value="vendor">Vendor</option><option value="client">Client</option></select></div><div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Direction</label><select className="w-full p-3 border border-gray-200 rounded-lg bg-white outline-none" value={form.direction} onChange={e => setForm({...form, direction: e.target.value})}><option value="expense">Expense (-)</option><option value="income">Income (+)</option></select></div></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Cost</label><input type="number" className="w-full p-3 border border-gray-200 rounded-lg" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00"/></div><div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Currency</label><select className="w-full p-3 border border-gray-200 rounded-lg bg-white" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}><option value="USD">USD</option><option value="THB">THB</option><option value="EUR">EUR</option></select></div></div>
                        <div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Renewal Date</label><input type="date" className="w-full p-3 border border-gray-200 rounded-lg" required value={form.renewalDate} onChange={e => setForm({...form, renewalDate: e.target.value})}/></div>
                        <div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Description / Notes</label><textarea rows="3" className="w-full p-3 border border-gray-200 rounded-lg resize-none" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Add details..."/></div>
                        <div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Owner Email</label><input type="email" className="w-full p-3 border border-gray-200 rounded-lg" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} placeholder="ash@acme.com"/></div>
                        <div className="space-y-1.5"><label className="text-sm font-semibold text-brand-black">Contract File</label><div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 relative group"><Upload className="w-8 h-8 text-gray-300 mx-auto mb-2"/><input type="file" onChange={e => setForm({...form, attachment: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" /><p className="text-sm text-brand-gray"><span className="text-brand-black font-semibold">Click to upload</span></p></div></div>
                        <div className="pt-2"><button className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-dark transition-all shadow-soft active:scale-95">{form.id ? 'Update Contract' : 'Save Contract'}</button></div>
                    </form>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}