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
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Bills</h1>
          <p className="text-dark-400 mt-1">Manage billing records</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-bill">+ Add Bill</button>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center text-dark-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Bill Date</th>
                  <th>Due Date</th>
                  <th>Amount (₹)</th>
                  <th>SIM (Mobile)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-dark-500">No bills found</td></tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b.Bill_ID}>
                      <td className="font-mono text-primary-400">{b.Bill_ID}</td>
                      <td>{b.Bill_Date ? new Date(b.Bill_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td>{b.Due_Date ? new Date(b.Due_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="font-semibold text-emerald-400">₹{Number(b.Total_Amount).toLocaleString('en-IN')}</td>
                      <td className="font-mono">{b.Mobile_Number} <span className="text-dark-500 text-xs">(SIM {b.SIM_ID})</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(b)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(b.Bill_ID)} className="btn-danger">Delete</button>
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
            <label className="block text-sm font-medium text-dark-300 mb-1">Bill Date</label>
            <input type="date" required className="input-field" value={form.Bill_Date}
              onChange={(e) => setForm({ ...form, Bill_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Due Date</label>
            <input type="date" required className="input-field" value={form.Due_Date}
              onChange={(e) => setForm({ ...form, Due_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Total Amount (₹)</label>
            <input type="number" required step="0.01" min="0" className="input-field" value={form.Total_Amount}
              onChange={(e) => setForm({ ...form, Total_Amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">SIM Card</label>
            <select className="select-field" required value={form.SIM_ID}
              onChange={(e) => setForm({ ...form, SIM_ID: e.target.value })}>
              <option value="">-- Select SIM --</option>
              {sims.map((s) => (
                <option key={s.SIM_ID} value={s.SIM_ID}>{s.Mobile_Number} (SIM ID: {s.SIM_ID})</option>
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

export default Bills;
