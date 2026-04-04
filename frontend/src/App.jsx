import { useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Plans from './pages/Plans';
import SimCards from './pages/SimCards';
import Bills from './pages/Bills';
import Payments from './pages/Payments';
import CallRecords from './pages/CallRecords';
import Complaints from './pages/Complaints';
import Login from './pages/Login';
import CustomerPortal from './pages/CustomerPortal';

const AUTH_KEY = 'telecom_auth_session';

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const setAndPersistSession = (value) => {
    setSession(value);
    if (value) localStorage.setItem(AUTH_KEY, JSON.stringify(value));
    else localStorage.removeItem(AUTH_KEY);
  };

  const handleAdminAuth = (data) => {
    setAndPersistSession({ role: 'admin', username: data.username });
  };

  const handleCustomerAuth = (data) => {
    setAndPersistSession({ role: 'customer', customerId: data.customerId, name: data.name });
  };

  const onLogout = () => setAndPersistSession(null);

  const role = useMemo(() => session?.role || null, [session]);

  if (!role) {
    return <Login onAdminAuth={handleAdminAuth} onCustomerAuth={handleCustomerAuth} />;
  }

  if (role === 'customer') {
    return (
      <CustomerPortal
        customerId={session.customerId}
        customerName={session.name}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0 h-screen overflow-hidden">
        <Topbar onLogout={onLogout} username={session.username || 'Admin User'} />
        <main className="flex-1 overflow-y-auto p-8 border-l border-zinc-800/50 bg-[#09090b] relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/simcards" element={<SimCards />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/callrecords" element={<CallRecords />} />
            <Route path="/complaints" element={<Complaints />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
