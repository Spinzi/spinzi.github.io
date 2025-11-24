import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.BIO_API_KEY,
  authDomain: import.meta.env.BIO_APP_ID,
  projectId: import.meta.env.BIO_AUTH_DOMAIN,
  storageBucket: import.meta.env.BIO_MEASUREMENT_ID,
  messagingSenderId: import.meta.env.BIO_MESSAGING_SENDER_ID,
  appId: import.meta.env.BIO_PROJECT_ID,
  measurementId: import.meta.env.BIO_STORAGE_BUCKET
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export modules you need
export { app, analytics, auth, db };