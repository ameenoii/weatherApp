/* ===================================================
   WEATHER DASHBOARD JAVASCRIPT (script.js)
   Beginner-friendly code explaining core JS concepts:
   - DOM Selection & Event Listeners
   - Fetch API & Promises
   - async / await & try / catch
   - localStorage (saving favorites & theme)
   - Debounce technique
   =================================================== */

// ===================================================
// 1. API CONFIGURATION
// ===================================================
// ⚠️ IMPORTANT: Replace "YOUR_API_KEY" with your actual key from https://openweathermap.org/
const API_KEY = '39efed0febc4be24360c6e4365312e8f'; 

// ===================================================
// 2. DOM ELEMENT REFERENCES
// ===================================================
// Selecting HTML elements using their unique IDs
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loadingBox = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");

const weatherSection = document.getElementById("weather-section");
const cityNameEl = document.getElementById("city-name");
const addFavoriteBtn = document.getElementById("add-favorite-btn");
const weatherIcon = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const weatherConditionEl = document.getElementById("weather-condition");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");

const forecastSection = document.getElementById("forecast-section");
const forecastCardsContainer = document.getElementById("forecast-cards");

const favoritesListContainer = document.getElementById("favorites-list");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

// Application State Variables
let currentCity = "";
let debounceTimer = null; // Used to delay automatic searching while typing

// ===================================================
// 3. UI HELPER FUNCTIONS (Loading & Errors)
// ===================================================

// Show loading indicator
function showLoading() {
    loadingBox.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    weatherSection.classList.add("hidden");
    forecastSection.classList.add("hidden");
}

// Hide loading indicator
function hideLoading() {
    loadingBox.classList.add("hidden");
}

// Display beginner-friendly error message
function showError(message) {
    hideLoading();
    weatherSection.classList.add("hidden");
    forecastSection.classList.add("hidden");
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

// Clear error message display
function clearError() {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";
}

// ===================================================
// 4. FETCH WEATHER DATA (async/await & try/catch)
// ===================================================

/**
 * Main function to fetch current weather and 5-day forecast
 * @param {string} city - Name of the city to search for
 */
async function fetchWeather(city) {
    // If the input is empty, don't execute search
    if (!city || city.trim() === "") {
        return;
    }

    // Check if user has updated API_KEY placeholder
    if (API_KEY === "YOUR_API_KEY") {
        showError("Please replace 'YOUR_API_KEY' with your real OpenWeatherMap API Key in script.js!");
        return;
    }

    clearError();
    showLoading();

    try {
        // ---------------------------------------------------
        // A. Fetch Current Weather Data using Fetch API & await
        // ---------------------------------------------------
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${API_KEY}`;
        
        // fetch() sends an HTTP GET request to the OpenWeatherMap API
        const weatherResponse = await fetch(weatherUrl);

        // Check if the response status is NOT OK (e.g. 404 City Not Found)
        if (!weatherResponse.ok) {
            throw new Error("City not found. Please enter a valid city name.");
        }

        // Convert response stream to JSON format using await
        const weatherData = await weatherResponse.json();

        // ---------------------------------------------------
        // B. Fetch 5-Day Forecast Data
        // ---------------------------------------------------
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&units=metric&appid=${API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            throw new Error("Could not fetch 5-day forecast.");
        }

        const forecastData = await forecastResponse.json();

        // Hide loading spinner after successful fetches
        hideLoading();

        // Store currently viewed city name
        currentCity = weatherData.name;

        // Display the retrieved weather & forecast data on screen
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);

    } catch (error) {
        // Handle any network errors or invalid city exceptions
        console.error("Fetch Error:", error);
        showError(error.message || "An error occurred while fetching weather data.");
    }
}

// ===================================================
// 5. DISPLAY WEATHER ON PAGE (DOM Manipulation)
// ===================================================

/**
 * Updates DOM elements with current weather data
 */
function displayCurrentWeather(data) {
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    weatherConditionEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} m/s`;

    // Weather condition icon from OpenWeatherMap
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Reveal weather section
    weatherSection.classList.remove("hidden");
}

/**
 * Displays 5-day forecast cards
 */
function displayForecast(forecastData) {
    // Clear previous forecast cards
    forecastCardsContainer.innerHTML = "";

    // The API returns data every 3 hours (40 items total).
    // Filter to get 1 forecast per day around 12:00 PM (noon)
    const dailyList = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

    // If noon filter is empty (e.g., late night fetch), pick every 8th item as fallback
    const itemsToDisplay = dailyList.length > 0 ? dailyList : forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5);

    itemsToDisplay.forEach(item => {
        // Format date string (e.g., "Mon, Oct 12")
        const dateObj = new Date(item.dt * 1000);
        const formattedDate = dateObj.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

        const temp = Math.round(item.main.temp);
        const condition = item.weather[0].description;
        const iconCode = item.weather[0].icon;

        // Create card div element dynamically
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <div class="date">${formattedDate}</div>
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${condition}" />
            <div class="temp">${temp}°C</div>
            <div class="condition">${condition}</div>
        `;

        forecastCardsContainer.appendChild(card);
    });

    // Reveal forecast section
    forecastSection.classList.remove("hidden");
}

// ===================================================
// 6. FAVORITES MANAGEMENT (localStorage)
// ===================================================

/**
 * Retrieve favorite cities array from localStorage
 */
function getFavoritesFromStorage() {
    const saved = localStorage.getItem("weather_favorites");
    // If favorites exist in storage, parse JSON string to array, else return empty array []
    return saved ? JSON.parse(saved) : [];
}

/**
 * Save current city to favorites in localStorage
 */
function saveFavoriteCity() {
    if (!currentCity) return;

    let favorites = getFavoritesFromStorage();

    // Check if city is already in favorites list (case-insensitive)
    const cityExists = favorites.some(city => city.toLowerCase() === currentCity.toLowerCase());

    if (!cityExists) {
        favorites.push(currentCity);
        // localStorage can only store strings, so convert array to JSON string
        localStorage.setItem("weather_favorites", JSON.stringify(favorites));
        renderFavorites();
    }
}

/**
 * Remove city from favorites
 */
function removeFavoriteCity(cityNameToRemove) {
    let favorites = getFavoritesFromStorage();
    favorites = favorites.filter(city => city.toLowerCase() !== cityNameToRemove.toLowerCase());
    localStorage.setItem("weather_favorites", JSON.stringify(favorites));
    renderFavorites();
}

/**
 * Render favorites list on screen
 */
function renderFavorites() {
    favoritesListContainer.innerHTML = "";
    const favorites = getFavoritesFromStorage();

    if (favorites.length === 0) {
        favoritesListContainer.innerHTML = "<p style='color: var(--text-muted); font-size: 0.9rem;'>No saved favorite cities yet.</p>";
        return;
    }

    favorites.forEach(city => {
        const item = document.createElement("div");
        item.className = "favorite-item";

        // Create city click button
        const cityBtn = document.createElement("button");
        cityBtn.className = "favorite-city-btn";
        cityBtn.textContent = city;
        cityBtn.addEventListener("click", () => {
            cityInput.value = city;
            fetchWeather(city);
        });

        // Create remove (X) button
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-fav-btn";
        removeBtn.textContent = "×";
        removeBtn.title = "Remove favorite";
        removeBtn.addEventListener("click", (event) => {
            event.stopPropagation(); // Stop parent click event from triggering
            removeFavoriteCity(city);
        });

        item.appendChild(cityBtn);
        item.appendChild(removeBtn);
        favoritesListContainer.appendChild(item);
    });
}

// Add event listener to Favorite Button
addFavoriteBtn.addEventListener("click", saveFavoriteCity);

// ===================================================
// 7. DEBOUNCED SEARCH IMPLEMENTATION
// ===================================================
/*
   WHY DEBOUNCE IS USED:
   Debounce prevents making an API call on EVERY single keypress while typing.
   Instead, it waits until the user has stopped typing for 500ms before sending the API request.
   This saves internet data, prevents API rate-limit errors, and improves website performance.
*/
function handleDebouncedInput() {
    // Clear any previously scheduled timer
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    // Set a new timer to wait for 500 milliseconds of no typing
    debounceTimer = setTimeout(() => {
        const city = cityInput.value.trim();
        if (city.length >= 3) {
            fetchWeather(city);
        }
    }, 500);
}

// Trigger debounced search when user types in the input box
cityInput.addEventListener("input", handleDebouncedInput);

// Trigger immediate search when user clicks the Search button or presses Enter
searchBtn.addEventListener("click", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        if (debounceTimer) clearTimeout(debounceTimer);
        fetchWeather(cityInput.value.trim());
    }
});

// ===================================================
// 8. DARK / LIGHT THEME TOGGLE (localStorage)
// ===================================================

function toggleTheme() {
    // Toggle 'dark-mode' CSS class on the <body> element
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");
    
    // Save current theme preference in localStorage
    localStorage.setItem("theme_preference", isDarkMode ? "dark" : "light");

    // Update button icon & text
    themeToggleBtn.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem("theme_preference");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggleBtn.textContent = "☀️ Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggleBtn.textContent = "🌙 Dark Mode";
    }
}

themeToggleBtn.addEventListener("click", toggleTheme);

// ===================================================
// 9. INITIALIZATION ON PAGE LOAD
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
    loadSavedTheme();
    renderFavorites();
});
