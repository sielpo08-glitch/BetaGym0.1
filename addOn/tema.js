

function setTema() {
    const temaEl = document.getElementById("tema");
    if (!temaEl) return; // Se l'elemento non esiste, esco dalla funzione

    const tema = temaEl.value; 

    // rimozione di eventuali classi tema precedenti
    document.body.classList.remove("white-theme", "dark-theme");

    if (tema === "chiaro") {
        document.body.classList.add("white-theme");
    } else if (tema === "scuro") {
        document.body.classList.add("dark-theme");
    }

    const logos = document.querySelectorAll('.logo');
    const isPageFolder = window.location.pathname.includes('/page/');
    const imgPrefix = isPageFolder ? '../img/' : 'img/';

    logos.forEach((logo) => {
        const src = tema === 'chiaro' ? `${imgPrefix}logo2.png` : `${imgPrefix}logo.png`;
        if (logo.getAttribute('src') !== src) {
            logo.setAttribute('src', src);
        }
    });

    // salvo preferenza utente
    try {
        localStorage.setItem('preferredTheme', tema);
    } catch (e) {
        // localStorage potrebbe non essere disponibile; ignoro l'errore
    }
}

function normalizeNavPath(path) {
    if (!path) return '/';

    const cleanPath = path.split('?')[0].split('#')[0].replace(/\\/g, '/');
    if (cleanPath.endsWith('/')) return cleanPath;
    return cleanPath.replace(/\/index\.html$/i, '/');
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.navbar a[href]');
    if (!navLinks.length) return;

    const currentPath = normalizeNavPath(window.location.pathname);

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const resolvedPath = normalizeNavPath(new URL(href, window.location.href).pathname);
        const isActive = resolvedPath === currentPath;

        link.classList.toggle('nav-link--active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const temaEl = document.getElementById('tema');
    if (!temaEl) return;

    // Se l'utente ha una preferenza salvata, applicala e imposta il valore della select
    try {
        const saved = localStorage.getItem('preferredTheme');
        if (saved) {
            temaEl.value = saved;
        }
    } catch (e) {
        // ignore
    }

    setTema();
    setActiveNavLink();
    temaEl.addEventListener('change', setTema);  // Aggiorno il tema quando l'utente cambia la selezione
});