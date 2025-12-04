import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {auth, googleProvider, app, db} from "./firebase.js"
import { doc, setDoc, collection, getDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"


var uid;

onAuthStateChanged(auth, (user) => {
    if(user){
        uid = user.uid;
        load_user_dashboard(uid);

    } else {
        load_no_user_dashboard();
    }
});

// Converts a Firestore timestamp or JS Date into a "time since" string
function timeSince(timestamp) {
    let createdDate;

    if (timestamp.toDate) {
        // Firestore Timestamp object
        createdDate = timestamp.toDate();
    } else {
        // fallback if it's already a JS Date
        createdDate = new Date(timestamp);
    }

    const now = new Date();
    const diffMs = now - createdDate; // difference in milliseconds
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
        return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
    } else if (diffMonths > 0) {
        return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    } else if (diffDays > 0) {
        return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffHr > 0) {
        return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
    } else if (diffMin > 0) {
        return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
    } else {
        return "just now";
    }
}

async function load_user_dashboard(uid){
    
    const docRef = doc(db, "users", uid);

    console.log("Ref:", docRef);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        
        let data = docSnap.data();
        
        console.log("Document data:", data);
        console.log("Name: ", data.name);

        document.getElementById("dashboard-name").innerHTML = `<a href = "change-name.html">${data.name}</a>`;
        
        document.getElementById("dashboard-age").textContent = timeSince(data.createdAt);

        document.getElementById("dashboard-email").textContent = data.email;

        if(data.points){
            document.getElementById("dashboard-points").textContent = toString(data.points) + " points";
        }else{
            document.getElementById("dashboard-points").textContent = "No points";
        }


    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
    }

}

function load_no_user_dashboard(){

}

async function change_name_to(name){
    const docRef = doc(db, "users", uid);

    console.log("Ref:", docRef);

    setDoc((docRef), {
        name: name
    }, {merge: true});
    
    change_name_notify(true, `Name changed to ${name}.`, `#129c06ff`);
}

function change_name_notify(showElement = false, text="", _color = '#000000ff'){
    try{
        var name_el = document.getElementById("new-name-message");
        name_el.style.display = showElement;

        if(showElement === true && text){
            name_el.innerText = text;
            name_el.style.color = _color;
        }
    }catch(error){
        console.error(error);
    }
}

function init_buttons(){
    document.getElementById("new-name-button").addEventListener("click", ()=>{
        let new_name = document.getElementById("new-name").value.trim();
        if(!new_name){
            change_name_notify(true, "Empty text.", `#ff0000ff` );
            return;
        }

        change_name_to(new_name);

    });
}

document.addEventListener("DOMContentLoaded", ()=>{
    change_name_notify();
    init_buttons();
});