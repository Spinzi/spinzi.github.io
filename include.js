function loadPartial(id, file, isTutorial = false) {
    // Adjust path to file based on location
    const path = isTutorial ? `../${file}` : file;

    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = data;

                // ✅ Adjust all relative links inside the loaded content
                const links = el.querySelectorAll('a[href]');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (
                        href &&
                        !href.startsWith('http') &&
                        !href.startsWith('/') &&
                        !href.startsWith('../')
                    ) {
                        link.setAttribute('href', `../${href}`);
                    }
                });
            }
        })
        .catch(error => {
            console.error(`Error loading ${file}:`, error);
        });
}

window.onload = () => {
    const isTutorial = window.location.pathname.includes('/tutorials/');
    loadPartial(isTutorial ? 'header-placeholder-tut' : 'header-placeholder', 'header.html', isTutorial);
    loadPartial(isTutorial ? 'footer-placeholder-tut' : 'footer-placeholder', 'footer.html', isTutorial);
};
