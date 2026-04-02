import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { Name: '', Aadhaar_Number: '', Phone: '', Date_of_Birth: '' };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
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

  const openEdit = (c) => {
    setForm({
      Name: c.Name,
      Aadhaar_Number: c.Aadhaar_Number,
      Phone: c.Phone,
      Date_of_Birth: c.Date_of_Birth ? c.Date_of_Birth.split('T')[0] : ''
    });
    setEditMode(true);
    setEditId(c.Customer_ID);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/customers/${editId}`, form);
      } else {
        await API.post('/customers', form);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer? This will also delete all their SIM cards, bills, and complaints.')) return;
    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Customers</h1>
          <p className="text-dark-400 mt-1">Manage customer records</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-customer">
          + Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {loading ? (
          <div className="p-8 text-center text-dark-400">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Aadhaar Number</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-dark-500">No customers found</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.Customer_ID}>
                      <td className="font-mono text-primary-400">{c.Customer_ID}</td>
                      <td className="font-medium text-dark-100">{c.Name}</td>
                      <td className="font-mono text-dark-300">{c.Aadhaar_Number}</td>
                      <td>{c.Phone}</td>
                      <td>{c.Date_of_Birth ? new Date(c.Date_of_Birth).toLocaleDateString('en-IN') : ''}</td>
                      <td>
                        <span className="px-2 py-1 bg-primary-500/10 text-primary-300 rounded-lg text-sm font-medium">
                          {c.Age} yrs
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(c.Customer_ID)} className="btn-danger">Delete</button>
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Name</label>
            <input type="text" required className="input-field" value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Aadhaar Number</label>
            <input type="text" required maxLength={12} pattern="\d{12}" title="12-digit Aadhaar number" className="input-field"
              value={form.Aadhaar_Number} onChange={(e) => setForm({ ...form, Aadhaar_Number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Phone</label>
            <input type="text" required className="input-field" value={form.Phone}
              onChange={(e) => setForm({ ...form, Phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Date of Birth</label>
            <input type="date" required className="input-field" value={form.Date_of_Birth}
              onChange={(e) => setForm({ ...form, Date_of_Birth: e.target.value })} />
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

export default Customers;
