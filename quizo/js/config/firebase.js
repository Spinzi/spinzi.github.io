
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyDHmA2KPv9-dNIYC4Pnnulh3CsfrWlCPls",
authDomain: "quizo-4be0e.firebaseapp.com",
projectId: "quizo-4be0e",
storageBucket: "quizo-4be0e.firebasestorage.app",
messagingSenderId: "751150418582",
appId: "1:751150418582:web:1c80c9082db92c0d2790b7",
measurementId: "G-3283938Z4H"
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);