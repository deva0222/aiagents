import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0890735580",
  appId: "1:374895065098:web:01d389e85071f6687147f3",
  apiKey: "AIzaSyAcmfaG1Ww_r21sjBOHqjrzKGDCEKGYdbE",
  authDomain: "gen-lang-client-0890735580.firebaseapp.com",
  messagingSenderId: "374895065098",
  storageBucket: "gen-lang-client-0890735580.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
