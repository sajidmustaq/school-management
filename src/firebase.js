// ✅ src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAg4E8EeOdg5mR1q_THI6BQ3KKBlFBbvbw",
  authDomain: "school-management-system-ed228.firebaseapp.com",
  projectId: "school-management-system-ed228",
  storageBucket: "school-management-system-ed228.firebasestorage.app",
  messagingSenderId: "751180298370",
  appId: "1:751180298370:web:287c51ff6f69ad24c29c9b",
  measurementId: "G-DB508859M7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
