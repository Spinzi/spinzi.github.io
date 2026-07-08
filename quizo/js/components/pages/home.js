import { loadCSS } from "../../helpers/loadCSS.js";

export function renderHome(){

    const app = document.getElementById("app");
    loadCSS("assets/css/pages/home.css");

    app.innerHTML += "<h1>QUIZO</h1>";
    app.innerHTML += "<h3>Create quizes. Assign. Learn.</h3>";
    app.innerHTML += "<p>Written and developed by Spinzi</p>";
    app.innerHTML += `<button data-action="goto-dashboard">Teacher Dashboard</button>`;
    app.innerHTML += `<button data-action="goto-quiz">Take a Quiz</button>`;

}