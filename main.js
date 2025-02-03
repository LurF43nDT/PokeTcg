const BASE_URL = "https://api.pokemontcg.io/v2/cards";
const API_KEY = "eb3574b9-9e90-41ee-9ebf-3d88065876f7"; 

document.addEventListener('DOMContentLoaded', () => {
    // Search button functionality
    document.getElementById("searchButton").addEventListener("click", () => {
        const searchQuery = document.getElementById("searchInput").value.trim();
        if (searchQuery) {
            searchPokemonCard(searchQuery);
        } else {
            loadInitialCards();
        }
    });

    // Deck builder button functionality
    document.getElementById("deckBuilderButton").addEventListener("click", () => {
        window.location.href = "deck-builder.html";
    });

    // Load initial cards
    loadInitialCards();
});

async function loadInitialCards() {
    try {
        const response = await fetch(BASE_URL, {
            headers: {
                "X-Api-Key": API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayCards(data.data);
    } catch (error) {
        console.error('Error loading cards:', error);
        document.getElementById("cardResults").innerHTML = 
            "<p>Error loading cards. Please try again later.</p>";
    }
}

async function searchPokemonCard(name) {
    const response = await fetch(`${BASE_URL}?q=name:"${name}"`, {
        headers: {
            "X-Api-Key": API_KEY
        }
    });

    if (!response.ok) {
        console.error(`Error: ${response.status} - ${await response.text()}`);
        return;
    }

    const data = await response.json();
    displayCards(data.data);
}

function displayCards(cards) {
    const resultsDiv = document.getElementById("cardResults");
    resultsDiv.innerHTML = ""; // Clear previous results

    if (cards.length === 0) {
        resultsDiv.innerHTML = "<p>No cards found.</p>";
        return;
    }

    cards.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        cardDiv.innerHTML = `
            <h3>${card.name}</h3>
            <p>Set: ${card.set.name}</p>
            <p>Rarity: ${card.rarity || "Unknown"}</p>
            <img src="${card.images.large}" alt="${card.name}">
        `;

        resultsDiv.appendChild(cardDiv);
    });
}