// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMt-Hh4HpPBs_0NjT_Skds9uIpqw5O1YM",
  authDomain: "spinzi.firebaseapp.com",
  databaseURL: "https://spinzi-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "spinzi",
  storageBucket: "spinzi.appspot.com",
  messagingSenderId: "831744235097",
  appId: "1:831744235097:web:7a08ce55f287a473150348",
  measurementId: "G-S9E6L64DCZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
