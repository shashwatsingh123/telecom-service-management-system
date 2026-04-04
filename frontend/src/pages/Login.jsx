import { useState } from 'react';
import API from '../api/axios';

function Login({ onAdminAuth, onCustomerAuth }) {
  const [mode, setMode] = useState('admin');
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [customerForm, setCustomerForm] = useState({ aadhaarNumber: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/admin-login', adminForm);
      onAdminAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/customer-login', customerForm);
      onCustomerAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Customer login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#18181b] border border-zinc-800/70 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Telecom<span className="text-indigo-400">Pro</span></h1>
          <p className="text-sm text-zinc-400 mt-1">Login to continue</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => { setMode('admin'); setError(''); }}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${mode === 'admin' ? 'bg-indigo-500 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
          >
            Admin Login
          </button>
          <button
            onClick={() => { setMode('customer'); setError(''); }}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${mode === 'customer' ? 'bg-indigo-500 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
          >
            Customer Login
          </button>
        </div>

        {mode === 'admin' ? (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Username</label>
              <input
                type="text"
                required
                value={adminForm.username}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? 'Signing in...' : 'Login as Admin'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Aadhaar Number</label>
              <input
                type="text"
                required
                value={customerForm.aadhaarNumber}
                onChange={(e) => setCustomerForm({ ...customerForm, aadhaarNumber: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phone</label>
              <input
                type="text"
                required
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? 'Signing in...' : 'Login as Customer'}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
