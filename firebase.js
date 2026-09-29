// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCuhS5TRJ8Hw3U0oLY7fzlowwtNVJ4-JI",
  authDomain: "aims-tutorial-838dd.firebaseapp.com",
  projectId: "aims-tutorial-838dd",
  storageBucket: "aims-tutorial-838dd.firebasestorage.app",
  messagingSenderId: "182619434148",
  appId: "1:182619434148:web:c902f092f9ecdaa60aca31",
  measurementId: "G-KBEEE1PXJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;