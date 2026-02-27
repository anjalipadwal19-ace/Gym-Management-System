/* ================= Firebase ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= Web app's Firebase configuration ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDQGvEZ6uDk5LeAwGMs8-Emb0iiPRsfxc8",
  authDomain: "gym-management-system-70659.firebaseapp.com",
  projectId: "gym-management-system-70659",
  storageBucket: "gym-management-system-70659.appspot.com",
  messagingSenderId: "53400250219",
  appId: "1:53400250219:web:9ed75d5d8e672830af4e2e"
};

/* ================= Initialize Firebase ================= */
const app = initializeApp(firebaseConfig);

/* ================= Export Firebase services ================= */
export const auth = getAuth(app);
export const db = getFirestore(app);