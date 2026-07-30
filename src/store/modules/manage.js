import types from '../mutation-types';
import * as manageService from '@/service/manage';
import {
  LOADING,
  SUCCESS,
  FAIL
} from '@/store/status';

const {
  GET_MANAGE_LIST,
  GET_MANAGE_LIST_SUCCESS,
  GET_MANAGE_LIST_FAILURE
} = types;

// initial state
const state = {
  manageList: [],
  manageListStatus: SUCCESS,
  manageListTotal: 0
};

const actions = {
  async getManageList(context, params) {
    const {
      commit
    } = context;
    try {
      commit(GET_MANAGE_LIST, params);
      const res = await manageService.getManageList(params);
      if (res.error_code === 0) {
        commit(GET_MANAGE_LIST_SUCCESS, res);
      } else {
        commit(GET_MANAGE_LIST_FAILURE, res);
      }
    } catch (err) {
      commit(GET_MANAGE_LIST_FAILURE, err);
    }
  },
  async createProcess(context, params) {
    try {
      const res = await manageService.createProcess(params);
      return res;
    } catch (err) {}
  },
  async deleteProcess(context, id) {
    try {
      const res = await manageService.deleteProcess(id);
      return res;
    } catch (err) {}
  },
  async updateProcess(context, params) {
    try {
      const res = await manageService.updateProcess(params.id, params.param);
      return res;
    } catch (err) {}
  },
  async getProcessDetail(context, params) {
    try {
      const res = await manageService.getProcessDetail(params);
      return res;
    } catch (err) {}
  },
  async isExistName(context, params) {
    try {
      const res = await manageService.isExistName(params);
      if (res.error_code === 0) {
        return res.data.exists;
      } else {
        return false;
      }
    } catch (err) {}
  }
};

const mutations = {
  [GET_MANAGE_LIST]() {
    state.manageListStatus = LOADING;
  },

  [GET_MANAGE_LIST_SUCCESS](state, res) {
    state.manageListStatus = SUCCESS;
    state.manageList = res.data.processes;
    state.manageListTotal = res.data.total;
  },

  [GET_MANAGE_LIST_FAILURE]() {
    state.manageListStatus = FAIL;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
