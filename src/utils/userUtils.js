import { signOut } from "firebase/auth";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { ChatroomsContext } from "../context/ChatroomsContext";




export const signUserOut = async(auth, chatDispatch, memberDispatch, messageDispatch, chatRoomsDispatch) => {

  //Reset the context data
  chatDispatch({type: "RESET"});
  memberDispatch({type: "RESET"});
  messageDispatch({type: "RESET"});
  chatRoomsDispatch({type: "RESET"});

  //Firebase sign out
  await signOut(auth).then(() => {
    console.info("Sign out successful")
  }).catch((error) => {
    console.error(error);
  });
}