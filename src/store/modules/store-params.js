import types from '../mutation-types';

const {
  SET_STORE_PARAMS,
} = types;

const state = {
  storeParams: {}
};

const getters = {
  'GET_STORE_PARAMS': state => state.storeParams,
};

const mutations = {
  [SET_STORE_PARAMS](state, payload) {
    const { namespace, params } = payload;
    state.storeParams[namespace] = params;
  },
};

export default {
  state,
  getters,
  mutations
};
