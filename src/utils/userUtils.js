import { signOut } from "firebase/auth";
import { showToast } from "../services/toastService";

export const signUserOut = async (
  auth,
  resetAllChatContexts,
  chatroomsDispatch,
) => {
  //Reset the context data
  resetAllChatContexts();
  chatroomsDispatch({ type: "RESET" });

  //Firebase sign out
  await signOut(auth)
    .then(() => {
      showToast("Sign out successful", "success");
    })
    .catch((error) => {
      console.error(error);
    });
};
