function Topbar({ username = 'Admin User', onLogout }) {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1" />

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20">
            {username?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="text-sm font-medium text-zinc-300">{username}</span>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;
