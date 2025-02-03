const BASE_URL = "https://api.pokemontcg.io/v2/cards";
const API_KEY = "eb3574b9-9e90-41ee-9ebf-3d88065876f7";
const MAX_DECK_SIZE = 60;
const MAX_COPIES = 4;

let currentDeck = new Map(); // Map to store card quantities

document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('searchButton').addEventListener('click', searchCards);
    document.getElementById('saveDeck').addEventListener('click', saveDeck);

    // Load initial cards
    searchCards();
});

async function searchCards() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    showLoadingSpinner();

    try {
        let url = `${BASE_URL}?pageSize=20`;
        if (searchQuery) {
            url += `&q=name:"${searchQuery}"`;
        }

        const response = await fetch(url, {
            headers: {
                "X-Api-Key": API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displaySearchResults(data.data);
    } catch (error) {
        console.error('Error searching cards:', error);
        document.getElementById('searchResults').innerHTML = 
            "<p>Error loading cards. Please try again.</p>";
    } finally {
        hideLoadingSpinner();
    }
}

function displaySearchResults(cards) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.innerHTML = `
            <img src="${card.images.small}" alt="${card.name}">
            <p>${card.name}</p>
        `;
        cardDiv.addEventListener('click', () => addCardToDeck(card));
        resultsDiv.appendChild(cardDiv);
    });
}

function addCardToDeck(card) {
    const currentCount = currentDeck.get(card.id) || 0;
    const totalCards = Array.from(currentDeck.values()).reduce((a, b) => a + b, 0);

    if (totalCards >= MAX_DECK_SIZE) {
        alert('Deck is full! Maximum 60 cards allowed.');
        return;
    }

    if (currentCount >= MAX_COPIES) {
        alert(`Maximum ${MAX_COPIES} copies of a card allowed in deck.`);
        return;
    }

    currentDeck.set(card.id, currentCount + 1);
    updateDeckDisplay();
}

function removeCardFromDeck(cardId) {
    const currentCount = currentDeck.get(cardId);
    if (currentCount > 1) {
        currentDeck.set(cardId, currentCount - 1);
    } else {
        currentDeck.delete(cardId);
    }
    updateDeckDisplay();
}

async function updateDeckDisplay() {
    const deckList = document.getElementById('deckList');
    const cardCount = document.getElementById('cardCount');
    deckList.innerHTML = '';

    const totalCards = Array.from(currentDeck.values()).reduce((a, b) => a + b, 0);
    cardCount.textContent = `${totalCards}/60 cards`;

    for (const [cardId, quantity] of currentDeck) {
        try {
            const response = await fetch(`${BASE_URL}/${cardId}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            });
            const { data: card } = await response.json();

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('deck-card');
            cardDiv.innerHTML = `
                <img src="${card.images.small}" alt="${card.name}">
                <div class="deck-card-info">
                    <div>${card.name}</div>
                    <div class="deck-card-count">
                        <button class="count-button" onclick="removeCardFromDeck('${cardId}')">-</button>
                        <span>${quantity}</span>
                        <button class="count-button" onclick="addCardToDeck(${JSON.stringify(card)})">+</button>
                    </div>
                </div>
            `;
            deckList.appendChild(cardDiv);
        } catch (error) {
            console.error('Error fetching card details:', error);
        }
    }
}

function saveDeck() {
    const deckName = document.getElementById('deckName').value.trim() || 'Untitled Deck';
    const totalCards = Array.from(currentDeck.values()).reduce((a, b) => a + b, 0);

    if (totalCards === 0) {
        alert('Cannot save an empty deck!');
        return;
    }

    if (totalCards < MAX_DECK_SIZE) {
        if (!confirm(`This deck only has ${totalCards} cards. Save anyway?`)) {
            return;
        }
    }

    const deck = {
        name: deckName,
        cards: Object.fromEntries(currentDeck),
        created: new Date().toISOString()
    };

    // Save to localStorage
    let savedDecks = JSON.parse(localStorage.getItem('pokemonDecks') || '[]');
    savedDecks.push(deck);
    localStorage.setItem('pokemonDecks', JSON.stringify(savedDecks));

    alert('Deck saved successfully!');
    currentDeck.clear();
    updateDeckDisplay();
    document.getElementById('deckName').value = '';
}

function showLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}