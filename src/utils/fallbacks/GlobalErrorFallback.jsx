export const GlobalErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8">
          <div className="mb-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-linear-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md">
              <span className="text-xl font-bold">!</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              An unexpected error occurred while loading the app.
            </p>
          </div>

          {error?.message && (
            <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 wrap-break-word">
              {error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="button"
              onClick={resetErrorBoundary}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
