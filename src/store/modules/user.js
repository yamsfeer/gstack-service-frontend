import types from '@/store/mutation-types';
import {
  LOADING,
  SUCCESS,
  FAIL
} from '@/stores/vuex-compat';
import * as userService from '@/service/user';

const {
  GET_USER_DETAIL,
  GET_USER_DETAIL_SUCCESS,
  GET_USER_DETAIL_FAILURE,

  GET_USER_LIST,
  GET_USER_LIST_SUCCESS,
  GET_USER_LIST_FAILURE,

  GET_GROUP_LIST,
  GET_GROUP_LIST_SUCCESS,
  GET_GROUP_LIST_FAILURE
} = types;

// initial state
const state = {
  detail: {},
  detailStatus: SUCCESS,

  userList: [],
  userListStatus: SUCCESS,
  userListTotal: 0,

  groupList: [],
  groupListStatus: SUCCESS,
  groupListTotal: 0
};

const actions = {
  async getUserDetail(context, id) {
    const {
      commit
    } = context;

    try {
      commit(GET_USER_DETAIL, id);
      const res = await userService.detail(id);
      commit(GET_USER_DETAIL_SUCCESS, res);
      return res;
    } catch (err) {
      commit(GET_USER_DETAIL_FAILURE, err);
      throw err;
    }
  },
  async getUserList(context, param) {
    const {
      commit
    } = context;

    try {
      commit(GET_USER_LIST, param);
      const res = await userService.getUserList(param);
      if (res.error_code === 0) {
        commit(GET_USER_LIST_SUCCESS, res);
      } else {
        commit(GET_USER_LIST_FAILURE, res);
      }
    } catch (err) {
      commit(GET_USER_LIST_FAILURE, err);
      throw err;
    }
  },
  async getGroupList(context, param) {
    const {
      commit
    } = context;

    try {
      commit(GET_GROUP_LIST, param);
      const res = await userService.getGroupList(param);
      if (res.error_code === 0) {
        commit(GET_GROUP_LIST_SUCCESS, res);
      } else {
        commit(GET_GROUP_LIST_FAILURE, res);
      }
    } catch (err) {
      commit(GET_GROUP_LIST_FAILURE, err);
      throw err;
    }
  },
  async getUserByIds(context, params) {
    try {
      const res = await userService.getUserByIds(params);
      return res;
    } catch (err) {}
  },
  async getGroupByIds(context, params) {
    try {
      const res = await userService.getGroupByIds(params);
      return res;
    } catch (err) {}
  },
  async getUserTenant(context, params) {
    try {
      const res = await userService.getUserTenant(params);
      return res;
    } catch (err) {}
  }
};

const mutations = {
  // detail
  [GET_USER_DETAIL]() {
    state.detailStatus = LOADING;
  },
  [GET_USER_DETAIL_SUCCESS](state, payload) {
    state.detail = payload.data;
    state.detailStatus = SUCCESS;
  },
  [GET_USER_DETAIL_FAILURE]() {
    state.detailStatus = FAIL;
  },
  [GET_USER_LIST]() {
    state.userListStatus = LOADING;
  },
  [GET_USER_LIST_SUCCESS](state, res) {
    state.userListStatus = SUCCESS;
    state.userList = res.data.users;
    state.userListTotal = res.data.total;
  },
  [GET_USER_LIST_FAILURE]() {
    state.userListStatus = FAIL;
  },
  [GET_GROUP_LIST]() {
    state.groupListStatus = LOADING;
  },
  [GET_GROUP_LIST_SUCCESS](state, res) {
    state.groupListStatus = SUCCESS;
    state.groupList = res.data.groups;
    state.groupListTotal = res.data.total;
  },
  [GET_GROUP_LIST_FAILURE]() {
    state.groupListStatus = FAIL;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
