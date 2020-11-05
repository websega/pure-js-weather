import imageApi from './assets/js/service/unsplashService';
import weatherApi from './assets/js/service/weatherService';
import './assets/scss/style.scss';

window.addEventListener('DOMContentLoaded', () => {
  const searchform = document.querySelector('.header__form');
  const tabs = document.querySelector('.tabs');
  const forecastEl = document.querySelector('.forecast');
  const tabsBtns = document.querySelectorAll('.tabs__tab');
  const info = document.querySelector('.info');
  const weatherDetails = document.querySelector('.weather-details');
  const app = document.querySelector('.app');
  const autorLink = document.querySelector('.header__link');
  const autorName = document.querySelector('.header__name');
  let selectedTab = null;
  const coord = { lon: 0, lat: 0 };
  let forecast = {};

  const months = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ];

  const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ];

  // запросы к weather api
  const getCityWeather = (city) => weatherApi.cityWeather(city);
  const getForecast = (coords) => weatherApi.getForecast(coords);
  const getCoordWeather = (coords) => weatherApi.coordWeather(coords);

  // запросы к unsplash api
  const getImage = (word) => imageApi.image(word);

  const createDate = (d) => {
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day}, ${date} ${month} ${year}`;
  };

  const renderInfo = (weather) => {
    info.innerText = '';
    const now = new Date();
    const html = `
    <div class="info__temperature">
      <span class="info__value">
        ${Math.round(weather.main.temp)}&#176;
      </span>
      <span class="info__scale">C</span>
    </div>

    <div class="info__item">
      <div class="info__body">
        <div class="info__cityname">
          ${weather.name}
        </div>
        <img class="info__icon" src="assets/img/weather/${weather.weather[0].icon.slice(
          0,
          2
        )}.svg" alt="weathericon" />
      </div>

      <div class="info__downside">
        <div class="info__date">
          ${now.getHours()}:${now.getMinutes()} - ${createDate(now)}
        </div>
        <div class="info__weather-description">${
          weather.weather[0].description
        }</div>
      </div>
    </div>
    `;

    info.insertAdjacentHTML('beforeend', html);
  };

  const getForecastItem = (time, icon, temp) => {
    return `
    <div class="forecast__item">
      <div class="forecast__time">${time}</div>
        <img
          src="assets/img/weather/${icon}.svg"
          alt="icon"
          class="forecast__icon"
         />
      <div class="forecast__temperature">
        <span class="forecast__value">${temp}&#176;</span>
       <span class="forecast__scale">C</span>
      </div>
    </div>
    `;
  };

  const renderForecast = ({ daily, hourly }) => {
    forecastEl.innerText = '';
    let out = '';

    if (selectedTab === 'daily') {
      daily.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = `${days[date.getDay()]}`;
        const icon = `${item.weather[0].icon.slice(0, 2)}`;
        const temp = `${Math.round(item.temp.day)}`;

        out += getForecastItem(day, icon, temp);
      });
    } else {
      hourly.slice(0, 12).forEach((item) => {
        const date = new Date(item.dt * 1000);
        const time = `${date.getHours()}:0${date.getMinutes()}`;
        const icon = `${item.weather[0].icon.slice(0, 2)}`;
        const temp = `${Math.round(item.temp)}`;

        out += getForecastItem(time, icon, temp);
      });
    }

    forecastEl.insertAdjacentHTML('beforeend', out);
  };

  const renderWeatherDetails = (weather) => {
    weatherDetails.innerText = '';
    const html = `
    <div class="weather-details__item">
          <img
            class="weather-details__icon"
            src="assets/img/cloud-details.svg"
            alt="icon"
          />
          <div>
            <div class="weather-details__title">Облачность</div>
            <div class="weather-details__value cloudy">${weather.clouds.all}%</div>
          </div>
        </div>

        <div class="weather-details__item">
          <img
            class="weather-details__icon"
            src="assets/img/humidity-details.svg"
            alt="icon"
          />
          <div>
            <div class="weather-details__title">Влажность</div>
            <div class="weather-details__value humidity">${weather.main.humidity}</div>
          </div>
        </div>

        <div class="weather-details__item">
          <img
            class="weather-details__icon"
            src="assets/img/wind-details.svg"
            alt="icon"
          />
          <div>
            <div class="weather-details__title">Ветер</div>
            <div class="weather-details__value wind">${weather.wind.speed}m/s</div>
          </div>
        </div>

        <div class="weather-details__item">
          <img
            class="weather-details__icon"
            src="assets/img/pressure-deatails.svg"
            alt="icon"
          />
          <div>
            <div class="weather-details__title">Давление</div>
            <div class="weather-details__value pressure">${weather.main.pressure}hPa</div>
          </div>
        </div>
    `;

    weatherDetails.insertAdjacentHTML('beforeend', html);
  };

  const setBackground = (imgUrl) => {
    app.style.backgroundImage = `url(${imgUrl})`;
  };

  const renderAuthor = (url, name) => {
    autorLink.setAttribute('href', `${url}`);
    autorName.innerText = `${name}`;
  };

  const deleteCls = (elements, cls) => {
    elements.forEach((item) => {
      if (item.classList.contains(cls)) {
        item.classList.remove(cls);
      }
    });
  };

  const setActiveCls = (elements) => {
    elements.forEach((item) => {
      if (item.id === selectedTab) {
        item.classList.add('tabs__tab--active');
      }
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const cityName = e.target.input__search.value;

    if (!cityName.trim()) {
      return;
    }

    const cityWeather = await getCityWeather(cityName);

    if (!cityWeather) {
      return;
    }

    deleteCls(tabsBtns, 'tabs__tab--active');

    // сдулать активный класс для первого таба
    selectedTab = 'daily';
    setActiveCls(tabsBtns);

    renderInfo(cityWeather);
    renderWeatherDetails(cityWeather);

    const image = await getImage(cityWeather.weather[0].main);
    setBackground(image.urls.full);
    renderAuthor(image.user.links.html, image.user.name);

    coord.lon = cityWeather.coord.lon;
    coord.lat = cityWeather.coord.lat;

    forecast = await getForecast(coord);
    renderForecast(forecast);

    e.target.input__search.value = '';
  };

  const tabHandler = async ({ target }) => {
    const btn = target.closest('button');

    if (!btn) {
      return;
    }

    deleteCls(tabsBtns, 'tabs__tab--active');

    if (btn.id === 'daily') {
      selectedTab = 'daily';
    } else {
      selectedTab = 'hourly';
    }

    setActiveCls(tabsBtns);
    renderForecast(forecast);
  };

  const init = () => {
    // сдулать активный класс для первого таба
    selectedTab = 'daily';
    setActiveCls(tabsBtns);

    // geolocation
    if (navigator.geolocation) {
      const geoOptions = {
        timeout: 10 * 1000,
      };

      const geoSuccess = async (position) => {
        coord.lon = position.coords.longitude;
        coord.lat = position.coords.latitude;

        const weather = await getCoordWeather(coord);

        const image = await getImage(weather.weather[0].main);
        setBackground(image.urls.full);
        renderAuthor(image.user.links.html, image.user.name);

        forecast = await getForecast(coord);

        renderInfo(weather);
        renderWeatherDetails(weather);
        renderForecast(forecast);
      };

      const geoError = (error) => {
        throw new Error(`Error geolocation. Error code: ${error.code}`);
      };

      navigator.geolocation.getCurrentPosition(
        geoSuccess,
        geoError,
        geoOptions
      );
    }
  };

  // start
  init();

  // handlers
  searchform.addEventListener('submit', submitHandler);
  tabs.addEventListener('click', tabHandler);
});
