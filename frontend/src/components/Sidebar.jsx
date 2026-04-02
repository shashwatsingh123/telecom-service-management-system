import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/',            label: 'Dashboard',    icon: '📊' },
  { path: '/customers',   label: 'Customers',    icon: '👥' },
  { path: '/plans',       label: 'Plans',        icon: '📋' },
  { path: '/simcards',    label: 'SIM Cards',    icon: '📱' },
  { path: '/bills',       label: 'Bills',        icon: '🧾' },
  { path: '/payments',    label: 'Payments',     icon: '💳' },
  { path: '/callrecords', label: 'Call Records', icon: '📞' },
  { path: '/complaints',  label: 'Complaints',  icon: '📝' },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700/50">
        <h1 className="text-xl font-bold gradient-text">TelecomPro</h1>
        <p className="text-xs text-dark-500 mt-1">Service Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-primary-300 border border-primary-500/20 shadow-lg shadow-primary-500/5'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
              }`
            }
          >
            <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700/50">
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-dark-500">DBS Project</p>
          <p className="text-xs text-primary-400 font-medium mt-0.5">Telecom DBMS</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
