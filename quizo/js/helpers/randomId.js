import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { db } from "../config/firebase.js";

const CHARS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ID_LENGTH = 6;

function randomQuizId() {
    let id = "";

    for (let i = 0; i < ID_LENGTH; i++) {
        id += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    return id;
}

export async function generateQuizId() {
    while (true) {
        const id = randomQuizId();

        const docRef = doc(db, "quizzes", id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return id;
        }
    }
}