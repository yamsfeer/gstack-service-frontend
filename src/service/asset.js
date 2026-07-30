// 获取一些资产选项数据，例如：机房，产品线，ip，服务器，集群，dns的域
import http from '@/utils/http';
import axios from 'axios';
import config from '@/config';
import { transformRequest } from '@/utils/utils';

const URL = config.API_GOD;
const ASSET = config.API_GOD_LVS;
// '/lvs/qa/api/v1';
const DNS = '/dns_module/api/v1/dns';
const VM = config.API_GOD_VM;

export function getServer(query) {
  return http.post(`${URL}${ASSET}/servers?page=${query.page}&size=${query.size}`, {
    equals: query.equals,
    contains: query.contains,
    not_equals: query.not_equals,
    tenant: query.tenant,
    user_id: query.user_id
  });
}

/* 获取vm审核时的Subnet */
export function getVmIdcSubnet(idc) {
  return http.get(`${URL}${VM}/idc_subnet`, { params: { idc } });
}
/* 获取vm审核时的Server */
export function getVmServer(query) {
  return http.get(`${URL}${VM}/host_server`, { params: query });
}

/* 获取vm审核时的Ip */
export function getVmIp(query) {
  return http.get(`${URL}${VM}/subnet_ip`, { params: query });
}

export function getProduction(query) {
  return http.post(`${URL}${ASSET}/productions`, query);
}

export function getLbgroup(query) {
  return http.post(`${URL}${ASSET}/lbgroups?page=${query.page}&size=${query.size}`, {
    contains: query.contains,
    equals: query.equals
  });
}

export function getIdc(query) {
  return http.post(`${URL}${ASSET}/idcs`, query);
}

export function getDomain(param) {
  return http.get(`${URL}${DNS}/domain`, { params: param });
}

export function getDns(param) {
  return http.get(`${URL}${DNS}`, { params: param });
}

export function getIp(query) {
  return http.post(`${URL}${ASSET}/ips?page=${query.page}&size=${query.size}`, {
    equals: query.equals,
    contains: query.contains
  });
}

export function getSystems(param) {
  return http.post(`${URL}${ASSET}/systems`, { params: param });
}

export function getServerByIds(param) {
  return http.post(`${URL}${ASSET}/servers/uuid`, param);
}

// server
export function getAssetsServerOption(param) {
  return http.get(`/asset/server/searchers`);
}

export function getAssetsServer(param) {
  return http.get(`/asset/servers?${transformRequest(param)}`);
}

export function getServerDetail(id) {
  return http.get(`/asset/server/${id}`);
}

export function updateServer({ id, param }) {
  return http.put(`/asset/server/${id}`, param);
}

export function createServer(param) {
  return http.post(`/asset/servers`, param);
}

export function batchServer(param) {
  return http.post(`/asset/servers/batch`, param);
}

export function getUserListByUsername(param) {
  return http.post(`${URL}/lanus/api/v1/users?cmd=GetUserListByUsername`, param);
}

// cluster
export function getAssetsClusterOption(param) {
  return http.get(`/asset/lb_group/searchers`);
}

export function getAssetsCluster(param) {
  return http.get(`/asset/lb_groups?${transformRequest(param)}`);
}

export function getClusterDetail(id) {
  return http.get(`/asset/lb_group/${id}`);
}

export function delAssetsCluster(id) {
  return http.delete(`/asset/lb_group/${id}`);
}

export function updateCluster({ id, param }) {
  return http.put(`/asset/lb_group/${id}`, param);
}

export function createCluster(param) {
  return http.post(`/asset/lb_groups`, param);
}

// lvs
export function getAssetsLvsOption(param) {
  return http.get(`/asset/lvs/searchers`);
}

export function getAssetsLvs(param) {
  return http.get(`/asset/lvss?${transformRequest(param)}`);
}

export function getLvsDetail(id) {
  return http.get(`/asset/lvs/${id}`);
}

export function createLvs(param) {
  return http.post(`/asset/lvss`, param);
}

export function deleteLvs(instanceName) {
  return http.delete(`/asset/lvs/${instanceName}`);
}

export function isLvsExistName(instanceName) {
  return http.get(`/asset/lvs/${instanceName}/exists`);
}

// nat
export function getAssetsNatOption(param) {
  return http.get(`/asset/nat/searchers`);
}

export function getAssetsNat(param) {
  return http.get(`/asset/nats?${transformRequest(param)}`);
}

export function delAssetsNat(id) {
  return http.delete(`/asset/nat/${id}`);
}

// ip
export function getAssetsIpOption(param) {
  return http.get(`/asset/ip/searchers`);
}

export function getAssetsIp(param) {
  return http.get(`/asset/ips?${transformRequest(param)}`);
}

export function createAssetsIpBatch(param) {
  return http.post(`/asset/ips/batch`, param);
}

export function updateAssetsIp(id, param) {
  return http.patch(`/asset/ip/${id}`, param);
}

// dns
export function getAssetsDnsOption(param) {
  return http.get(`/asset/dns/searchers`);
}

export function getAssetsDns(param) {
  return http.get(`/asset/dnss?${transformRequest(param)}`);
}

export function updateAssetsDns(param) {
  return http.put(`/asset/dns/${param.domain}`, param.param);
}

export function retryUpdateAssetsDns(domain, params) {
  return http.put(`/asset/dns/retry/${domain}`, params);
}

export function fetchTaskMessage(ids) {
  return http.get(`${URL}${DNS}/tasklist?ids=${ids.join(',')}`);
}

export function deleteAssetsDns(params) {
  return axios.delete(`/asset/dns`, { data: params });
}

// netmap
export function getAssetsNetMapOption(param) {
  return http.get(`/asset/net_mapping/searchers`);
}

export function getAssetsNetMap(param) {
  return http.get(`/asset/net_mappings?${transformRequest(param)}`);
}

export function getHostName() {
  return http.get(`${URL}${VM}/new_hostname`);
}

export function getSubnetByIdc(param) {
  return http.get(`/asset/ip/statistics?${transformRequest(param)}`);
}
