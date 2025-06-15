import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteAccount from "./Components/DeleteAccount";
import ChangePassword from "./Components/ChangePassword";
import ChangeEmail from "./Components/ChangeEmail";
import ChangeUsername from "./Components/ChangeUsername";
import ChangeProfilePicture from "./Components/ChangeProfilePicture";
import { useAuth } from "../../context/providers/AuthContext";
import { lazy } from "react";

const EmailNotVerified = lazy(
  () => import("../../components/EmailNotVerified"),
);

import ConfirmPassModal from "./modals/ConfirmPassModal";
import BlockedUsersModal from "./modals/BlockedUsersModal";

const Settings = () => {
  const { currUser } = useAuth();
  const navigate = useNavigate();

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
          changeConfirmation: (confirmed) => confirmed && resolve(),
          modalHeader: header,
          modalText: text,
          isDeleteAccount: isDeleteAccount,
        },
      });
    });
  };

  return (
    <>
      <h1>Settings</h1>

      <h2>My Account</h2>

      <div className="flex">
        <ChangeProfilePicture />
        <div>{currUser.displayName}</div>
      </div>

      <ChangeUsername
        displayPassModal={displayPassModal}
        passwordModalHeader={passwordModalHeader}
        passwordModalText={passwordModalText}
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
      <DeleteAccount displayPassModal={displayPassModal} />

      <button
        onClick={() =>
          setModal({
            type: "BlockedUsersModal",
            props: {
              changeDisplayment: () => setModal({ type: null, props: {} }),
            },
          })
        }
        className="bg-gray-500"
      >
        Blocked Users
      </button>

      <button onClick={() => navigate("/")}>Go Home</button>

      {modal.type === "ConfirmPassModal" && (
        <ConfirmPassModal {...modal.props} />
      )}
      {modal.type === "EmailNotVerified" && (
        <EmailNotVerified {...modal.props} />
      )}
      {modal.type === "BlockedUsersModal" && (
        <BlockedUsersModal {...modal.props} />
      )}
    </>
  );
};
export default Settings;
