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

  /**
   * Получение текушей даты
   * @param {Date} d now date
   * @return {String}  дата в формате day, date month year
   */
  const createDate = (d) => {
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day}, ${date} ${month} ${year}`;
  };

  /**
   * Рендер информации о погоде
   * @param {Object} weather объект с данными погоды
   */
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


      <div class="info__body">
        <div class="info__cityname">
          ${weather.name}
        </div>
        <div class="info__date">
          ${now.getHours()}:${now.getMinutes()} - ${createDate(now)}
        </div>
      </div>

      <div class="info__weather">
        <img class="info__icon" src="assets/img/weather/${weather.weather[0].icon.slice(
          0,
          2
        )}.svg" alt="weathericon" />
        <div class="info__weather-description">${
          weather.weather[0].description
        }</div>
      </div>
    `;

    info.insertAdjacentHTML('beforeend', html);
  };

  /**
   * Созднание верстки элемента прогноза
   * @param {String} time время или день прогноза
   * @param {String} icon имя иконки
   * @param {String} temp температура
   * @return {String} html строка
   */
  const createForecastHTML = (time, icon, temp) => {
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

  /**
   * Получить вёрстку прогноза
   * @param {Array} array массив погодных данных
   * @return {String} html строка
   */
  const getForecastItems = (array) => {
    let time = '';
    let icon = '';
    let temperature = '';
    let out = '';

    array.forEach((item) => {
      const date = new Date(item.dt * 1000);

      time =
        selectedTab === 'daily'
          ? `${days[date.getDay()]}`
          : `${date.getHours()}:0${date.getMinutes()}`;

      icon = `${item.weather[0].icon.slice(0, 2)}`;

      temperature =
        selectedTab === 'daily'
          ? `${Math.round(item.temp.day)}`
          : `${Math.round(item.temp)}`;

      out += createForecastHTML(time, icon, temperature);
    });

    return out;
  };

  /**
   * Вывести на страницу прогноз
   * @param {Object} daily массив данных прогноза по дням
   * @param {Object} hourly массив данных прогноза по часам
   */
  const renderForecast = ({ daily, hourly }) => {
    forecastEl.innerText = '';

    const items =
      selectedTab === 'daily'
        ? getForecastItems(daily)
        : getForecastItems(hourly);

    forecastEl.insertAdjacentHTML('beforeend', items);
  };

  /**
   * Вывести на страницу детальные данные погоды
   * @param {Object} weather объект поогоды
   */
  const renderWeatherDetails = (weather) => {
    weatherDetails.innerText = '';

    const html = `
    <div class="weather-details__item">
          <img
            class="weather-details__icon"
            src="assets/img/cloud-details.svg"
            alt="icon"
          />
          <div class="weather-details__info">
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
          <div class="weather-details__info">
            <div class="weather-details__title">Влажность</div>
            <div class="weather-details__value humidity">${weather.main.humidity}%</div>
          </div>
        </div>

        <div class="weather-details__item">
          <img
            class="weather-details__icon"
            src="assets/img/wind-details.svg"
            alt="icon"
          />
          <div class="weather-details__info">
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
          <div class="weather-details__info">
            <div class="weather-details__title">Давление</div>
            <div class="weather-details__value pressure">${weather.main.pressure}hPa</div>
          </div>
        </div>
    `;

    weatherDetails.insertAdjacentHTML('beforeend', html);
  };

  /**
   * Установить бекграунд
   * @param {String} imgUrl адрес фонового изображения
   */
  const setBackground = (imgUrl) => {
    app.style.backgroundImage = `url(${imgUrl})`;
  };

  /**
   * Вывести на страницу инофрмацию об авторе фото
   * @param {String} url адрес автора фото
   * @param {String} name имя автора фото
   */
  const renderAuthor = (url, name) => {
    autorLink.setAttribute(
      'href',
      `${url}?utm_source=weather_app&utm_medium=referral`
    );

    autorName.innerText = `${name}`;
  };

  /**
   * Удалить класс
   * @param {HTMLElement} elements массив табов
   * @param {String} cls клaсс для удаления
   */
  const deleteCls = (elements, cls) => {
    elements.forEach((item) => {
      if (item.classList.contains(cls)) {
        item.classList.remove(cls);
      }
    });
  };

  /**
   * Установить активный класс
   * @param {HTMLELement} elements массив табов
   */
  const setActiveCls = (elements) => {
    elements.forEach((item) => {
      if (item.id === selectedTab) {
        item.classList.add('tabs__tab--active');
      }
    });
  };

  /**
   * Определить тип устройства
   * @return {Boolean}
   */
  const isMobile = () => {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      console.log('Вы используете мобильное устройство (телефон или планшет).');
      return true;
    }
    console.log('Вы используете ПК.');
    return false;
  };

  /**
   * Получить адрес фото в зависимости от устройства
   * @param {Object} image объект с данными об фото
   * @return {String} адрес фото
   */
  const getImageUrl = (image) =>
    isMobile() ? image.urls.regular : image.urls.full;

  /**
   * Обработка события на получение погоды по городу
   * @param {Event} e
   */
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

    // сделать активный класс для первого таба
    selectedTab = 'daily';
    setActiveCls(tabsBtns);

    renderInfo(cityWeather);
    renderWeatherDetails(cityWeather);

    const image = await getImage(cityWeather.weather[0].main);

    setBackground(getImageUrl(image));
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
    // сделать активный класс для первого таба
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

        setBackground(getImageUrl(image));
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
