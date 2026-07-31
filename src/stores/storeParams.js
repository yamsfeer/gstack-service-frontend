import { defineStore } from 'pinia';

export const useStoreParamsStore = defineStore('storeParams', {
  state: () => ({
    storeParams: {},
  }),

  getters: {
    GET_STORE_PARAMS: (state) => state.storeParams,
  },

  actions: {
    SET_STORE_PARAMS({ namespace, params }) {
      this.storeParams[namespace] = params;
    },
  },
});
