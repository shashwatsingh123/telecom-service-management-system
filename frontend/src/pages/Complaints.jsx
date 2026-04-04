import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { Customer_ID: '', Complaint_Date: '', Description: '', Status: 'Open' };

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editKey, setEditKey] = useState({ customerId: null, complaintNo: null });
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [compRes, custRes] = await Promise.all([
        API.get('/complaints'),
        API.get('/customers')
      ]);
      setComplaints(compRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditMode(false);
    setEditKey({ customerId: null, complaintNo: null });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      Customer_ID: c.Customer_ID,
      Complaint_Date: c.Complaint_Date ? c.Complaint_Date.split('T')[0] : '',
      Description: c.Description,
      Status: c.Status
    });
    setEditMode(true);
    setEditKey({ customerId: c.Customer_ID, complaintNo: c.Complaint_No });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/complaints/${editKey.customerId}/${editKey.complaintNo}`, form);
      } else {
        await API.post('/complaints', form);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Error saving complaint:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (customerId, complaintNo) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await API.delete(`/complaints/${customerId}/${complaintNo}`);
      fetchAll();
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10';
      case 'In Progress': return 'status-inprogress';
      case 'Resolved': return 'status-resolved';
      case 'Closed': return 'status-closed';
      default: return 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Complaints</h1>
          <p className="text-zinc-400 mt-1">Manage customer complaints (Weak Entity)</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-complaint">+ Add Complaint</button>
      </div>

      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Complaint #</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {complaints.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="7" className="text-center py-8 text-zinc-400">No complaints found</td></tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={`${c.Customer_ID}-${c.Complaint_No}`}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{c.Customer_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-accent-400">{c.Complaint_No}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-medium text-zinc-100 tracking-tight">{c.Customer_Name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{c.Complaint_Date ? new Date(c.Complaint_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 max-w-xs truncate" title={c.Description}>{c.Description}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400"><span className={getStatusClass(c.Status)}>{c.Status}</span></td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(c.Customer_ID, c.Complaint_No)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Complaint' : 'Add Complaint'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Customer</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" required value={form.Customer_ID} disabled={editMode}
              onChange={(e) => setForm({ ...form, Customer_ID: e.target.value })}>
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.Customer_ID} value={c.Customer_ID}>{c.Name} (ID: {c.Customer_ID})</option>
              ))}
            </select>
            {editMode && <p className="text-xs text-zinc-400 mt-1">Customer cannot be changed for existing complaints</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Complaint Date</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Complaint_Date}
              onChange={(e) => setForm({ ...form, Complaint_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            <textarea required className="block w-full rounded-md border-0 py-1.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 min-h-[100px] resize-y" value={form.Description}
              onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" value={form.Status}
              onChange={(e) => setForm({ ...form, Status: e.target.value })}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
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

export default Complaints;
