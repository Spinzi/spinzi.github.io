export function loadCSS(path) {

    // Don't load the same stylesheet twice
    if (document.querySelector(`link[href="${path}"]`)) {
        return;
    }

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = path;

    document.head.appendChild(link);
}