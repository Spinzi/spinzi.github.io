let quiz_questions = [];
let current_index = 0;
let quiz_length = 0;

function gen_quiz_header(obj) {
    const top_header = document.createElement('div');
    top_header.className = 'quiz_h';

    const top_header_name = document.createElement('h3');
    const top_header_score = document.createElement('span');
    const top_header_lineBreak = document.createElement('hr');

    const top_header_spacer = document.createElement('div');
    top_header_spacer.className = 'quiz_h_spacer';

    const head_and_score = document.createElement('div');
    head_and_score.className = 'quiz_h_headAndScore';
    top_header_name.className = 'quiz_h_name';
    top_header_score.className = 'quiz_h_score';
    top_header_score.id = 'quiz_score';

    top_header_name.textContent = 'Quiz';
    top_header_score.textContent = 0;

    head_and_score.appendChild(top_header_name);
    head_and_score.appendChild(top_header_spacer);
    head_and_score.appendChild(top_header_score);

    top_header.appendChild(head_and_score);
    top_header.appendChild(top_header_lineBreak);

    obj.appendChild(top_header);
}

function load_quiz(){
    console.log('Loading quiz');
    const holder = document.getElementById('quiz_placeholder');
    const el = document.createElement('div');
    
    gen_quiz_header(el);

    fetch('quiz.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        quiz_questions = data;
        quiz_length = quiz_questions.length;
        console.log(quiz_questions);

        const quiz_hld = document.createElement('div');
        quiz_hld.id = 'quiz_container';

        generate_quiz(quiz_hld, quiz_questions[current_index], current_index);

        el.appendChild(quiz_hld);
    })
    .catch(error => {
        console.error('Could not fetch or parse the JSON:', error);
    });

    holder.appendChild(el);
}

function generate_quiz(container, questionData, index) {
    container.innerHTML = ""; // Clear previous content

    const quiz_wrapper = document.createElement('div');
    quiz_wrapper.className = 'quiz_wrapper';

    const answerGroup = document.createElement('div');
    answerGroup.className = 'quiz_answers';

    function updateScoreDisplay(scoreElement) {
        const score = parseInt(scoreElement.textContent, 10);
        scoreElement.style.color = score > 0 ? 'green' : score < 0 ? 'red' : 'gray';
    }

    function createQuestionInfo() {
        const quiz_title = document.createElement('h4');
        quiz_title.textContent = `${index + 1} / ${quiz_length}. ${questionData.question}`;
        quiz_wrapper.appendChild(quiz_title);

        answerGroup.innerHTML = ''; // Clear previous answers if restarting

        for (const [key, text] of Object.entries(questionData.answers)) {
            const label = document.createElement('label');
            label.textContent = text;

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question_${index}`;
            radio.value = key;

            label.prepend(radio);
            answerGroup.appendChild(label);
        }
    }

    function showFinalMessage(finalScore) {
        let message = '';
        if (finalScore < 0) {
            message = 'Spaima doctorilor!';
        } else if (finalScore > quiz_questions.length - 3) {
            message = 'Bun de doctor! Felicitări!';
        } else if (finalScore > 0) {
            message = 'Nu deveni doctor... dar ai încercat!';
        } else {
            message = 'Poate data viitoare vei face mai bine!';
        }

        container.innerHTML = '';
        const messageElement = document.createElement('div');
        messageElement.className = 'quiz_end_message';
        messageElement.textContent = `Scor final: ${finalScore} - ${message}`;
        container.appendChild(messageElement);
    }

    // Render the initial question
    createQuestionInfo();

    const submit_quiz = document.createElement('button');
    submit_quiz.textContent = 'Trimite';

    const restart_quiz = document.createElement('button');
    restart_quiz.textContent = 'Restart';
    
    restart_quiz.onclick = () => {
        const sc = document.getElementById('quiz_score');
        sc.textContent = '0';
        updateScoreDisplay(sc);
        current_index = 0;
        generate_quiz(container, quiz_questions[current_index], current_index);
    };

    submit_quiz.onclick = () => {
        const selected = document.querySelector(`input[name="question_${index}"]:checked`);
        if (!selected) {
            alert("Selectează un răspuns!");
            return;
        }

        const sc = document.getElementById('quiz_score');
        let score = parseInt(sc.textContent, 10) || 0;

        if (selected.value === questionData.correct) {
            score++;
            popUp(true);
        } else {
            score--;
            popUp(false);
        }

        sc.textContent = score.toString();
        updateScoreDisplay(sc);
        submit_quiz.disabled = true;

        setTimeout(() => {
            current_index++;
            if (current_index < quiz_questions.length) {
                generate_quiz(container, quiz_questions[current_index], current_index);
            } else {
                showFinalMessage(score);
            }
        }, 1500);
    };

    quiz_wrapper.appendChild(answerGroup);
    quiz_wrapper.appendChild(submit_quiz);
    quiz_wrapper.appendChild(restart_quiz);
    container.appendChild(quiz_wrapper);
}


function popUp(value) {
    const body = document.body;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-aos', 'fade-up'); // AOS animates the wrapper
    wrapper.style.position = 'fixed';
    wrapper.style.top = '50%';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translate(-50%, -50%)';
    wrapper.style.zIndex = '1000';

    const pop_up_el = document.createElement('div');
    pop_up_el.className = value ? 'pop_up_correct' : 'pop_up_incorrect';

    const pop_up_img = document.createElement('img');
    pop_up_img.src = value
        ? 'https://www.shutterstock.com/image-vector/emoticon-showing-thumbs-260nw-447757687.jpg'
        : 'https://thumbs.dreamstime.com/b/no-emoticon-29087585.jpg';
    pop_up_img.className = 'pop_up_img';

    pop_up_el.appendChild(pop_up_img);
    wrapper.appendChild(pop_up_el);
    body.appendChild(wrapper);

    setTimeout(() => {
        pop_up_el.classList.add('fade_out');
        setTimeout(() => {
            body.removeChild(wrapper);
        }, 500);
    }, 1000);
}

function poor_dev(){
    const el = document.body;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-aos', 'fade-up'); // AOS animates the wrapper
    wrapper.style.position = 'fixed';
    wrapper.style.top = '50%';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translate(-50%, -50%)';
    wrapper.style.zIndex = '1000';
    const pop_up_el = document.createElement('div');
    pop_up_el.className = 'poor_dev';
    const pop_up_img = document.createElement('img');
    pop_up_img.src = 'https://wandel.ca/homepage/basement.jpg';
    const pop_up_text=document.createElement('p');
    pop_up_text.textContent='Fonduri insuficiente💸💸💸';
    pop_up_text.style.position = 'fixed';
    pop_up_text.style.top = '50%';
    pop_up_text.style.left = '50%';
    pop_up_text.style.transform = 'translate(-50%, -50%)';
    pop_up_text.style.background = 'white';
    pop_up_el.appendChild(pop_up_img);
    pop_up_el.appendChild(pop_up_text);
    wrapper.appendChild(pop_up_el);
    el.appendChild(wrapper);

    setTimeout(() => {
        pop_up_el.classList.add('fade_out');
        setTimeout(() => {
            el.removeChild(wrapper);
        }, 500);
    }, 1000);
}

function create_pop_up(json_file) {
    fetch(json_file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const j_info = data;

            const body_ = document.body;
            const holder = document.createElement('div');
            holder.setAttribute('data-aos', 'fade-in');
            holder.className = '_pop_up_holder';

            const heading = document.createElement('div');
            heading.className = '_pop_up_heading';

            const exit_button = document.createElement('img');
            exit_button.src = 'exit.png';
            exit_button.alt = 'Close';
            exit_button.onclick = () => {
                holder.classList.add('fade');
                setTimeout(() => {
                    body_.removeChild(holder);
                }, 500); // only wait for the CSS transition
            };

            const bar_title = document.createElement('h4');
            bar_title.textContent = j_info.title;

            heading.appendChild(bar_title);
            heading.appendChild(exit_button);
            holder.appendChild(heading);

            const el = document.createElement('div');
            el.className = '_pop_up_content';

            j_info.list.forEach(item => {
                for (const key in item) {
                    if (key === "heading") {
                        const h = document.createElement('h4');
                        h.textContent = item[key];
                        el.appendChild(h);
                    } else if (key === "paragraph") {
                        const p = document.createElement('p');
                        p.textContent = item[key];
                        el.appendChild(p);
                    } else if (key === "lineBreak") {
                        const hr = document.createElement('hr');
                        el.appendChild(hr);
                    } else {
                        console.warn(`Unknown key "${key}" encountered in list item.`);
                    }
                }
            });

            holder.appendChild(el);
            body_.appendChild(holder);
        })
        .catch(error => {
            console.error('Could not fetch or parse the JSON:', error);
            alert('Ceva nu a functionat');
        });
}

function loadHTML(id, file) {
    return fetch(file)
        .then(response => {
            if (!response.ok) {
                alert(`Could not load ${file}`);
                throw new Error(`Could not load ${file}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById(id).innerHTML = html;
        })
        .catch(error => console.error(error));
}

window.addEventListener("DOMContentLoaded", () => {
    // Load header first, then refresh AOS
    loadHTML("header_placeholder", "header_footer/header.html")
        .then(() => {
            AOS.init();  // Only now it's safe
        });

    // Load footer (doesn't need AOS)
    loadHTML("footer_placeholder", "header_footer/footer.html");
});
