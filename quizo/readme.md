# QUIZO

A lightweight, real-time quiz platform inspired by Kahoot — built with vanilla JavaScript, Firebase, and no frameworks. Teachers create quizzes from a dashboard, players join with a 6-character code, and everyone answers timed multiple-choice questions with a live leaderboard at the end.

---

## Features

- **Google Sign-In** for teachers via Firebase Authentication
- **Quiz builder** — multi-question editor with up to 4 answers per question, correct-answer marking, and per-question navigation
- **Shareable join codes** — auto-generated unique 6-character quiz IDs
- **Live quiz-taking flow** — name entry, timed questions with a shrinking/color-shifting timer bar, instant answer reveal (green = correct, gray = incorrect)
- **Results & leaderboard** — final score, correct-answer count, placement, and top-5 leaderboard pulled from Firestore
- **Responsive design** — 2×2 answer grid on desktop, full-height stacked bars on mobile
- **No build step** — plain ES modules loaded directly in the browser

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | Vanilla JavaScript (ES Modules), HTML, CSS |
| Backend    | Firebase Firestore (data), Firebase Auth (Google Sign-In) |
| Hosting    | Static hosting (any host that serves static files) |

No bundler, no framework, no npm build step — everything runs directly via `<script type="module">`.

---

## Project Structure

```
├── index.html
├── assets/
│   └── css/
│       ├── variables.css        # Design tokens (colors, spacing, typography, shadows...)
│       ├── global.css           # Reset + base styles, imported on every page
│       └── pages/
│           ├── home.css
│           ├── dashboard.css
│           ├── createQuiz.css
│           └── quiz.css
└── js/
    ├── app.js                   # Entry point
    ├── renderer.js               # Routes appState.page to the right page renderer
    ├── router.js                  # Parses ?page= and ?id= from the URL
    ├── config/
    │   └── firebase.js            # Firebase project config + SDK initialization
    ├── state/
    │   ├── appState.js            # Global page/routing state + quiz builder state
    │   ├── authState.js           # (reserved for future auth state)
    │   └── quizState.js           # Runtime state while a player is taking a quiz
    ├── helpers/
    │   ├── actions.js             # Global event delegation for [data-action] elements
    │   ├── goto.js                # Client-side "navigation" via query params
    │   ├── loadCSS.js             # Lazy-loads a page's stylesheet once
    │   ├── copyToClipboard.js     # Clipboard helper with fallback
    │   └── randomId.js            # Generates a unique 6-character quiz ID
    └── components/
        └── pages/
            ├── home.js            # Landing page
            ├── dashboard.js       # Teacher dashboard (list/create/delete quizzes)
            ├── createQuiz.js      # Quiz builder
            └── quiz.js            # Join screen → live quiz-taking → results
```

---

## Routing

There's no client-side router library — navigation is done by setting query parameters and doing a full page reload:

```
?page=home
?page=dashboard
?page=createQuiz
?page=quiz&id=ABC123
```

- `js/router.js` reads `page` and `id` from the URL into `appState`.
- `js/renderer.js` calls the matching page renderer based on `appState.page`.
- `js/helpers/goto.js` builds/sets the URL and triggers a reload (`window.location.href = ...`).

Each page renderer is responsible for calling `loadCSS()` to lazy-load its own stylesheet.

---

## Data Model (Firestore)

```
quizzes/{quizId}
  ├─ title: string
  ├─ owner: string (Firebase Auth UID)
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  ├─ questions: [
  │     { id, text, answers: [{ text, correct }, ...], answerTime }
  │   ]
  └─ players/{playerName}
        ├─ status: string           ("taking quiz..." | "Finished.")
        ├─ points: number
        └─ points_log: [
              { answer: string, is_correct: boolean }
            ]

users/{uid}
  ├─ displayName, email, photoURL
  ├─ createdAt: timestamp
  └─ lastLogin: timestamp
```

Quiz IDs are 6-character alphanumeric codes (`js/helpers/randomId.js`), checked for uniqueness against Firestore before being assigned.

---

## Core Flows

### 1. Teacher: Create a Quiz
1. Sign in with Google from the **Dashboard** (`dashboard.js`).
2. Click **Create Quiz** → opens the quiz builder (`createQuiz.js`).
3. Add a title, question text, and 2–4 answers per question; mark the correct one(s).
4. Navigate between questions with **prev / next** (auto-creates a new blank question when moving past the last one).
5. Click **Save** to write the quiz to Firestore under a freshly generated ID.

### 2. Player: Join & Take a Quiz
1. Visit `?page=quiz` (optionally with `&id=CODE` pre-filled) or enter a code on the join screen (`quiz.js`).
2. Enter a display name (must be unique within that quiz's player list, minimum 4 characters).
3. Answer each question before the timer runs out:
   - Selecting a tile immediately reveals correct/incorrect for **all** tiles.
   - If time runs out with no selection, the correct answer is still revealed.
   - Each result is shown for 3 seconds before advancing.
4. On the final question, results are written to Firestore and the **Results** screen shows:
   - Total points, correct-answer count, and current leaderboard placement
   - Top 5 leaderboard entries (ranked by points via a Firestore query with `orderBy`)

---

## Design System

All visual styling is driven by CSS custom properties defined in `assets/css/variables.css` — colors, typography scale, font weights, border radii, spacing scale, shadows, transitions, and layout constants. Page-level stylesheets (`home.css`, `dashboard.css`, `createQuiz.css`, `quiz.css`) consume these tokens rather than hardcoding values, so the whole app can be re-themed by editing one file.

Answer tiles use a fixed 4-color rotation (danger / info / warning / secondary) to mimic the classic red-blue-yellow-green quiz-game look.

---

## Global Actions

Instead of attaching listeners per-render, `js/helpers/actions.js` uses a single delegated `click` listener on `document.body` that reacts to any element with a `data-action` attribute:

- `goto-<page>` — navigate to another page
- `logout` — sign out via Firebase Auth
- `save_q` — persist the quiz being built
- `join_quizz` — join a quiz by code
- `copy-<id>` / `delete-<id>` — dashboard quiz-card actions (delete requires a confirmation click)

The quiz builder (`createQuiz.js`) uses a separate `data-action-local` attribute with its own scoped listeners, since those inputs are re-rendered per question and tied to local closures rather than global routing.

---

## Setup

1. Clone the repository.
2. Firebase config is already wired in `js/config/firebase.js` (Firestore + Auth). Replace the `firebaseConfig` object with your own Firebase project's credentials if deploying elsewhere.
3. In the Firebase console, enable:
   - **Authentication → Google** sign-in provider
   - **Firestore Database** (in production or test mode, with rules restricting quiz edits to their `owner`)
4. Serve the project root with any static file server (no build step required), e.g.:
   ```bash
   npx serve .
   ```
5. Open `index.html` in the browser.

> **Note:** The leaderboard query (`orderBy("points", "desc")` on the `players` subcollection) requires a Firestore index. Firestore will prompt with a direct link to auto-create it the first time the query runs.

---

## Known Limitations / Next Steps

- Leaderboard is fetched once on the results screen — it does not update live if other players finish afterward (would require `onSnapshot`).
- No scoring bonus for answering quickly (all correct answers currently award a flat 1 point).
- No host/presenter view — currently designed for self-paced, asynchronous play rather than a synchronized live game.
- No validation preventing a quiz from being saved with empty questions/answers.
- Firestore security rules are not included in this repo and should be configured before production use.

---

## Credits

Developed by **Spinzi**.# QUIZO

A lightweight, real-time quiz platform inspired by Kahoot — built with vanilla JavaScript, Firebase, and no frameworks. Teachers create quizzes from a dashboard, players join with a 6-character code, and everyone answers timed multiple-choice questions with a live leaderboard at the end.

---

## Features

- **Google Sign-In** for teachers via Firebase Authentication
- **Quiz builder** — multi-question editor with up to 4 answers per question, correct-answer marking, and per-question navigation
- **Shareable join codes** — auto-generated unique 6-character quiz IDs
- **Live quiz-taking flow** — name entry, timed questions with a shrinking/color-shifting timer bar, instant answer reveal (green = correct, gray = incorrect)
- **Results & leaderboard** — final score, correct-answer count, placement, and top-5 leaderboard pulled from Firestore
- **Responsive design** — 2×2 answer grid on desktop, full-height stacked bars on mobile
- **No build step** — plain ES modules loaded directly in the browser

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | Vanilla JavaScript (ES Modules), HTML, CSS |
| Backend    | Firebase Firestore (data), Firebase Auth (Google Sign-In) |
| Hosting    | Static hosting (any host that serves static files) |

No bundler, no framework, no npm build step — everything runs directly via `<script type="module">`.

---

## Project Structure

```
├── index.html
├── assets/
│   └── css/
│       ├── variables.css        # Design tokens (colors, spacing, typography, shadows...)
│       ├── global.css           # Reset + base styles, imported on every page
│       └── pages/
│           ├── home.css
│           ├── dashboard.css
│           ├── createQuiz.css
│           └── quiz.css
└── js/
    ├── app.js                   # Entry point
    ├── renderer.js               # Routes appState.page to the right page renderer
    ├── router.js                  # Parses ?page= and ?id= from the URL
    ├── config/
    │   └── firebase.js            # Firebase project config + SDK initialization
    ├── state/
    │   ├── appState.js            # Global page/routing state + quiz builder state
    │   ├── authState.js           # (reserved for future auth state)
    │   └── quizState.js           # Runtime state while a player is taking a quiz
    ├── helpers/
    │   ├── actions.js             # Global event delegation for [data-action] elements
    │   ├── goto.js                # Client-side "navigation" via query params
    │   ├── loadCSS.js             # Lazy-loads a page's stylesheet once
    │   ├── copyToClipboard.js     # Clipboard helper with fallback
    │   └── randomId.js            # Generates a unique 6-character quiz ID
    └── components/
        └── pages/
            ├── home.js            # Landing page
            ├── dashboard.js       # Teacher dashboard (list/create/delete quizzes)
            ├── createQuiz.js      # Quiz builder
            └── quiz.js            # Join screen → live quiz-taking → results
```

---

## Routing

There's no client-side router library — navigation is done by setting query parameters and doing a full page reload:

```
?page=home
?page=dashboard
?page=createQuiz
?page=quiz&id=ABC123
```

- `js/router.js` reads `page` and `id` from the URL into `appState`.
- `js/renderer.js` calls the matching page renderer based on `appState.page`.
- `js/helpers/goto.js` builds/sets the URL and triggers a reload (`window.location.href = ...`).

Each page renderer is responsible for calling `loadCSS()` to lazy-load its own stylesheet.

---

## Data Model (Firestore)

```
quizzes/{quizId}
  ├─ title: string
  ├─ owner: string (Firebase Auth UID)
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  ├─ questions: [
  │     { id, text, answers: [{ text, correct }, ...], answerTime }
  │   ]
  └─ players/{playerName}
        ├─ status: string           ("taking quiz..." | "Finished.")
        ├─ points: number
        └─ points_log: [
              { answer: string, is_correct: boolean }
            ]

users/{uid}
  ├─ displayName, email, photoURL
  ├─ createdAt: timestamp
  └─ lastLogin: timestamp
```

Quiz IDs are 6-character alphanumeric codes (`js/helpers/randomId.js`), checked for uniqueness against Firestore before being assigned.

---

## Core Flows

### 1. Teacher: Create a Quiz
1. Sign in with Google from the **Dashboard** (`dashboard.js`).
2. Click **Create Quiz** → opens the quiz builder (`createQuiz.js`).
3. Add a title, question text, and 2–4 answers per question; mark the correct one(s).
4. Navigate between questions with **prev / next** (auto-creates a new blank question when moving past the last one).
5. Click **Save** to write the quiz to Firestore under a freshly generated ID.

### 2. Player: Join & Take a Quiz
1. Visit `?page=quiz` (optionally with `&id=CODE` pre-filled) or enter a code on the join screen (`quiz.js`).
2. Enter a display name (must be unique within that quiz's player list, minimum 4 characters).
3. Answer each question before the timer runs out:
   - Selecting a tile immediately reveals correct/incorrect for **all** tiles.
   - If time runs out with no selection, the correct answer is still revealed.
   - Each result is shown for 3 seconds before advancing.
4. On the final question, results are written to Firestore and the **Results** screen shows:
   - Total points, correct-answer count, and current leaderboard placement
   - Top 5 leaderboard entries (ranked by points via a Firestore query with `orderBy`)

---

## Design System

All visual styling is driven by CSS custom properties defined in `assets/css/variables.css` — colors, typography scale, font weights, border radii, spacing scale, shadows, transitions, and layout constants. Page-level stylesheets (`home.css`, `dashboard.css`, `createQuiz.css`, `quiz.css`) consume these tokens rather than hardcoding values, so the whole app can be re-themed by editing one file.

Answer tiles use a fixed 4-color rotation (danger / info / warning / secondary) to mimic the classic red-blue-yellow-green quiz-game look.

---

## Global Actions

Instead of attaching listeners per-render, `js/helpers/actions.js` uses a single delegated `click` listener on `document.body` that reacts to any element with a `data-action` attribute:

- `goto-<page>` — navigate to another page
- `logout` — sign out via Firebase Auth
- `save_q` — persist the quiz being built
- `join_quizz` — join a quiz by code
- `copy-<id>` / `delete-<id>` — dashboard quiz-card actions (delete requires a confirmation click)

The quiz builder (`createQuiz.js`) uses a separate `data-action-local` attribute with its own scoped listeners, since those inputs are re-rendered per question and tied to local closures rather than global routing.

---

## Setup

1. Clone the repository.
2. Firebase config is already wired in `js/config/firebase.js` (Firestore + Auth). Replace the `firebaseConfig` object with your own Firebase project's credentials if deploying elsewhere.
3. In the Firebase console, enable:
   - **Authentication → Google** sign-in provider
   - **Firestore Database** (in production or test mode, with rules restricting quiz edits to their `owner`)
4. Serve the project root with any static file server (no build step required), e.g.:
   ```bash
   npx serve .
   ```
5. Open `index.html` in the browser.

> **Note:** The leaderboard query (`orderBy("points", "desc")` on the `players` subcollection) requires a Firestore index. Firestore will prompt with a direct link to auto-create it the first time the query runs.

---

## Known Limitations / Next Steps

- Leaderboard is fetched once on the results screen — it does not update live if other players finish afterward (would require `onSnapshot`).
- No scoring bonus for answering quickly (all correct answers currently award a flat 1 point).
- No host/presenter view — currently designed for self-paced, asynchronous play rather than a synchronized live game.
- No validation preventing a quiz from being saved with empty questions/answers.
- Firestore security rules are not included in this repo and should be configured before production use.

---

## Credits

Developed by **Spinzi**.