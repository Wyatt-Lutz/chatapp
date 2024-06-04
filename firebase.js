import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyBu-sdXz1njK-QXuDGN9FRjQX0yc8UhjIY",
  authDomain: "chatapp-fb9af.firebaseapp.com",
  databaseURL: "https://chatapp-fb9af-default-rtdb.firebaseio.com",
  projectId: "chatapp-fb9af",
  storageBucket: "chatapp-fb9af.appspot.com",
  messagingSenderId: "877180065623",
  appId: "1:877180065623:web:a78a64d378bc92b2cc1012",
  measurementId: "G-59XNF9LKSY"
};



export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth();
export const storage = getStorage();
