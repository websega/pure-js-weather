import { ipConfig } from '../config/apiConfig';

class IpPositionApi {
  constructor(config) {
    this.url = config.url;
    this.key = config.key;
  }

  async ip() {
    try {
      const response = await fetch(`${this.url}/v1?apiKey=${this.key}`);

      if (!response.ok) {
        throw new Error(
          `Не удалось получить ${this.url}, код ошибки ${response.status}`
        );
      }

      return response.json();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const ipApi = new IpPositionApi(ipConfig);

export default ipApi;
