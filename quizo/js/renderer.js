import { parse_route } from "./router.js";
import { appState } from "./state/appState.js";

import { renderHome } from "./components/pages/home.js";
import { renderDashboard } from "./components/pages/dashboard.js";
import { renderQuizCreate } from "./components/pages/createQuiz.js";
import { renderQuiz } from "./components/pages/quiz.js";

export function renderPage(){
    parse_route();

    if(appState.page === null || appState.page === "home"){
        renderHome();
    }else if(appState.page === "dashboard"){
        renderDashboard();
    }else if(appState.page === "createQuiz"){
        renderQuizCreate();
    }else if(appState.page === "quiz"){
        renderQuiz();
    }else{
        document.getElementById("app").innerHTML = `<h1 class="txt_err">Error 404 could not find page "${appState.page}"</h1>`;
    }

}