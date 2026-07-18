// helpers/profanityFilter.js

// Keep this list lowercase. Add/remove words as needed.
const BLOCKED_WORDS = [
    // English
    "fuck",
    "fucking",
    "fucker",
    "shit",
    "bullshit",
    "bitch",
    "bitches",
    "ass",
    "asshole",
    "bastard",
    "cunt",
    "dick",
    "cock",
    "penis",
    "vagina",
    "pussy",
    "slut",
    "whore",
    "hoe",
    "motherfucker",
    "mf",
    "nigger",
    "nigga",
    "negro",
    "retard",
    "retarded",
    "fag",
    "faggot",
    "gaylord",
    "cum",
    "semen",
    "porn",
    "porno",
    "rape",
    "rapist",
    "suicide",
    "killyourself",
    "kys",
    "hitler",
    "nazi",

    // Romanian
    "pula",
    "pulii",
    "pulamea",
    "pizda",
    "pizdii",
    "pizdă",
    "muie",
    "coaie",
    "coaie",
    "coiu",
    "coi",
    "cur",
    "curu",
    "curva",
    "curve",
    "futut",
    "futută",
    "fut",
    "fute",
    "futi",
    "fututule",
    "fututilor",
    "fmm",
    "fgm",
    "mortii",
    "morții",
    "mortiimatii",
    "mortiimatii",
    "mata",
    "matii",
    "dracu",
    "dracului",
    "cacat",
    "căcat",
    "cacanar",
    "cacacios",
    "cacatule",
    "prost",
    "prostule",
    "idiot",
    "handicapat",
    "handicapatule",
    "retardat",
    "muist",
    "muista",
    "jegos",
    "jeg",
    "sugi",
    "suge",
    "sugipula",
    "bagamias",
    "bagamiasi",
    "bagpl",
    "bagpula",
];

// Catches basic leetspeak substitutions (e.g. "b4dw0rd") and repeated chars.
function normalize(str){
    return str
        .toLowerCase()
        .normalize("NFKD").replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/7/g, "t")
        .replace(/@/g, "a")
        .replace(/\$/g, "s")
        .replace(/[^a-z0-9]/g, ""); // strip spaces/punctuation
}

export function containsProfanity(name){
    const normalized = normalize(name);

    return BLOCKED_WORDS.some(word => normalized.includes(normalize(word)));
}

export function validatePlayerName(name){
    const trimmed = name.trim();

    if(trimmed.length === 0){
        return { valid: false, reason: "Name can't be empty." };
    }

    if(containsProfanity(trimmed)){
        return { valid: false, reason: "That name isn't allowed. Please choose another." };
    }

    return { valid: true };
}