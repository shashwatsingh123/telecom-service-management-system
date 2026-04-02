import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { Plan_Name: '', Plan_Type: 'Prepaid', Cost: '', Data_Limit: '', Validity_Days: '' };

function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await API.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
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
      Plan_Name: p.Plan_Name,
      Plan_Type: p.Plan_Type,
      Cost: p.Cost,
      Data_Limit: p.Data_Limit,
      Validity_Days: p.Validity_Days
    });
    setEditMode(true);
    setEditId(p.Plan_ID);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/plans/${editId}`, form);
      } else {
        await API.post('/plans', form);
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan? This will fail if any SIM cards are using it.')) return;
    try {
      await API.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Plans</h1>
          <p className="text-dark-400 mt-1">Manage mobile plans</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-plan">+ Add Plan</button>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center text-dark-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plan Name</th>
                  <th>Type</th>
                  <th>Cost (₹)</th>
                  <th>Data Limit</th>
                  <th>Validity (Days)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-dark-500">No plans found</td></tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.Plan_ID}>
                      <td className="font-mono text-primary-400">{p.Plan_ID}</td>
                      <td className="font-medium text-dark-100">{p.Plan_Name}</td>
                      <td>
                        <span className={p.Plan_Type === 'Prepaid' ? 'status-active' : 'status-open'}>
                          {p.Plan_Type}
                        </span>
                      </td>
                      <td className="font-semibold text-emerald-400">₹{Number(p.Cost).toLocaleString('en-IN')}</td>
                      <td>{p.Data_Limit}</td>
                      <td>{p.Validity_Days}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(p.Plan_ID)} className="btn-danger">Delete</button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Plan' : 'Add Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Plan Name</label>
            <input type="text" required className="input-field" value={form.Plan_Name}
              onChange={(e) => setForm({ ...form, Plan_Name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Plan Type</label>
            <select className="select-field" value={form.Plan_Type}
              onChange={(e) => setForm({ ...form, Plan_Type: e.target.value })}>
              <option value="Prepaid">Prepaid</option>
              <option value="Postpaid">Postpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Cost (₹)</label>
            <input type="number" required step="0.01" min="0" className="input-field" value={form.Cost}
              onChange={(e) => setForm({ ...form, Cost: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Data Limit</label>
            <input type="text" required className="input-field" placeholder="e.g. 2 GB/day" value={form.Data_Limit}
              onChange={(e) => setForm({ ...form, Data_Limit: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Validity (Days)</label>
            <input type="number" required min="1" className="input-field" value={form.Validity_Days}
              onChange={(e) => setForm({ ...form, Validity_Days: e.target.value })} />
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

export default Plans;
