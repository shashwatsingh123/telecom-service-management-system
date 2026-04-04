import { useEffect, useState } from 'react';
import API from '../api/axios';

function CustomerPortal({ customerId, customerName, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rechargeForm, setRechargeForm] = useState({ simId: '', amount: '', paymentMode: 'UPI' });

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/customer-portal/profile/${customerId}`);
      setData(res.data);
      if (res.data?.sims?.length && !rechargeForm.simId) {
        setRechargeForm((prev) => ({ ...prev, simId: String(res.data.sims[0].SIM_ID) }));
      }
    } catch (err) {
      console.error('Failed to fetch customer portal:', err);
      alert(err.response?.data?.error || 'Failed to load customer portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [customerId]);

  const submitRecharge = async (e) => {
    e.preventDefault();
    try {
      await API.post('/customer-portal/recharge', {
        customerId,
        simId: Number(rechargeForm.simId),
        amount: Number(rechargeForm.amount),
        paymentMode: rechargeForm.paymentMode
      });
      setRechargeForm((prev) => ({ ...prev, amount: '' }));
      await fetchProfile();
      alert('Recharge successful');
    } catch (err) {
      alert(err.response?.data?.error || 'Recharge failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400">Loading portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="h-16 border-b border-zinc-800/80 bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
        <div>
          <h1 className="text-lg font-semibold">Customer Portal</h1>
          <p className="text-xs text-zinc-500">Welcome, {customerName}</p>
        </div>
        <button onClick={onLogout} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        <section className="bg-[#18181b] border border-zinc-800/50 rounded-2xl p-5">
          <h2 className="text-xl font-bold tracking-tight">Basic Information</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-zinc-500">Name</p>
              <p className="text-zinc-100 font-medium">{data?.customer?.Name}</p>
            </div>
            <div>
              <p className="text-zinc-500">Aadhaar Number</p>
              <p className="text-zinc-100 font-medium">{data?.customer?.Aadhaar_Number}</p>
            </div>
            <div>
              <p className="text-zinc-500">Phone</p>
              <p className="text-zinc-100 font-medium">{data?.customer?.Phone}</p>
            </div>
          </div>
        </section>

        <section className="bg-[#18181b] border border-zinc-800/50 rounded-2xl p-5">
          <h2 className="text-xl font-bold tracking-tight">Your SIM Details</h2>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">SIM Number</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Current Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Plan Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-[#18181b]">
                {data?.sims?.length ? data.sims.map((sim) => (
                  <tr key={sim.SIM_ID}>
                    <td className="px-4 py-3 text-sm text-zinc-100 font-mono">{sim.Mobile_Number}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{sim.Status}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{sim.Plan_Name}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">₹{sim.Cost}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{sim.Data_Limit}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-zinc-500">No SIM records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#18181b] border border-zinc-800/50 rounded-2xl p-5">
            <h2 className="text-xl font-bold tracking-tight">Recharge SIM</h2>
            <form onSubmit={submitRecharge} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Select SIM</label>
                <select
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  value={rechargeForm.simId}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, simId: e.target.value })}
                  required
                >
                  {data?.sims?.map((sim) => (
                    <option key={sim.SIM_ID} value={sim.SIM_ID}>{sim.Mobile_Number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Amount</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  value={rechargeForm.amount}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Payment Mode</label>
                <select
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  value={rechargeForm.paymentMode}
                  onChange={(e) => setRechargeForm({ ...rechargeForm, paymentMode: e.target.value })}
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <button type="submit" className="w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold transition-colors">
                Recharge Now
              </button>
            </form>
          </div>

          <div className="bg-[#18181b] border border-zinc-800/50 rounded-2xl p-5">
            <h2 className="text-xl font-bold tracking-tight">Recent Recharges</h2>
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
              {data?.recentRecharges?.length ? data.recentRecharges.map((r) => (
                <div key={r.Recharge_ID} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-sm text-zinc-200 font-medium">SIM ID: {r.SIM_ID} • ₹{r.Amount}</p>
                  <p className="text-xs text-zinc-500">{r.Payment_Mode} • {r.Recharge_Date}</p>
                </div>
              )) : (
                <p className="text-sm text-zinc-500">No recharges yet</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CustomerPortal;
