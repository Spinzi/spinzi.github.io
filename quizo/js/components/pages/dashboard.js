import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { auth, db } from "../../config/firebase.js";
import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { loadCSS } from "../../helpers/loadCSS.js";
import { appState } from "../../state/appState.js";
import { insertFooter } from "../../helpers/footer.js";

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
    loadCSS("assets/css/pages/dashboard.css");

    app.innerHTML = `
        <header class="dashboard-header">
            <h1>Please log in in order to continue</h1>
        </header>

        <h3>By logging in with Google, you accept the Terms of Service and Privacy Policy.</h3>
        
        <button id="login-btn" class="header_button" style="margin-top:10px">Login with Google</button>
    `;

    app.innerHTML += insertFooter();


    
    const btn = document.getElementById("login-btn");
    btn.addEventListener("click", async ()=>{
        async function login(){
            const provider = new GoogleAuthProvider();
    
            try{
                const result = await signInWithPopup(auth, provider);
    
                console.log(result.user);
            }catch(err){
                console.error(err);
            }
        }
        
        login();
    });

}

async function get_quiz(quizId){
    const quizRef = doc(db, "quizzes", quizId);
    const quizSnap = await getDoc(quizRef);
    return quizSnap.exists() ? quizSnap.data() : null;
}

async function get_players(quizId){
    const q = query(
        collection(db, "quizzes", quizId, "players"),
        orderBy("points", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ name: d.id, ...d.data() }));
}

async function delete_player(quizId, playerName){
    await deleteDoc(doc(db, "quizzes", quizId, "players", playerName));
}

function render_leaderboard(players, quizId){
    if(players.length === 0){
        return `<p class="empty-state">No one has taken this quiz yet.</p>`;
    }

    return players.map((p, i) => `
        <div class="player_row" id="player_row_${p.name}">
            <span class="rank">#${i + 1}</span>
            <span class="player_name">${p.name}</span>
            <span class="player_points">${p.points} pts</span>
            <span class="player_status ${p.status === "Finished." ? "finished" : "in-progress"}">${p.status}</span>
            <button data-action="delplayer-${quizId}-${p.name}" class="copy-btn del">Delete</button>
        </div>
    `).join("");
}

export async function render_view(){
    const q_data = document.getElementById("q_data");
    const quizId = appState.view;
    const user = auth.currentUser;

    if(!quizId){
        q_data.innerHTML = `<p class="empty-state">No quiz selected.</p>`;
        return;
    }

    const quiz = await get_quiz(quizId);

    if(!quiz){
        q_data.innerHTML = `<p class="empty-state">Quiz not found.</p>`;
        return;
    }

    if(!user || quiz.owner !== user.uid){
        q_data.innerHTML = `<p class="empty-state">You don't have access to this quiz's stats.</p>`;
        return;
    }

    const players = await get_players(quizId);

    q_data.innerHTML = `
        <div class="stats-header">
            <h3>${quiz.title || "Quiz"} — Stats</h3>
            <button data-action="goto-dashboard" class="copy-btn">Back</button>
        </div>
            
        <div class="leaderboard" id="leaderboard_data">
            <p>${players.length} player${players.length === 1 ? "" : "s"} took this quiz</p>
            ${render_leaderboard(players, quizId)}
        </div>
    `;

}

export async function render_quizzes(){
    const user = auth.currentUser;
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
                <button data-action="view-${quizzes[key]["id"]}" class="copy-btn">Stats</button>
                <button data-action="delete-${quizzes[key]["id"]}" class="copy-btn del">Delete</button>
            </div>


        `).join("");

    document.getElementById("q_data").innerHTML = `
        <h3>Your quizzes</h3>
        ${quizzesHTML}
    `;
}

async function render_dashboard(user) {
    const app = document.getElementById("app");
    loadCSS("assets/css/pages/dashboard.css");

    app.innerHTML = `
        <header class="dashboard-header">
            <h1>Welcome back, ${user.displayName}!</h1>
            <div class="spacer"></div>
            <button data-action="goto-createQuiz">Create Quiz</button>
            <button data-action="goto-quiz">Test quiz</button>
            <button data-action="logout" class="btn-logout">Log out</button>
        </header>

        <section class="quiz-list" id="q_data">

        </section>
    `;

    if(appState.view){
        await render_view();
    }else{
        await render_quizzes();
    }

    app.innerHTML += insertFooter();
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