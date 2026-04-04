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

function App() {
  return (
    <div className="flex min-h-screen bg-background text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0 h-screen overflow-hidden">
        <Topbar />
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
