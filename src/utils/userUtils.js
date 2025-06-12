import { signOut } from "firebase/auth";

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
      console.info("Sign out successful");
    })
    .catch((error) => {
      console.error(error);
    });
};
