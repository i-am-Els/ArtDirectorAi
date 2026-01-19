import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

let app;
let auth;
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase module loaded successfully.");

} catch (error) {
  console.error("FATAL: Firebase initialization failed.", error);
  // We can leave auth undefined. The app will show an error state.
}

export { app, auth, googleProvider };
