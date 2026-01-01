import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "./Components/DeleteAccount";
import ChangePassword from "./Components/ChangePassword";
import ChangeEmail from "./Components/ChangeEmail";
import ChangeUsername from "./Components/ChangeUsername";
import ChangeProfilePicture from "./Components/ChangeProfilePicture";
import { useAuth } from "../../context/providers/AuthContext";

import ConfirmPassModal from "./modals/ConfirmPassModal";
import BlockedUsersModal from "./modals/BlockedUsersModal";
import { signUserOut } from "../../utils/userUtils";
import { useChatContexts } from "../../hooks/useContexts";
import { auth } from "../../firebase";

const Settings = () => {
  const { currUser } = useAuth();
  const navigate = useNavigate();
  const [currUsername, setCurrUsername] = useState(currUser.displayName);
  const { chatroomsDispatch, resetAllChatContexts } = useChatContexts();

  const [modal, setModal] = useState({ type: null, props: {} });

  const passwordModalHeader = "Confirm Current Password";
  const passwordModalText =
    "Please enter your current password to confirm these changes.";

  const displayPassModal = (header, text, isDeleteAccount = false) => {
    return new Promise((resolve) => {
      setModal({
        type: "ConfirmPassModal",
        props: {
          changeDisplayment: () => setModal({ type: null, props: {} }),
          changeConfirmation: (confirmed) => resolve(confirmed),
          modalHeader: header,
          modalText: text,
          isDeleteAccount: isDeleteAccount,
        },
      });
    });
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-zinc-800/60 backdrop-blur rounded-xl shadow-lg border border-zinc-700 p-6 sm:p-8 space-y-6">
          <div className="mb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-sm text-zinc-400">
                Manage your account and preferences.
              </p>
            </div>
          </div>

          <section className="w-full">
            <div className="bg-zinc-800/40 border border-zinc-700 rounded-md px-8 py-6 flex items-center gap-8 max-w-3xl mx-auto">
              <div className="flex-shrink-0">
                <ChangeProfilePicture />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Signed in as</div>
                <div className="mt-1 text-3xl font-semibold text-zinc-100">
                  {currUsername}
                </div>
                <div className="mt-1 text-sm text-zinc-400">
                  {currUser?.email}
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <ChangeUsername
              displayPassModal={displayPassModal}
              passwordModalHeader={passwordModalHeader}
              passwordModalText={passwordModalText}
              setCurrUsername={setCurrUsername}
            />

            <ChangeEmail
              displayPassModal={displayPassModal}
              passwordModalHeader={passwordModalHeader}
              passwordModalText={passwordModalText}
            />

            <ChangePassword
              displayPassModal={displayPassModal}
              passwordModalHeader={passwordModalHeader}
              passwordModalText={passwordModalText}
            />

            <div className="pt-4 border-t border-zinc-700">
              <DeleteAccount displayPassModal={displayPassModal} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() =>
                setModal({
                  type: "BlockedUsersModal",
                  props: {
                    changeDisplayment: () =>
                      setModal({ type: null, props: {} }),
                  },
                })
              }
              className="text-base text-violet-400 hover:underline font-medium"
            >
              Blocked users
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="text-base text-zinc-300 hover:text-white font-medium"
              >
                Go Home
              </button>
              <button
                onClick={async () =>
                  await signUserOut(
                    auth,
                    resetAllChatContexts,
                    chatroomsDispatch,
                  )
                }
                className="inline-flex items-center rounded-lg bg-linear-to-tr from-violet-600 to-fuchsia-600 px-4 py-2 text-base font-semibold text-white shadow hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
              >
                Sign out
              </button>
            </div>
          </div>

          {modal.type === "ConfirmPassModal" && (
            <ConfirmPassModal {...modal.props} />
          )}
          {modal.type === "BlockedUsersModal" && (
            <BlockedUsersModal {...modal.props} />
          )}
        </div>
      </div>
    </div>
  );
};
export default Settings;
