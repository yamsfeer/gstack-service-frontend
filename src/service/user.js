// 用户信息接口
import http from '@/utils/http';
import config from '@/config';

const URL = config.API_GOD;
const USER = '/lanus';
const TENANT = '/tenant_management';
export function detail(id) {
  return http.get(`/user/${id}.json`);
}

// post case
export function create(user) {
  return http.post('/user', user);
}

export function getUserList(query) {
  return http.get(`${URL}${USER}/api/v1/users`, { params: query });
}

export function getGroupList(query) {
  return http.get(`${URL}${USER}/api/v1/groups`, { params: query });
}

export function getUserByIds(query) {
  return http.post(`${URL}${USER}/api/v1/users?cmd=GetUserListById`, query);
}

export function getGroupByIds(query) {
  return http.post(`${URL}${USER}/api/v1/groups?cmd=GetGroupListById`, query);
}

export function getUserTenant(isAll) {
  return isAll ? http.get(`${URL}${TENANT}/api/v1/getTenat`, { params: { page: 1, pagesize: 100 } }) : http.get(`${URL}${TENANT}/api/v1/getTenantsOfuser`);
}

export function getAuthToken(param) {
  return http.get(`${URL}/auth`, { params: param });
}

export function getUserInfo() {
  return http.get(`${URL}${USER}/api/v1/user/0`);
}

export function logout() {
  return http.post(`${URL}${USER}/api/v1/user/0?cmd=Logout`);
}
