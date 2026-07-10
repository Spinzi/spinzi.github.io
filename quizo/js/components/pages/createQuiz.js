import { loadCSS } from "../../helpers/loadCSS.js";
import { goto } from "../../helpers/goto.js";
import { appState } from "../../state/appState.js";
import { insertFooter } from "../../helpers/footer.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { auth, db } from "../../config/firebase.js";

import { generateQuizId } from "../../helpers/randomId.js";

export async function saveQuizz(){

    const q_id = await generateQuizId();

    const quizzRef = doc(
        db,
        "quizzes",
        q_id
    );

    await setDoc(quizzRef, {
        title: appState.current_q_title,
        owner: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        questions: appState.quizBuilder
    });
}

function create_empty_q(){
    appState.quizBuilder.push({
        id: appState.quizBuilder.length + 1,
        text: "",
        answers: [],
        answers: []
    })
}

function update_header(){
    const q_len = appState.quizBuilder.length;
    const current = appState.current_q;

    const prev_button = document.getElementById("prevBtn");
    const next_button = document.getElementById("nextBtn");

    const status = document.getElementById("q_status");

    if(current === 1){
        prev_button.innerText = "";
    }else{
        prev_button.innerText = "Previous question";
    }

    if(current === q_len){
        next_button.innerText = "Add question";
    }else{
        next_button.innerText = "Next question";
    }

    status.innerText = `${current}/${q_len}`;

    //wire

    if(prev_button.dataset.wired !== "true"){
        prev_button.dataset.wired = "true";
        prev_button.addEventListener("click", ()=>{
            appState.current_q = Math.max(1, appState.current_q - 1);
            update_header();
            render_main_q_creator();
        });
    }

    if(next_button.dataset.wired !== "true"){
        next_button.dataset.wired = "true";
        next_button.addEventListener("click", ()=>{

            if(appState.quizBuilder.length === appState.current_q){
                create_empty_q();
            }

            appState.current_q = appState.current_q + 1;
            update_header();
            render_main_q_creator();
        });
    }

}

function render_main_q_creator(){

    const container = document.getElementById("quiz_builder");
    const q = appState.quizBuilder[appState.current_q - 1];

    const answersHTML = q.answers.map((answer, index) => `
        <div class="answer-tile" data-answer-index="${index}">
            <input
                type="checkbox"
                data-action-local="toggle_correct"
                data-answer-index="${index}"
                ${answer.correct ? "checked" : ""}
            >
            <input
                type="text"
                placeholder="Answer ${index + 1}"
                data-action-local="update_answer_text"
                data-answer-index="${index}"
                value="${answer.text}"
            >
        </div>
    `).join("");

    container.innerHTML = `
        <div class="question-card">
            <textarea 
                placeholder="Type the title here..."
                rows = "1"
                data-action-local="update_question_title"
            >${appState.current_q_title}</textarea>
        </div>
        <div class="question-card">
            <textarea
                placeholder="Type your question here..."
                rows="2"
                data-action-local="update_question_text"
            >${q.text}</textarea>

            <div class="answers-grid">
                ${answersHTML}
            </div>

            ${q.answers.length < 4
                ? `<button class="add-answer" data-action-local="add_answer">+ Add answer</button>`
                : ""
            }
        </div>
    `;

    wire_q_creator_events(q);
}

function wire_q_creator_events(q){

    const container = document.getElementById("quiz_builder");

    container.querySelector('[data-action-local="update_question_title"')
        .addEventListener("input", (e)=>{
            appState.current_q_title = e.target.value;
        });


    container.querySelector('[data-action-local="update_question_text"]')
        .addEventListener("input", (e) => {
            q.text = e.target.value;
        });

    container.querySelectorAll('[data-action-local="update_answer_text"]')
        .forEach(input => {
            input.addEventListener("input", (e) => {
                const index = Number(e.target.dataset.answerIndex);
                q.answers[index].text = e.target.value;
            });
        });

    container.querySelectorAll('[data-action-local="toggle_correct"]')
        .forEach(checkbox => {
            checkbox.addEventListener("change", (e) => {
                const index = Number(e.target.dataset.answerIndex);
                q.answers[index].correct = e.target.checked;
            });
        });

    const add_button = container.querySelector('[data-action-local="add_answer"]');
    if (add_button){
        add_button.addEventListener("click", () => {
            q.answers.push({ text: "", correct: false });
            render_main_q_creator();
        });
    }
}

function render_create_q(user){

    const app = document.getElementById("app");

    app.innerHTML = `
    
    <header>

        <div class="h_center">

            <div id="back" class="special_card">

                <button data-action="goto-dashboard">Back</button>

            </div>

            <h1> Create your quiz, ${user.displayName}</h1>


            <div class="special_card">

                <button data-action="save_q">Save</button>

            </div>

        </div>

        <div class="h_interract special_card">

            <button id="prevBtn">prev</button>
            <span id="q_status">.../...</span>
            <button id="nextBtn">next</button>

        </div>

    </header>

    <div id="quiz_builder">
    </div>
    
    `;

    app.innerHTML += insertFooter();

    appState.current_q = 1;
    create_empty_q();

    update_header();
    render_main_q_creator();

}

export async function renderQuizCreate(){

    loadCSS("assets/css/pages/createQuiz.css");

    const app = document.getElementById("app");

    onAuthStateChanged(auth, (user)=>{
        if(user){
            render_create_q(user);
        }else{
            goto({
                page: "dashboard"
            });
        }
    });

}