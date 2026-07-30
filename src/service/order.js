// 工单
import http from '@/utils/http';
import config from '@/config';

const URL = config.API_GOD;
const ASSET = config.API_GOD_LVS;
const DNS = '/dns_module/api/v1/dns';
const VM = config.API_GOD_VM;
const NAT = '/nat/api/v1';

export function getConfigData(param) {
  return http.get(`/vm_collection_tasks`, { params: param });
}

export function getOrderType() {
  return http.get(`/ticket_types`);
}

export function createOrder(param) {
  return http.post(`/tickets?cmd=CreateTicket`, param);
}

export function updateOrder(param) {
  return http.put(`/ticket/${param.id}`, param.param);
}

export function delVmDeleteTask(param) {
  return http.delete(`/vm_collection_task/${param.id}`);
}

export function getOrderList(query) {
  return http.get(`/tickets?${transformRequest(query)}`);
}

export function getOrderDetail(id) {
  return http.get(`/ticket/${id}`);
}

export function updateStateByAction(id, param) {
  return http.post(`/ticket/${id}?cmd=UpdateStateByAction`, param);
}

export function batchUpdateStateByAction(param) {
  return http.post(`/tickets?cmd=BatchUpdateStateByAction`, param);
}

export function deleteOrder(id) {
  return http.delete(`/ticket/${id}`);
}

export function handleOrder(id, param) {
  return http.put(`/ticket/${id}`, param);
}

// 校验lvs
export function checkLvs(param) {
  const type = param.type.toLowerCase();
  return http.post(`${URL}${ASSET}/${type}/check`, {master_ip_list: param.master_ip_list, port_list: param.port_list});
}
// 校验lvs的机柜是否相同
export function checkCabinet(param) {
  return http.post(`${URL}${ASSET}/cabinet/check`, param);
}

// 根据server_uuids获取关联的lvs
export function getRelatedLvs(param) {
  return http.post(`${URL}${ASSET}/lvs/related`, param);
}

// 根据server_uuids获取关联的nat
export function getRelatedNat(param) {
  return http.post(`${URL}${NAT}/nat_instances`, param);
}

// 校验dns的exist
export function checkDns(param) {
  return http.get(`${URL}${DNS}/exist`, { params: param });
}
// 校验dns的参数
export function checkDnsParam(param) {
  return http.get(`${URL}${DNS}/check`, { params: param });
}

// 各工单的日志获取
export function getVmDeleteLog(param) {
  return http.get(`/vms?cmd=GetTaskLog`, { params: param });
}

export function getLvsLog(ticketId) {
  return http.get(`${URL}${ASSET}/log/${ticketId}`);
}

export function getNatLog(ticketId) {
  return http.get(`${URL}${NAT}/nat_log/${ticketId}`);
}

export function getVmLog(taskId) {
  return http.get(`${URL}${VM}/task_log/${taskId}`);
}

export function getVmConfig(ticketId) {
  return http.get(`${URL}${VM}/ticket/${ticketId}`);
}

export function deleteVmTask(taskId) {
  return http.delete(`${URL}${VM}/vm_task/${taskId}`);
}

function transformRequest(obj) {
  let str = [];
  for (let p in obj) {
    if (obj[p] instanceof Array) {
      str.push(encodeURIComponent(p) + '=' + JSON.stringify(obj[p]));
    } else {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}
