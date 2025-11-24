async function load_html_elements(){
    const componentElements = document.querySelectorAll("[data-load-from-html]");

    for(const el of componentElements){
        const fileName = el.dataset.loadFromHtml;

        try{
            const response = await fetch(`components/${fileName}`);
            if(!response.ok) throw new Error(`Failed to load ${fileName}`);
            el.innerHTML = await response.text();
        }catch(err){
            throw new Error(err);
        }
    }

};

async function load_translation_elements(){
    const componentElements = document.querySelectorAll("[data-translate-key]");
    var language = localStorage.getItem("language");
    if(language === null){
        localStorage.setItem("language", "ro");
        language = "ro";
    }
    var translations = null;
    const translation_location = `data/lang/${language}.json`;
    try {
        const response = await fetch(translation_location);
        if(!response.ok) throw new Error(`Failed to load ${translation_location}`);
        translations = await response.json(); 
        
    } catch (error) {
        console.error(`Error, translation file not found. ${translation_location}`);
    }
    
    console.log(`Translating elements:\nFound elements to translate: ${JSON.stringify(componentElements, null, 2)}\nTranslation file:\n${JSON.stringify(translations, null, 2)}`);

    for (el of componentElements){
        var translation = translations[el.dataset.translateKey];
        console.log("trans");
        if(translation == null)
            el.innerHTML = el.dataset.translateKey;
        else
            el.innerHTML = translation;
    }

}

async function init_elements() {
    
    // Auth button
    document.getElementById("login-btn").addEventListener("click", () => {
        window.location.href = "auth.html";
    })
}

document.addEventListener("DOMContentLoaded", async()=>{
    __init();
    await load_html_elements();
    await load_translation_elements();
    await init_elements();
});