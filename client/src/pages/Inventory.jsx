import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function Inventory() {
  const { token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    name: '', type: 'subscription', direction: 'expense', amount: '', 
    currency: 'USD', frequency: 'Monthly', renewalDate: '', owner: '', noticePeriod: 30, attachment: null
  });

  const fetchContracts = () => {
    axios.get('http://localhost:5000/api/contracts', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setContracts(res.data));
  };

  useEffect(() => fetchContracts(), [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('data', JSON.stringify(form));
    if (form.attachment) formData.append('attachment', form.attachment);

    await axios.post('http://localhost:5000/api/contracts', formData, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
    });
    setShowForm(false);
    fetchContracts();
  };

  const getStatusColor = (date, direction) => {
    if (direction === 'income') return 'bg-blue-100 text-blue-800';
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'bg-gray-200 text-gray-600';
    if (days < 7) return 'bg-red-100 text-red-800';
    if (days < 30) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredContracts = filter === 'All' ? contracts : contracts.filter(c => c.type === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Inventory</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add New</button>
      </div>

      {/* FILTERING (FR-08) */}
      <div className="mb-4">
        <select onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded">
          <option value="All">All Types</option>
          <option value="subscription">Subscriptions</option>
          <option value="client">Client Contracts</option>
          <option value="vendor">Vendor Contracts</option>
        </select>
      </div>

      {/* ADD FORM (FR-06) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">
          <input placeholder="Name" className="border p-2 rounded" onChange={e => setForm({...form, name: e.target.value})} required />
          <select className="border p-2 rounded" onChange={e => setForm({...form, type: e.target.value})}>
             <option value="subscription">SaaS Subscription</option>
             <option value="license">Software License</option>
             <option value="vendor">Vendor Contract</option>
             <option value="client">Client Contract</option>
          </select>
          <select className="border p-2 rounded" onChange={e => setForm({...form, direction: e.target.value})}>
             <option value="expense">Payable (Expense)</option>
             <option value="income">Receivable (Income)</option>
          </select>
          <input type="number" placeholder="Cost/Value" className="border p-2 rounded" onChange={e => setForm({...form, amount: e.target.value})} required />
          <input type="date" className="border p-2 rounded" onChange={e => setForm({...form, renewalDate: e.target.value})} required />
          <input placeholder="Owner (e.g. CTO)" className="border p-2 rounded" onChange={e => setForm({...form, owner: e.target.value})} />
          {/* FR-09 File Attachment */}
          <div className="col-span-2">
            <label className="block text-sm text-gray-600">Attach Contract (PDF)</label>
            <input type="file" onChange={e => setForm({...form, attachment: e.target.files[0]})} className="border p-2 w-full" />
          </div>
          <button className="bg-green-600 text-white p-2 rounded col-span-2">Save Record</button>
        </form>
      )}

      {/* LIST TABLE (FR-07) */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Value</th>
              <th className="p-4">Renewal</th>
              <th className="p-4">Status</th>
              <th className="p-4">Doc</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{c.name}</td>
                <td className="p-4 capitalize">{c.type}</td>
                <td className="p-4">{c.amount} {c.currency} <span className="text-xs text-gray-500">/{c.frequency}</span></td>
                <td className="p-4">{c.renewalDate}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(c.renewalDate, c.direction)}`}>
                    {c.direction === 'income' ? 'Income' : 'Active'}
                  </span>
                </td>
                <td className="p-4">
                  {c.attachmentPath && (
                    <a href={`http://localhost:5000/uploads/${c.attachmentPath}`} target="_blank" className="text-blue-500 underline text-sm">View PDF</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}