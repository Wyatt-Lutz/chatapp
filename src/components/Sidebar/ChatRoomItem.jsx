const ChatRoomItem = ({
  title,
  unread = 0,
  active,
  onClick,
  onContextMenu,
}) => {
  return (
    <button
      onContextMenu={onContextMenu}
      onClick={onClick}
      className={`group w-full text-left flex items-center gap-3 py-3 px-3 rounded-xl transition-all border border-transparent ${
        active
          ? "bg-zinc-800/80 border-violet-500/50 shadow-inner"
          : "hover:bg-zinc-800/50 hover:border-zinc-700"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60`}
      aria-pressed={active}
    >
      <div className="min-w-0">
        <div
          className={`truncate ${active ? "font-semibold text-zinc-50" : "text-zinc-100/90"}`}
        >
          {title}
        </div>
      </div>

      {unread > 0 && (
        <div className="ml-auto">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-xs font-semibold shadow-sm">
            {unread}
          </span>
        </div>
      )}
    </button>
  );
};

export default ChatRoomItem;
