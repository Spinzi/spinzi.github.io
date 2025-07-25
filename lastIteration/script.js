import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAiay_lJS7bLRjchi96pqUGvupgSwmvV60",
  authDomain: "codekids-af967.firebaseapp.com",
  databaseURL: "https://codekids-af967-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "codekids-af967",
  storageBucket: "codekids-af967.firebasestorage.app",
  messagingSenderId: "775479351886",
  appId: "1:775479351886:web:c247eeacf51c0d03b4411f",
  measurementId: "G-3J91199C5Y"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);

const publicDataRef = ref(database, 'publicData'); // Changed from database.ref('publicData')
const adminDataRef = ref(database, 'adminData');   // Changed from database.ref('adminData')

const adminNamesLocation = child(adminDataRef, "adminNames");

const logsRef = ref(database, 'adminData/logs');
const bufRef = ref(database, 'adminData/buffer');

let isAdmin = false;
let admin_id;

let translations = {};

let currentPage = 'home';

function pageManager(page){
    // verify if page is correct
    const validPages = ['home', 'feedback']
    if(!validPages.includes(page))
        page = 'home'
    loadHtmlInto(`pages/pag/${page}.html`, 'dynamicContent',() => {
        // now we need to apply functionality for the elements of the page
        if(page === 'home'){
            homePageManager();
        }else if(page === 'feedback'){
            feedbackPageManager();
        }
    });
}

function homePageManager(){
    return;
}

function feedbackPageManager(){
    const holder = document.getElementById('feedbackCard');
    const adminHolder= document.getElementById('feedbackAdminOnly');

    const formNameInput = document.getElementById('feedbackNameInput');
    const formMessageInput = document.getElementById('feedbackMessageInput');

    const submitButton = document.getElementById('feedbackSubmitButton');
    const cancelButton = document.getElementById('feedbackCancelButton');

    const adminMessages = document.getElementById('feedbackAdminOnlyTitle')
    
    if(
        holder &&
        adminHolder &&
        formNameInput &&
        formMessageInput &&
        submitButton &&
        cancelButton &&
        adminMessages
    ){
        console.log('Elements have been loaded correctly. ');
        if(!isAdmin){
            adminHolder.classList.add('hidden');
        }
        async function loadMes() {
            adminMessages.innerHTML = ''; // Clear previous content

            const reloadButton = document.createElement('button');
            reloadButton.textContent = t('reload');
            reloadButton.onclick = loadMes;
            reloadButton.classList.add('styledButton');
            reloadButton.classList.add('red');
            reloadButton.style.marginBottom = '1rem';
            adminMessages.appendChild(reloadButton);

            onValue(child(publicDataRef, 'feedback'), (snapshot) => {
                adminMessages.innerHTML = '';
                adminMessages.appendChild(reloadButton);

                if (!snapshot.exists()) {
                    const noMsg = document.createElement('div');
                    noMsg.textContent = 'No feedback messages found.';
                    adminMessages.appendChild(noMsg);
                    return;
                }

                snapshot.forEach((el) => {
                    const val = el.val();

                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('feedbackItem');

                    const feedbackMsgDiv = document.createElement('div');
                    feedbackMsgDiv.classList.add('feedbackMsgDivEl');

                    const title = document.createElement('h3');

                    const strong = document.createElement('strong');
                    strong.textContent = val.name ?? 'Anonymous';

                    const em = document.createElement('em');
                    em.textContent = new Date(val.timestamp ?? 0).toLocaleString();

                    title.appendChild(strong);
                    title.appendChild(em);
                    feedbackMsgDiv.appendChild(title);

                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('styledButton', 'red');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => {
                        deleteFeedback(el.key);
                    });

                    feedbackMsgDiv.appendChild(deleteButton);

                    const messageP = document.createElement('p');
                    messageP.textContent = val.feedback ?? '';

                    entryDiv.appendChild(feedbackMsgDiv);
                    entryDiv.appendChild(messageP);
                    adminMessages.appendChild(entryDiv);

                    const divider = document.createElement('div');
                    divider.classList.add('sidebar-divider');
                    adminMessages.appendChild(divider);
                });
            });
        }
        loadMes();
        cancelButton.addEventListener('click', ()=>{
            currentPage = 'home';
            updatePage(currentPage);
        });
        submitButton.addEventListener('click', ()=>{
            if (!formNameInput.value.trim() || !formMessageInput.value.trim()){
                notify(t('name_or_message_incomplete'));
                return;
            }
            if(formNameInput.value.trim().length > 20){
                notify(t('name_too_long'));
                return;
            }
            if(formMessageInput.value.trim().length > 500){
                notify(t('message_too_long'));
                return;
            }
            const msg = {
                feedback: formMessageInput.value.trim(),
                name: formNameInput.value.trim(),
                timestamp: Date.now()
            }
            push(child(publicDataRef, 'feedback'), msg)
            .then(() => {
                notify(t('sent_succesfully'))
                formMessageInput.value = "";
            }).catch((error) => {
                console.error(error);
                notify(t('failed_sending_message'));
            });
        });

    }else{
        console.warn('Elements have not been loaded correctly in feedback page.');
        notify('Error in loading feedback page, attepting to reload.');
        pageManager(currentPage);
    }
}
function deleteFeedback(key) {
    const refToDelete = child(publicDataRef, `feedback/${key}`);
    set(refToDelete, null)
        .then(() => notify('Removed element'))
        .catch((error) => {
            console.error("Error removing element:", error);
            notify('Failed to remove feedback.');
        });
}

function updatePage(){
    if(isAdmin){
        const adminRenameButton = document.getElementById('adminName');
        getAdminName(admin_id, (name) => {
            adminRenameButton.innerText = name;
        });
    }

    pageManager(currentPage);
    let lang = localStorage.getItem('lang');
    if(!lang) lang = 'ro';
    setLanguage(lang);

}

function t(key){
    return translations[key] || key;
}

async function setLanguage(lang) {
    const langRoButton = document.getElementById('roLangButton');
    const langEnButton = document.getElementById('enLangButton');
    if(lang === 'ro'){
        langRoButton.classList.remove('nonactive');
        langRoButton.classList.add('active');
        langEnButton.classList.remove('active');
        langEnButton.classList.add('nonactive');
    }else{
        langRoButton.classList.add('nonactive');
        langRoButton.classList.remove('active');
        langEnButton.classList.add('active');
        langEnButton.classList.remove('nonactive');
    }

    const response = await fetch(`lang/${lang}.json`);
    translations = await response.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) el.textContent = translations[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el =>{
        const key = el.getAttribute('data-i18n-placeholder');
        if(translations[key]) el.setAttribute("placeholder", translations[key]);
    })
}

async function loadHtmlInto(filePath, elementId, callback){
    fetch(filePath)
    .then(response => {
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        console.log(data);
        document.getElementById(elementId).innerHTML = '';
        document.getElementById(elementId).innerHTML = data;
        if(callback)callback();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

async function loadElements() {
    await loadHtmlInto('pages/header.html', 'headerPlaceholder');
    await loadHtmlInto('pages/footer.html', 'footerPlaceholder');
}

function sidebarHandler(header, main, side, button, secondButton, dynamicContent){
    if(main && side && button){
        button.addEventListener('click', ()=>{
            side.classList.toggle('open');
            header.classList.toggle('phoneHide');
            if(window.innerWidth <= 768){
                dynamicContent.classList.toggle('shown');
            }else{
                main.classList.toggle('sidebar-shown');
            }
        });
        secondButton.addEventListener('click', ()=>{
            side.classList.toggle('open');
            header.classList.toggle('phoneHide');
        });
        button.dataset.bound = 'true';
    }
}

function notify(message) {
    // Create container if not present
    let container = document.getElementById("notificationContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "notificationContainer";
        document.body.appendChild(container);
    }

    // Create notification box
    const notif = document.createElement("div");
    notif.className = "notification";

    // Add message and close button
    notif.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // Append to container (goes to bottom of column-reverse, so visually top)
    container.insertBefore(notif, container.firstChild);

    // Auto remove after 15 seconds
    setTimeout(() => {
        notif.remove();
    }, 15000);
}

document.addEventListener("DOMContentLoaded", async () => {

    await new Promise((resolve) => {
        // Așteptăm să se încarce header-ul și elementele
        loadElements();

        const ALL = setInterval(() => {
            const headerArea = document.getElementById('headerSection');
            const mainContentArea = document.getElementById('mainContentArea');
            const sideMenu = document.getElementById('sideMenu');
            const sidebarButton = document.getElementById('headerButton');
            const secondSideBarButton = document.getElementById('hideSideBarButton');
            const loginButton = document.getElementById('logInButton');
            const signOutButton = document.getElementById('signOutButton');
            const adminRenameButton = document.getElementById('adminName');
            const langRoButton = document.getElementById('roLangButton');
            const langEnButton = document.getElementById('enLangButton');
            const dynamicContent = document.getElementById('dynamicContent');
            const feedbackButton = document.getElementById('feedbackButton');
            const homeButton = document.getElementById('homeButton');
            
            if(secondSideBarButton && headerArea && mainContentArea && sidebarButton && sidebarButton.dataset.bound !== 'true'){
                sidebarHandler(headerArea, mainContentArea, sideMenu, sidebarButton, secondSideBarButton, dynamicContent);
                // dataset is inside sidebarhandler
            }

            if(adminRenameButton && isAdmin && adminRenameButton.dataset.bound !== 'true'){
                adminRenameButton.addEventListener('click', createRenameModal);
                adminRenameButton.dataset.bound = 'true';
                getAdminName(admin_id, (name) => {
                    adminRenameButton.innerText = name;
                });
            }

            if(loginButton && loginButton.dataset.bound !== 'true'){
                loginButton.addEventListener('click', createLoginModal);
                console.log('Attached login modal');
                loginButton.dataset.bound = 'true';
            }

            if(signOutButton && signOutButton.dataset.bound !== 'true'){
                signOutButton.addEventListener('click', signOutUser);
                console.log('Attached sign out button');
                signOutButton.dataset.bound = 'true';
            }

            if(langRoButton && langRoButton.dataset.bound !== 'true'){
                langRoButton.addEventListener('click', ()=>{
                    localStorage.setItem('lang', 'ro');
                    updatePage();
                    console.log("Changed lang to Ro.");
                });
                langRoButton.dataset.button = 'true';
            }

            if(langEnButton && langEnButton.dataset.bound !== 'true'){
                langEnButton.addEventListener('click', ()=>{
                    localStorage.setItem('lang', 'en');
                    updatePage();
                    console.log("Changed lang to En.");
                });
                langEnButton.dataset.bound = 'true';
            }

            if(feedbackButton && feedbackButton.dataset.bound !== 'true'){
                feedbackButton.addEventListener('click', () => {
                    currentPage = 'feedback';
                    updatePage();
                })
                feedbackButton.dataset.bound = 'true';
            }

            if(homeButton && homeButton.dataset.bound !== 'true'){
                homeButton.addEventListener('click', () => {
                    currentPage = 'home';
                    updatePage();
                })
                homeButton.dataset.bound = 'true';
            }
            
            let taskFinished = false;

            if (
                headerArea &&
                mainContentArea &&
                sideMenu &&
                sidebarButton &&
                sidebarButton.dataset.bound === 'true' &&
                adminRenameButton &&
                langRoButton &&
                langEnButton &&
                dynamicContent &&
                feedbackButton &&
                homeButton
            ) {
                taskFinished = true;
            }       
            if(taskFinished){
                setLanguage(localStorage.getItem('preferedLanguage') || 'ro');
                resolve();
                clearTimeout(timeout);
                clearInterval(ALL);
                updatePage();
            }
        }, 100);
        const timeout = setTimeout(()=>{
            clearInterval(ALL);
            console.warn('Some elements could not be loaded.');
            resolve();
        }, 3000);
    })
});

function signInUser(email, password){
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log("User signed in:", user.email, "UID:", user.uid);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign in error:", errorCode, errorMessage);
        alert("Sign in failed: " + errorMessage);
    })
}

function createRenameModal() {
    if (!isAdmin) {
        notify(t("not_admin_no_function"));
        return;
    }

    // Evită dubluri
    const existing = document.getElementById("renameModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "renameModal";
    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal-content">
            <button id="renameModalExitButton" class="modal-exit">×</button>
            <h2 class="modal-title" data-i18n="rename_title">Rename Admin</h2>
            <input
                id="renameInput"
                type="text"
                class="input-field"
                maxlength="20"
                placeholder="${t("new_name")}"
                data-i18n-placeholder="new_name"
            />
            <button id='submitRenameButton' class="btn-primary" data-i18n="submit">Submit</button>
        </div>
    `;
    document.body.appendChild(modal);
    updatePage();
    try {
        document.getElementById('renameModalExitButton').addEventListener('click', ()=>{
            closeModal('renameModal');
        });
        document.getElementById('submitRenameButton').addEventListener('click', () => {
            submitRename();
            closeModal('renameModal');
        });
    } catch (error) {
        console.warn(`Rename modal error: ${error}`);
    }
}

function submitRename(){
    const name = document.getElementById('renameInput').value;
    if(name.length > 20){
        notify(t('length_too_long'));
        return;
    }else if(name.length === 0){
        notify(t('please_name'));
        return;
    }
    set(child(adminNamesLocation, admin_id), {name: name});
    getAdminName(admin_id, (name) => {
        notify(`${t('name_set_to')} ${name}`);
        if (document.getElementById('adminName')) document.getElementById('adminName').innerText = name;
    });
}

function createLoginModal() {
    if (isAdmin){
        notify(t("already_logged_in"));
        return; // prevenim afișarea pentru admin
    }

    // verificăm dacă există deja modalul
    if (document.getElementById("loginModal")) return;

    // creăm containerul
    const modal = document.createElement("div");
    modal.id = "loginModal";
    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-exit">×</button>
            <h2 class="modal-title" data-i18n="login_title">Login</h2>
            <input id="loginEmailInput" type="text" class="input-field" data-i18n-placeholder="email" placeholder="Email" />
            <input id="loginPasswordInput" type="password" class="input-field" data-i18n-placeholder = "password" placeholder="Password" />
            <button class="btn-primary" data-i18n="login_button" >Login</button>
        </div>
    `;

    document.body.appendChild(modal);
    updatePage();
    try {
        document.querySelector("#loginModal .btn-primary").addEventListener("click", () => {
            submitLogin();
            closeModal("loginModal");
        });
        document.querySelector("#loginModal .modal-exit").addEventListener("click", () => {
            closeModal('loginModal');
    });
    } catch (error) {
        alert(`Loggin modal error. ${error.message}`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(!modal)return;
    modal.classList.add('hide');
    setTimeout(() => {
        if (modal) modal.remove();
    }, 200);
}

function getAdminName(adminId, callback) {
    if (adminId && isAdmin) {
        onValue(child(adminNamesLocation, adminId), (snapshot) => {
            const data = snapshot.val();
            console.log("Fetched admin data:", data);

            if (!data || typeof data.name !== 'string' || data.name.trim() === '') {
                callback(t('unnamed'));
                console.log('auiwdfgbeyfgbaiwejfgeyuif');
            } else {
                callback(data.name);
            }
        }, {
            onlyOnce: true // optional: only fetch once
        });
    } else {
        callback(t('unnamed'));
        console.log('auiwdfgbeyfgbaiwejfgeyuif');
    }
}

function submitLogin() {
    let email = document.getElementById('loginEmailInput').value;
    let password = document.getElementById('loginPasswordInput').value;
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        admin_id = user.uid;
        isAdmin = true;
        console.log("User signed in:", user.email, "UID:", user.uid);

        getAdminName(admin_id, (name) => {
            const btn = document.getElementById('adminName');
            if (btn) btn.innerText = name;
            notify(`${t("logged_in_as")} ${name || "Admin"}`);
        });

    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign in error:", errorCode, errorMessage);
        alert("Sign in failed: " + errorMessage);
    })
}

onAuthStateChanged(auth, async (user) => {
    if(user){
        isAdmin = true;
        admin_id = user.uid;

        const adminRenameButton = document.getElementById('adminName');
        const loginButton = document.getElementById('logInButton');
        const signOutButton = document.getElementById('signOutButton');

        if (adminRenameButton && adminRenameButton.dataset.bound !== 'true') {
            adminRenameButton.addEventListener('click', createRenameModal);
            adminRenameButton.dataset.bound = 'true';
        }

        if(adminRenameButton)
            adminRenameButton.classList.remove('hidden')
        if(loginButton)
            loginButton.classList.add('hidden');
        if(signOutButton)
            signOutButton.classList.remove('hidden');

        // Punem numele
        getAdminName(admin_id, (name) => {
            adminRenameButton.innerText = name;
        });
        updatePage();
    }else{
        isAdmin = false;
        admin_id = 0;

        const adminRenameButton = document.getElementById('adminName');
        const loginButton = document.getElementById('logInButton');
        const signOutButton = document.getElementById('signOutButton');

        if(adminRenameButton)
            adminRenameButton.classList.add('hidden')
        if(loginButton)
            loginButton.classList.remove('hidden');
        if(signOutButton)
            signOutButton.classList.add('hidden');
    }
});

function signOutUser(){
    if(!isAdmin){
        notify(t("already_signed_out"));
        return;
    }

    auth.signOut()
    .then(() => {
        console.log('User signed out.');
        notify(t("signed_out"));
    })
    .catch((error) => {
        console.error("Sign out error:", error);
        notify(t('could_not_log_out_user'));
    })
}
