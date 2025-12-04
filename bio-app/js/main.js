import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js"
import { auth, app, db } from "./firebase.js"

import { doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"


async function verify_and_fix_data_integrity(uid){
  //retreive data

  let userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()){
    const data = snap.data();

    if(!data.name){
        setDoc(userRef, {name:"Unnamed"}, {merge: true});
    }

    if(!data.createdAt){
        setDoc(userRef, {createdAt: new Date()}, {merge: true});
    }

  }

}

async function load_html_elements() {
    const componentElements = document.querySelectorAll("[data-load-from-html]");

    for (const el of componentElements) {
        const fileName = el.dataset.loadFromHtml;

        try {
            const response = await fetch(`components/${fileName}`);
            if (!response.ok) throw new Error(`Failed to load ${fileName}`);
            el.innerHTML = await response.text();
        } catch (err) {
            throw new Error(err);
        }
    }

};

async function load_translation_elements() {
    const componentElements = document.querySelectorAll("[data-translate-key]");
    var language = localStorage.getItem("language");
    if (language === null) {
        localStorage.setItem("language", "ro");
        language = "ro";
    }
    var translations = null;
    const translation_location = `data/lang/${language}.json`;
    try {
        const response = await fetch(translation_location);
        if (!response.ok) throw new Error(`Failed to load ${translation_location}`);
        translations = await response.json();

    } catch (error) {
        console.error(`Error, translation file not found. ${translation_location}`);
    }

    console.log(`Translating elements:\nFound elements to translate: ${JSON.stringify(componentElements, null, 2)}\nTranslation file:\n${JSON.stringify(translations, null, 2)}`);

    for (var el of componentElements) {
        var translation = translations[el.dataset.translateKey];
        console.log("trans");
        if (translation == null)
            el.innerHTML = el.dataset.translateKey;
        else
            el.innerHTML = translation;
    }

}

async function init_elements() {

    document.getElementById("login-btn").addEventListener("click", () => {
        window.location.href = "auth.html";
    });

    document.getElementById("my-account-btn").addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    document.getElementById("log-out").addEventListener("click", () => {
        signOut(auth).then(()=>{
            window.location.href = "index.html";
        }).catch((error)=>{

        });
    });

}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        verify_and_fix_data_integrity(uid);
        console.log("User loggged in.", uid);
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("my-account-btn").style.display = "block";
        document.getElementById("log-out").style.display = "block";
        // ...
    } else {
        // User is signed out
        // ...
        console.log("User signed out.");
        document.getElementById("login-btn").style.display = "block";
        document.getElementById("my-account-btn").style.display = "none";
        document.getElementById("log-out").style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    await load_html_elements();
    await load_translation_elements();
    await init_elements();
});