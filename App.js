// firebase.js — Firebase SDK v9+ (modular) setup for AIMS Tutorial
//
// 1. Firebase Console → Project settings → "Your apps" → Web app → copy the config below.
// 2. Terminal: npm install firebase
//
// NOTE: the web config is NOT a secret. Security comes from Firestore Rules (see firestore.rules).

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Primary app: used for the logged-in user (admin or student).
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   // persists sessions automatically (local persistence)
export const db = getFirestore(app);

// The admin account. Create this user ONCE in Firebase Console → Authentication → Users.
export const ADMIN_EMAIL = "admin@aims.com";

// Secondary app: lets the admin create/reset student logins WITHOUT being signed out
// of their own admin session. (Calling these on the primary auth would sign the
// admin OUT and the student IN, since Firebase Auth only tracks one session per app.)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

export async function createStudentAuthAccount(email, password) {
  try {
    await createUserWithEmailAndPassword(secondaryAuth, email, password);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      // Login already exists (e.g. student was deleted and is being re-registered).
      // Works only if the password matches; otherwise this throws auth/invalid-credential.
      await signInWithEmailAndPassword(secondaryAuth, email, password);
    } else {
      throw err;
    }
  } finally {
    await signOut(secondaryAuth);
  }
}

// 100% client-side, Spark-plan-friendly password reset.
//
// Firebase's client SDK can only change the password of the account that is
// CURRENTLY SIGNED IN — there's no way around that without the Admin SDK (Cloud
// Functions, which need Blaze). So the only free client-side way to let the admin
// set a NEW password without the student's involvement is to already know the
// student's CURRENT password, sign in as them (in the secondary app, so the admin's
// own session is untouched), and change it from there.
//
// currentPassword must be the password Firestore has on file for this student
// (the `password` field on their `students/{email}` doc) — this app keeps that
// field in sync with their real Firebase Auth password on every registration and
// reset, so it stays accurate as long as all password changes go through this app.
export async function resetStudentPasswordClientSide(email, currentPassword, newPassword) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await signInWithEmailAndPassword(secondaryAuth, normalizedEmail, currentPassword);
    await updatePassword(secondaryAuth.currentUser, newPassword);
  } finally {
    await signOut(secondaryAuth);
  }
}