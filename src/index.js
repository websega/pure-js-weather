import imageApi from './assets/js/service/unsplashService';
import weatherApi from './assets/js/service/weatherService';
import './assets/scss/style.scss';

window.addEventListener('DOMContentLoaded', () => {
  const searchform = document.querySelector('.header__form');
  const tabs = document.querySelector('.tabs');
  const forecastEl = document.querySelector('.forecast');
  const tabsBtns = document.querySelectorAll('.tabs__tab');
  const app = document.querySelector('.app');
  const autorLink = document.querySelector('.header__link');
  const autorName = document.querySelector('.header__name');
  let selectedTab = null;
  const coord = { lon: 0, lat: 0 };

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

  const createDate = (d) => {
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day}, ${date} ${month} ${year}`;
  };

  const displayInfo = (weather) => {
    const temperature = document.querySelector('.info__value');
    const city = document.querySelector('.info__cityname');
    const date = document.querySelector('.info__date');
    const cloudy = document.querySelector('.cloudy');
    const humidity = document.querySelector('.humidity');
    const wind = document.querySelector('.wind');
    const pressure = document.querySelector('.pressure');
    const bodyIcon = document.querySelector('.info__icon');
    const description = document.querySelector('.info__weather-description');
    const now = new Date();

    temperature.innerHTML = `${Math.round(weather.main.temp)}&#176;`;
    city.innerText = `${weather.name}`;
    date.innerText = `${now.getHours()}:${now.getMinutes()} - ${createDate(
      now
    )}`;
    cloudy.innerText = `${weather.clouds.all}%`;
    humidity.innerText = `${weather.main.humidity}%`;
    wind.innerText = `${weather.wind.speed}m/s`;
    pressure.innerText = `${weather.main.pressure}hPa`;
    description.innerText = `${weather.weather[0].description}`;
    bodyIcon.setAttribute(
      'src',
      `assets/img/weather/${weather.weather[0].icon.slice(0, 2)}.svg`
    );
  };

  // запросы к weather api
  const getCityWeather = (city) => weatherApi.cityWeather(city);
  const getForecast = (coords) => weatherApi.getForecast(coords);
  const getCoordWeather = (coords) => weatherApi.coordWeather(coords);

  // запросы к unsplash api
  const getImage = (word) => imageApi.image(word);

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

  const renderDaily = ({ daily }) => {
    forecastEl.innerText = '';
    let out = '';

    daily.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = `${days[date.getDay()]}`;
      const icon = `${item.weather[0].icon.slice(0, 2)}`;
      const temp = `${Math.round(item.temp.day)}`;

      out += getForecastItem(day, icon, temp);
    });

    forecastEl.insertAdjacentHTML('beforeend', out);
  };

  const renderHourly = ({ hourly }) => {
    forecastEl.innerText = '';
    let out = '';

    for (let i = 0; i < 12; i++) {
      const item = hourly[i];
      const date = new Date(item.dt * 1000);
      const time = `${date.getHours()}:0${date.getMinutes()}`;
      const icon = `${item.weather[0].icon.slice(0, 2)}`;
      const temp = `${Math.round(item.temp)}`;

      out += getForecastItem(time, icon, temp);
    }

    forecastEl.insertAdjacentHTML('beforeend', out);
  };

  const setBackground = (imgUrl) => {
    app.style.backgroundImage = `url(${imgUrl})`;
  };

  const renderAutor = (url, name) => {
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

    // активный класс для первого таба
    selectedTab = 'daily';
    setActiveCls(tabsBtns);

    displayInfo(cityWeather);

    const image = await getImage(cityWeather.weather[0].main);
    setBackground(image.urls.full);
    renderAutor(image.user.links.html, image.user.name);

    coord.lon = cityWeather.coord.lon;
    coord.lat = cityWeather.coord.lat;

    const forecast = await getForecast(coord);
    renderDaily(forecast);

    e.target.input__search.value = '';
  };

  const tabHandler = async ({ target }) => {
    const forecast = await getForecast(coord);
    const btn = target.closest('button');

    if (!btn) {
      return;
    }

    deleteCls(tabsBtns, 'tabs__tab--active');

    if (btn.id === 'daily') {
      selectedTab = 'daily';
      setActiveCls(tabsBtns);
      renderDaily(forecast);
    } else {
      selectedTab = 'hourly';
      setActiveCls(tabsBtns);
      renderHourly(forecast);
    }
  };

  const init = () => {
    deleteCls(tabsBtns, 'tabs__tab--active');

    // активный класс для первого таба
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
        renderAutor(image.user.links.html, image.user.name);

        const forecast = await getForecast(coord);

        displayInfo(weather);
        renderDaily(forecast);
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
