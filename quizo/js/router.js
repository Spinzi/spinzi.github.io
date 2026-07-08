import { appState } from "./state/appState.js";

export function parse_route(){
    const params = new URLSearchParams(window.location.search);

    appState.page = params.get("page");
    appState.id = params.get("id");
}