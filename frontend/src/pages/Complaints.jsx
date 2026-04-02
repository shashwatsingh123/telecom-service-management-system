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
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-inprogress';
      case 'Resolved': return 'status-resolved';
      case 'Closed': return 'status-closed';
      default: return 'status-badge';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Complaints</h1>
          <p className="text-dark-400 mt-1">Manage customer complaints (Weak Entity)</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-complaint">+ Add Complaint</button>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center text-dark-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Complaint #</th>
                  <th>Customer Name</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-dark-500">No complaints found</td></tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={`${c.Customer_ID}-${c.Complaint_No}`}>
                      <td className="font-mono text-primary-400">{c.Customer_ID}</td>
                      <td className="font-mono text-accent-400">{c.Complaint_No}</td>
                      <td className="font-medium text-dark-100">{c.Customer_Name}</td>
                      <td>{c.Complaint_Date ? new Date(c.Complaint_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="max-w-xs truncate" title={c.Description}>{c.Description}</td>
                      <td><span className={getStatusClass(c.Status)}>{c.Status}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(c.Customer_ID, c.Complaint_No)} className="btn-danger">Delete</button>
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
            <label className="block text-sm font-medium text-dark-300 mb-1">Customer</label>
            <select className="select-field" required value={form.Customer_ID} disabled={editMode}
              onChange={(e) => setForm({ ...form, Customer_ID: e.target.value })}>
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.Customer_ID} value={c.Customer_ID}>{c.Name} (ID: {c.Customer_ID})</option>
              ))}
            </select>
            {editMode && <p className="text-xs text-dark-500 mt-1">Customer cannot be changed for existing complaints</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Complaint Date</label>
            <input type="date" required className="input-field" value={form.Complaint_Date}
              onChange={(e) => setForm({ ...form, Complaint_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
            <textarea required className="input-field min-h-[100px] resize-y" value={form.Description}
              onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
            <select className="select-field" value={form.Status}
              onChange={(e) => setForm({ ...form, Status: e.target.value })}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
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

export default Complaints;
