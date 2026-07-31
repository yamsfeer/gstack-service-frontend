import types from '../mutation-types';
import * as orderService from '@/service/order';
import {
  LOADING,
  SUCCESS,
  FAIL
} from '@/stores/vuex-compat';

const {
  GET_ORDER_TYPE,
  GET_ORDER_TYPE_SUCCESS,
  GET_ORDER_TYPE_FAILURE,

  GET_ORDER_LIST,
  GET_ORDER_LIST_SUCCESS,
  GET_ORDER_LIST_FAILURE,

  GET_ORDER_DETAIL,
  GET_ORDER_DETAIL_SUCCESS,
  GET_ORDER_DETAIL_FAILURE
} = types;

// initial state
const state = {
  orderType: [],
  orderTypeStatus: SUCCESS,
  orderList: [],
  orderListStatus: SUCCESS,
  orderListTotal: 0,
  orderDetail: {},
  orderDetailStatus: SUCCESS
};

const actions = {
  async getConfigData(context, params) {
    try {
      const res = await orderService.getConfigData(params);
      return res;
    } catch (err) { }
  },
  async getOrderType(context) {
    const {
      commit
    } = context;
    try {
      commit(GET_ORDER_TYPE);
      const res = await orderService.getOrderType();
      if (res.error_code === 0) {
        commit(GET_ORDER_TYPE_SUCCESS, res);
      } else {
        commit(GET_ORDER_TYPE_FAILURE, res);
      }
    } catch (err) {
      commit(GET_ORDER_TYPE_FAILURE, err);
    }
  },
  async getOrderList(context, params) {
    const {
      commit
    } = context;
    try {
      commit(GET_ORDER_LIST, params);
      const res = await orderService.getOrderList(params);
      if (res.error_code === 0) {
        commit(GET_ORDER_LIST_SUCCESS, res);
      } else {
        commit(GET_ORDER_LIST_FAILURE, res);
      }
    } catch (err) {
      commit(GET_ORDER_LIST_FAILURE, err);
    }
  },
  async getOrderDetail(context, params) {
    const {
      commit
    } = context;
    try {
      commit(GET_ORDER_DETAIL, params);
      const res = await orderService.getOrderDetail(params);
      if (res.error_code === 0) {
        commit(GET_ORDER_DETAIL_SUCCESS, res);
      } else {
        commit(GET_ORDER_DETAIL_FAILURE, res);
      }
    } catch (err) {
      commit(GET_ORDER_DETAIL_FAILURE, err);
    }
  },
  async createOrder(context, params) {
    try {
      const res = await orderService.createOrder(params);
      return res;
    } catch (err) {}
  },
  async updateOrder(context, params) {
    try {
      const res = await orderService.updateOrder(params);
      return res;
    } catch (err) {}
  },
  // 删除虚拟机删除某主机的任务
  async delVmDeleteTask(context, params) {
    try {
      const res = await orderService.delVmDeleteTask(params);
      return res;
    } catch (err) {}
  },
  async batchUpdateStateByAction(context, params) {
    try {
      const res = await orderService.batchUpdateStateByAction(params);
      return res;
    } catch (err) {}
  },
  async updateStateByAction(context, params) {
    try {
      const res = await orderService.updateStateByAction(params.id, params.param);
      return res;
    } catch (err) {}
  },
  async checkLvs(context, params) {
    try {
      const res = await orderService.checkLvs(params);
      return res;
    } catch (err) {}
  },
  async checkDnsParam(context, params) {
    try {
      const res = await orderService.checkDnsParam(params);
      return res;
    } catch (err) {}
  },
  async checkDns(context, params) {
    try {
      const res = await orderService.checkDns(params);
      return res;
    } catch (err) {}
  },
  async getRelatedLvs(context, params) {
    try {
      const res = await orderService.getRelatedLvs(params);
      return res;
    } catch (err) {}
  },
  async getRelatedNat(context, params) {
    try {
      const res = await orderService.getRelatedNat(params);
      return res;
    } catch (err) {}
  },
  async checkCabinet(context, params) {
    try {
      const res = await orderService.checkCabinet(params);
      return res;
    } catch (err) {}
  },
  async getVmDeleteLog(context, params) {
    try {
      const res = await orderService.getVmDeleteLog(params);
      return res;
    } catch (err) {}
  },
  async getLvsLog(context, params) {
    try {
      const res = await orderService.getLvsLog(params);
      return res;
    } catch (err) {}
  },
  async getNatLog(context, params) {
    try {
      const res = await orderService.getNatLog(params);
      return res;
    } catch (err) {}
  },
  async getVmLog(context, params) {
    try {
      const res = await orderService.getVmLog(params);
      return res;
    } catch (err) {}
  },
  async getVmConfig(context, params) {
    try {
      const res = await orderService.getVmConfig(params);
      return res;
    } catch (err) {}
  },
  async deleteVmTask(context, params) {
    try {
      const res = await orderService.deleteVmTask(params);
      return res;
    } catch (err) {}
  }
};

const mutations = {
  [GET_ORDER_TYPE]() {
    state.orderTypeStatus = LOADING;
  },

  [GET_ORDER_TYPE_SUCCESS](state, res) {
    state.orderTypeStatus = SUCCESS;
    state.orderType = res;
  },

  [GET_ORDER_TYPE_FAILURE]() {
    state.orderTypeStatus = FAIL;
  },

  [GET_ORDER_LIST]() {
    state.orderListStatus = LOADING;
  },

  [GET_ORDER_LIST_SUCCESS](state, res) {
    state.orderListStatus = SUCCESS;
    state.orderList = res.data.tickets;
    state.orderListTotal = res.data.total;
  },

  [GET_ORDER_LIST_FAILURE]() {
    state.orderListStatus = FAIL;
  },

  [GET_ORDER_DETAIL]() {
    state.orderDetailStatus = LOADING;
  },

  [GET_ORDER_DETAIL_SUCCESS](state, res) {
    state.orderDetailStatus = SUCCESS;
    state.orderDetail = res.data;
  },

  [GET_ORDER_DETAIL_FAILURE]() {
    state.orderDetailStatus = FAIL;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
