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

