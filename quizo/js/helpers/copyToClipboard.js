export async function copyToClipboard(text) {
    try {
        // Modern browsers
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length); // Mobile support

        const success = document.execCommand("copy");
        textarea.remove();

        return success;
    }
}