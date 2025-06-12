import CloseModal from "./ui/CloseModal";

const BlockedUserWarning = ({ setModal, setAddedUsers, user }) => {
  const onAddUser = () => {
    setAddedUsers((prev) => [...prev, user]);
    setModal({ type: "", user: null });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-600 rounded-lg shadow-lg">
        <button
          onClick={() => setModal({ type: "", user: null })}
          className="absolute top-4 right-4"
        >
          <CloseModal />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Blocked User</h2>
        <p>
          The user you are trying to add has been blocked. Are you sure you want
          to add them?
        </p>
        <div>
          <button
            className="border rounded-md bg-zinc-500 m-2 p-1"
            onClick={onAddUser}
          >
            Yes
          </button>
          <button
            className="border rounded-md bg-zinc-500 m-2 p-1"
            onClick={() => setModal({ type: "", user: null })}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
export default BlockedUserWarning;
