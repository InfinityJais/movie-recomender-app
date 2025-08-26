const API_ENDPOINT = 'https://chetna-recommender-app.onrender.com/recommend';
let tmdbApiKey = '';

// --- API Key Management ---
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key');
const toggleApiKeyButton = document.getElementById('toggle-api-key');

document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('tmdbApiKey');
    if (savedKey) {
        tmdbApiKey = savedKey;
        apiKeyInput.value = savedKey;
        console.log("API key loaded from localStorage.");
    }
});

saveApiKeyButton.addEventListener('click', () => {
    tmdbApiKey = apiKeyInput.value;
    localStorage.setItem('tmdbApiKey', tmdbApiKey);
    alert('API key saved successfully!');
});

toggleApiKeyButton.addEventListener('click', () => {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    const icon = toggleApiKeyButton.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// --- Movie Search and Recommendation Logic ---
async function handleMovieSearch() {
    const movieName = document.getElementById('movie-search-input').value;

    if (!movieName) {
        return;
    }

    if (!tmdbApiKey) {
        alert('Please save your TMDb API key first!');
        return;
    }

    showLoadingState();

    try {
        const recommendations = await fetchRecommendations(movieName);
        displayRecommendations(recommendations);
    } catch (error) {
        console.error('An error occurred:', error);
        displayErrorState('Sorry, something went wrong. Please try again later.');
    }
}

async function fetchRecommendations(movieTitle) {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-TMDB-API-Key': tmdbApiKey
        },
        body: JSON.stringify({ movie_title: movieTitle })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.recommendations) {
        throw new Error('API response format is invalid.');
    }

    return data.recommendations;
}

function displayRecommendations(movies) {
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '';

    if (movies.length === 0) {
        movieList.innerHTML = '<p class="text-center text-lg text-gray-400 col-span-full">No recommendations found. Try another movie!</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieList.appendChild(movieCard);
    });
}

function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('bg-gray-700', 'p-4', 'rounded-xl', 'shadow-md', 'flex', 'flex-col', 'items-center', 'space-y-2', 'transition-transform', 'transform', 'hover:scale-105', 'hover:bg-gray-600', 'duration-200');

    const posterImage = document.createElement('img');
    posterImage.src = movie.poster;
    posterImage.alt = movie.title;
    posterImage.classList.add('w-32', 'h-48', 'object-cover', 'rounded-lg', 'shadow-sm');

    const movieTitle = document.createElement('h3');
    movieTitle.textContent = movie.title;
    movieTitle.classList.add('text-lg', 'font-semibold', 'text-blue-300', 'text-center');

    movieCard.appendChild(posterImage);
    movieCard.appendChild(movieTitle);

    return movieCard;
}

function showLoadingState() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '<div class="text-center text-lg text-gray-400 col-span-full">Loading recommendations...</div>';
    recommendationsContainer.classList.remove('hidden');
}

function displayErrorState(message) {
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = `<p class="text-center text-red-400 col-span-full">${message}</p>`;
}

document.getElementById('search-button').addEventListener('click', handleMovieSearch);