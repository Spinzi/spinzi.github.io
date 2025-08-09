import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, fetchSignInMethodsForEmail, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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
        localStorage.setItem('currentPage', 'home');
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
    const validPages = ['home', 'feedback', 'settings', 'messages', 'console', 'controlPanel'];
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
            if(!isAdmin){
                notify(t("not_admin_no_function"));
                currentPage = 'home';
                updatePage();
            }else{
                consoleManager();
            }
        }else if(page === 'controlPanel'){
            if(!isAdmin){
                notify(t("not_admin_no_function"));
                currentPage = 'home';
                updatePage();
            }else{
                controlPanelManager();
            }
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

function controlPanelManager(){
    if(!isAdmin){
        localStorage.setItem("currentPage", "home");
        updatePage();
    }
    const settingsTable = document.getElementById("settingsTable");
    const settingsTableBody = settingsTable.querySelector("tbody");
    const plantDataTable = document.getElementById("plantDataTable");
    const saveBtn = document.getElementById('controlPanelSaveButton');

    function log(message, skip){
        const source = 'web';
        const timestamp = Date.now();
        push(logsRef, {
            source: source,
            timestamp: timestamp,
            message: message
        });
        if(!skip)notify(t('message_logged'));
    }

    async function loadSettings() {
        onValue(child(adminDataRef, 'settings'), (snapshot)=>{
            if(!snapshot.exists()){
                notify(t('couldnt_get_settings'));
                console.error("Couldn't get settings from firebase.")
                return;
            }

            const data = snapshot.val();
            console.log(data);
            settingsTableBody.innerHTML = '';

            for(const [key, value] of Object.entries(data)){
                const validKeys = ['data limit', 'delay', 'name'];
                if(!validKeys.includes(key)){
                    return;
                }
                const el = document.createElement('tr');

                const tit = document.createElement('td');
                tit.textContent = key;

                const val = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.dataset.key = key;
                input.dataset.originalValue = value;

                input.addEventListener('input', () => {
                    saveBtn.classList.remove('hidden')
                })

                val.appendChild(input);
                el.appendChild(tit);
                el.appendChild(val);
                settingsTableBody.appendChild(el);
                
                const inputs = document.querySelectorAll('#settingsTable tbody tr td input ');
                inputs.forEach((input, index) => {
                    input.addEventListener('keydown', (event) => {
                        if(event.key === 'Enter'){
                            event.preventDefault();
    
                            const nextInput = inputs[index+1];
                            if(nextInput){
                                nextInput.focus();
                                nextInput.select();
                            }else{
                                saveBtn.focus();
                            }
                        }
                    });
                });
            }

        });
    }

    function loadPannel() {
        let finalTable = document.createElement('div');
        let shownData = null;

        // Listen to settings/showData once to get allowed keys, then listen for data changes
        onValue(child(adminDataRef, 'settings/showData'), (settingsSnap) => {
            if (settingsSnap.exists()) {
                shownData = settingsSnap.val();
                const allowedLists = Object.keys(shownData);

                // Now listen for data changes, every time data updates this callback fires
                onValue(child(adminDataRef, 'data'), (dataSnap) => {
                    if (dataSnap.exists()) {
                        const data = dataSnap.val();

                        // Clear previous table container
                        finalTable.innerHTML = '';

                        function createTable(timeString, itemsArr) {
                            const table = document.createElement('table');
                            table.classList.add('data-table');

                            const caption = document.createElement('caption');
                            caption.textContent = `Created on: ${timeString}`;
                            caption.style.fontWeight = 'bold';
                            caption.style.padding = '0.5rem';
                            caption.style.textAlign = 'left';
                            caption.style.captionSide = 'top';
                            table.appendChild(caption);

                            const thead = document.createElement('thead');
                            const headerRow = document.createElement('tr');
                            for (const [key] of itemsArr) {
                                const th = document.createElement('th');
                                th.textContent = key;
                                headerRow.appendChild(th);
                            }
                            thead.appendChild(headerRow);

                            const tbody = document.createElement('tbody');
                            const valueRow = document.createElement('tr');
                            for (const [key, value] of itemsArr) {
                                const td = document.createElement('td');
                                td.textContent = value;

                                const maxValue = shownData[key] || 100;

                                const numericValue = Number(value);
                                let ratio = 0;
                                if(!isNaN(numericValue) && maxValue > 0){
                                    ratio = Math.min(Math.max(numericValue / maxValue, 0), 1);
                                }

                                const r = Math.round(255 * (1 - ratio));
                                const b = 0;
                                const g = Math.round(255 * ratio);

                                td.style.backgroundColor = `rgba(${r},${g},${b}, 0.4)`;

                                valueRow.appendChild(td);
                            }
                            tbody.appendChild(valueRow);

                            table.appendChild(thead);
                            table.appendChild(tbody);
                            return table;
                        }

                        Object.values(data)
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .forEach((entry) => {
                                if (!entry['message'] || !entry['timestamp']) {
                                    console.error('Could not find message or timestamp in entry:', entry);
                                    return;
                                }

                                const obj = [];
                                for (const [key, value] of Object.entries(entry['message'])) {
                                    if (allowedLists.includes(key)) {
                                        obj.push([key, value]);
                                    }
                                }

                                if (obj.length === 0) return;

                                const ts = new Date(entry['timestamp']);
                                const timeString = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')} ${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}:${String(ts.getSeconds()).padStart(2, '0')}`;

                                const tableElement = createTable(timeString, obj);
                                finalTable.appendChild(tableElement);
                            });

                        plantDataTable.innerHTML = '';
                        plantDataTable.appendChild(finalTable);

                    } else {
                        plantDataTable.innerHTML = '<h3>No plant data found.</h3>';
                    }
                });
            } else {
                console.log('No plant data settings found.');
            }
        });
    }

    function updateSetting(key, value) {
        const settingsRef = child(adminDataRef, `settings/${key}`);
        return set(settingsRef, value)
            .then(() => {
                console.log(`Setting '${key}' updated to:`, value);
            })
            .catch((error) => {
                console.error(`Error updating setting '${key}':`, error);
                notify(`Error updating setting: ${error.message}`);
            });
    }
    
    saveBtn.addEventListener('click', async () => {
        const info = settingsTableBody.querySelectorAll('input');
        let updates = [];
        
        info.forEach((el)=>{
            const key = el.dataset.key;
            const val = el.value.trim();

            if(key === 'delay'){
                const num = Number(val);
                if (!val || isNaN(num) || num < 0 || !Number.isInteger(num)) {
                    console.warn('Invalid delay value:', val);
                    notify('Delay must be a valid non-negative integer.');
                    return;
                }

                if(val === el.dataset.originalValue){
                    console.log("Found setting to be unchanged, skipping saving.");
                    return
                }

                const p = new Promise((resolve) => {
                    getAdminName(admin_id, (name)=>{
                        updateSetting('delay', num);
                        log(`\nAdmin <font color="red">${name}</font> changed setting.\nSetting name: 'delay'\nValue: ${num}\n`, true);
                        resolve(true);
                    })
                })
                updates.push(p);

            }else if(key === 'name'){
                if (!val) {
                    console.warn('Name is empty.');
                    notify('Name cannot be empty.');
                    return;
                }

                if (val.length > 50) {
                    console.warn('Name is too long:', val);
                    notify('Name must be less than 50 characters.');
                    return;
                }

                // Optional: disallow special characters (only letters, numbers, space, dash, underscore)
                const nameRegex = /^[a-zA-Z0-9 _-]+$/;
                if (!nameRegex.test(val)) {
                    console.warn('Invalid characters in name:', val);
                    notify('Name can only contain letters, numbers, spaces, dashes and underscores.');
                    return;
                }

                if(val === el.dataset.originalValue){
                    console.log("Found setting to be unchanged, skipping saving.");
                    return
                }

                const p = new Promise((resolve) => {
                    getAdminName(admin_id, (name)=>{
                        updateSetting('name', val);
                        log(`\nAdmin <font color="red">${name}</font> changed setting.\nSetting name: 'name'\nValue: ${val}\n`, true);
                        resolve(true);
                    })
                })
                updates.push(p);

            }else if(key === 'data limit'){
                const num = Number(val);
                if (!val || isNaN(num) || num < 0 || !Number.isInteger(num)) {
                    console.warn('Invalid delay value:', val);
                    notify('Delay must be a valid non-negative integer.');
                    return;
                }

                if(val === el.dataset.originalValue){
                    console.log("Found setting to be unchanged, skipping saving.");
                    return
                }

                const p = new Promise((resolve) => {
                    getAdminName(admin_id, (name)=>{
                        updateSetting('data limit', num);
                        log(`\nAdmin <font color="red">${name}</font> changed setting.\nSetting name: 'data limit'\nValue: ${num}\n`, true);
                        resolve(true);
                    })
                })
                updates.push(p);

            }else{
                console.warn('Unknow setting element, skipping.');
            }
        });
        if(updates.length > 0){
            await Promise.all(updates);
            notify('Updated settings');
            saveBtn.classList.add('hidden');
            loadSettings();
        }
    });

    loadSettings();
    loadPannel();

}

function consoleReqLogData(data) {
    if (typeof data === 'object' || typeof data['raw_message'] === 'string') {
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

        if(data['raw_message'])retMessage += `RAW_MESSAGE: ${data['raw_message']}`;
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

            finalText = consoleReqLogData(data.data.message).replace(/^"(.*)"$/, '$1') ; 

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
            
            function parseCommand(input) {
                const trimmed = input.trim();

                // Match: command with optional "argument"
                const match = trimmed.match(/^(\w+)(?:\s+"(.*)")?$/);

                if (!match) {
                    return null;
                }

                const [, command, argument] = match;
                return { command, argument: argument || null };
            }

            let messages = parseCommand(consoleInput.value);
            console.log(messages);
            consoleInput.value = '';

            if (!messages) {
                log(`ERROR: Invalid command format. Use: &lt;command&gt; "argument"`);
                return;
            }
            
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

            function bufLog(message){
                try {
                    const source = 'web';
                    const timestamp = Date.now();
                    push(bufRef, {
                        source: source,
                        timestamp: timestamp,
                        message: message
                    });
                    log(`<b>Logged message in buffer:</b>\n${message}`)
                    notify(t('message_logged_in_buf'));
                } catch (error) {
                    notify('Error logging message in buffer.');
                    console.error(error);
                    log(`Error logging message in buffer: ${error.message}`);
                }
            }

            if(messages.command === 'help'){
                const helpMessage = `
<font color="#81A6FF">-+-+-</font><br>
<b>Help</b><br>
<font color="#81A6FF">-+-+-</font><br><br>
<font color="cyan">say "message"</font> - Log a message as a user<br>
<font color="cyan">clr</font> - Clear all logs<br>
<font color="cyan">stats</font> - View website stats<br>
<font color="cyan">empty "messages"</font> - Delete all public messages<br>
<font color="cyan">empty "feedback"</font> - Delete all feedback messages<br>
<font color="cyan">addAdmin "uid"</font> - Add user to admin list<br>
<font color="cyan">addDataVariable "name$maxVal"</font> - Add a data variable to be shown<br>
<font color="cyan">removeDataVariable "name"</font> - Remove a data variable from being shown<br>
<font color="cyan">showDataVariables</font> - Display all current data variables set to show<br>
<font color="cyan">buffSay "message"</font> - Log a message in the buffer<br>
<font color="cyan">buffClr</font> - Clear the buffer<br>
<font color="cyan">help</font> - Show this help message<br>
    `;
                    log(helpMessage);
            }else if(messages.command === 'say'){
                if(messages.argument === ''){
                    log('Missing argument, try putting it in between \" \".');
                }
                log(messages.argument);
            }else if(messages.command === 'clr'){
                set(logsRef, '');
                getAdminName(admin_id, (name)=>{
                    log(`<font color="red">Admin</font> ${name} cleared the logs.`);
                });
            }else if(messages.command === 'stats'){
                let lgMsg = '';
                lgMsg += "\n-+-+-\n<font color=\"#81A6FF\">WEBSITE STATS</font>\n-+-+-\n";
                
                let tm = new Date();
                let formatted = tm.getFullYear() + '-' +
                                String(tm.getMonth() + 1).padStart(2, '0') + '-' +
                                String(tm.getDate()).padStart(2, '0') + ' ' +
                                String(tm.getHours()).padStart(2, '0') + ':' +
                                String(tm.getMinutes()).padStart(2, '0');

                lgMsg += `<font color="#81A6FF">[${formatted}]</font>\n\n`;

                async function printData() {
                    lgMsg += `<b>Admin Data:</b><br>`;

                    const adminsNumber = await get(child(adminDataRef, 'admins')).then(snapshot => {
                        return snapshot.exists() ? snapshot.size || Object.keys(snapshot.val()).length : 0;
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> <font color="cyan">${adminsNumber}</font> admins.<br>`;

                    const adminNamed = await get(child(adminDataRef, 'adminNames')).then(snapshot => {
                        return snapshot.exists() ? snapshot.size || Object.keys(snapshot.val()).length : 0;
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> <font color="cyan">${adminNamed}</font> named admins.<br>`;

                    const logsLength = await get(child(adminDataRef, 'logs')).then(snapshot => {
                        return snapshot.exists() ? snapshot.size || Object.keys(snapshot.val()).length : 0;
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> <font color="cyan">${logsLength}</font> logs.<br>`;

                    const bufferLength = await get(child(adminDataRef, 'buffer')).then(snapshot => {
                        return snapshot.exists() ? snapshot.size || Object.keys(snapshot.val()).length : 0;
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> <font color="cyan">${bufferLength}</font> buffer messages.<br>`;

                    lgMsg += `<b>Control Data:</b><br>`;

                    const feedbackAllowed = await get(child(controlData, 'feedback')).then(snapshot => {
                        if (!snapshot.exists()) return '<font color="red">Could not get value</font>';
                        return snapshot.val()["value"]
                            ? '<font color="green">Allowed</font>'
                            : '<font color="orange">Denied</font>';
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> Feedback: ${feedbackAllowed}.<br>`;

                    const messagesAllowed = await get(child(controlData, 'message')).then(snapshot => {
                        if (!snapshot.exists()) return '<font color="red">Could not get value</font>';
                        return snapshot.val()["value"]
                            ? '<font color="green">Allowed</font>'
                            : '<font color="orange">Denied</font>';
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> Messages: ${messagesAllowed}.<br>`;

                    lgMsg += `<b>Public Data:</b><br>`;

                    const messagesLength = await get(child(publicDataRef, 'messages')).then(snapshot => {
                        return snapshot.exists() ? snapshot.size || Object.keys(snapshot.val()).length : 0;
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> Number of messages: <font color="cyan">${messagesLength}</font>.<br>`;

                    const feedbackMsgLength = await get(child(publicDataRef, 'feedback')).then(snapshot => {
                        return snapshot.exists() ? snapshot.size || Object.keys(snapshot.val()).length : 0;
                    }).catch(error => `<font color="red">ERROR</font>`);

                    lgMsg += `  -> Number of feedback messages: <font color="cyan">${feedbackMsgLength}</font>.<br>`;

                    log(lgMsg);
                }


                printData();
            }else if(messages.command === 'addAdmin'){
                const uidToAdd = messages.argument;
                console.log(uidToAdd);
                const adminRef = child(adminDataRef, 'admins/' + uidToAdd);

                set(adminRef, true)
                    .then(() => {
                        log(`Added <font color="#81A6FF">${messages.argument}</font> to admin list.`);
                    })
                    .catch((error) => {
                        log(`<font color="red">Error:</font> ${error.message}`);
                    });
            }else if(messages.command === 'empty'){
                 if (messages.argument === "messages") {
                    set(ref(database, 'publicData/messages'), null)
                        .then(() => {
                            getAdminName(admin_id, (name) => {
                                log(`<font color="red">Admin</font> ${name} cleared the <b>messages</b>.`);
                            });
                        })
                        .catch((error) => log(`ERROR: ${error.message}`));
                } else if (messages.argument === "feedback") {
                    set(ref(database, 'publicData/feedback'), null)
                        .then(() => {
                            getAdminName(admin_id, (name) => {
                                log(`<font color="red">Admin</font> ${name} cleared the <b>feedback</b>.`);
                            });
                        })
                        .catch((error) => log(`ERROR: ${error.message}`));
                } else {
                    log("Argument doesn't match the description. Available are: \"messages\", \"feedback\"");
                }
            }else if(messages.command === 'addDataVariable'){
                if (!messages.argument) {
                    log('Missing argument for addDataVariable. Usage: addDataVariable "variableName"');
                } else {
                    const variable = messages.argument.trim();
                    const dt = variable.split('$');
                    const variableName = dt[0].trim();

                    if (dt.length > 1) {
                        const secondElement = dt[1].trim();
                        const isNumber = !isNaN(secondElement) && secondElement !== '';
                        
                        if (isNumber) {
                            const ref = child(adminDataRef, `settings/showData/${variableName}`);
                            set(ref, secondElement)
                                .then(() => {
                                    log(`Added data variable <font color="#81A6FF">${variableName}</font> with value <font color="#81A6FF">${secondElement}</font> to showData.`);
                                })
                                .catch((error) => {
                                    log(`<font color="red">Error:</font> ${error.message}`);
                                });
                        } else {
                            log(`Second element "${secondElement}" is NOT a number.`);
                            return;
                        }
                    } else {
                        log('No second element found after splitting by $.');
                        return;
                    }
                }
            }
            else if (messages.command === 'showDataVariables') {
                const ref = child(adminDataRef, 'settings/showData');
                get(ref)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const variables = snapshot.val();

                            // Check if variables is an object
                            if (typeof variables !== 'object' || variables === null) {
                                log('Expected showData to be an object of variables and values.');
                                return;
                            }

                            const variableList = Object.entries(variables).map(
                                ([key, value]) => `<font color="#81A6FF">${key}</font>: <font color="cyan">${value}</font>`
                            );

                            if (variableList.length === 0) {
                                log('No data variables found in showData.');
                            } else {
                                log(`<b>ShowData variables:</b><br>` + variableList.join(', '));
                            }
                        } else {
                            log('No showData variables found.');
                        }
                    })
                    .catch((error) => {
                        log(`<font color="red">Error:</font> ${error.message}`);
                    });
            }
            else if(messages.command === 'removeDataVariable'){
                if (!messages.argument) {
                    log('Missing argument for removeDataVariable. Usage: removeDataVariable "variableName"');
                } else {
                    const variableName = messages.argument.trim();
                    const ref = child(adminDataRef, `settings/showData/${variableName}`);
                    set(ref, null)
                        .then(() => {
                            log(`Removed data variable <font color="#81A6FF">${variableName}</font> from showData.`);
                        })
                        .catch((error) => {
                            log(`<font color="red">Error:</font> ${error.message}`);
                        });
                }
            }else if(messages.command === 'buffSay'){
                if(messages.argument === ''){
                    log('Missing argument, try putting it in between \" \".');
                }
                bufLog(messages.argument);
            }
            else if(messages.command === 'buffClr'){
                set(bufRef, '')
                    .then(() => {
                        getAdminName(admin_id, (name) => {
                            log(`<font color="red">Admin</font> ${name} cleared the buffer.`);
                        });
                    })
                    .catch((error) => log(`ERROR: ${error.message}`));
            }
            else{
                log(`Unknown command<br><font color="#81A6FF">${messages.command} ${messages.argument ?? ''}</font><br>Please use 'help' for support.`);
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

                if(isAdmin){
                    getAdminName(admin_id, (name)=>{
                        formNameInput.value = name;
                        notify(t('auto_completed_name'));
                    })
                }

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
                if(isAdmin){
                    getAdminName(admin_id, (name)=>{
                        formNameInput.value = name;
                        notify(t('auto_completed_name'));
                    })
                }
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
    const controlPanelButton =  document.getElementById('controlButton');
    if(isAdmin){
        const adminRenameButton = document.getElementById('adminName');
        getAdminName(admin_id, (name) => {
            adminRenameButton.innerText = name;
        });

        adminAboutButton.classList.remove('hidden');
        settingsButton.classList.remove('hidden');
        consoleButton.classList.remove('hidden');
        controlPanelButton.classList.remove('hidden');
    }else{
        adminAboutButton.classList.add('hidden');
        settingsButton.classList.add('hidden');
        consoleButton.classList.add('hidden');
        controlPanelButton.classList.add('hidden');
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
            const controlButton = document.getElementById('controlButton');
            
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

            if(controlButton && controlButton.dataset.bound !== 'true'){
                controlButton.addEventListener('click', () => {
                    currentPage = 'controlPanel';
                    localStorage.currentPage = 'controlPanel';
                    updatePage();
                });
                controlButton.dataset.bound = 'true';
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
                consoleButton &&
                controlButton
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
  let email = document.getElementById('loginEmailInput').value.trim().toLowerCase();
  let password = document.getElementById('loginPasswordInput').value;

  if (!email || !password) {
    alert("⚠️ Please enter both email and password.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
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
    .catch(error => {
      const genericMsg = "Login failed. Please check your email and password.";

      switch (error.code) {
        case 'auth/too-many-requests':
          alert("🚫 Too many failed attempts. Please wait and try again later.");
          break;
        case 'auth/network-request-failed':
          alert("🌐 Network error. Check your connection.");
          break;
        default:
          alert(genericMsg);
      }

      console.error("Sign in error:", error.code, error.message);
    })
}


onAuthStateChanged(auth, async (user) => {
    if(user){
        isAdmin = true;
        admin_id = user.uid;

        const adminRenameButton = document.getElementById('adminName');
        const loginButton = document.getElementById('logInButton');
        const signOutButton = document.getElementById('signOutButton');
        const hideNonAdmin = document.getElementById('hideNonAdmin');

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
        if(hideNonAdmin)
            hideNonAdmin.classList.remove('hidden');

        // Punem numele
        getAdminName(admin_id, (name) => {
            adminRenameButton.innerText = name;
        });
    }else{
        isAdmin = false;
        admin_id = 0;
        const hideNonAdmin = document.getElementById('hideNonAdmin');

        const adminRenameButton = document.getElementById('adminName');
        const loginButton = document.getElementById('logInButton');
        const signOutButton = document.getElementById('signOutButton');

        if(adminRenameButton)
            adminRenameButton.classList.add('hidden')
        if(loginButton)
            loginButton.classList.remove('hidden');
        if(signOutButton)
            signOutButton.classList.add('hidden');
        if(hideNonAdmin)
            hideNonAdmin.classList.add('hidden');
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