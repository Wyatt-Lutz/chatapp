import { useNavigate } from "react-router";

const CheckEmail = ({ email }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
            <span className="text-xl font-bold">@</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            We sent a password reset link to{" "}
            <span className="text-zinc-100 font-medium">{email}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Follow the instructions there, then return to sign in.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
          >
            Return to sign in
          </button>
        </div>
      </div>
    </div>
  );
};
export default CheckEmail;
