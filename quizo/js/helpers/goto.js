export function goto(params){
    const url = new URL(window.location);

    url.search = "";

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    window.location.href = url.toString();
}