const state = {
  userInfo: {},
  token: '',
  tenantList: []
};

const getters = {
  'GET_USER_INFO': state => state.userInfo,
  'GET_TOKEN': state => state.token,
  'GET_TENANT': state => state.tenantList
};

const mutations = {
  'UPDATE_USER_INFO' (state, payload) {
    state.userInfo = payload;
  },
  'UPDATE_TOKEN' (state, payload) {
    state.token = payload;
  },
  'UPDATE_TENANT' (state, payload) {
    state.tenantList = payload;
  }
};

export default {
  state,
  getters,
  mutations
};
