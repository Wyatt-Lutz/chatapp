import { useForm } from "react-hook-form";
import { changeUsername } from "../../../services/settingsDataService";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../AuthProvider";
import { db } from "../../../../firebase";
import { reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import EmailNotVerified from "../../../utils/EmailNotVerified";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
import ChangeUsername from "./ChangeUsername";
import DeleteAccount from "./DeleteAccount";
import BlockedUsersModel from "./BlockedUsersModel";

const Settings = () => {
  const { currUser } = useContext(AuthContext);
  const [modelDisplayment, setModelDisplayment] = useState("");


  const handleModelDisplaymentChange = (model) => {
    setModelDisplayment(model);
  }

  return (
    <>
      {modelDisplayment === "verification" ? (
        <EmailNotVerified changeDisplayment={handleModelDisplaymentChange} email={newEmail} isUpdatingEmail={true} />
      ) : (
        <>
          <h1>Settings</h1>

          <h2>My Account</h2>

          <div className="flex">
            <img alt="PFP"/>
            <div>{currUser.displayName}</div>
          </div>

          <div className="flex">
            <div>
              <div>Username</div>
              <div>{currUser.displayName}</div>
            </div>
            <button onClick={() => handleModelDisplaymentChange("changeUsername")} className="bg-gray-500">Edit</button>
          </div>

          <div className="flex">
            <div>
              <div>Email</div>
              <div>{currUser.email}</div>
            </div>
            <button onClick={() => handleModelDisplaymentChange("changeEmail")} className="bg-gray-500">Edit</button>
          </div>

          <div className="flex">
            <div>
              <div>Password</div>
              <div>******</div>
            </div>
            <button onClick={() => handleModelDisplaymentChange("changePassword")} className="bg-gray-500">Change</button>
          </div>


          <button onClick={() => handleModelDisplaymentChange("blockedUsers")} className="bg-gray-500">Blocked Users</button>





          <button onClick={() => handleModelDisplaymentChange("deleteAccount")} className="bg-red-500">Delete Account</button>

          {modelDisplayment === "changeUsername" && (
            <ChangeUsername changeDisplayment={handleModelDisplaymentChange} />
          )}
          {modelDisplayment === "changeEmail" && (
            <ChangeEmail changeDisplayment={handleModelDisplaymentChange} />
          )}
          {modelDisplayment === "changePassword" && (
            <ChangePassword changeDisplayment={handleModelDisplaymentChange} />
          )}
          {modelDisplayment === "deleteAccount" && (
            <DeleteAccount changeDisplayment={handleModelDisplaymentChange} />
          )}
          {modelDisplayment === "blockedUsers" && (
            <BlockedUsersModel changeDisplayment={handleModelDisplaymentChange} />
          )}

        </>

      )}
    </>




    //change email


    //change password

    //change pfp

    //delete account
  )
}
export default Settings;