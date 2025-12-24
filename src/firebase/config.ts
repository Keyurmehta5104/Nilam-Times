import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC44WRtNc0cgSsQyXaGjcbaxboQFJVnHFQ",
  authDomain: "nilam-times.firebaseapp.com",
  projectId: "nilam-times",
  storageBucket: "nilam-times.firebasestorage.app",
  messagingSenderId: "987737918088",
  appId: "1:987737918088:web:332fc8a3eb539b8b1cad3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;