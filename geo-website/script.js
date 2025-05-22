const swiper = new Swiper('.swiper1', {
  direction: 'horizontal',
  loop: true,
  slidesPerView: 'auto', // allows multiple slides visible at once
  speed: 10000, // total time to move from one slide to next
  spaceBetween: 20,
  freeMode: true, // allows continuous scroll
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
  },
  freeModeMomentum: false, // disables easing momentum
  pagination: {
    el: '.swiper-pagination',
    clickable: false,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

const secSwiper = new Swiper('.secSwiper', {
  loop: true,
  slidesPerView: 1.5,                // shows 1 full + half of next
  centeredSlides: true,             // active slide is centered
  spaceBetween: -40,               // overlaps slides!
  speed: 500,

  navigation: {
    nextEl: '.secSwiper-next',
    prevEl: '.secSwiper-prev',
  },

  pagination: {
    el: '.secSwiper-pagination',
    clickable: true,
  },

  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },

  effect: 'slide',
});




window.addEventListener('load', () => {
  const loader = document.getElementById('site-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
});

function load_element(el_id, fileLocation) {
  return fetch(fileLocation)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      const element = document.getElementById(el_id);
      if (element) {
        element.innerHTML = html;
      } else {
        alert(`Element with ID "${el_id}" not found.`);
      }
    })
    .catch(error => {
      console.error("Failed to load HTML:", error);
      alert("Nu am putut incarca o parte din site.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const h = document.getElementById('pg_header');
    const f = document.getElementById('pg_footer');
    if (h) {
    load_element(h.id, 'page-content/pg/header.html').then(() => {
        const toggleBtn = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu-list');

        if (toggleBtn && mobileMenu) {
        toggleBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('visible');
            mobileMenu.classList.toggle('hidden');
        });
        } else {
        console.warn('Mobile menu elements not found');
        }
    });
    }

    if(f){
    load_element(f.id, 'page-content/pg/footer.html')
    }

    create_centered('mySection', 'Ce urmeaza')
});

function contactPopUp() {
  if (document.getElementById('popup-contact')) return;

  const overlay = document.createElement('div');
  overlay.id = 'popup-contact';
  overlay.className = 'popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'popup-container';

  const header = document.createElement('div');
  header.className = 'popup-header';

  const title = document.createElement('h2');
  title.textContent = 'Contact';

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'popup-close';
  closeBtn.onclick = () => overlay.remove();

  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = document.createElement('div');
  content.className = 'popup-content';
  content.innerHTML = `
  <p><strong>Email:</strong> <a href="mailto:alinnicusorgisca@gmail.com">alinnicusorgisca@gmail.com</a></p>
  <p><strong>GitHub:</strong> <a href="https://github.com/Spinzi" target="_blank" rel="noopener noreferrer">Spinzi</a></p>
`;


  popup.appendChild(header);
  popup.appendChild(content);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}
let fact = 0;
function showMoreFacts() {
    if(fact === 0){
      fact=1;
      document.querySelectorAll('.extra-fact').forEach(card => {
          card.classList.remove('hide_on_phone');
      });
  
      // Ascunde butonul "..."
      document.getElementById('showMoreTrigger').innerHTML = 'Ascunde';
    }else{
      fact=0;
      document.querySelectorAll('.extra-fact').forEach(card => {
        card.classList.add('hide_on_phone');
      });
      document.getElementById('showMoreTrigger').innerHTML = "Afiseaza mai multe";
    }
}

function create_centered(id, text_) {
  const holder = document.getElementById(id);

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.className = 'centerWrapper';

  // Create left line
  const leftLine = document.createElement('div');
  leftLine.className = 'thinLine';

  // Create centered text
  const textElement = document.createElement('h3');
  textElement.className = 'textInCenter';
  textElement.innerText = text_;

  // Create right line
  const rightLine = document.createElement('div');
  rightLine.className = 'thinLine';

  // Append all to wrapper
  wrapper.appendChild(leftLine);
  wrapper.appendChild(textElement);
  wrapper.appendChild(rightLine);

  // Append wrapper to main holder
  holder.appendChild(wrapper);
}

function showPopup() {
  document.getElementById('unfinished-popup').classList.add('show');
}

function closePopup() {
  document.getElementById('unfinished-popup').classList.remove('show');
}

function createSpinziPopup() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.6)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "24px 32px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
    box.style.maxWidth = "400px";
    box.style.textAlign = "center";
    box.style.fontFamily = "sans-serif";
    box.style.animation = "fadeIn 0.3s ease";

    const title = document.createElement("h2");
    title.textContent = "Cine e Spinzi?";
    title.style.color = "#222";

    const message = document.createElement("p");
    message.innerHTML = "Spinzi este doar un acronim.<br>Numele meu real este <strong>Gisca Alin Nicusor</strong>.";
    message.style.color = "#444";
    message.style.marginTop = "12px";
    message.style.marginBottom = "20px";

    const button = document.createElement("button");
    button.textContent = "Am înțeles";
    button.style.padding = "10px 18px";
    button.style.background = "#007777";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.fontWeight = "bold";
    button.style.cursor = "pointer";
    button.style.transition = "background-color 0.2s ease";

    button.addEventListener("mouseover", () => {
        button.style.background = "#00aaaa";
    });

    button.addEventListener("mouseout", () => {
        button.style.background = "#007777";
    });

    button.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    // Asamblare
    box.appendChild(title);
    box.appendChild(message);
    box.appendChild(button);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}