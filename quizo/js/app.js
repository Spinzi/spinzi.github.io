//MAIN APP, IMPORTING DEPENDENCIES AND RUNNING MAIN TASKS

import { renderPage } from "./renderer.js";
import { initActions } from "./helpers/actions.js";

document.addEventListener("DOMContentLoaded", async () => {
    renderPage();
    initActions();
});