import { appState } from "../../state/appState.js";
import { loadCSS } from "../../helpers/loadCSS.js";
import { insertFooter } from "../../helpers/footer.js";

import { quizState } from "../../state/quizState.js";

import { db } from "../../config/firebase.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let timerInterval = null;

function render_join(non_existent_code = false){
    return `
        <div class="join-screen">
            <h1>QUIZO</h1>
            <h3>Developed by Spinzi</h3>

            ${
                non_existent_code === false
                    ? `<p>Enter a quiz code to join</p>`
                    : `<p>Could not find any quiz with the code <b>${non_existent_code}</b>. Please enter a valid code.</p>`
            }

            <div class="join-form">
                <input type="text" id="quizzCode" placeholder="12A B56" maxlength="6" autocomplete="off" oninput="this.value = this.value.toUpperCase()">
                <button data-action="join_quizz">Enter</button>
            </div>
            
        </div>
        
        <div class="terms_section">
            <p><a href="js/services/terms-of-service.txt">Terms</a> | <a href="js/services/privacy-policy.txt">Privacy</a></p>
        </div>
        `;
}

async function check_name(name){
    const path = doc(db, "quizzes", appState.id, "players", name);
    const snap = await getDoc(path);
    return !snap.exists();
}

async function set_user_data(name, data){
    const path = doc(db, "quizzes", appState.id, "players", name);
    await setDoc(path, data);
}

function build_queue(quiz){
    //STRUCTURE
    // page : 
    // meta : 

    quizState.title = quiz["title"];
    
    quizState.quizQueue.push({
        page: "getName",
        meta: {}
    })

    quizState.q_counter = quiz["questions"].length;

    for(const key in quiz["questions"]){
        const el = quiz["questions"][key];

        quizState.quizQueue.push({
            page: "quizPage",
            meta: {
                answers: el["answers"],
                text: el["text"]
            },
            answerTime: el["answerTime"] ?? 15
        });
    }

    quizState.quizQueue.push({
        page: "results",
        meta: {}
    });


}

function render_answer_tile(answer, index){
    return `
        <button class="answer-tile" data-answer-index="${index}">
            <span class="answer-icon"></span>
            <span class="answer-text">${answer.text}</span>
        </button>
    `;
}

function start_timer(seconds, onEnd){
    const fill = document.getElementById("timerFill");
    const text = document.getElementById("timerText");
    let remaining = seconds;

    text.innerText = remaining;
    fill.style.transform = "scaleX(1)";
    fill.classList.remove("warning", "danger");

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remaining--;
        text.innerText = remaining;
        fill.style.transform = `scaleX(${remaining / seconds})`;

        fill.classList.toggle("warning", remaining <= seconds * 0.5 && remaining > seconds * 0.25);
        fill.classList.toggle("danger", remaining <= seconds * 0.25);

        if(remaining <= 0){
            clearInterval(timerInterval);
            
            onEnd();
        }
    }, 1000);
}

function reveal_answers(meta, selectedIndex = null){
    const tiles = document.querySelectorAll(".answer-tile");

    tiles.forEach((tile, i) => {
        tile.disabled = true;
        if(meta.answers[i].correct){
            tile.classList.add("correct");
        }else{
            tile.classList.add("incorrect");
        }
    });

    if(selectedIndex !== null){
        tiles[selectedIndex].classList.add("selected");
    }
}

async function get_leaderboard(){
    const playersPath = collection(db, "quizzes", appState.id, "players");
    const q = query(playersPath, orderBy("points", "desc"));
    const snapshot = await getDocs(q);

    const players = [];
    snapshot.forEach(doc => {
        players.push({ name: doc.id, ...doc.data() });
    });

    return players;
}

function render_leaderboard_row(player, index, isYou){
    const place = index + 1;
    return `
        <div class="leaderboard-row ${isYou ? "is-you" : ""}">
            <span class="lb-place">#${place}</span>
            <span class="lb-name">${player.name}${isYou ? " (you)" : ""}</span>
            <span class="lb-points">${player.points ?? 0} pts</span>
        </div>
    `;
}

async function submit_answer(index, meta){
    clearInterval(timerInterval);
    reveal_answers(meta, index);

    const is_correct = meta.answers[index].correct;

    quizState.points.push({
        answer: meta.answers[index].text,
        is_correct: is_correct
    });

    quizState.totalPoints += is_correct;

    setTimeout(() => {
        renderPage(quizState.quizQueue.shift());
    }, 3000);

}

async function renderPage(data){

    const app = document.getElementById("app");

    if(data.page === "getName"){
        
        app.innerHTML = `
        <div class="join-screen">
            <h1>QUIZO</h1>
            <h3>Developed by Spinzi</h3>

            <p id="feedback">Chose a name to take the quiz</p>

            <div class="join-form">
                <input type="text" id="name" placeholder="Name" autocomplete="off">
                <button id="enter">Enter</button>
            </div>
        </div>
        <div class="terms_section">
            <p><a href="js/services/terms-of-service.txt">Terms</a> | <a href="js/services/privacy-policy.txt">Privacy</a></p>
        </div>
        `;

        

        document.getElementById("enter").addEventListener("click", async ()=>{
            const name = document.getElementById("name").value;
            if(name.length <= 3){
                const feedback_el = document.getElementById("feedback");
                feedback_el.innerText = "Name must be at least 4 characters long.";
                feedback_el.style.color = "#EF4444";
                return;
            }
            
            if(await check_name(name)){
                set_user_data(name, {
                    status: "taking quiz..."
                });
                quizState.name = name;
                renderPage(quizState.quizQueue.shift());
            }else{
                const feedback_el = document.getElementById("feedback");
                feedback_el.innerText = "Name already take. Try another.";
                feedback_el.style.color = "#EF4444";
            }
        });

    }else if(data.page === "quizPage"){

        const total = quizState.quizQueue.filter(q => q.page === "quizPage").length + 1;
        const remaining = quizState.quizQueue.filter(q => q.page === "quizPage").length;
        const current = quizState.q_counter - remaining;

        const answersHTML = data.meta.answers.map((a, i) => render_answer_tile(a, i)).join("");


        app.innerHTML = `
        <div class="quiz-header">
            <h1 id="quiz_title">QUIZO | ${quizState.title}</h1>
            
            <div class="quiz-meta">
                <span id="questions_remaining">Question ${current}/${quizState.q_counter}</span>
                <div class="timer-bar">
                    <div class="timer-fill" id="timerFill"></div>
                </div>
                <span id="timerText">${data.answerTime}</span>
            </div>
        </div>
        <div class="q_body">
            <div class="q_text">
                <h3>${data.meta.text}</h3>
            </div>
            <div class="q_answers">
                ${answersHTML}
            </div>
        </div>
        `;

        document.querySelectorAll(".answer-tile").forEach(tile => {
            tile.addEventListener("click", () => {
                submit_answer(Number(tile.dataset.answerIndex), data.meta);
            });
        })

        start_timer(data.answerTime, () => {
            reveal_answers(data.meta);
            setTimeout(() => {
                renderPage(quizState.quizQueue.shift());
            }, 3000);
        });

    }else if(data.page === "results"){
        await set_user_data(quizState.name, {
        points_log: quizState.points,
        points: quizState.totalPoints,
        status: "Finished."
    });

    const leaderboard = await get_leaderboard();
    const myPlace = leaderboard.findIndex(p => p.name === quizState.name) + 1;

    const correctCount = quizState.points.filter(p => p.is_correct).length;

    const rowsHTML = leaderboard
        .slice(0, 5)
        .map((p, i) => render_leaderboard_row(p, i, p.name === quizState.name))
        .join("");

    app.innerHTML = `
        <div class="results-screen">
            <h1>Quiz complete!</h1>
            <h3>Nice work, ${quizState.name}</h3>

            <div class="results-stats">
                <div class="stat">
                    <span class="stat-value">${quizState.totalPoints}</span>
                    <span class="stat-label">Points</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${correctCount}/${quizState.q_counter}</span>
                    <span class="stat-label">Correct</span>
                </div>
                <div class="stat">
                    <span class="stat-value">#${myPlace}</span>
                    <span class="stat-label">Place</span>
                </div>
            </div>

            <div class="leaderboard">
                <h4>Leaderboard</h4>
                ${rowsHTML}
            </div>
        </div>
        <div class="terms_section">
            <p><a href="js/services/terms-of-service.txt">Terms</a> | <a href="js/services/privacy-policy.txt">Privacy</a></p>
        </div>
    `;
    }else{
        app.innerHTML = `
        <div class="join-screen">
            <p id="feedback">Unknown page ${data.page}</p>
        </div>
        <div class="terms_section">
            <p><a href="js/services/terms-of-service.txt">Terms</a> | <a href="js/services/privacy-policy.txt">Privacy</a></p>
        </div>
        `;
    }
}

export async function renderQuiz(){
    const app = document.getElementById("app");
    loadCSS("assets/css/pages/quiz.css");

    if(appState.id === null){
        app.innerHTML = 
            render_join();
        return;
    }

    const quizPath = doc(db, "quizzes", appState.id);

    const snapshot = await getDoc(quizPath);

    if(!snapshot.exists()){
        console.log("Quiz does not exist.");
        app.innerHTML = 
            render_join(appState.id);
        return;
    }

    const quiz = snapshot.data();

    console.log(quiz);

    build_queue(quiz);

    renderPage(quizState.quizQueue.shift());

}