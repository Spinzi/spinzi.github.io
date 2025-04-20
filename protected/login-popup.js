import { checkLogin } from './auth.js';

function createLoginPopup() {
    if (document.getElementById('loginModal')) return; // already exists
    document.getElementById('protectedContent').style.display = 'none';

  const modal = document.createElement('div');
modal.innerHTML = `
    <style>
        #loginModal {
            position: fixed;
            top: 0; left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0,0,0,0.7);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        #loginBox {
            background: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            font-family: Arial, sans-serif;
        }
        #loginBox input {
            display: block;
            margin: 10px auto;
            padding: 10px;
            width: 80%;
            font-family: Arial, sans-serif;
        }
        #loginBox button {
            padding: 10px 20px;
            font-family: Arial, sans-serif;
        }
        #errorText {
            color: red;
            font-family: Arial, sans-serif;
        }
    </style>
    <div id="loginModal">
        <div id="loginBox">
            <h2>Admin log in</h2>
            <input type="text" id="username" placeholder="Username"/>
            <input type="password" id="password" placeholder="Password"/>
            <button id="loginButton">Login</button>
            <p id="errorText"></p>
        </div>
    </div>
`;
  document.body.appendChild(modal);

  document.getElementById('loginButton').onclick = async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const result = await checkLogin(username, password);
    if (result === true) {
        sessionStorage.setItem('loggedIn', 'true');
        modal.remove();
        document.getElementById('protectedContent').style.display = 'block';
    } else {
    document.getElementById('errorText').innerText = result; // returns the error message
    }
  

  };
}

function enforceLogin() {
  if (sessionStorage.getItem('loggedIn') !== 'true') {
    createLoginPopup();
  }
}

// Logout on Alt+Tab
window.addEventListener('blur', () => {
  sessionStorage.removeItem('loggedIn');
});

window.addEventListener('focus', () => {
  if (sessionStorage.getItem('loggedIn') !== 'true') {
    createLoginPopup();
  }
});

export { enforceLogin };
