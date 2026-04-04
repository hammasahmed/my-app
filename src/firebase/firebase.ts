// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAY_e_6lZW_2MP2-Y2eKtyho3Mr0F8UFPM",
  authDomain: "to-do-c7220.firebaseapp.com",
  projectId: "to-do-c7220",
  storageBucket: "to-do-c7220.firebasestorage.app",
  messagingSenderId: "425753658592",
  appId: "1:425753658592:web:59969a3d48999171bfbc85",
  measurementId: "G-2QT3SMY82G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);