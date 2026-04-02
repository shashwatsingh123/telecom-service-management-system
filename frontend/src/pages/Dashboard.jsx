import { useState, useEffect } from 'react';
import API from '../api/axios';

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
        { label: 'Total Customers',  value: stats.totalCustomers,  icon: '👥', color: 'from-primary-500 to-primary-600',   bgGlow: 'shadow-primary-500/20' },
        { label: 'Active SIMs',      value: stats.activeSims,      icon: '📱', color: 'from-emerald-500 to-emerald-600',   bgGlow: 'shadow-emerald-500/20' },
        { label: 'Total Revenue',    value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`, icon: '💰', color: 'from-amber-500 to-amber-600', bgGlow: 'shadow-amber-500/20' },
        { label: 'Total Bills',      value: stats.totalBills,      icon: '🧾', color: 'from-blue-500 to-blue-600',        bgGlow: 'shadow-blue-500/20' },
        { label: 'Paid Bills',       value: stats.paidBills,       icon: '✅', color: 'from-emerald-500 to-teal-600',      bgGlow: 'shadow-emerald-500/20' },
        { label: 'Pending Bills',    value: stats.pendingBills,    icon: '⏳', color: 'from-orange-500 to-orange-600',     bgGlow: 'shadow-orange-500/20' },
        { label: 'Open Complaints',  value: stats.openComplaints,  icon: '📝', color: 'from-red-500 to-red-600',           bgGlow: 'shadow-red-500/20' },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-dark-100">Dashboard</h1>
        <p className="text-dark-400 mt-1">Overview of your telecom operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`glass-card-hover p-5 animate-fade-in-up shadow-lg ${card.bgGlow}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-dark-100 mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl shadow-lg`}>
                {card.icon}
              </div>
            </div>
            {/* Decorative bar */}
            <div className="mt-4 h-1 w-full bg-dark-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-1000`}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">System Information</h3>
          <div className="space-y-3">
            <InfoRow label="Database" value="MySQL (telecom_db)" />
            <InfoRow label="Backend" value="Node.js / Express" />
            <InfoRow label="Frontend" value="React / Vite / Tailwind" />
            <InfoRow label="API Port" value="5000" />
            <InfoRow label="Frontend Port" value="5173" />
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Entity Summary</h3>
          <div className="space-y-3">
            <InfoRow label="Strong Entities" value="Customer, Plan, SIM Card, Bill, Payment" />
            <InfoRow label="Weak Entities" value="Call Record, Complaint" />
            <InfoRow label="Derived Attribute" value="Age (from Date_of_Birth)" />
            <InfoRow label="Composite Keys" value="(SIM_ID, Call_ID) , (Customer_ID, Complaint_No)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-dark-500 min-w-[130px] font-medium">{label}</span>
      <span className="text-dark-300">{value}</span>
    </div>
  );
}

export default Dashboard;
