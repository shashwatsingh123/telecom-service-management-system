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
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Blocked': return 'status-blocked';
      default: return 'status-badge';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">SIM Cards</h1>
          <p className="text-dark-400 mt-1">Manage SIM card assignments</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-sim">+ Add SIM Card</button>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center text-dark-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SIM ID</th>
                  <th>Mobile Number</th>
                  <th>Activation Date</th>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sims.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-dark-500">No SIM cards found</td></tr>
                ) : (
                  sims.map((s) => (
                    <tr key={s.SIM_ID}>
                      <td className="font-mono text-primary-400">{s.SIM_ID}</td>
                      <td className="font-medium text-dark-100 font-mono">{s.Mobile_Number}</td>
                      <td>{s.Activation_Date ? new Date(s.Activation_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td><span className={getStatusClass(s.Status)}>{s.Status}</span></td>
                      <td>{s.Customer_Name}</td>
                      <td>{s.Plan_Name}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(s.SIM_ID)} className="btn-danger">Delete</button>
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
            <label className="block text-sm font-medium text-dark-300 mb-1">Mobile Number</label>
            <input type="text" required className="input-field" value={form.Mobile_Number}
              onChange={(e) => setForm({ ...form, Mobile_Number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Activation Date</label>
            <input type="date" required className="input-field" value={form.Activation_Date}
              onChange={(e) => setForm({ ...form, Activation_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
            <select className="select-field" value={form.Status}
              onChange={(e) => setForm({ ...form, Status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Customer</label>
            <select className="select-field" required value={form.Customer_ID}
              onChange={(e) => setForm({ ...form, Customer_ID: e.target.value })}>
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.Customer_ID} value={c.Customer_ID}>{c.Name} (ID: {c.Customer_ID})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Plan</label>
            <select className="select-field" required value={form.Plan_ID}
              onChange={(e) => setForm({ ...form, Plan_ID: e.target.value })}>
              <option value="">-- Select Plan --</option>
              {plans.map((p) => (
                <option key={p.Plan_ID} value={p.Plan_ID}>{p.Plan_Name} — ₹{p.Cost} ({p.Plan_Type})</option>
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

export default SimCards;
