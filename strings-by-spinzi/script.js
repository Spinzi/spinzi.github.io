async function apply_copy(button_element){
    if (!(button_element instanceof HTMLButtonElement)){
        throw new TypeError("Expected a button element!");
    }

    button_element.addEventListener("click", ()=>{
        const codeBlock = button_element.nextElementSibling;
        if(codeBlock){
            navigator.clipboard.writeText(codeBlock.textContent || "");
            button_element.textContent = "Copied!";
            setTimeout(()=>{
                button_element.textContent = "Copy";
            }, 1000);
        }
    });
}

async function init_copy_buttons() {
    let buttons = document.querySelectorAll("[id^='copy']");
    buttons.forEach(element => {
        apply_copy(element);
    });
}

async function initialize_data(){
    let holder = document.getElementById("burgerLover");

    fetch("data.json").then((response)=>{
        if(response.ok){
            return response.json();
        }
        throw new Error("Something went wrong fetching the data.");
    })
    .then((response) => {

        response.forEach( (element) => {

            const div = document.createElement('div');
            div.classList.add("container");

            for( const key in element){
                const value = element[key];

                if (key.startsWith("h2")) {
                    div.innerHTML += `<h2>${value}</h2>`;
                } else if (key.startsWith("h3")) {
                    div.innerHTML += `<h3>${value}</h3>`;
                } else if (key.startsWith("p")) {
                    div.innerHTML += `<p>${value}</p>`;
                } else if (key === "code") {
                    div.innerHTML += `<div class="code"><button class="copy">Copy</button><pre><code>${value}</code></pre></div>`;
                } else if (key === "syntax") {
                    div.innerHTML += `<div class="syntax">${value}</div>`;
                } else if (key === "hr") {
                    div.innerHTML += `<hr>`;
                }
                
            }

            holder.appendChild(div);

        } );

    })
    .catch((error)=>{
        console.error(error);
    });
}

document.addEventListener("DOMContentLoaded", async ()=>{
    await initialize_data();
    init_copy_buttons();
});