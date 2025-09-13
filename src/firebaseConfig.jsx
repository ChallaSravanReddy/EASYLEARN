import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // New import

const firebaseConfig = {
  apiKey: "AIzaSyA7_Z8gsiLH5I4y_g8aQdEK1LQ9K3wxT7k",
  authDomain: "easylearn-6f72a.firebaseapp.com",
  projectId: "easylearn-6f72a",
  storageBucket: "easylearn-6f72a.firebasestorage.app",
  messagingSenderId: "752745758020",
  appId: "1:752745758020:web:dbb595c804b2d3006aab11",
  measurementId: "G-S561TRR8ZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Export the Firestore instance