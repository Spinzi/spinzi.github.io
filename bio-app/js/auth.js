import {createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {auth, googleProvider} from "./firebase.js"

createUserWithEmailAndPassword(auth, email, password)
    .then((userCredentials) => {
        const user = userCredentials.user
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});

function init_show_password_button(){
    const passwordInput = document.getElementById("password");
    const showPasswordCheckbox = document.getElementById("show-password");
    console.log("iniawdwat");
    showPasswordCheckbox.addEventListener("change", () => {
        passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
        console.log("swap");
    });
}

document.addEventListener("DOMContentLoaded", ()=>{
    console.log("authjson");
    init_show_password_button();
});