import { weatherConfig } from '../config/apiConfig';

class WeatherApi {
  constructor(config) {
    this.url = config.url;
    this.key = config.key;
  }

  // при поиске по названию города
  async cityWeather(cityName) {
    try {
      const response = await fetch(
        `${this.url}/weather?q=${cityName}&units=metric&lang=ru&appid=${this.key}`
      );

      if (!response.ok) {
        throw new Error(
          `Не удалось получить ${this.url}, код ошибки ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // на несколько дней по координатам
  async getForecast({ lon, lat }) {
    try {
      const response = await fetch(
        `${this.url}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,current,alerts&units=metric&lang=ru&appid=${this.key}`
      );

      if (!response.ok) {
        throw new Error(
          `Не удалось получить ${this.url}, код ошибки ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // по координатам при загрузке
  async coordWeather({ lon, lat }) {
    try {
      const response = await fetch(
        `${this.url}/weather?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${this.key}`
      );

      if (!response.ok) {
        throw new Error(
          `Не удалось получить ${this.url}, код ошибки ${response.status}`
        );
      }

      return await response.json();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const weatherApi = new WeatherApi(weatherConfig);

export default weatherApi;
