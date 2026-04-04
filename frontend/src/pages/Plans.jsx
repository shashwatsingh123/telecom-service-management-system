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
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Plans</h1>
          <p className="text-zinc-400 mt-1">Manage mobile plans</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-plan">+ Add Plan</button>
      </div>

      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Plan Name</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Cost (₹)</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Data Limit</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Validity (Days)</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {plans.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="7" className="text-center py-8 text-zinc-400">No plans found</td></tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p.Plan_ID}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{p.Plan_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-medium text-zinc-100 tracking-tight">{p.Plan_Name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <span className={p.Plan_Type === 'Prepaid' ? 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20' : 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'}>
                          {p.Plan_Type}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-semibold text-green-600">₹{Number(p.Cost).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{p.Data_Limit}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{p.Validity_Days}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(p.Plan_ID)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
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
            <label className="block text-sm font-medium text-zinc-400 mb-1">Plan Name</label>
            <input type="text" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Plan_Name}
              onChange={(e) => setForm({ ...form, Plan_Name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Plan Type</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" value={form.Plan_Type}
              onChange={(e) => setForm({ ...form, Plan_Type: e.target.value })}>
              <option value="Prepaid">Prepaid</option>
              <option value="Postpaid">Postpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Cost (₹)</label>
            <input type="number" required step="0.01" min="0" className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Cost}
              onChange={(e) => setForm({ ...form, Cost: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Data Limit</label>
            <input type="text" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" placeholder="e.g. 2 GB/day" value={form.Data_Limit}
              onChange={(e) => setForm({ ...form, Data_Limit: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Validity (Days)</label>
            <input type="number" required min="1" className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Validity_Days}
              onChange={(e) => setForm({ ...form, Validity_Days: e.target.value })} />
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

export default Plans;
