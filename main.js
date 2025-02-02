const BASE_URL = "https://api.pokemontcg.io/v2/cards";
const API_KEY = "eb3574b9-9e90-41ee-9ebf-3d88065876f7"; // Replace with your real API key

document.getElementById("searchButton").addEventListener("click", () => {
    const searchQuery = document.getElementById("searchInput").value.trim();
    if (searchQuery) {
        searchPokemonCard(searchQuery);
    }
});

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

    cards.slice(0, 6).forEach(card => {  // Show up to 6 results
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
