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
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Customers</h1>
          <p className="text-zinc-400 mt-1">Manage customer records</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-customer">
          + Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Aadhaar Number</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Date of Birth</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {customers.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="7" className="text-center py-8 text-zinc-400">No customers found</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.Customer_ID}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{c.Customer_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-medium text-zinc-100 tracking-tight">{c.Name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-zinc-400">{c.Aadhaar_Number}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{c.Phone}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{c.Date_of_Birth ? new Date(c.Date_of_Birth).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-sm font-medium">
                          {c.Age} yrs
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(c.Customer_ID)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
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
            <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
            <input type="text" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Aadhaar Number</label>
            <input type="text" required maxLength={12} pattern="\d{12}" title="12-digit Aadhaar number" className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              value={form.Aadhaar_Number} onChange={(e) => setForm({ ...form, Aadhaar_Number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
            <input type="text" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Phone}
              onChange={(e) => setForm({ ...form, Phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Date of Birth</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Date_of_Birth}
              onChange={(e) => setForm({ ...form, Date_of_Birth: e.target.value })} />
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

export default Customers;
