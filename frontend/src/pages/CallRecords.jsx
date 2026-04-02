import { useState, useEffect } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';

const emptyForm = { SIM_ID: '', Call_Date: '', Call_Time: '', Call_Duration: '', Call_Type: 'Outgoing' };

function CallRecords() {
  const [records, setRecords] = useState([]);
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editKey, setEditKey] = useState({ simId: null, callId: null });
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [recRes, simRes] = await Promise.all([
        API.get('/callrecords'),
        API.get('/simcards')
      ]);
      setRecords(recRes.data);
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
    setEditKey({ simId: null, callId: null });
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setForm({
      SIM_ID: r.SIM_ID,
      Call_Date: r.Call_Date ? r.Call_Date.split('T')[0] : '',
      Call_Time: r.Call_Time || '',
      Call_Duration: r.Call_Duration,
      Call_Type: r.Call_Type
    });
    setEditMode(true);
    setEditKey({ simId: r.SIM_ID, callId: r.Call_ID });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/callrecords/${editKey.simId}/${editKey.callId}`, form);
      } else {
        await API.post('/callrecords', form);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Error saving call record:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (simId, callId) => {
    if (!window.confirm('Delete this call record?')) return;
    try {
      await API.delete(`/callrecords/${simId}/${callId}`);
      fetchAll();
    } catch (err) {
      console.error('Error deleting call record:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDuration = (seconds) => {
    if (seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Outgoing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Incoming': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Missed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-dark-500/10 text-dark-400 border-dark-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-dark-100">Call Records</h1>
          <p className="text-dark-400 mt-1">View and manage call records (Weak Entity)</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="btn-add-callrecord">+ Add Call Record</button>
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
                  <th>Call ID</th>
                  <th>Mobile Number</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8 text-dark-500">No call records found</td></tr>
                ) : (
                  records.map((r) => (
                    <tr key={`${r.SIM_ID}-${r.Call_ID}`}>
                      <td className="font-mono text-primary-400">{r.SIM_ID}</td>
                      <td className="font-mono text-accent-400">{r.Call_ID}</td>
                      <td className="font-mono">{r.Mobile_Number}</td>
                      <td>{r.Call_Date ? new Date(r.Call_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="font-mono">{r.Call_Time}</td>
                      <td>{formatDuration(r.Call_Duration)}</td>
                      <td>
                        <span className={`status-badge border ${getTypeColor(r.Call_Type)}`}>
                          {r.Call_Type}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(r)} className="btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(r.SIM_ID, r.Call_ID)} className="btn-danger">Delete</button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Edit Call Record' : 'Add Call Record'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">SIM Card</label>
            <select className="select-field" required value={form.SIM_ID} disabled={editMode}
              onChange={(e) => setForm({ ...form, SIM_ID: e.target.value })}>
              <option value="">-- Select SIM --</option>
              {sims.map((s) => (
                <option key={s.SIM_ID} value={s.SIM_ID}>{s.Mobile_Number} (SIM ID: {s.SIM_ID})</option>
              ))}
            </select>
            {editMode && <p className="text-xs text-dark-500 mt-1">SIM cannot be changed for existing records</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Call Date</label>
            <input type="date" required className="input-field" value={form.Call_Date}
              onChange={(e) => setForm({ ...form, Call_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Call Time</label>
            <input type="time" required className="input-field" value={form.Call_Time}
              onChange={(e) => setForm({ ...form, Call_Time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Duration (seconds)</label>
            <input type="number" required min="0" className="input-field" value={form.Call_Duration}
              onChange={(e) => setForm({ ...form, Call_Duration: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Call Type</label>
            <select className="select-field" value={form.Call_Type}
              onChange={(e) => setForm({ ...form, Call_Type: e.target.value })}>
              <option value="Outgoing">Outgoing</option>
              <option value="Incoming">Incoming</option>
              <option value="Missed">Missed</option>
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

export default CallRecords;
