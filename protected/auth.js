import { database } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

async function checkLogin(username, password) {
    const userRef = ref(database, username);
    const snapshot = await get(userRef);
  
    if (!snapshot.exists()) {
      return 'User does not exist';
    }
  
    const storedPassword = snapshot.val();
  
    if (storedPassword !== password) {
      return 'Wrong password';
    }
  
    return true;
  }
  
  

export { checkLogin };
