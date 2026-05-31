import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_uTZPWq2aem8JqHvGk7dc6r2bHg6q-CQ",
  authDomain: "shramasetu-backend.firebaseapp.com",
  projectId: "shramasetu-backend",
  storageBucket: "shramasetu-backend.firebasestorage.app",
  messagingSenderId: "171440665890",
  appId: "1:171440665890:web:f1fe160edb2bda0e16617b",
  measurementId: "G-5NLQCKVFSH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
