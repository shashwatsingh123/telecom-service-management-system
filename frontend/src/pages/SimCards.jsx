import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { Mobile_Number: '', Activation_Date: '', Status: 'Active', Customer_ID: '', Plan_ID: '' };

function SimCards() {
  const [sims, setSims] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [simRes, custRes, planRes] = await Promise.all([
        API.get('/simcards'),
        API.get('/customers'),
        API.get('/plans')
      ]);
      setSims(simRes.data);
      setCustomers(custRes.data);
      setPlans(planRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditMode(false);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setForm({
      Mobile_Number: s.Mobile_Number,
      Activation_Date: s.Activation_Date ? s.Activation_Date.split('T')[0] : '',
      Status: s.Status,
      Customer_ID: s.Customer_ID,
      Plan_ID: s.Plan_ID
    });
    setEditMode(true);
    setEditId(s.SIM_ID);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/simcards/${editId}`, form);
      } else {
        await API.post('/simcards', form);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Error saving SIM:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this SIM card? This will also delete associated bills, payments, and call records.')) return;
    try {
      await API.delete(`/simcards/${id}`);
      fetchAll();
    } catch (err) {
      console.error('Error deleting SIM:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20';
      case 'Inactive': return 'inline-flex items-center rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10';
      case 'Blocked': return 'inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10';
      default: return 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">SIM Cards</h1>
          <p className="text-zinc-400 mt-1">Manage SIM card assignments</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-sim">+ Add SIM Card</button>
      </div>

      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">SIM ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Activation Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {sims.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="7" className="text-center py-8 text-zinc-400">No SIM cards found</td></tr>
                ) : (
                  sims.map((s) => (
                    <tr key={s.SIM_ID}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{s.SIM_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-medium text-zinc-100 tracking-tight font-mono">{s.Mobile_Number}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{s.Activation_Date ? new Date(s.Activation_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400"><span className={getStatusClass(s.Status)}>{s.Status}</span></td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{s.Customer_Name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{s.Plan_Name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(s.SIM_ID)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit SIM Card' : 'Add SIM Card'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Mobile Number</label>
            <input type="text" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Mobile_Number}
              onChange={(e) => setForm({ ...form, Mobile_Number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Activation Date</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Activation_Date}
              onChange={(e) => setForm({ ...form, Activation_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" value={form.Status}
              onChange={(e) => setForm({ ...form, Status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Customer</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" required value={form.Customer_ID}
              onChange={(e) => setForm({ ...form, Customer_ID: e.target.value })}>
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.Customer_ID} value={c.Customer_ID}>{c.Name} (ID: {c.Customer_ID})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Plan</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" required value={form.Plan_ID}
              onChange={(e) => setForm({ ...form, Plan_ID: e.target.value })}>
              <option value="">-- Select Plan --</option>
              {plans.map((p) => (
                <option key={p.Plan_ID} value={p.Plan_ID}>{p.Plan_Name} — ₹{p.Cost} ({p.Plan_Type})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex-1">{editMode ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SimCards;
