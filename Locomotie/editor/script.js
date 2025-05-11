class SectionBuilder{
    constructor(type='Text', content=''){
        this.type = type;
        this.content = content;
    }
}

const body = document.body;
const title = new SectionBuilder();
const description = new SectionBuilder();
const sections = [];

const refreshBtn = document.getElementById('header_button_1');
const downloadBtn = document.getElementById('header_button_2');
const uploadBtn = document.getElementById('header_button_3');
const aboutBtn = document.getElementById('header_button_4');

uploadBtn.addEventListener('click', function(){
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.addEventListener('change', function(){
        const file = input.files[0];
        if(!file){
            showPopup('Eroare fisier', 'Fisierul nu a putut fi citit sau nu a fost inserat');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e){
            try {
                const data = JSON.parse(e.target.result);
                
                if (typeof data.titlu !== 'string' || typeof data.descriere !== 'string' || !Array.isArray(data.sections)) {
                    showPopup("Eroare", "Structura fișierului JSON nu este validă.");
                    return;
                }
                
                init();
                title.content = data.titlu;
                description.content = data.descriere;
                
                sections.length=0;
                data.sections.forEach((elemet) => {
                    sections.push(new SectionBuilder(elemet.type, elemet.content));
                });
                update_editor();
                alr_('Mesaj important', 'Functia de upload nu este inca perfectionata si exista doua probleme identificate la momentul de fata - imaginile nu se randeaza perfect, dar se poate repara daca scrieti un caracter si stergeti imediat dupa, iar prima sectiune este una extra, goala, care poate fi searsa rapid.');
            } catch (error) {
                console.log(error);
                showPopup('Eroare', error);
            }
        };
        reader.readAsText(file);
    });
    input.click();
    
});

aboutBtn.addEventListener('click', function(){
    showPopup('Lipsa', 'Momentan nu am creat inca aceasta functie, inca lucrez la ea');
});

downloadBtn.addEventListener('click', function(){
    console.log('Starting download...');
    const titlu = title.content;
    const descriere = description.content;
    const document_holder = {
        titlu,
        descriere,
        sections: sections.map(s => ({type: s.type, content: s.content}))
    }
    const blob = new Blob([JSON.stringify(document_holder, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${titlu.replace(/\s+/g, "_").toLowerCase() || 'lectie'}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
});

function showPopup(title, description) {
    // Create popup container
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.right = '20px';
    popup.style.padding = '16px';
    popup.style.backgroundColor = '#333';
    popup.style.color = '#fff';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = '1000';
    popup.style.fontFamily = 'sans-serif';
    popup.style.minWidth = '200px';
    popup.style.opacity = '1';
    popup.style.transition = 'opacity 0.5s ease';
  
    // Add content
    popup.innerHTML = `<strong style="display:block; margin-bottom:4px;">${title}</strong>${description}`;
  
    // Append to body
    document.body.appendChild(popup);
  
    // Trigger fade out after 2.5s, remove after 3s
    setTimeout(() => {
      popup.style.opacity = '0';
    }, 2500);
  
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }
  

refreshBtn.addEventListener('click', function () {
    const img = refreshBtn.querySelector('img');
    rotate(img, -360);
    title.content='';
    description.content='';
    sections.length='';
    update_editor();
    init();
});

function rotate(obj, deg) {
    const currentDeg = parseInt(obj.style.getPropertyValue('--rot') || "0", 10);
    const newDeg = currentDeg + deg;
    obj.style.setProperty('--rot', `${newDeg}deg`);
}

document.addEventListener('DOMContentLoaded', function(){
    init();
});

function init(){

    const editor_main_holder = document.getElementById('editor');
    editor.innerHTML = '';

    const main_div = document.createElement('div');
    main_div.id = 'main_div';
    main_div.className = 'main_div';

    //so we need title, description and then all of the other things, putiin like
    /*
    {
        title,
            title text,
        description,
            description text,
    }
    {   
        {
            {
                Section ${Number} ; addbutton ; remove button
            },
            {
                Section type selector
                -
                section container
            }
        }
    }
    */

    const title_holder = create_box();
    const title_name = document.createElement('h3'); title_name.textContent = 'Titlu';
    const title_text = create_text_box('Introdu titlul...', title, 'content');
    title_text.id = 'title_text';
    title_holder.appendChild(title_name); title_holder.appendChild(title_text);
    const title_dname = document.createElement('h3'); title_dname.textContent = 'Descriere';
    const title_dtext = create_text_box('Intrudu descrierea...', description, 'content');
    title_dtext.id = 'description_text';
    title_holder.appendChild(customhr());
    title_holder.appendChild(title_dname); title_holder.appendChild(title_dtext);

    const section_holder = document.createElement('div');
    section_holder.id = 'section_holder';

    main_div.appendChild(title_holder);
    main_div.appendChild(section_holder);
    create_section(section_holder);

    editor_main_holder.appendChild(main_div);
}

function create_section(_section_holder, index = sections.length){
    let section;
    let isNew = false;

    if (index >= sections.length) {
        section = new SectionBuilder();
        sections.splice(index, 0, section);
        isNew = true;
    } else {
        section = sections[index];
    }

    const section_div = document.createElement('div');
    section_div.className = 'section';
    section_div.id = 'childSection_';
    section_div.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'section_header_class'
    header.innerHTML = `
    <h4>Sectiunea ${index + 1}</h4>
    `;

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Adauga sub';
    addBtn.onclick = () => {
        const currentIndex = Array.from(_section_holder.children).indexOf(section_div);
        create_section(_section_holder, currentIndex+1);
    }

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Sterge';
    removeBtn.onclick = () => {
        sections.splice(index, 1);
        _section_holder.removeChild(section_div);
        reindex_sections(_section_holder);
    };

    const sectionType = document.createElement('select');
    ['Titlu', 'Text', 'Imagine', 'Sfarsit de linie'].forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        sectionType.appendChild(opt);
    })

    sectionType.value = section.type;
    sectionType.onchange = () => {
        section.type = sectionType.value;
        section_creator();
    }

    const section_content_holder = document.createElement('div');

    function section_creator(){
        section_content_holder.innerHTML = '';
        const val = sectionType.value;
        if(val === 'Titlu' || val === 'Text'){
            section_content_holder.appendChild(create_text_box(`Introdu ${val}...`, section, 'content'));
        }else if(val === 'Imagine'){
            const var_ = create_text_box(`Introdu ${val}...`, section, 'content');
            const img_ = document.createElement('img');
            img_.style.display = 'none';
            var_.addEventListener('input', function() {
                img_.style.display = 'block';
                img_.style.margin = 'auto';
                img_.style.width = '10rem';
                img_.style.borderRadius = '1rem';
                img_.style.border = '0.2rem solid blue'; // Adjusted to look more reasonable
                img_.src = var_.value.trim();
            });
            
            section_content_holder.appendChild(var_);
            section_content_holder.appendChild(img_);
        }else{
            section_content_holder.appendChild(document.createElement('hr'));
        }
    }
    section_creator();

    header.appendChild(addBtn);
    header.appendChild(removeBtn);

    section_div.appendChild(header);
    section_div.appendChild(sectionType);
    section_div.appendChild(section_content_holder);

    if (index >= _section_holder.children.length) {
        _section_holder.appendChild(section_div);
    } else {
        _section_holder.insertBefore(section_div, _section_holder.children[index]);
    }

    reindex_sections(_section_holder);

}

function reindex_sections(section_holder){
    Array.from(section_holder.children).forEach((secDiv, index) => {
        const header = secDiv.querySelector('h4');
        if(header) header.textContent = `Sectiunea ${index + 1}`;
        secDiv.dataset.index = index;
    });
}


function create_box(){
    const t =  document.createElement('div');
    t.className='content_';
    t.id='content_holder';
    return t;
}

function customhr(){
    const t = document.createElement('hr');
    t.style.width = '80%';
    t.style.textAlign = 'justify';
    t.style.border = '0.3vh solid brown';
    t.style.borderRadius = '0.5vh';
    return t;
}

function create_text_box(placeholder, objRef, key){
    const textBox = document.createElement('textarea');
    textBox.className = 'text_box';
    textBox.placeholder = placeholder;
    textBox.value = objRef[key];

    textBox.style.overflowY = 'hidden';
    textBox.style.resize = 'none';

    const autoresize = () => {
        textBox.style.height = 'auto';
        textBox.style.height = textBox.scrollHeight + 'px';
    };

    textBox.oninput = () => {
        objRef[key] = textBox.value;
        autoresize();
        console.log(objRef[key]);
    };

    autoresize();

    return textBox;
}

function update_editor() {
    const editor = document.getElementById('main_div');
    if (!editor) return;

    // Actualizează titlul și descrierea
    const title_text = editor.querySelector('#title_text');
    const description_text = editor.querySelector('#description_text');
    if (title_text) title_text.value = title.content;
    if (description_text) description_text.value = description.content;

    const section_holder = editor.querySelector('#section_holder');
    if (!section_holder) return;

    // Golește secțiunile existente
    section_holder.innerHTML = '';

    // Recreează fiecare secțiune din array-ul `sections`
    sections.forEach((sectionData, index) => {
        create_section(section_holder, index);

        // Apoi actualizează conținutul pentru secțiunea proaspăt creată
        const sectionDiv = section_holder.children[index];
        if (!sectionDiv) return;

        const typeSelect = sectionDiv.querySelector('select');
        if (typeSelect) {
            typeSelect.value = sectionData.type;
            if (typeof typeSelect.onchange === 'function') {
                typeSelect.onchange(); // reconstruiește conținutul intern
            }
        }

        if (sectionData.type === 'Text' || sectionData.type === 'Titlu' || sectionData.type === 'Imagine') {
            const textarea = sectionDiv.querySelector('textarea');
            if (textarea) textarea.value = sectionData.content;

            if (sectionData.type === 'Imagine') {
                const img = sectionDiv.querySelector('img');
                if (img) {
                    img.style.display = 'block';
                    img.src = sectionData.content.trim();
                }
            }
        }
    });

    // Reindexează pentru siguranță
    reindex_sections(section_holder);
}   

function alr_(title_of_alert, container_of_alert) {
    // Create the main alert container
    const hol = document.createElement('div');
    
    // Create the exit button and set it to display an image
    const exit_button = document.createElement('button');
    const exit_image = document.createElement('img');
    exit_image.src = 'img/exit.png';  // Set the image source for the exit button
    exit_image.alt = 'Exit';      // Add alt text for accessibility
    exit_image.style.width = '20px';  // Adjust image size if needed
    exit_image.style.height = '20px';
    exit_button.style.background = 'transparent';
    exit_button.style.border = 'none';
    exit_button.style.padding = '5px';
    exit_button.style.cursor = 'pointer';
    exit_button.style.borderRadius = '50%';
    exit_button.appendChild(exit_image);  // Append the image to the button

    // Create the header and set the title
    const header_ = document.createElement('div');
    const h_title = document.createElement('h4');
    h_title.textContent = title_of_alert;
    header_.appendChild(h_title);

    // Event listener for the exit button
    exit_button.addEventListener('click', function () {
        hol.remove();  // Remove the alert when the button is clicked
    });

    // Set the styles for the alert container (hol)
    hol.style.position = 'fixed';
    hol.style.top = '50%';
    hol.style.left = '50%';
    hol.style.transform = 'translate(-50%, -50%)';
    hol.style.padding = '20px';
    hol.style.backgroundColor = '#fff';
    hol.style.border = '1px solid #ccc';
    hol.style.borderRadius = '1rem';
    hol.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    hol.style.zIndex = '9999';
    
    // Set styles for the header
    header_.style.display = 'flex';
    header_.style.justifyContent = 'space-between';
    header_.style.alignItems = 'center';
    header_.style.marginBottom = '10px';

    // Style the exit button container
    exit_button.style.background = 'transparent';
    exit_button.style.border = 'none';
    exit_button.style.padding = '5px';
    exit_button.style.cursor = 'pointer';
    exit_button.style.borderRadius = '50%';

    // Append header and exit button to the alert container
    header_.appendChild(exit_button);
    hol.appendChild(header_);

    // Check if container_of_alert is a string or an element and append content
    if (typeof container_of_alert === 'string') {
        const contentDiv = document.createElement('div');
        contentDiv.textContent = container_of_alert;
        hol.appendChild(contentDiv);
    } else {
        hol.appendChild(container_of_alert);
    }

    // Append the alert container to the body
    document.body.appendChild(hol);
}