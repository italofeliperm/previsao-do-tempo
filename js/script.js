document.addEventListener("DOMContentLoaded", () => {
  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
});

console.log("script carregado");

const key = "94b08e79bbe84041102216fbb71e496c";

function formatarData() {
  const data = new Date();
  const opcoes = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return data.toLocaleDateString("en-US", opcoes);
}

function colocarDadosNaTela(dados) {
  console.log(dados);

  // Formatação mais precisa das temperaturas
  const temp = dados.main.temp.toFixed(1);
  const tempMin = dados.main.temp_min.toFixed(1);
  const tempMax = dados.main.temp_max.toFixed(1);
  const windSpeed = (dados.wind.speed * 3.6).toFixed(1); // Convertendo m/s para km/h com precisão

  document.querySelector(".cidade").innerHTML = "Weather in " + dados.name;
  document.querySelector(".data").innerHTML = formatarData();
  document.querySelector(".temp").innerHTML = `${temp}°C`;
  document.querySelector(".temp-min").innerHTML = `Min: ${tempMin}°C`;
  document.querySelector(".temp-max").innerHTML = `Max: ${tempMax}°C`;
  document.querySelector(".texto-previsao").innerHTML =
    dados.weather[0].description.charAt(0).toUpperCase() +
    dados.weather[0].description.slice(1); // Primeira letra maiúscula
  document.querySelector(".umidade").innerHTML = `${dados.main.humidity}%`;
  document.querySelector(".vento").innerHTML = `${windSpeed} km/h`;
  document.querySelector(".pressao").innerHTML = `${dados.main.pressure} hPa`;
  document.querySelector(
    ".img-previsao"
  ).src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png`;

  // Formatação mais precisa do nascer e pôr do sol
  const sunriseTime = new Date(dados.sys.sunrise * 1000);
  const sunsetTime = new Date(dados.sys.sunset * 1000);

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Formato 24h
  };

  document.querySelector(".sunrise").innerHTML = sunriseTime.toLocaleTimeString(
    "en-US",
    timeOptions
  );
  document.querySelector(".sunset").innerHTML = sunsetTime.toLocaleTimeString(
    "en-US",
    timeOptions
  );
}

async function buscarCidade(cidade) {
  showLoading();
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${key}&units=metric`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const dados = await response.json();
    colocarDadosNaTela(dados);
    await buscarPrevisao5Dias(cidade);
  } catch (error) {
    console.error("Error details:", error);
    if (error.message.includes("401")) {
      alert("Invalid API key. Please check your OpenWeather API key.");
    } else if (error.message.includes("404")) {
      alert("City not found. Please check the city name.");
    } else {
      alert("Error fetching weather data. Please try again later.");
    }
  } finally {
    hideLoading();
  }
}

function cliqueiNoBotao() {
  const cidade = document.querySelector(".input-cidade").value;
  if (cidade) {
    buscarCidade(cidade);
  } else {
    alert("Please enter a city name");
  }
}

// Adicionar evento de tecla Enter no input
document.querySelector(".input-cidade").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    cliqueiNoBotao();
  }
});

// Theme Toggle
const themeToggle = document.querySelector(".theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-theme") ? "dark" : "light"
  );
});

// Temperature Toggle
let isCelsius = true;
document.querySelector(".temp-toggle").addEventListener("click", (e) => {
  if (e.target.classList.contains("fahrenheit") && isCelsius) {
    convertToFahrenheit();
  } else if (e.target.classList.contains("celsius") && !isCelsius) {
    convertToCelsius();
  }
});

function convertToFahrenheit() {
  const tempElement = document.querySelector(".temp");
  const tempMinElement = document.querySelector(".temp-min");
  const tempMaxElement = document.querySelector(".temp-max");

  // Convert main temperature with more precision
  const celsius = parseFloat(tempElement.textContent);
  const fahrenheit = ((celsius * 9) / 5 + 32).toFixed(1);
  tempElement.innerHTML = `${fahrenheit}°F`;

  // Convert min temperature
  const minCelsius = parseFloat(
    tempMinElement.textContent.replace("Min: ", "")
  );
  const minFahrenheit = ((minCelsius * 9) / 5 + 32).toFixed(1);
  tempMinElement.innerHTML = `Min: ${minFahrenheit}°F`;

  // Convert max temperature
  const maxCelsius = parseFloat(
    tempMaxElement.textContent.replace("Max: ", "")
  );
  const maxFahrenheit = ((maxCelsius * 9) / 5 + 32).toFixed(1);
  tempMaxElement.innerHTML = `Max: ${maxFahrenheit}°F`;

  isCelsius = false;
  document.querySelector(".celsius").classList.remove("active");
  document.querySelector(".fahrenheit").classList.add("active");
}

function convertToCelsius() {
  const tempElement = document.querySelector(".temp");
  const tempMinElement = document.querySelector(".temp-min");
  const tempMaxElement = document.querySelector(".temp-max");

  // Convert main temperature
  const fahrenheit = parseFloat(tempElement.textContent);
  const celsius = Math.round(((fahrenheit - 32) * 5) / 9);
  tempElement.innerHTML = `${celsius}°C`;

  // Convert min temperature
  const minFahrenheit = parseFloat(
    tempMinElement.textContent.replace("Min: ", "")
  );
  const minCelsius = Math.round(((minFahrenheit - 32) * 5) / 9);
  tempMinElement.innerHTML = `Min: ${minCelsius}°C`;

  // Convert max temperature
  const maxFahrenheit = parseFloat(
    tempMaxElement.textContent.replace("Max: ", "")
  );
  const maxCelsius = Math.round(((maxFahrenheit - 32) * 5) / 9);
  tempMaxElement.innerHTML = `Max: ${maxCelsius}°C`;

  isCelsius = true;
  document.querySelector(".fahrenheit").classList.remove("active");
  document.querySelector(".celsius").classList.add("active");
}

// Geolocation
function getLocation() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        buscarCidadePorCoordenadas(lat, lon);
      },
      (error) => {
        hideLoading();
        alert("Unable to retrieve your location");
      }
    );
  }
}

async function buscarCidadePorCoordenadas(lat, lon) {
  showLoading();
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const dados = await response.json();
    colocarDadosNaTela(dados);
    await buscarPrevisao5Dias(dados.name);
  } catch (error) {
    console.error("Error details:", error);
    alert("Error fetching weather data. Please try again later.");
  } finally {
    hideLoading();
  }
}

// 5-day forecast
async function buscarPrevisao5Dias(cidade) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${key}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const dados = await response.json();
    mostrarPrevisao5Dias(dados);
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

function mostrarPrevisao5Dias(dados) {
  const container = document.querySelector(".forecast-items");
  container.innerHTML = "";

  // Get one forecast per day (at noon)
  const forecasts = dados.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  forecasts.slice(0, 5).forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp = forecast.main.temp.toFixed(1); // Maior precisão na temperatura

    const forecastHTML = `
      <div class="forecast-item">
        <div class="forecast-day">${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${
          forecast.weather[0].icon
        }.png" 
             alt="${forecast.weather[0].description}" 
             class="forecast-icon">
        <div class="forecast-temp">${temp}°${isCelsius ? "C" : "F"}</div>
      </div>
    `;

    container.innerHTML += forecastHTML;
  });
}

// Loading screen
function showLoading() {
  document.querySelector(".loading-screen").style.display = "flex";
}

function hideLoading() {
  document.querySelector(".loading-screen").style.display = "none";
}
