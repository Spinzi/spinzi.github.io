
//Function for loading the header and footer elements into the html - can be used for loading any part with the file location and el to be replaced id
function load_el(id, file, callback){
    let d = document.getElementById(id);
    if (!d) {
        console.error(`No element with id "${id}" found.`);
        return;
    }

    fetch(file)
    .then(response =>{
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        d.innerHTML = html;
        console.log(`Loaded content for ${id}:`, html);  // <- Add this
        if (typeof callback === "function") callback();
    })
    .catch(error =>{
        console.error(error);
    });
}

//General loading part section
document.addEventListener("DOMContentLoaded", ()=>{
    console.log("Script loading");
    load_el("OHheader", "pages/head_foot/header.html", ()=>{
        const OHhd = document.getElementById('swMenu');
        const OHhd_tg = document.getElementById('sandwich');

        if (!OHhd || !OHhd_tg) {
            console.log("Operation Sandwich not working, elements not found.");
            return;
        }

        OHhd.addEventListener('click', () => {
            OHhd_tg.classList.toggle('active');
            console.log("Sandwich modified");
        });
    });
    load_el("OHfooter", "pages/head_foot/footer.html");
});

//mini game

const cards = document.querySelectorAll('.card');
const targets = document.querySelectorAll('.target');
let draggedCard = null;

// Ensure cards are draggable
cards.forEach(card => {
  card.setAttribute('draggable', true);

  card.addEventListener('dragstart', () => {
    draggedCard = card;
    card.classList.add('dragging');
  });

  card.addEventListener('dragend', () => {
    draggedCard = null;
    card.classList.remove('dragging');
  });
});

targets.forEach(target => {
  target.addEventListener('dragover', e => {
    e.preventDefault();
  });

  target.addEventListener('drop', e => {
    e.preventDefault();
    if (!draggedCard) return;

    const existingCard = target.querySelector('.card');
    if (existingCard) {
      document.getElementById('cards').appendChild(existingCard);
    }

    target.appendChild(draggedCard);
  });
});

document.getElementById('check').addEventListener('click', () => {
  let score = 0;

  targets.forEach(target => {
    const card = target.querySelector('.card');
    const tratat = card?.getAttribute('data-tratat');
    const an = target.getAttribute('data-ani');

    // Reset target background before evaluation
    target.style.backgroundColor = '';

    if (
      (tratat === 'Schuman' && an === '1950') ||
      (tratat === 'Roma' && an === '1957') ||
      (tratat === 'Maastricht' && an === '1992')
    ) {
      score++;
      target.style.backgroundColor = '#a2f5a2'; // verde
    } else {
      if (card) target.style.backgroundColor = '#f5a2a2'; // roșu doar dacă era o carte
    }
  });

  document.getElementById('result').textContent = `Ai potrivit corect ${score} din 3 tratate.`;
});

target.addEventListener('dragenter', () => {
  target.classList.add('highlight');
});
target.addEventListener('dragleave', () => {
  target.classList.remove('highlight');
});

