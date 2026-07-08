import { goto } from "./goto.js";
import { auth, db } from "../config/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { saveQuizz } from "../components/pages/createQuiz.js";
import { copyToClipboard } from "./copyToClipboard.js";

import { deleteDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export async function initActions(){
    document.body.addEventListener("click", async (event) => {
        const trigger = event.target.closest("[data-action]");

        if(!trigger) return;

        const action = trigger.dataset.action;
        //now use the action 

        if(action.startsWith("goto-")){
            const target = action.slice(5);
            goto({page: target});
        }

        if(action.startsWith("delete-")){
            const target = action.slice(7);
            if(trigger.dataset.double_check !== "true"){
                trigger.innerText = "Are you sure?";
                trigger.dataset.double_check = true;
                return;
            }

            const pth = doc(db, "quizzes", target);
            await deleteDoc(pth);
            console.log(`#quizz_holder_${target}`);
            console.log(document.querySelector(`#quizz_holder_${target}`));
            document.querySelector(`#quizz_holder_${target}`).remove();

            return;
        }

        if(action.startsWith("copy-")){
            const target = action.slice(5);
            if(copyToClipboard(target)){
                trigger.dataset.copied = true;
                trigger.innerText = "Copied";
            }else{
                trigger.innerText = "Failed to copy";
            }
            return;
        }

        switch(action){
            case "logout":
                await signOut(auth);
                console.log("Signed out");
                break;
            
            case "save_q":
                saveQuizz();
                break;
            
            case "join_quizz":

                const code = document.getElementById("quizzCode").value;
                goto({
                    page: "quiz",
                    id: code
                });

                break;

            default:
                console.warn(`Unknown action "${action}"`);
        }
        
    })
}