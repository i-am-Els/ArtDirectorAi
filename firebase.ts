import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

console.log("Firebase module loading...");

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

try {
  console.log("Attempting to initialize App Check with Enterprise provider...");
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  console.log("VITE_RECAPTCHA_SITE_KEY:", siteKey);
  if (!siteKey) {
    console.error("FATAL: VITE_RECAPTCHA_SITE_KEY is not defined!");
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true
  });
  console.log("App Check initialized successfully.");
} catch (error) {
  console.error("FATAL: Error during App Check initialization:", error);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log("Firebase module loaded successfully.");
