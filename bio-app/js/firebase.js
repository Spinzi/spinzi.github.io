import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKKiRvpK4ESzJU3yc-hv4pmTOE7Xd04YE",
  authDomain: "bio-app-2a4db.firebaseapp.com",
  databaseURL: "https://bio-app-2a4db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bio-app-2a4db",
  storageBucket: "bio-app-2a4db.firebasestorage.app",
  messagingSenderId: "634941639422",
  appId: "1:634941639422:web:8e146ca97363d13b4db3af",
  measurementId: "G-XHPXTY0M03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
// Export modules you need
export { app, analytics, auth, db, googleProvider };