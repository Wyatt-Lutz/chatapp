const PageNotFound = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center rounded-2xl bg-zinc-800/70 border border-zinc-700 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 mb-6">
          404 · Page not found
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Uh oh, this page doesn&apos;t exist.
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          The link might be broken, or the page may have been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
        >
          Go back home
        </a>
      </div>
    </div>
  );
};
export default PageNotFound;
