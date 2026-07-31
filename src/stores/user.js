import { defineStore } from 'pinia';
import * as userService from '@/service/user';

const LOADING = 'LOADING';
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';

export const useUserStore = defineStore('user', {
  state: () => ({
    detail: {},
    detailStatus: SUCCESS,
    userList: [],
    userListStatus: SUCCESS,
    userListTotal: 0,
    groupList: [],
    groupListStatus: SUCCESS,
    groupListTotal: 0,
  }),

  actions: {
    async getUserDetail(id) {
      this.detailStatus = LOADING;
      try {
        const res = await userService.detail(id);
        this.detail = res.data;
        this.detailStatus = SUCCESS;
        return res;
      } catch (err) {
        this.detailStatus = FAIL;
        throw err;
      }
    },
    async getUserList(param) {
      this.userListStatus = LOADING;
      try {
        const res = await userService.getUserList(param);
        if (res.error_code === 0) {
          this.userList = res.data.users;
          this.userListTotal = res.data.total;
          this.userListStatus = SUCCESS;
        } else {
          this.userListStatus = FAIL;
        }
      } catch (err) {
        this.userListStatus = FAIL;
        throw err;
      }
    },
    async getGroupList(param) {
      this.groupListStatus = LOADING;
      try {
        const res = await userService.getGroupList(param);
        if (res.error_code === 0) {
          this.groupList = res.data.groups;
          this.groupListTotal = res.data.total;
          this.groupListStatus = SUCCESS;
        } else {
          this.groupListStatus = FAIL;
        }
      } catch (err) {
        this.groupListStatus = FAIL;
        throw err;
      }
    },
    async getUserByIds(params) {
      return await userService.getUserByIds(params);
    },
    async getGroupByIds(params) {
      return await userService.getGroupByIds(params);
    },
    async getUserTenant(params) {
      return await userService.getUserTenant(params);
    },
  },
});
