import { signOut } from "firebase/auth";

export const signUserOut = async(auth, resetAllChatContexts, chatRoomsDispatch) => {

  //Reset the context data
  resetAllChatContexts();
  chatRoomsDispatch({type: "RESET"});

  //Firebase sign out
  await signOut(auth).then(() => {
    console.info("Sign out successful")
  }).catch((error) => {
    console.error(error);
  });
}
