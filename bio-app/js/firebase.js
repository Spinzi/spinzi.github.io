import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
const googleProvider = new GoogleAuthProvider();

// Export modules you need
export { app, analytics, auth, db, googleProvider};