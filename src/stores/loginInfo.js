import { defineStore } from 'pinia';

export const useLoginInfoStore = defineStore('loginInfo', {
  state: () => ({
    userInfo: {},
    token: '',
    tenantList: [],
  }),

  getters: {
    GET_USER_INFO: (state) => state.userInfo,
    GET_TOKEN: (state) => state.token,
    GET_TENANT: (state) => state.tenantList,
  },

  actions: {
    UPDATE_USER_INFO(payload) {
      this.userInfo = payload;
    },
    UPDATE_TOKEN(payload) {
      this.token = payload;
    },
    UPDATE_TENANT(payload) {
      this.tenantList = payload;
    },
  },
});
