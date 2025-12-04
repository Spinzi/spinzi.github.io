import {createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {auth, googleProvider, app, db} from "./firebase.js"

import { doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

// createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredentials) => {
//         const user = userCredentials.user
//     }).catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//     });

let captchaVerified = false;

function captchaSuccess() {
    captchaVerified = true;
    console.log("Captcha verified.");
}

window.captchaSuccess = captchaSuccess;

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

async function initUserData(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // FIRST LOGIN — CREATE USER DOC
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || "Unnamed",
      createdAt: Date.now(),
      points: 0
    });
  } else {
    // Already exists — optional tiny fixes:
    const data = snap.data();
    const fixes = {};

    if (!data.email) fixes.email = user.email;
    if (!data.name) fixes.name = user.displayName || "Unnamed";
    if (!data.createdAt) fixes.createdAt = Date.now();
    if (!data.points) fixes.points = 0;

    if (Object.keys(fixes).length > 0) {
      await setDoc(userRef, fixes, { merge: true });
    }
  }
}

function init_show_password_button(){
    const passwordInput = document.getElementById("password");
    const showPasswordCheckbox = document.getElementById("show-password");
    showPasswordCheckbox.addEventListener("change", () => {
        passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
        console.log("swap");
    });
}

function process_login_with_email(){
  console.log("Processing login...");

  if (captchaVerified === false){
    document.getElementById("error-msg").innerText = "Solve captcha first!";
    return;
  }

  var email_element = document.getElementById("email");
  var email = email_element.value.trim();

  if(email === ""){
    document.getElementById("error-msg").innerText = "Email invalid!";
    return;
  }

  var password_element = document.getElementById("password");
  var password = password_element.value;  

  console.log("Trying to sing in user with Email: ", email, " and password ", password);

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log("Logged user in. User: ", user);
      window.location.href = "index.html";
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Could not log user in. Error code: ", errorCode, " Error message: ", errorMessage);
      document.getElementById("error-msg").innerText = errorMessage;
    });

}

function process_create_account(){
  if(!captchaVerified){
    document.getElementById("error-msg").innerText = "Solve captcha first!";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!name) {
      document.getElementById("error-msg").innerText = "Name is required!";
      return;
  }
  if (!email) {
      document.getElementById("error-msg").innerText = "Email is required!";
      return;
  }
  if (password !== confirmPassword) {
      document.getElementById("error-msg").innerText = "Passwords do not match!";
      return;
  }

  createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Store user in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: new Date()
            });

            console.log("User account created:", user.uid);
            document.getElementById("error-msg").innerText = "Account created successfully!";
            // Optionally redirect to dashboard
        })
        .catch((error) => {
            console.error(error);
            document.getElementById("error-msg").innerText = error.message;
        });

}

function init_buttons(){
  const loginForm = document.getElementById("login-form");
  const singInFormWithEmail = document.getElementById("sing-in-form-with-email");
  const continue_with_google = document.getElementById("google-btn");

  try{
    loginForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      process_login_with_email();
    });
  }catch(error){
    console.log("Could not bind LoginForm");
  }

  try {
    singInFormWithEmail.addEventListener("submit", (e)=>{
      e.preventDefault();
      process_create_account();
    });
  } catch (error) {
    console.log("Could not bind sing in form.");
  }

  try{
    continue_with_google.addEventListener("click", async ()=>{
      if(!captchaVerified){
        document.getElementById("error-msg").innerText = "Solve captcha first!";
        return;
      }
      signInWithPopup(auth, googleProvider)
        .then(async (result) => {
          const user = result.user;
          console.log("Google login success:", user);
          await initUserData(user);
          window.location.href = "index.html";
        }).catch((error)=>{
          console.error("Error in sign in:", error);
          document.getElementById("error-msg").innerText = error.message;
        });
    });
  }catch(error){
    console.log("Could not bind Google button.");
  }
  
}

document.addEventListener("DOMContentLoaded", ()=>{
    init_show_password_button();
    init_buttons();
});