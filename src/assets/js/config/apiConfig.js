const weatherConfig = {
  url: 'https://api.openweathermap.org/data/2.5',
  key: process.env.OPENWEATHER_API_KEY,
};

const imageConfig = {
  url: 'https://api.unsplash.com',
  key: process.env.UNSPLASH_API_KEY,
};

const ipConfig = {
  url: 'https://geo.ipify.org/api',
  key: process.env.IP_API_KEY,
};

export { weatherConfig, imageConfig, ipConfig };
