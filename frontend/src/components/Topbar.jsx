import { Bell, Search, User } from 'lucide-react';

function Topbar() {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {/* Search disabled per user request */}
      </div>

      <div className="flex items-center gap-5">
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20">
            A
          </div>
          <span className="text-sm font-medium text-zinc-300">Admin User</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
