const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full panel-bg text-slate-100 overflow-x-hidden">
      {children}
    </div>
  );
};

export default Layout;
