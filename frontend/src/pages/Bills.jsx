import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { Bill_Date: '', Due_Date: '', Total_Amount: '', SIM_ID: '' };

function Bills() {
  const [bills, setBills] = useState([]);
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [billRes, simRes] = await Promise.all([
        API.get('/bills'),
        API.get('/simcards')
      ]);
      setBills(billRes.data);
      setSims(simRes.data);
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

  const openEdit = (b) => {
    setForm({
      Bill_Date: b.Bill_Date ? b.Bill_Date.split('T')[0] : '',
      Due_Date: b.Due_Date ? b.Due_Date.split('T')[0] : '',
      Total_Amount: b.Total_Amount,
      SIM_ID: b.SIM_ID
    });
    setEditMode(true);
    setEditId(b.Bill_ID);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/bills/${editId}`, form);
      } else {
        await API.post('/bills', form);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Error saving bill:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill? Associated payments will also be deleted.')) return;
    try {
      await API.delete(`/bills/${id}`);
      fetchAll();
    } catch (err) {
      console.error('Error deleting bill:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Bills</h1>
          <p className="text-zinc-400 mt-1">Manage billing records</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-bill">+ Add Bill</button>
      </div>

      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Bill ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Bill Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">SIM (Mobile)</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {bills.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="6" className="text-center py-8 text-zinc-400">No bills found</td></tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b.Bill_ID}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{b.Bill_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{b.Bill_Date ? new Date(b.Bill_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{b.Due_Date ? new Date(b.Due_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-semibold text-green-600">₹{Number(b.Total_Amount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono">{b.Mobile_Number} <span className="text-zinc-400 text-xs">(SIM {b.SIM_ID})</span></td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(b)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(b.Bill_ID)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Bill' : 'Add Bill'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Bill Date</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Bill_Date}
              onChange={(e) => setForm({ ...form, Bill_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Due_Date}
              onChange={(e) => setForm({ ...form, Due_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Total Amount (₹)</label>
            <input type="number" required step="0.01" min="0" className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/50 py-2.5 px-3 text-zinc-500 cursor-not-allowed sm:text-sm transition-colors" value={form.Total_Amount} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">SIM Card</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" required value={form.SIM_ID}
              onChange={(e) => {
                const selectedSimId = e.target.value;
                const sim = sims.find(s => s.SIM_ID == selectedSimId);
                setForm({ 
                  ...form, 
                  SIM_ID: selectedSimId, 
                  Total_Amount: sim ? sim.Plan_Cost : form.Total_Amount 
                });
              }}>
              <option value="">-- Select SIM --</option>
              {sims.map((s) => (
                <option key={s.SIM_ID} value={s.SIM_ID}>{s.Mobile_Number} (SIM ID: {s.SIM_ID})</option>
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

export default Bills;
