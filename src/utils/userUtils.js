import { signOut } from "firebase/auth";
import toast from "../components/toast";

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
      toast("Sign out successful", "success");
    })
    .catch((error) => {
      console.error(error);
    });
};
