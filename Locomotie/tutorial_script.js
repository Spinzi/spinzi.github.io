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
    loadLessons();
});

async function loadLessons() {
  try {
    const response = await fetch('lessons/index.json');
    const lessonFiles = await response.json();

    const container = document.getElementById('lessons-tab');
    container.innerHTML = ''; // Clear previous content

    for (let file of lessonFiles) {
      try {
        const res = await fetch(`lessons/${file}`);
        const lesson = await res.json();

        const card = document.createElement('div');
        card.className = 'lesson-card';

        // Construct card content
        card.innerHTML = `
          <div class="section_locomotie" data-aos="fade-up" data-aos-delay="300" style="border-radius:1rem;">
            <h3>${lesson.titlu}</h3>
            <p>${lesson.descriere}</p>
            <button class="view-lesson-btn">Vezi lecția</button>
          </div>
        `;

        // Attach event handler to the button
        const button = card.querySelector('.view-lesson-btn');
        button.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent click bubbling if needed
          viewLesson(file);    // You’ll implement this function
        });

        // Optional: make entire card clickable (if desired)
        card.querySelector('.section_locomotie').addEventListener('click', () => {
          viewLesson(file);
        });

        container.appendChild(card);
        AOS.init();
      } catch (err) {
        console.error(`Failed to load ${file}:`, err);
        alert('Ceva nu a mers bine cu lecția: ' + file);
      }
    }
  } catch (err) {
    console.error('Failed to load lesson index:', err);
    alert('Nu s-a putut încărca index.json');
  }
}

async function viewLesson(filename) {
  try {
    const res = await fetch(`lessons/${filename}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lesson = await res.json();

    const modal = document.getElementById('lesson-viewer-modal');
    const viewer = document.getElementById('lesson-viewer');

    if (!viewer || !modal) {
      console.error('Viewer modal not found.');
      alert('Eroare: vizualizatorul lecției nu există.');
      return;
    }

    viewer.innerHTML = ''; // Clear previous

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-btn';
    closeBtn.onclick = () => (modal.style.display = 'none');
    viewer.appendChild(closeBtn);

    // Lesson title + description
    const titleEl = document.createElement('h2');
    titleEl.textContent = lesson.titlu;
    viewer.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.textContent = lesson.descriere;
    descEl.style.fontStyle = 'italic';
    viewer.appendChild(descEl);

    // Sections
    if (Array.isArray(lesson.sections)) {
      lesson.sections.forEach(section => {
        const container = document.createElement('div');
        container.className = 'lesson-section';
        container.style.margin = '1rem 0';

        switch (section.type) {
          case 'Titlu':
            container.innerHTML = `<h3>${section.content}</h3>`;
            break;
          case 'Text':
            container.innerHTML = `<p>${section.content}</p>`;
            break;
          case 'Imagine':
            const img = document.createElement('img');
            img.src = section.content;
            img.alt = 'Imagine';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '1rem';
            img.style.margin = 'auto';
            img.style.display = 'block';
            container.appendChild(img);
            break;
          case 'Sfarsit de linie':
            container.innerHTML = `<hr>`;
            break;
          default:
            console.warn(`Unknown section type: ${section.type}`);
        }

        viewer.appendChild(container);
      });
    } else {
      viewer.appendChild(document.createElement('p')).textContent = '(Fără secțiuni disponibile)';
    }

    modal.style.display = 'flex'; // Show modal
  } catch (err) {
    console.error(`Failed to view lesson ${filename}:`, err);
    alert('Ceva nu a mers bine la încărcarea lecției.');
  }
}