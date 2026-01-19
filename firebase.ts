import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCtTpe52p_i2sJ7igPjcrl0Ojx6qkVaSOU",
  authDomain: "device-streaming-0e5375e3.firebaseapp.com",
  projectId: "device-streaming-0e5375e3",
  storageBucket: "device-streaming-0e5375e3.firebasestorage.app",
  messagingSenderId: "294069102529",
  appId: "1:294069102529:web:1f070d73122b30bb0f3140"
};

const app = initializeApp(firebaseConfig);

// Initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfUBU8sAAAAADvUeirtoCfPk09uhF9CbIlakxQu'),
  isTokenAutoRefreshEnabled: true
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();