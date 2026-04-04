import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  ListOrdered, 
  CreditCard, 
  PhoneCall, 
  AlertTriangle,
  Smartphone
} from 'lucide-react';

const navItems = [
  { path: '/',            label: 'Overview',    icon: BarChart3 },
  { path: '/customers',   label: 'Customers',   icon: Users },
  { path: '/plans',       label: 'Plans',       icon: ListOrdered },
  { path: '/simcards',    label: 'SIM Cards',   icon: Smartphone },
  { path: '/bills',       label: 'Bills',       icon: CreditCard },
  { path: '/payments',    label: 'Payments',    icon: CreditCard },
  { path: '/callrecords', label: 'Call Records',icon: PhoneCall },
  { path: '/complaints',  label: 'Complaints',  icon: AlertTriangle },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#09090b] flex flex-col z-50">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg leading-none">T</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight leading-tight">Telecom<span className="text-indigo-400">Pro</span></h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-3 px-2">Management</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-zinc-800/50 text-indigo-400'
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {/* Active Indicator line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-500 rounded-r-full transition-all duration-300 opacity-0" 
                   style={{ opacity: 0 /* handled by global active class if we wanted */}} />
            </NavLink>
          );
        })}
      </nav>

      {/* Server Status Footer */}
      <div className="p-4">
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-400">System Online</span>
          </div>
          <p className="text-[11px] text-zinc-500">Connected to 127.0.0.1:5000</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
