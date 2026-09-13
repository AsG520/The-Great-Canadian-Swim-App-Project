let settings = document.getElementById("settings-box");

function callSettingsPage() {
    window.location.href = "index-settings-page.html";
}

settings.addEventListener("click", callSettingsPage);

const apiKey = "b6ae35d8f35cd1f689aeb32b6361c0f3";
const container = document.querySelector(".container");
const cityInput = document.getElementById("search");
const searchPicture = document.getElementById("search-picture");

let humidityPercentageDisplay = document.getElementById("humidity-percentage");
let temperatureDisplay = document.getElementById("temperature-display");
let windSpeedDisplay = document.getElementById("wind-kilometers-per-hour");
let pressureDisplay = document.getElementById("pressure-value");
let descriptionDisplay = document.getElementById("description");
let weatherEmojiDisplay = document.getElementById("weather-emoji");
let locationDisplay = document.getElementById("location-display");
let windAngleDisplay = document.getElementById("wind-angle-value");

searchPicture.addEventListener("click", async (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
        } catch (error) {
            console.error(error);
        }
    } else {
        cityInput.placeholder = "Invalid location. Try again!";
    }
});

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not fetch weather data.");
    }

    return await response.json();
}

function displayWeatherInfo(data) {
    const {
        name: city,
        main: { temp, humidity, feels_like, pressure },
        wind: { speed, deg },
        weather: [{ description, id, main }],
    } = data;

    humidityPercentageDisplay.value = `${Math.floor(humidity)}`;
    temperatureDisplay.textContent = `${Math.floor((temp - 273.15).toFixed(1))}` + " °C";
    windSpeedDisplay.value = `${Math.floor(speed * 3.6)}`;
    pressureDisplay.value = `${Math.floor(pressure)}`;
    descriptionDisplay.innerHTML = `${description}`;
    weatherEmojiDisplay.textContent = getWeatherEmoji(id);
    locationDisplay.textContent = cityInput.value;
    windAngleDisplay.value = `${deg}`;
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case weatherId >= 200 && weatherId < 300:
            return "⛈️";
        case weatherId >= 300 && weatherId < 400:
            return "🌧️";
        case weatherId >= 500 && weatherId < 600:
            return "🌧️";
        case weatherId >= 600 && weatherId < 700:
            return "❄️";
        case weatherId >= 700 && weatherId < 800:
            return "🌫️";
        case weatherId === 800:
            return "☀️";
        case weatherId >= 801 && weatherId < 810:
            return "☁️";
        default:
            return "❓";
    }
}
