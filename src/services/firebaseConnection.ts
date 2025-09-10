import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//--------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCvU0g3qKo0ET4cvlDx2E1IdxJufUTH2Jg",
  authDomain: "webcarros2-e92f0.firebaseapp.com",
  projectId: "webcarros2-e92f0",
  storageBucket: "webcarros2-e92f0.firebasestorage.app",
  messagingSenderId: "327192904676",
  appId: "1:327192904676:web:87f67f916afc42a877fdf1"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export {db, auth, storage}