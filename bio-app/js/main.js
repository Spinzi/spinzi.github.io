
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
    try {
        const response = await fetch(`data/lang/${language}.json`);
        if(!response.ok) throw new Error(`Failed to load ${fileName}`);
        translations = await response.json(); 

    } catch (error) {
        console.error("Error, translation file not found...");
    }

    for (el of componentElements){
        var translation = translations[el.dataset.translateKey];
        if(translation == null)
            el.innerHTML = el.dataset.translateKey;
        else
            el.innerHTML = translation
    }

}

document.addEventListener("DOMContentLoaded", async()=>{

    load_html_elements();

});