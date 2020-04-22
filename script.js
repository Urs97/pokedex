const pokedex = document.querySelector('#pokedex');

let pokemonGeneration = [1, 151];
const cache = {};

const fetchPokemon = async (gen) => {
    pokedex.innerHTML = `<div class="loader"></div>`;

    const urls = [];
    for(let i = gen[0]; i <= gen[1]; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}/`;
        urls.push(url);
    }
    const data = await Promise.all((urls)
        .map(url => fetch(url)
        .then(response => response.json())));

            const pokemon = data.map((p) => ({
                name: p.name,
                id: p.id,
                image: p.sprites.front_default,
                type: p.types.map(type => type.type.name).join(" "),
                typeNumber: p.types.length,
                height: p.height,
                weight: p.weight
            }));

            displayPokemon(pokemon);
}

const displayPokemon = (pokemon) => {
    pokedex.innerHTML = "";

    pokemon.map(p => pokedex.innerHTML +=
        `<button class="card" onClick="fetchPokemonDetails(${p.id})">
            <h2 class="card-name">${p.name}</h2>
            <p>${displayId(p.id)}</p>
            <img class="img" src="${p.image}" alt="Pokemon front"></>
            ${displayType(p.typeNumber, p.type)}
        </button>`
    );
}

const fetchPokemonDetails = async (id) => {
    if(!cache[id]) {
        const urls = [];
        const url_1 = `https://pokeapi.co/api/v2/pokemon/${id}/`;
        const url_2 = `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
        const url_prev = `https://pokeapi.co/api/v2/pokemon/${id-1}/`;
        const url_next = `https://pokeapi.co/api/v2/pokemon/${id+1}/`;
        urls.push(url_1, url_2);
        if(id > 1) {urls.push(url_prev)} else {urls.push(url_1)};
        if(id < 807) {urls.push(url_next)} else {urls.push(url_1)};

        const data = await Promise.all((urls)
            .map(url => fetch(url)
            .then(response => response.json())));
        
        const pokemon = {
            name : data[0].name,
            id : data[0].id,
            type : data[0].types.map(type => type.type.name).join(" "),
            typeNumber : data[0].types.length,
            height: data[0].height,
            weight: data[0].weight,
            image_front: data[0].sprites.front_default,
            image_back: data[0].sprites.back_default,
            shiny_image_front: data[0].sprites.front_shiny,
            shiny_image_back: data[0].sprites.back_shiny,
            description: data[1].flavor_text_entries,
            short_description: data[1].genera,
            generation: data[1].generation.name,
            prev_name: data[2].name,
            prev_id: data[2].id, 
            next_name: data[3].name,
            next_id: data[3].id,
            prev_type: data[2].types.map(type => type.type.name).join(" "),
            next_type: data[3].types.map(type => type.type.name).join(" "),
        }
        cache[id] = pokemon;
        displayPokemonDetails(pokemon);

    } else displayPokemonDetails(cache[id]);
}

const displayPokemonDetails = (p) => {
    pokedex.innerHTML += 
        `<div id="popup-background" class="close" onClick="closePokemonDetails()">
            <div class="popup">
                <div class="popup-nav">
                    ${displayPrevPokemon(p.id, p.prev_id, p.prev_name, p.prev_type)}
                    <button class="popup-close-button close">X</button>
                    ${displayNextPokemon(p.id, p.next_id, p.next_name, p.next_type)}
                </div>
                <div class="popup-grid">
                    <h1 class="popup-id">${displayId(p.id)}</h1>
                    <div class="popup-title">
                        <h1>${p.name}</h1>
                        ${displayType(p.typeNumber, p.type)}
                    </div>
                    <div class="popup-images">
                        <img class="img" src="${p.image_front}" alt="Pokemon front"></>
                        <img class="img" src="${p.image_back}" alt="Pokemon back"></>
                        <img class="img" src="${p.shiny_image_front}" alt="Pokemon shiny front"></>
                        <img class="img" src="${p.shiny_image_back}" alt="Pokemon shiny back"></>
                    </div>
                    <div class="popup-card">
                        <p>${displayText(p.description, 'description')}</p>
                        <div class="popup-card-stats">
                            <p>Type: ${displayText(p.short_description, 'category')}</p>
                            <p>Height: ${displayHeight(p.height)}</p>
                            <p>Region: ${displayRegion(p.generation)}</p>
                            <p>Weight: ${displayWeight(p.weight)}</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>`
}

const fetchFromDetails = (id) => {
    const event = this.event;
    const popupBackground = document.querySelector('#popup-background');

    event.target.parentElement.parentElement.parentElement.parentElement.removeChild(popupBackground);

    setTimeout( () => {
        if(event.target.classList.contains("popup-left-btn") && id > 1) fetchPokemonDetails(id-1);
        if(event.target.classList.contains("popup-right-btn") && id < 807) fetchPokemonDetails(id+1);
        }, 400);
    
}

const filterPokemon = () => {
    event.preventDefault();
    
    const input = document.querySelector('#filter-input');
    const cardNames = document.querySelectorAll('.card-name');
    const cardNamesArray = [... cardNames];

    cardNamesArray.map(name => name.parentElement.style.display = "block");

    cardNamesArray
        .filter(name => !name.innerHTML.includes(input.value))
        .map(name => name.parentElement.style.display = "none");

    input.value = "";
}

const selectGeneration = () => {
    const select = document.querySelector('#select-generation');

    if(select.value === "gen-1") reFetchPokemon([1,151]);
    if(select.value === "gen-2") reFetchPokemon([152,251]);
    if(select.value === "gen-3") reFetchPokemon([252,386]); 
    if(select.value === "gen-4") reFetchPokemon([387,493]); 
    if(select.value === "gen-5") reFetchPokemon([494,649]);
    if(select.value === "gen-6") reFetchPokemon([650,721]);
    if(select.value === "gen-7") reFetchPokemon([722,807]);
}

const reFetchPokemon = (gen) => {
    pokedex.innerHTML = "";
    fetchPokemon(gen);
}

const displayPrevPokemon = (id, prevId, prevName, prevType) => {
    if(id === 1) return `<button class="popup-left-btn popup-empty-btn"></button>`;

    else {
        return `<button class="popup-btn popup-left-btn ${prevType}"
                onClick="fetchFromDetails(${id})">
                    <span>${displayId(prevId)}</span>
                    <span>${prevName}</span>
                </button>`;
    }
}

const displayNextPokemon = (id, nextId, nextName, nextType) => {
    if( id === 807) return `<button class="popup-right-btn popup-empty-btn"></button>`;

    else {
        return `<button class="popup-btn popup-right-btn ${nextType}"               
                onClick="fetchFromDetails(${id})">
                    <span>${displayId(nextId)}</span>
                    <span>${nextName}</span>
                </button>`;
    }
}

const displayType = (typeNumber, type) => {
    if(typeNumber === 1) {
        return `<p class="type ${type}">${type}</p>`;
    }
    
    if(typeNumber === 2) {
        const arr = type.split(" ");
        return `<div class="double-type">
                    <div>
                        <p class="type ${arr[0]}">${arr[0]}</p>
                        <p class="type ${arr[1]}">${arr[1]}</p>
                    </div>
                </div>`;
    }
}

const displayId = (id) => {
    if (id.toString().length === 1) return `#00${id}`;
    if (id.toString().length === 2) return `#0${id}`;
    else return `#${id}`;
}

const displayText = (entries, text) => {
    const entry = entries.filter(entry => entry.language.name === "en");

    if(text === 'category') {
        return `${entry[0].genus}`;
    }
    if(text === 'description') {
        return `${entry[0].flavor_text}`
    }
}

const displayHeight = (height) => {
    const m = height/10;
    const realFeet = ((m * 39.3701) / 12);
    const feet = Math.floor(realFeet);
    const inches = Math.round((realFeet - feet) * 12);
    
    return `${m} m / ${feet}' ${inches}''`;
}

const displayWeight = (weight) => {
    const kg = weight/10;
    const lbs = Math.round(kg * 2.205 * 10) / 10;
    return `${kg} kg / ${lbs} lbs`;
}

const displayRegion = (gen) => {
    if(gen === "generation-i") return "Kanto";
    if(gen === "generation-ii") return "Johto";
    if(gen === "generation-iii") return "Hoenn";
    if(gen === "generation-iv") return "Sinnoh";
    if(gen === "generation-v") return "Unova";
    if(gen === "generation-vi") return "Kalos";
    if(gen === "generation-vii") return "Alola";
}

const closePokemonDetails = () => {
    const popupBackground = document.querySelector('#popup-background');
    const outside = event.target.id === 'popup-background';

    if (event.target.classList.contains("close")) {
        return outside ? event.target.parentElement.removeChild(popupBackground) 
        : event.target.parentElement.parentElement.parentElement.parentElement.removeChild(popupBackground);
    } return;
}

const toggleNavMenu = () => {
    const navLinks = document.querySelector('.nav-links');
    
    navLinks.classList.toggle('show');
}

const getCurrentYear = () => {
    const current_year = document.querySelector('#current-year');
    const today = new Date();
    const year = today.getFullYear();
    current_year.innerHTML = year;
}

getCurrentYear();
fetchPokemon(pokemonGeneration);
