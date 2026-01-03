const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

export default Badge;
