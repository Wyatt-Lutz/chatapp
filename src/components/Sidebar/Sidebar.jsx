const Sidebar = ({ title, children, className, onCollapse }) => {
  return (
    <div
      className={`flex flex-col max-h-[86vh] md:max-h-[80vh] rounded-2xl border border-zinc-700/70 bg-zinc-900/60 backdrop-blur-sm shadow-lg ${className || ""}`}
    >
      <div className="px-4 py-3 border-b border-zinc-700/70 bg-zinc-900/60 rounded-t-2xl shrink-0 flex items-center justify-between">
        <div className="text-sm uppercase tracking-[0.08em] text-zinc-300 font-semibold">
          {title}
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition group"
            aria-label="Collapse sidebar"
          >
            <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition">
              Close
            </span>
            <svg
              className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-3 overflow-auto flex-1 min-h-0">{children}</div>
    </div>
  );
};

export default Sidebar;
