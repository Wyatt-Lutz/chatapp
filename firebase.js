import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './FIREBASE_CONFIG';


export const actionCodeSettings = {
  url: 'http://localhost:5173/',
}
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth();
export const storage = getStorage();
