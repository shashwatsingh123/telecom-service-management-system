import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, Smartphone, CreditCard, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        { label: 'Total Customers',  value: stats.totalCustomers,  icon: Users,        color: 'text-indigo-400' },
        { label: 'Active SIMs',      value: stats.activeSims,      icon: Smartphone,   color: 'text-blue-400' },
        { label: 'Total Revenue',    value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`, icon: FileText,     color: 'text-emerald-400' },
        { label: 'Total Bills',      value: stats.totalBills,      icon: FileText,     color: 'text-zinc-400' },
        { label: 'Paid Bills',       value: stats.paidBills,       icon: CheckCircle,  color: 'text-emerald-400' },
        { label: 'Pending Bills',    value: stats.pendingBills,    icon: Clock,        color: 'text-amber-400' },
        { label: 'Open Complaints',  value: stats.openComplaints,  icon: AlertTriangle,color: 'text-red-400' },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium tracking-wide">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Overview</h1>
        <p className="text-sm text-zinc-400 mt-1">Real-time telecommunication metrics and system info.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-surface border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">{card.value}</h3>
              <p className="text-sm text-zinc-500 mt-1 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;
