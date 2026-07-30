const VUE_APP__ENV = process.env.VUE_APP__ENV;
let config = require('./config.dev.js').default;

if (VUE_APP__ENV === 'mock') {
  config = require('./config.mock.js').default;
} else if (VUE_APP__ENV === 'production') {
  config = require('./config.prod.js').default;
}

export default config;
