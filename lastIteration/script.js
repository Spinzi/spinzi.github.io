import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
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
const controlData = ref(database, 'controlData');

const adminNamesLocation = child(adminDataRef, "adminNames");

const logsRef = ref(database, 'adminData/logs');
const bufRef = ref(database, 'adminData/buffer');

let isAdmin = false;
let admin_id;

let translations = {};

let currentPage = localStorage.currentPage || 'home';

let loadingTimeout;

function showLoading() {
    console.log('🔻 showLoading called');
    clearTimeout(loadingTimeout);
    document.getElementById("loadingOverlay").classList.remove("hiddens");
    
    loadingTimeout = setTimeout(()=>{
        document.getElementById("loadingOverlay").classList.add("hiddens");
        document.getElementById('loadingOverlayError').classList.remove('hiddens');
        console.error(t("Loading took too long. Showing error."));
        notify(t("loading_took_too_long_error"));
    }, 5000);
}

function hideLoading() {
    console.log("🔻 hideLoading called");
    document.getElementById("loadingOverlay").classList.add("hiddens");
    document.getElementById('loadingOverlayError').classList.add('hiddens');
    clearTimeout(loadingTimeout);
}

showLoading();

function pageManager(page, callback){
    // verify if page is correct
    showLoading();
    const validPages = ['home', 'feedback', 'settings', 'messages', 'console'];
    if(!validPages.includes(page))
        page = 'home';
    
    loadHtmlInto(`pages/pag/${page}.html`, 'dynamicContent',() => {
        // now we need to apply functionality for the elements of the page
        if(page === 'home'){
            homePageManager();
        }else if(page === 'feedback'){
            feedbackPageManager();
        }else if(page === 'messages'){
            messagePageManager();
        }else if(page === 'settings'){
            if(!isAdmin){
                notify(t("not_admin_no_function"));
                currentPage = 'home';
                updatePage();
            }else{
                settingsManager();
            }
        }else if(page === 'console'){
            consoleManager();
        }
        hideLoading();
        
        setTimeout(() => {
            if(callback) {
                callback();
            }
        }, 100);
    });
}

function homePageManager(){
    return;
}

function consoleReqLogData(data) {
    if (typeof data === 'object' && typeof data['raw_message'] === 'string') {
        let retMessage = "";

        if (data['err']) {
            retMessage += `ERROR: ${data['err']}\n`;
        }

        if (data['cmd']) {
            retMessage += `COMMAND: ${data['cmd']}\n`;
            // You can handle different commands here later
        } else if (Array.isArray(data)) {
            data.forEach(element => {
                retMessage += `${element.key}: ${element.data}\n`;
            });
        }

        retMessage += `RAW_MESSAGE: ${data['raw_message']}`;
        return retMessage;
    }

    return JSON.stringify(data); // Fallback
}


function consoleManager(){
    const consoleOutput = document.getElementById('firebaseConsoleOutput');
    const consoleInput = document.getElementById('firebaseConsoleInput');

    const autoScrollToggle = document.getElementById('autoScrollToggle');

    let autoScrollEnabled = true;

    if( localStorage.getItem('autoScrollConsole') !== null ){
        autoScrollEnabled = localStorage.getItem('autoScrollConsole') === 'true';
    }else{
        autoScrollEnabled = autoScrollToggle.checked;
    }
    autoScrollToggle.checked = autoScrollEnabled;

    autoScrollToggle.addEventListener('change', () => {
        autoScrollEnabled = autoScrollToggle.checked;
        localStorage.setItem('autoScrollConsole', autoScrollEnabled);
        scrollToBottom();
    });

    function scrollToBottom() {
        if (autoScrollEnabled) {
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
            console.log('Auto scrolled.');
        }else{
            console.log('Skipped scroll, variable negative.');
        }
    }

    onValue(child(adminDataRef, 'logs'), (snapshot) => {
        if(!snapshot.exists){
            consoleOutput.innerHTML = "<p data-i18n='no_logs'>No logs...</p>";
        }

        consoleOutput.innerHTML = '';
        
        let logsArr = [];

        snapshot.forEach((el) => {
            logsArr.push({
                key: el.key,
                data: el.val()
            });
        });

        logsArr.sort((a, b) => (a.data.timestamp ?? 0) - (b.data.timestamp ?? 0));

        logsArr.forEach((data) => {
            const msg = document.createElement('div');
            msg.classList.add('selectable');
            
            let finalText;

            finalText = consoleReqLogData(data.data.message) ; 

            const _header = document.createElement('h3');

            const _text = document.createElement('p');

            const date = new Date(data.data.timestamp);
            const formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
            _header.innerText = `[${formattedDate}](${data.data.source})`;

            _text.innerHTML = finalText
            .replace(/\\n/g, '<br>')
            .replace(/\n/g, '<br>')
            .replace(/\\"/g, "\"")
            .replace(/ERROR:/g, '<font color="red">ERROR:</font>');

            
            msg.appendChild(_header);
            msg.appendChild(_text);

            consoleOutput.appendChild(msg);
        });
        scrollToBottom();
    })

    consoleInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Optional: prevent form submission or line break
            
            let messages = consoleInput.value.trim().split(" ");
            consoleInput.value = '';
            
            function log(message){
                const source = 'web';
                const timestamp = Date.now();
                push(logsRef, {
                    source: source,
                    timestamp: timestamp,
                    message: message
                });
                notify(t('message_logged'));
            }

            if(messages.length > 2){
                log('ERROR: Message excedes two spaces. Use \'help\'.');
                return;
            }

            if(messages[0] === 'help'){
                log("-+-+-\nHelp\n-+-+-");
            }else if(messages[0] === 'say'){
                log(messages[1]);
            }else if(messages[0] === 'clr'){
                set(logsRef, '');
                getAdminName(admin_id, (name)=>{
                    log(`<font color="red">Admin</font> ${name} cleared the logs.`);
                });
            }else if(messages[0] === 'stats'){
                let lgMsg = '';
                lgMsg += "-+-+-\n<font color=\"#81A6FF\">WEBSITE STATS</font>\n-+-+-\n";
                
                let tm = new Date();
                let formatted = tm.getFullYear() + '-' +
                                String(tm.getMonth() + 1).padStart(2, '0') + '-' +
                                String(tm.getDate()).padStart(2, '0') + ' ' +
                                String(tm.getHours()).padStart(2, '0') + ':' +
                                String(tm.getMinutes()).padStart(2, '0');

                lgMsg += `<font color="#81A6FF">[${formatted}]</font>\n\n`;
                log(lgMsg);
            }else if(messages[0] === 'addAdmin'){
                const uidToAdd = messages[1];
                const adminRef = child(adminDataRef, 'admins/' + uidToAdd);

                set(adminRef, true)
                    .then(() => {
                        log(`Added <font color="#81A6FF">${messages[1]}</font> to admin list.`);
                    })
                    .catch((error) => {
                        log(`<font color="red">Error:</font> ${error.message}`);
                    });
            }else{
                log(`Unknown command\n<font color="#81A6FF">${messages[0]} ${messages[1] ?? ''}</font>\nPlease use 'help' for support.`);
            }
        }
    });

}

async function reqStatus(settingId, callback) {
    const validSettings = ['feedback', 'message'];
    if (!validSettings.includes(settingId)) {
        notify(t('error_setting_id_not_existent') + ` ID: ${settingId}`);
        return null;
    }

    try {
        const snapshot = await get(child(controlData, settingId));
        if (!snapshot.exists()) {
            console.error(`Setting '${settingId}' doesn't exist in database.`);
            if(callback) callback(404);
            return 404;
        }
        const value = snapshot.val();
        if(callback) callback(value.value===true);
        return value.value === true; // returns boolean

    } catch (error) {
        console.error(`Error fetching setting '${settingId}':`, error);
        return null;
    }
}

function settingsManager(){
    if(!isAdmin){
        return;
    }

    const feedbackButton = document.getElementById('toggleFeedbackPanelButton');
    const feedbackStatus = document.getElementById('toggleFeedbackPanelButtonStatus');

    const messageButton = document.getElementById('toggleMessagePanelButton');
    const messageStatus = document.getElementById('toggleMessagePanelButtonStatus');

    if (!feedbackButton || !feedbackStatus || !messageButton || !messageStatus) {
        notify(t('elements_not_loaded'));
        return;
    }

    const validSettings = ['feedback', 'message'];

    async function updateStatus(paragraphId, settingId, el) {
        const element = document.getElementById(paragraphId);
        if (!validSettings.includes(settingId)) {
            notify(t('error_setting_id_not_existent') + ` ID: ${settingId}`);
            return;
        }
        if(!element){
            notify(t('no_element_with_id'));
            return;
        }

        element.innerText = t('parsing_data');
        try {
            const response = await reqStatus(settingId);

            if (response === 404) {
                element.innerText = t('setting_not_existent');
                if(el){
                    el.classList.remove('green');
                    el.classList.remove('red');
                }
            } else if (response === true) {
                element.innerText = t('setting_activated');
                if(el){
                    el.classList.add('green');
                    el.classList.remove('red');
                }
            } else if (response === false) {
                element.innerText = t('setting_deactivated');
                if(el){
                    el.classList.remove('green');
                    el.classList.add('red');
                }
            } else {
                element.innerText = t('unknown_error_in_processing_data') + ` Value read: ${response}`;
                if(el){
                    el.classList.remove('green');
                    el.classList.remove('red');
                }
            }
        } catch (error) {
            element.innerText = t('unknown_error_in_processing_data') + ` ${error}`;
        }

        console.log(`Status updated on: ${paragraphId}`);
    }
    
    function addEv(el, st, settingId){
        el.addEventListener('click', () => {
            reqStatus(settingId, (stat)=>{
                if(stat === 404){
                    console.log(`Status of feedback found: ${stat}, executing propper program...`);
                    st.innerText = t('creating_element_in_database');
                    set(child(controlData, settingId), {
                        value: false
                    })
                    .catch((error)=>{
                        console.error(`Error in feedback setting: ${error}`);
                    });
                }else if(stat === true){
                    console.log(`Status of feedback found: ${stat}, executing propper program...`);
                    st.innerText = t('updating_element_in_database');
                    set(child(controlData, settingId), {
                        value: false
                    })
                    .catch((error)=>{
                        console.error(`Error in feedback setting: ${error}`);
                    });
                }else if(stat === false){
                    console.log(`Status of feedback found: ${stat}, executing propper program...`);
                    st.innerText = t('updating_element_in_database');
                    set(child(controlData, settingId), {
                        value: true
                    })
                    .catch((error)=>{
                        console.error(`Error in feedback setting: ${error}`);
                    });
                }else{
                    console.error(`Could not read the status of the button. Status read: ${stat}`);
                }
                updateStatus(`${st.id}`, settingId, el);
            });
        });
    }
    
    addEv(feedbackButton, feedbackStatus, 'feedback');
    addEv(messageButton, messageStatus, 'message');
    // setTimeout(() => {
        try {
            updateStatus(feedbackStatus.id, 'feedback', feedbackButton);
            updateStatus(messageStatus.id, 'message', messageButton);
        } catch (error) {
            notify(t('error') + ` ${error}`);
        }
    // }, 300);
}

function messagePageManager() {
    const holder = document.getElementById('messagesCard');
    const displayHolder = document.getElementById('messagesDisplayContent');
    const msgDisplayHolder= document.getElementById('messagesDisplay');

    const functionalMessage = document.getElementById('messagesDescription');
    const nonFunctionalMessage = document.getElementById('messagesDescriptionDisabled');

    const formNameInput = document.getElementById('messagesNameInput');
    const formMessageInput = document.getElementById('messagesMessageInput');

    const submitButton = document.getElementById('messagesSubmitButton');
    const cancelButton = document.getElementById('messagesCancelButton');

    const messagesNumber = document.getElementById('usersNumber');

    if (
        holder &&
        displayHolder &&
        functionalMessage &&
        nonFunctionalMessage &&
        formNameInput &&
        formMessageInput &&
        submitButton &&
        cancelButton &&
        messagesNumber
    ) {
        console.log('Messages page elements loaded correctly.');

        function loadMessages() {
            displayHolder.innerHTML = '';

            onValue(child(publicDataRef, 'messages'), (snapshot) => {
                displayHolder.innerHTML = '';

                if (!snapshot.exists()) {
                    const noMsg = document.createElement('div');
                    noMsg.textContent = t('no_user_messages_found');
                    displayHolder.appendChild(noMsg);
                    return;
                }

                const messagesArray = [];
                snapshot.forEach((el) => {
                    const val = el.val();
                    messagesArray.push({
                        key: el.key,
                        data: val
                    });
                });
                messagesNumber.innerText = `${messagesArray.length} ${t('messages_number')}`;
                messagesNumber.style.fontSize = '1.2rem';
                messagesNumber.style.color = 'gray';

                // Sort by timestamp descending
                messagesArray.sort((a, b) => (b.data.timestamp ?? 0) - (a.data.timestamp ?? 0));

                messagesArray.forEach(({ key, data }) => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('feedbackItem');

                    const feedbackMsgDiv = document.createElement('div');
                    feedbackMsgDiv.classList.add('feedbackMsgDivEl');

                    const title = document.createElement('h3');
                    
                    const strong = document.createElement('strong');
                    strong.textContent = data.name ?? 'Anonymous';
                    
                    const em = document.createElement('em');
                    em.textContent = new Date(data.timestamp ?? 0).toLocaleString();

                    title.appendChild(strong);
                    title.appendChild(em);
                    
                    feedbackMsgDiv.appendChild(title);

                    if(isAdmin){
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('styledButton', 'red');
                        
                        deleteButton.textContent = 'Delete';
                        deleteButton.addEventListener('click', () => {
                            if(isAdmin){
                                const refToDelete = child(publicDataRef, `messages/${key}`);
                                console.log(refToDelete);
                                set(refToDelete, null)
                                    .then(() => notify('Removed element'))
                                    .catch((error) => {
                                        console.error("Error removing element:", error);
                                        notify('Failed to remove feedback.');
                                    });
                            }
                        });
                        feedbackMsgDiv.appendChild(deleteButton);
                    }

                    const messageP = document.createElement('p');
                    messageP.textContent = data.message ?? '';

                    entryDiv.appendChild(feedbackMsgDiv);
                    entryDiv.appendChild(messageP);
                    displayHolder.appendChild(entryDiv);

                    const divider = document.createElement('div');
                    divider.classList.add('sidebar-divider');
                    displayHolder.appendChild(divider);
                });

                let lang = localStorage.getItem('lang');
                if (!lang) lang = 'ro';
                setLanguage(lang);
            });
        }

        loadMessages();

        cancelButton.addEventListener('click', () => {
            currentPage = 'home';
            updatePage(currentPage);
        });

        reqStatus('message', (stat) => {
            if (stat === true) {
                formNameInput.disabled = false;
                formMessageInput.disabled = false;
                submitButton.classList.add('green');

                functionalMessage.classList.remove('hidden');
                nonFunctionalMessage.classList.add('hidden');
                formNameInput.classList.remove('hidden');
                formMessageInput.classList.remove('hidden');
                msgDisplayHolder.classList.remove('hidden');

                submitButton.addEventListener('click', () => {
                    console.log('Attempting to send message...');
                    if (!formNameInput.value.trim() || !formMessageInput.value.trim()) {
                        notify(t('name_or_message_incomplete'));
                        return;
                    }
                    if (formNameInput.value.trim().length > 20) {
                        notify(t('name_too_long'));
                        return;
                    }
                    if (formMessageInput.value.trim().length > 500) {
                        notify(t('message_too_long'));
                        return;
                    }

                    const msg = {
                        message: formMessageInput.value.trim(),
                        name: formNameInput.value.trim(),
                        timestamp: Date.now()
                    };

                    push(child(publicDataRef, 'messages'), msg)
                        .then(() => {
                            notify(t('sent_succesfully'));
                            formMessageInput.value = '';
                        })
                        .catch((error) => {
                            console.error(error);
                            notify(t('failed_sending_message'));
                        });
                });

            } else if (stat === false) {
                submitButton.classList.remove('green');
                formNameInput.disabled = true;
                formMessageInput.disabled = true;

                if(!isAdmin)msgDisplayHolder.classList.add('hidden');
                else msgDisplayHolder.classList.remove('hidden');

                functionalMessage.classList.add('hidden');
                nonFunctionalMessage.classList.remove('hidden');
                
                formNameInput.classList.add('hidden');
                formMessageInput.classList.add('hidden');
            }
        });

    } else {
        console.warn('Messages page elements failed to load.');
        notify('Error loading messages page, attempting to reload.');
        pageManager(currentPage);
    }
}

function feedbackPageManager(){
    const holder = document.getElementById('feedbackCard');
    const adminHolder= document.getElementById('feedbackAdminOnly');

    const functionalMessage = document.getElementById('feedbackDescription');
    const nonFunctionalMessage = document.getElementById('feedbackDescriptionDisabled');

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

        function loadMes() {
            adminMessages.innerHTML = ''; // Clear previous content

            onValue(child(publicDataRef, 'feedback'), (snapshot) => {
            adminMessages.innerHTML = '';

            if (!snapshot.exists()) {
                const noMsg = document.createElement('div');
                noMsg.textContent = t('no_feedback_messages_found');
                adminMessages.appendChild(noMsg);
                return;
            }

            const feedbackArray = [];

            snapshot.forEach((el) => {
                const val = el.val();
                feedbackArray.push({
                    key: el.key,
                    data: val
                });
            });

            const divel = document.createElement('div');
            divel.classList.add('feedbacktotalmessnumb');
            let length = feedbackArray.length;

            const reloadButton = document.createElement('button');
            reloadButton.setAttribute("data-i18n", "reload");
            reloadButton.onclick = ()=>{
                loadMes();
                notify('messages_havaaaaae_been_reloaded');
            };
            reloadButton.classList.add('styledButton');
            reloadButton.classList.add('red');
            reloadButton.style.marginBottom = '1rem';
            const stat = document.createElement('h4');
            stat.innerText = `${length} ${t('total_messages')}`;

            divel.appendChild(reloadButton);
            divel.append(stat);

            adminMessages.appendChild(divel);

            // Sort by timestamp descending (newest first)
            feedbackArray.sort((a, b) => (b.data.timestamp ?? 0) - (a.data.timestamp ?? 0));

            feedbackArray.forEach(({ key, data }) => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('feedbackItem');

                const feedbackMsgDiv = document.createElement('div');
                feedbackMsgDiv.classList.add('feedbackMsgDivEl');

                const title = document.createElement('h3');

                const strong = document.createElement('strong');
                strong.textContent = data.name ?? 'Anonymous';

                const em = document.createElement('em');
                em.textContent = new Date(data.timestamp ?? 0).toLocaleString();

                title.appendChild(strong);
                title.appendChild(em);
                feedbackMsgDiv.appendChild(title);

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('styledButton', 'red');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => {
                    deleteFeedback(key);
                });

                feedbackMsgDiv.appendChild(deleteButton);

                const messageP = document.createElement('p');
                messageP.textContent = data.feedback ?? '';

                entryDiv.appendChild(feedbackMsgDiv);
                entryDiv.appendChild(messageP);
                adminMessages.appendChild(entryDiv);

                const divider = document.createElement('div');
                divider.classList.add('sidebar-divider');
                adminMessages.appendChild(divider);
            });

            let lang = localStorage.getItem('lang');
            if(!lang) lang = 'ro';
            setLanguage(lang);
        });

        }

        loadMes();

        cancelButton.addEventListener('click', ()=>{
            currentPage = 'home';
            updatePage(currentPage);
        });

        reqStatus('feedback', (stat) => {
            if(stat === true){
                formNameInput.disabled = false;
                formMessageInput.disabled = false;
                submitButton.addEventListener('click', ()=>{
                
                    console.log('Attempting to send feedback...');
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
                submitButton.classList.add('green');
                functionalMessage.classList.remove('hidden');
                nonFunctionalMessage.classList.add('hidden');
                formNameInput.classList.remove('hidden');
                formMessageInput.classList.remove('hidden');
            }else if(stat === false){
                submitButton.classList.remove('green');
                formNameInput.disabled = true;
                formMessageInput.disabled = true;
                functionalMessage.classList.add('hidden');
                nonFunctionalMessage.classList.remove('hidden');
                formNameInput.classList.add('hidden');
                formMessageInput.classList.add('hidden');
            }
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
    const adminAboutButton = document.getElementById('adminButton');
    const settingsButton = document.getElementById('settingsButton');
    const consoleButton = document.getElementById('consoleButton');
    if(isAdmin){
        const adminRenameButton = document.getElementById('adminName');
        getAdminName(admin_id, (name) => {
            adminRenameButton.innerText = name;
        });

        adminAboutButton.classList.remove('hidden');
        settingsButton.classList.remove('hidden');
        consoleButton.classList.remove('hidden');
    }else{
        adminAboutButton.classList.add('hidden');
        settingsButton.classList.add('hidden');
        consoleButton.classList.add('hidden');
    }

    pageManager(currentPage, ()=>{
        let lang = localStorage.getItem('lang');
        if(!lang) lang = 'ro';
        setLanguage(lang);
    });
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
        <p>${message}</p>
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
            const messagesButton = document.getElementById('messageButton');
            const homeButton = document.getElementById('homeButton');
            const settingsButton = document.getElementById('settingsButton');
            const consoleButton = document.getElementById('consoleButton');
            
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
                langRoButton.dataset.bound = 'true';
            }

            if(langEnButton && langEnButton.dataset.bound !== 'true'){
                langEnButton.addEventListener('click', ()=>{
                    localStorage.setItem('lang', 'en');
                    updatePage();
                    console.log("Changed lang to En.");
                });
                langEnButton.dataset.bound = 'true';
            }

            if(settingsButton && settingsButton.dataset.bound !== 'true'){
                settingsButton.addEventListener('click', ()=>{
                    if(!isAdmin){
                        notify(t("not_admin_no_function"));
                        return;
                    }
                    currentPage = 'settings';
                    localStorage.currentPage = 'settings';
                    updatePage();
                });
                settingsButton.dataset.bound = 'true';
            }

            if(feedbackButton && feedbackButton.dataset.bound !== 'true'){
                feedbackButton.addEventListener('click', () => {
                    currentPage = 'feedback';
                    localStorage.currentPage = 'feedback';
                    updatePage();
                })
                feedbackButton.dataset.bound = 'true';
            }

            if(messagesButton && messagesButton.dataset.bound !== 'true'){
                messagesButton.addEventListener('click', ()=>{
                    currentPage = 'messages';
                    localStorage.currentPage = 'messages';
                    updatePage();
                });
                messagesButton.dataset.bound = 'true';
            }

            if(consoleButton && consoleButton.dataset.bound !== 'true'){
                consoleButton.addEventListener('click', ()=>{
                    if(!isAdmin){
                        notify(t("not_admin_no_function"));
                        return;
                    }
                    currentPage = 'console';
                    localStorage.currentPage = 'console';
                    updatePage();
                });
                consoleButton.dataset.bound = 'true';
            }

            if(homeButton && homeButton.dataset.bound !== 'true'){
                homeButton.addEventListener('click', () => {
                    currentPage = 'home';
                    localStorage.currentPage = 'home'
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
                homeButton &&
                settingsButton &&
                messagesButton &&
                consoleButton
            ) {
                taskFinished = true;
            }       
            if(taskFinished){
                setLanguage(localStorage.getItem('preferedLanguage') || 'ro');
                resolve();
                clearTimeout(timeout);
                clearInterval(ALL);
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
                if(callback) callback(t('unnamed'));
                return t('unnamed');
            } else {
                if(callback) callback(data.name);
                return data.name;
            }
        }, {
            onlyOnce: true // optional: only fetch once
        });
    } else {
        if(callback) callback(t('unnamed'));
        return t('unnamed');
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

    currentPage = localStorage.currentPage || 'home';
    updatePage();
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