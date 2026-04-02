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
      case 'Cash': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Net Banking': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-dark-500/10 text-dark-400 border-dark-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Payments</h1>
          <p className="text-dark-400 mt-1">Manage payment records</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-payment">+ Add Payment</button>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center text-dark-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Payment Date</th>
                  <th>Amount (₹)</th>
                  <th>Mode</th>
                  <th>Bill ID</th>
                  <th>Mobile Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-dark-500">No payments found</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.Payment_ID}>
                      <td className="font-mono text-primary-400">{p.Payment_ID}</td>
                      <td>{p.Payment_Date ? new Date(p.Payment_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="font-semibold text-emerald-400">₹{Number(p.Amount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-badge border ${getModeColor(p.Payment_Mode)}`}>
                          {p.Payment_Mode}
                        </span>
                      </td>
                      <td className="font-mono">#{p.Bill_ID}</td>
                      <td className="font-mono">{p.Mobile_Number}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(p.Payment_ID)} className="btn-danger">Delete</button>
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
            <label className="block text-sm font-medium text-dark-300 mb-1">Payment Date</label>
            <input type="date" required className="input-field" value={form.Payment_Date}
              onChange={(e) => setForm({ ...form, Payment_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Amount (₹)</label>
            <input type="number" required step="0.01" min="0" className="input-field" value={form.Amount}
              onChange={(e) => setForm({ ...form, Amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Payment Mode</label>
            <select className="select-field" value={form.Payment_Mode}
              onChange={(e) => setForm({ ...form, Payment_Mode: e.target.value })}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Bill</label>
            <select className="select-field" required value={form.Bill_ID}
              onChange={(e) => setForm({ ...form, Bill_ID: e.target.value })}>
              <option value="">-- Select Bill --</option>
              {bills.map((b) => (
                <option key={b.Bill_ID} value={b.Bill_ID}>
                  Bill #{b.Bill_ID} — ₹{b.Total_Amount} ({b.Mobile_Number})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editMode ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Payments;
