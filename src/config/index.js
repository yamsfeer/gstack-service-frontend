import configDev from './config.dev.js';
import configMock from './config.mock.js';
import configProd from './config.prod.js';

const VUE_APP__ENV = import.meta.env.VITE_APP__ENV || '';
let config = configDev;

if (VUE_APP__ENV === 'mock') {
  config = configMock;
} else if (VUE_APP__ENV === 'production') {
  config = configProd;
}

export default config;
