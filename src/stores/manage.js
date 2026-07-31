import { defineStore } from 'pinia';
import * as manageService from '@/service/manage';

const LOADING = 'LOADING';
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';

export const useManageStore = defineStore('manage', {
  state: () => ({
    manageList: [],
    manageListStatus: SUCCESS,
    manageListTotal: 0,
  }),

  actions: {
    async getManageList(params) {
      this.manageListStatus = LOADING;
      try {
        const res = await manageService.getManageList(params);
        if (res.error_code === 0) {
          this.manageList = res.data.processes;
          this.manageListTotal = res.data.total;
          this.manageListStatus = SUCCESS;
        } else {
          this.manageListStatus = FAIL;
        }
      } catch {
        this.manageListStatus = FAIL;
      }
    },
    async createProcess(params) {
      return await manageService.createProcess(params);
    },
    async deleteProcess(id) {
      return await manageService.deleteProcess(id);
    },
    async updateProcess(params) {
      return await manageService.updateProcess(params.id, params.param);
    },
    async getProcessDetail(params) {
      return await manageService.getProcessDetail(params);
    },
    async isExistName(params) {
      const res = await manageService.isExistName(params);
      if (res.error_code === 0) {
        return res.data.exists;
      }
      return false;
    },
  },
});
