import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { Payment_Date: '', Amount: '', Payment_Mode: 'UPI', Bill_ID: '' };

function Payments() {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [payRes, billRes] = await Promise.all([
        API.get('/payments'),
        API.get('/bills')
      ]);
      setPayments(payRes.data);
      setBills(billRes.data);
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

  const openEdit = (p) => {
    setForm({
      Payment_Date: p.Payment_Date ? p.Payment_Date.split('T')[0] : '',
      Amount: p.Amount,
      Payment_Mode: p.Payment_Mode,
      Bill_ID: p.Bill_ID
    });
    setEditMode(true);
    setEditId(p.Payment_ID);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/payments/${editId}`, form);
      } else {
        await API.post('/payments', form);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Error saving payment:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await API.delete(`/payments/${id}`);
      fetchAll();
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'UPI': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Card': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cash': return 'bg-emerald-500/10 text-green-600 border-emerald-500/20';
      case 'Net Banking': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-dark-500/10 text-zinc-400 border-dark-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Payments</h1>
          <p className="text-zinc-400 mt-1">Manage payment records</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-payment">+ Add Payment</button>
      </div>

      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount (₹)</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Bill ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {payments.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="7" className="text-center py-8 text-zinc-400">No payments found</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.Payment_ID}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{p.Payment_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{p.Payment_Date ? new Date(p.Payment_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-semibold text-green-600">₹{Number(p.Amount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getModeColor(p.Payment_Mode)}`}>
                          {p.Payment_Mode}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono">#{p.Bill_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono">{p.Mobile_Number}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(p.Payment_ID)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Payment' : 'Add Payment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Payment Date</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Payment_Date}
              onChange={(e) => setForm({ ...form, Payment_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Amount (₹)</label>
            <input type="number" required step="0.01" min="0" className="block w-full rounded-xl border border-zinc-800 bg-zinc-800/50 py-2.5 px-3 text-zinc-500 cursor-not-allowed sm:text-sm transition-colors" value={form.Amount} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Payment Mode</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" value={form.Payment_Mode}
              onChange={(e) => setForm({ ...form, Payment_Mode: e.target.value })}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Bill</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" required value={form.Bill_ID}
              onChange={(e) => {
                const selectedBillId = e.target.value;
                const bill = bills.find(b => b.Bill_ID == selectedBillId);
                setForm({ 
                  ...form, 
                  Bill_ID: selectedBillId, 
                  Amount: bill ? bill.Total_Amount : form.Amount 
                });
              }}>
              <option value="">-- Select Bill --</option>
              {bills.map((b) => (
                <option key={b.Bill_ID} value={b.Bill_ID}>
                  Bill #{b.Bill_ID} — ₹{b.Total_Amount} ({b.Mobile_Number})
                </option>
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

export default Payments;
