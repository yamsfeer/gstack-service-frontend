import * as assetService from '@/service/asset';

// initial state
const state = {};

const actions = {
  async getServer(context, params) {
    try {
      const res = await assetService.getServer(params);
      return res;
    } catch (err) {}
  },
  async getVmServer(context, params) {
    try {
      const res = await assetService.getVmServer(params);
      return res;
    } catch (err) {}
  },
  async getProduction(context, params) {
    try {
      const res = await assetService.getProduction(params);
      return res;
    } catch (err) {}
  },
  async getLbgroup(context, params) {
    try {
      const res = await assetService.getLbgroup(params);
      return res;
    } catch (err) {}
  },
  async getIdc(context, params) {
    try {
      const res = await assetService.getIdc(params);
      return res;
    } catch (err) {}
  },
  async getDomain(context, params) {
    try {
      const res = await assetService.getDomain(params);
      return res;
    } catch (err) {}
  },
  async getIp(context, params) {
    try {
      const res = await assetService.getIp(params);
      return res;
    } catch (err) {}
  },
  async getVmIp(context, params) {
    try {
      const res = await assetService.getVmIp(params);
      return res;
    } catch (err) {}
  },
  async getVmIdcSubnet(context, params) {
    try {
      const res = await assetService.getVmIdcSubnet(params);
      return res;
    } catch (err) {}
  },
  async getSystems(context, params) {
    try {
      const res = await assetService.getSystems(params);
      return res;
    } catch (err) {}
  },
  async getServerByIds(context, params) {
    try {
      const res = await assetService.getServerByIds(params);
      return res;
    } catch (err) {}
  },
  async getDns(context, params) {
    try {
      const res = await assetService.getDns(params);
      return res;
    } catch (err) {}
  },
  async getServerDetail(context, params) {
    try {
      const res = await assetService.getServerDetail(params);
      return res;
    } catch (err) {}
  },
  async updateServer(context, params) {
    try {
      const res = await assetService.updateServer(params);
      return res;
    } catch (err) {}
  },
  async createServer(context, params) {
    try {
      const res = await assetService.createServer(params);
      return res;
    } catch (err) {}
  },
  async getUserListByUsername(context, params) {
    try {
      const res = await assetService.getUserListByUsername(params);
      return res;
    } catch (err) {}
  },
  async getClusterDetail(context, params) {
    try {
      const res = await assetService.getClusterDetail(params);
      return res;
    } catch (err) {}
  },
  async updateCluster(context, params) {
    try {
      const res = await assetService.updateCluster(params);
      return res;
    } catch (err) {}
  },
  async createCluster(context, params) {
    try {
      const res = await assetService.createCluster(params);
      return res;
    } catch (err) {}
  },
  async getLvsDetail(context, params) {
    try {
      const res = await assetService.getLvsDetail(params);
      return res;
    } catch (err) {}
  },
  async deleteLvs(context, params) {
    try {
      const res = await assetService.deleteLvs(params);
      return res;
    } catch (err) {}
  },
  async createLvs(context, params) {
    try {
      const res = await assetService.createLvs(params);
      return res;
    } catch (err) {}
  },
  async isLvsExistName(context, params) {
    try {
      const res = await assetService.isLvsExistName(params);
      if (res.error_code === 0) {
        return res.data.exists;
      } else {
        return false;
      }
    } catch (err) {}
  },
  async getAssetsIp(context, params) {
    try {
      const res = await assetService.getAssetsIp(params);
      return res;
    } catch (err) {}
  }
};

const mutations = {};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
