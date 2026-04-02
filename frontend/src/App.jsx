import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
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
    <div className="flex min-h-screen bg-dark-950">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
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
  );
}

export default App;
