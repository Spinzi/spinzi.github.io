import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { auth, db } from "../../config/firebase.js";
import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { loadCSS } from "../../helpers/loadCSS.js";

async function user_check(user){
    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if(userSnap.exists()){
        await updateDoc(userRef, {
            lastLogin: serverTimestamp()
        });

        console.log("Existing user.");
    } else {
        await setDoc(userRef, {

            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,

            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()

        });

        console.log("Created new user.");
    }
}

async function get_user_quizzes(uid){
    const q = query(
        collection(db, "quizzes"),
        where("owner", "==", uid)
    )

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

async function render_login(){
    const app = document.getElementById("app");

    app.innerHTML += "<h1>Please log in in order to continue</h1>";

    app.innerHTML += `<button id="login-btn">Login with Google</button>`;

    document.getElementById("login-btn").addEventListener("click", async ()=>{
        const provider = new GoogleAuthProvider();

        try{
            const result = await signInWithPopup(auth, provider);

            console.log(result.user);
        }catch(err){
            console.error(err);
        }
    });

}

async function render_dashboard(user) {
    const app = document.getElementById("app");
    loadCSS("assets/css/pages/dashboard.css");

    const quizzes = await get_user_quizzes(user.uid);
    console.log(quizzes);

    const quizzesHTML = quizzes.length === 0
        ? `<p class="empty-state">No quizzes yet...</p>`
        : Object.keys(quizzes).map(key => `
            <div id="quizz_holder_${quizzes[key]["id"]}">
                <p>${quizzes[key]["title"]}</p>
                <span style="margin-left:auto;"></span>
                <p class="id_txt">${quizzes[key]["id"]}</p>
                <button data-action="copy-${quizzes[key]["id"]}" class="copy-btn">Copy</button>
                <button data-action="delete-${quizzes[key]["id"]}" class="copy-btn del">Delete</button>
            </div>


        `).join("");

    app.innerHTML = `
        <header class="dashboard-header">
            <h1>Welcome back, ${user.displayName}!</h1>
            <div class="spacer"></div>
            <button data-action="goto-createQuiz">Create Quiz</button>
            <button data-action="goto-quiz">Test quiz</button>
            <button data-action="logout" class="btn-logout">Log out</button>
        </header>

        <section class="quiz-list">
            <h3>Your quizzes</h3>
            ${quizzesHTML}
        </section>
    `;
}

export async function renderDashboard(){

    onAuthStateChanged(auth, (user)=> {
        
        document.getElementById("app").innerHTML = "";

        if(user){
            console.log("Logged in:", user.id);
            user_check(user);
            render_dashboard(user);
        }else{
            console.log("Not logged in...");
            render_login();
        }

    });

}