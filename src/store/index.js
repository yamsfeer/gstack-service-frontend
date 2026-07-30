import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);

const useLogger = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
  modules,
  plugins: useLogger ? [createLogger({})] : []
});

export default store;
