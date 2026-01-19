
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// --- Vercel Runtime Logs ---
console.log("--- FIREBASE CONFIG LOGS (CLIENT-SIDE) ---");
console.log("VITE_API_KEY:", import.meta.env.VITE_API_KEY ? "Loaded" : "MISSING!");
console.log("VITE_AUTH_DOMAIN:", import.meta.env.VITE_AUTH_DOMAIN ? "Loaded" : "MISSING!");
console.log("VITE_PROJECT_ID:", import.meta.env.VITE_PROJECT_ID ? "Loaded" : "MISSING!");
console.log("VITE_STORAGE_BUCKET:", import.meta.env.VITE_STORAGE_BUCKET ? "Loaded" : "MISSING!");
console.log("VITE_MESSAGING_SENDER_ID:", import.meta.env.VITE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING!");
console.log("VITE_APP_ID:", import.meta.env.VITE_APP_ID ? "Loaded" : "MISSING!");
console.log("-------------------------------------------");
// --- End Logs ---

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized.");

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log("Firebase module loaded successfully.");
