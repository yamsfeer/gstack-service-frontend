// 流程管理
import http from '@/utils/http';

export function getManageList(query) {
  return http.get(`/processes`, {params: query});
}

export function createProcess(param) {
  return http.post(`/processes?cmd=CreateProcess`, param);
}

export function isExistName(param) {
  return http.post(`/processes?cmd=NameExists`, param);
}

export function deleteProcess(id) {
  return http.delete(`/process/${id}`);
}

export function updateProcess(id, param) {
  return http.put(`/process/${id}`, param);
}

export function getProcessDetail(id) {
  return http.get(`/process/${id}`);
}