import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './FIREBASE_CONFIG';



export const app = initializeApp(firebaseConfig);
export const db = getDatabase();
export const auth = getAuth();
export const storage = getStorage();
