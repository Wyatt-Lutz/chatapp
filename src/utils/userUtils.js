import { signOut } from "firebase/auth";
import { useResetChatContexts } from "../hooks/useContexts";


export const signUserOut = async(auth, chatDispatch, memberDispatch, messageDispatch, chatRoomsDispatch) => {

  //Reset the context data
  const resetContexts = useResetChatContexts();
  resetContexts();
  chatRoomsDispatch({type: "RESET"});

  //Firebase sign out
  await signOut(auth).then(() => {
    console.info("Sign out successful")
  }).catch((error) => {
    console.error(error);
  });
}
