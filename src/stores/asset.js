import { defineStore } from 'pinia';
import * as assetService from '@/service/asset';

export const useAssetStore = defineStore('asset', {
  state: () => ({}),

  actions: {
    async getServer(params) { return await assetService.getServer(params); },
    async getVmServer(params) { return await assetService.getVmServer(params); },
    async getProduction(params) { return await assetService.getProduction(params); },
    async getLbgroup(params) { return await assetService.getLbgroup(params); },
    async getIdc(params) { return await assetService.getIdc(params); },
    async getDomain(params) { return await assetService.getDomain(params); },
    async getIp(params) { return await assetService.getIp(params); },
    async getVmIp(params) { return await assetService.getVmIp(params); },
    async getVmIdcSubnet(params) { return await assetService.getVmIdcSubnet(params); },
    async getSystems(params) { return await assetService.getSystems(params); },
    async getServerByIds(params) { return await assetService.getServerByIds(params); },
    async getDns(params) { return await assetService.getDns(params); },
    async getServerDetail(params) { return await assetService.getServerDetail(params); },
    async updateServer(params) { return await assetService.updateServer(params); },
    async createServer(params) { return await assetService.createServer(params); },
    async getUserListByUsername(params) { return await assetService.getUserListByUsername(params); },
    async getClusterDetail(params) { return await assetService.getClusterDetail(params); },
    async updateCluster(params) { return await assetService.updateCluster(params); },
    async createCluster(params) { return await assetService.createCluster(params); },
    async getLvsDetail(params) { return await assetService.getLvsDetail(params); },
    async deleteLvs(params) { return await assetService.deleteLvs(params); },
    async createLvs(params) { return await assetService.createLvs(params); },
    async isLvsExistName(params) { return await assetService.isLvsExistName(params); },
    async getAssetsIp(params) { return await assetService.getAssetsIp(params); },
  },
});
