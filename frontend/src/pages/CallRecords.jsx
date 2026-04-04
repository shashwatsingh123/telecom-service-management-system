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
      case 'Incoming': return 'bg-emerald-500/10 text-green-600 border-emerald-500/20';
      case 'Missed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-dark-500/10 text-zinc-400 border-dark-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Call Records</h1>
          <p className="text-zinc-400 mt-1">View and manage call records (Weak Entity)</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all" id="btn-add-callrecord">+ Add Call Record</button>
      </div>

      <div className="bg-[#18181b] shadow-sm ring-1 ring-gray-900/5 rounded-lg " >
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto min-w-full rounded-b-2xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-zinc-900">
                <tr className="hover:bg-zinc-900 transition-colors">
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">SIM ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Call ID</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#18181b]">
                {records.length === 0 ? (
                  <tr className="hover:bg-zinc-900 transition-colors"><td colSpan="8" className="text-center py-8 text-zinc-400">No call records found</td></tr>
                ) : (
                  records.map((r) => (
                    <tr key={`${r.SIM_ID}-${r.Call_ID}`}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-indigo-400">{r.SIM_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono text-accent-400">{r.Call_ID}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono">{r.Mobile_Number}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{r.Call_Date ? new Date(r.Call_Date).toLocaleDateString('en-IN') : ''}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400 font-mono">{r.Call_Time}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">{formatDuration(r.Call_Duration)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getTypeColor(r.Call_Type)}`}>
                          {r.Call_Type}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(r)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(r.SIM_ID, r.Call_ID)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">Delete</button>
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
            <label className="block text-sm font-medium text-zinc-400 mb-1">SIM Card</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" required value={form.SIM_ID} disabled={editMode}
              onChange={(e) => setForm({ ...form, SIM_ID: e.target.value })}>
              <option value="">-- Select SIM --</option>
              {sims.map((s) => (
                <option key={s.SIM_ID} value={s.SIM_ID}>{s.Mobile_Number} (SIM ID: {s.SIM_ID})</option>
              ))}
            </select>
            {editMode && <p className="text-xs text-zinc-400 mt-1">SIM cannot be changed for existing records</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Call Date</label>
            <input type="date" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Call_Date}
              onChange={(e) => setForm({ ...form, Call_Date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Call Time</label>
            <input type="time" required className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Call_Time}
              onChange={(e) => setForm({ ...form, Call_Time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Duration (seconds)</label>
            <input type="number" required min="0" className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" value={form.Call_Duration}
              onChange={(e) => setForm({ ...form, Call_Duration: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Call Type</label>
            <select className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none" value={form.Call_Type}
              onChange={(e) => setForm({ ...form, Call_Type: e.target.value })}>
              <option value="Outgoing">Outgoing</option>
              <option value="Incoming">Incoming</option>
              <option value="Missed">Missed</option>
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

export default CallRecords;
