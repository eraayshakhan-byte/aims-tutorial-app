import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
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
export const analytics = getAnalytics(app);

// Export Auth & Database
export const auth = getAuth(app);
export const db = getFirestore(app);

// Admin Email Definition
export const ADMIN_EMAIL = "admin@aims.com";

export default app;