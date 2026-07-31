import { defineStore } from 'pinia';
import * as orderService from '@/service/order';

const LOADING = 'LOADING';
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderType: [],
    orderTypeStatus: SUCCESS,
    orderList: [],
    orderListStatus: SUCCESS,
    orderListTotal: 0,
    orderDetail: {},
    orderDetailStatus: SUCCESS,
  }),

  actions: {
    async getConfigData(params) {
      return await orderService.getConfigData(params);
    },
    async getOrderType() {
      this.orderTypeStatus = LOADING;
      try {
        const res = await orderService.getOrderType();
        if (res.error_code === 0) {
          this.orderType = res;
          this.orderTypeStatus = SUCCESS;
        } else {
          this.orderTypeStatus = FAIL;
        }
      } catch {
        this.orderTypeStatus = FAIL;
      }
    },
    async getOrderList(params) {
      this.orderListStatus = LOADING;
      try {
        const res = await orderService.getOrderList(params);
        if (res.error_code === 0) {
          this.orderList = res.data.tickets;
          this.orderListTotal = res.data.total;
          this.orderListStatus = SUCCESS;
        } else {
          this.orderListStatus = FAIL;
        }
      } catch {
        this.orderListStatus = FAIL;
      }
    },
    async getOrderDetail(params) {
      this.orderDetailStatus = LOADING;
      try {
        const res = await orderService.getOrderDetail(params);
        if (res.error_code === 0) {
          this.orderDetail = res.data;
          this.orderDetailStatus = SUCCESS;
        } else {
          this.orderDetailStatus = FAIL;
        }
      } catch {
        this.orderDetailStatus = FAIL;
      }
    },
    async createOrder(params) {
      return await orderService.createOrder(params);
    },
    async updateOrder(params) {
      return await orderService.updateOrder(params);
    },
    async delVmDeleteTask(params) {
      return await orderService.delVmDeleteTask(params);
    },
    async batchUpdateStateByAction(params) {
      return await orderService.batchUpdateStateByAction(params);
    },
    async updateStateByAction(params) {
      return await orderService.updateStateByAction(params.id, params.param);
    },
    async checkLvs(params) {
      return await orderService.checkLvs(params);
    },
    async checkDnsParam(params) {
      return await orderService.checkDnsParam(params);
    },
    async checkDns(params) {
      return await orderService.checkDns(params);
    },
    async getRelatedLvs(params) {
      return await orderService.getRelatedLvs(params);
    },
    async getRelatedNat(params) {
      return await orderService.getRelatedNat(params);
    },
    async checkCabinet(params) {
      return await orderService.checkCabinet(params);
    },
    async getVmDeleteLog(params) {
      return await orderService.getVmDeleteLog(params);
    },
    async getLvsLog(params) {
      return await orderService.getLvsLog(params);
    },
    async getNatLog(params) {
      return await orderService.getNatLog(params);
    },
    async getVmLog(params) {
      return await orderService.getVmLog(params);
    },
    async getVmConfig(params) {
      return await orderService.getVmConfig(params);
    },
    async deleteVmTask(params) {
      return await orderService.deleteVmTask(params);
    },
  },
});
