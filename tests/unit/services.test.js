import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios 模块，service 层通过 '@/utils/http'（即 axios 默认导出）发请求
const { httpMock } = vi.hoisted(() => ({
  httpMock: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

vi.mock('@/utils/http', () => ({
  default: httpMock,
}));

import * as orderService from '@/service/order';
import * as manageService from '@/service/manage';
import * as userService from '@/service/user';
import * as assetService from '@/service/asset';

describe('service/order.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOrderType 请求工单类型', () => {
    orderService.getOrderType();
    expect(httpMock.get).toHaveBeenCalledWith('/ticket_types');
  });

  it('createOrder 创建工单', () => {
    const param = { type: 1, description: 'test' };
    orderService.createOrder(param);
    expect(httpMock.post).toHaveBeenCalledWith('/tickets?cmd=CreateTicket', param);
  });

  it('updateOrder 更新工单', () => {
    orderService.updateOrder({ id: 100, param: { resource: {} } });
    expect(httpMock.put).toHaveBeenCalledWith('/ticket/100', { resource: {} });
  });

  it('delVmDeleteTask 删除收集任务', () => {
    orderService.delVmDeleteTask({ id: 'task-1' });
    expect(httpMock.delete).toHaveBeenCalledWith('/vm_collection_task/task-1');
  });

  it('getOrderList 拼接查询参数', () => {
    orderService.getOrderList({ page: 1, page_size: 10, state: [1, 2] });
    expect(httpMock.get).toHaveBeenCalledWith('/tickets?page=1&page_size=10&state=[1,2]');
  });

  it('getOrderDetail 获取详情', () => {
    orderService.getOrderDetail(100);
    expect(httpMock.get).toHaveBeenCalledWith('/ticket/100');
  });

  it('updateStateByAction 状态流转', () => {
    orderService.updateStateByAction(100, { action: 1 });
    expect(httpMock.post).toHaveBeenCalledWith('/ticket/100?cmd=UpdateStateByAction', { action: 1 });
  });

  it('batchUpdateStateByAction 批量状态流转', () => {
    orderService.batchUpdateStateByAction({ ids: [1, 2], action: 12 });
    expect(httpMock.post).toHaveBeenCalledWith('/tickets?cmd=BatchUpdateStateByAction', { ids: [1, 2], action: 12 });
  });

  it('deleteOrder 删除工单', () => {
    orderService.deleteOrder(100);
    expect(httpMock.delete).toHaveBeenCalledWith('/ticket/100');
  });

  it('handleOrder 处理工单', () => {
    orderService.handleOrder(100, { a: 1 });
    expect(httpMock.put).toHaveBeenCalledWith('/ticket/100', { a: 1 });
  });

  it('checkLvs 校验 LVS 端口', () => {
    orderService.checkLvs({ type: 'http', master_ip_list: ['1.1.1.1'], port_list: [80] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/http/check', { master_ip_list: ['1.1.1.1'], port_list: [80] });
  });

  it('checkCabinet 校验机柜', () => {
    orderService.checkCabinet({ server_uuids: ['a'] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/cabinet/check', { server_uuids: ['a'] });
  });

  it('getRelatedLvs / getRelatedNat 关联查询', () => {
    orderService.getRelatedLvs({ server_uuids: ['a'] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/lvs/related', { server_uuids: ['a'] });
    orderService.getRelatedNat({ server_uuids: ['a'] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/nat/api/v1/nat_instances', { server_uuids: ['a'] });
  });

  it('checkDns / checkDnsParam DNS 校验', () => {
    orderService.checkDns({ sub_domain: 'www' });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/dns_module/api/v1/dns/exist', { params: { sub_domain: 'www' } });
    orderService.checkDnsParam({ ttl: 3600 });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/dns_module/api/v1/dns/check', { params: { ttl: 3600 } });
  });

  it('getVmDeleteLog / getLvsLog / getNatLog / getVmLog / getVmConfig / deleteVmTask 日志与配置', () => {
    orderService.getVmDeleteLog({ id: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/vms?cmd=GetTaskLog', { params: { id: 1 } });
    orderService.getLvsLog(100);
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/log/100');
    orderService.getNatLog(100);
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/nat/api/v1/nat_log/100');
    orderService.getVmLog('task-1');
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/task_log/task-1');
    orderService.getVmConfig(100);
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/ticket/100');
    orderService.deleteVmTask('task-1');
    expect(httpMock.delete).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/vm_task/task-1');
  });

  it('getConfigData 获取收集任务配置', () => {
    orderService.getConfigData({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/vm_collection_tasks', { params: { page: 1 } });
  });
});

describe('service/manage.js', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getManageList 查询流程列表', () => {
    manageService.getManageList({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/processes', { params: { page: 1 } });
  });

  it('createProcess / isExistName', () => {
    manageService.createProcess({ name: 'x' });
    expect(httpMock.post).toHaveBeenCalledWith('/processes?cmd=CreateProcess', { name: 'x' });
    manageService.isExistName({ name: 'x' });
    expect(httpMock.post).toHaveBeenCalledWith('/processes?cmd=NameExists', { name: 'x' });
  });

  it('deleteProcess / updateProcess / getProcessDetail', () => {
    manageService.deleteProcess(1);
    expect(httpMock.delete).toHaveBeenCalledWith('/process/1');
    manageService.updateProcess(1, { enable: true });
    expect(httpMock.put).toHaveBeenCalledWith('/process/1', { enable: true });
    manageService.getProcessDetail(1);
    expect(httpMock.get).toHaveBeenCalledWith('/process/1');
  });
});

describe('service/user.js', () => {
  beforeEach(() => vi.clearAllMocks());

  it('detail 获取用户详情（本地 json）', () => {
    userService.detail(1);
    expect(httpMock.get).toHaveBeenCalledWith('/user/1.json');
  });

  it('create 创建用户', () => {
    userService.create({ username: 'a' });
    expect(httpMock.post).toHaveBeenCalledWith('/user', { username: 'a' });
  });

  it('getUserList / getGroupList', () => {
    userService.getUserList({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/users', { params: { page: 1 } });
    userService.getGroupList({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/groups', { params: { page: 1 } });
  });

  it('getUserByIds / getGroupByIds', () => {
    userService.getUserByIds({ user_id_list: [1] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/users?cmd=GetUserListById', { user_id_list: [1] });
    userService.getGroupByIds({ group_id_list: [1] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/groups?cmd=GetGroupListById', { group_id_list: [1] });
  });

  it('getUserTenant 区分管理员/普通用户接口', () => {
    userService.getUserTenant(true);
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/tenant_management/api/v1/getTenat', { params: { page: 1, pagesize: 100 } });
    userService.getUserTenant(false);
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/tenant_management/api/v1/getTenantsOfuser');
  });

  it('getAuthToken / getUserInfo / logout', () => {
    userService.getAuthToken({ code: 'x' });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/auth', { params: { code: 'x' } });
    userService.getUserInfo();
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/user/0');
    userService.logout();
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/user/0?cmd=Logout');
  });
});

describe('service/asset.js', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getServer 分页查询服务器（lvs 服务）', () => {
    assetService.getServer({ page: 1, size: 10, equals: {}, contains: {}, not_equals: {} });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/servers?page=1&size=10', {
      equals: {}, contains: {}, not_equals: {}, tenant: undefined, user_id: undefined,
    });
  });

  it('getVmIdcSubnet / getVmServer / getVmIp', () => {
    assetService.getVmIdcSubnet('机房A');
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/idc_subnet', { params: { idc: '机房A' } });
    assetService.getVmServer({ idc: '机房A' });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/host_server', { params: { idc: '机房A' } });
    assetService.getVmIp({ subnet: 'x' });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/subnet_ip', { params: { subnet: 'x' } });
  });

  it('getProduction / getLbgroup / getIdc / getSystems / getServerByIds', () => {
    assetService.getProduction({ all: true });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/productions', { all: true });
    assetService.getLbgroup({ page: 1, size: 10, contains: {}, equals: {} });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/lbgroups?page=1&size=10', { contains: {}, equals: {} });
    assetService.getIdc({ all: true });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/idcs', { all: true });
    assetService.getSystems({ all: true });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/systems', { params: { all: true } });
    assetService.getServerByIds({ server_uuids: ['a'] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lvs/qa/api/v1/servers/uuid', { server_uuids: ['a'] });
  });

  it('getDomain / getDns', () => {
    assetService.getDomain({ scope: 'public' });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/dns_module/api/v1/dns/domain', { params: { scope: 'public' } });
    assetService.getDns({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/dns_module/api/v1/dns', { params: { page: 1 } });
  });

  it('资产 CRUD：server / cluster / lvs / nat / ip / dns / netmap', () => {
    assetService.getAssetsServerOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/server/searchers');
    assetService.getAssetsServer({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/servers?page=1');
    assetService.getServerDetail('uuid-1');
    expect(httpMock.get).toHaveBeenCalledWith('/asset/server/uuid-1');
    assetService.updateServer({ id: 'uuid-1', param: { a: 1 } });
    expect(httpMock.put).toHaveBeenCalledWith('/asset/server/uuid-1', { a: 1 });
    assetService.createServer({ a: 1 });
    expect(httpMock.post).toHaveBeenCalledWith('/asset/servers', { a: 1 });
    assetService.batchServer([{ a: 1 }]);
    expect(httpMock.post).toHaveBeenCalledWith('/asset/servers/batch', [{ a: 1 }]);
    assetService.getUserListByUsername({ username_list: ['a'] });
    expect(httpMock.post).toHaveBeenCalledWith('http://127.0.0.1:8000/lanus/api/v1/users?cmd=GetUserListByUsername', { username_list: ['a'] });

    assetService.getAssetsClusterOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lb_group/searchers');
    assetService.getAssetsCluster({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lb_groups?page=1');
    assetService.getClusterDetail('lbg-1');
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lb_group/lbg-1');
    assetService.delAssetsCluster('lbg-1');
    expect(httpMock.delete).toHaveBeenCalledWith('/asset/lb_group/lbg-1');
    assetService.updateCluster({ id: 'lbg-1', param: {} });
    expect(httpMock.put).toHaveBeenCalledWith('/asset/lb_group/lbg-1', {});
    assetService.createCluster({ a: 1 });
    expect(httpMock.post).toHaveBeenCalledWith('/asset/lb_groups', { a: 1 });

    assetService.getAssetsLvsOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lvs/searchers');
    assetService.getAssetsLvs({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lvss?page=1');
    assetService.getLvsDetail('lvs-1');
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lvs/lvs-1');
    assetService.createLvs({ a: 1 });
    expect(httpMock.post).toHaveBeenCalledWith('/asset/lvss', { a: 1 });
    assetService.deleteLvs('lvs-1');
    expect(httpMock.delete).toHaveBeenCalledWith('/asset/lvs/lvs-1');
    assetService.isLvsExistName('lvs-1');
    expect(httpMock.get).toHaveBeenCalledWith('/asset/lvs/lvs-1/exists');

    assetService.getAssetsNatOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/nat/searchers');
    assetService.getAssetsNat({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/nats?page=1');
    assetService.delAssetsNat('nat-1');
    expect(httpMock.delete).toHaveBeenCalledWith('/asset/nat/nat-1');

    assetService.getAssetsIpOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/ip/searchers');
    assetService.getAssetsIp({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/ips?page=1');
    assetService.createAssetsIpBatch([{ ipAddress: '1.1.1.1' }]);
    expect(httpMock.post).toHaveBeenCalledWith('/asset/ips/batch', [{ ipAddress: '1.1.1.1' }]);
    assetService.updateAssetsIp('ip-1', { isUsed: 'True' });
    expect(httpMock.patch).toHaveBeenCalledWith('/asset/ip/ip-1', { isUsed: 'True' });

    assetService.getAssetsDnsOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/dns/searchers');
    assetService.getAssetsDns({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/dnss?page=1');
    assetService.updateAssetsDns({ domain: 'www.example.com', param: { ttl: 60 } });
    expect(httpMock.put).toHaveBeenCalledWith('/asset/dns/www.example.com', { ttl: 60 });
    assetService.retryUpdateAssetsDns('www.example.com', { ttl: 60 });
    expect(httpMock.put).toHaveBeenCalledWith('/asset/dns/retry/www.example.com', { ttl: 60 });
    assetService.fetchTaskMessage(['1', '2']);
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/dns_module/api/v1/dns/tasklist?ids=1,2');

    assetService.getAssetsNetMapOption();
    expect(httpMock.get).toHaveBeenCalledWith('/asset/net_mapping/searchers');
    assetService.getAssetsNetMap({ page: 1 });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/net_mappings?page=1');

    assetService.getHostName();
    expect(httpMock.get).toHaveBeenCalledWith('http://127.0.0.1:8000/hyperv/local/api/v1/hyperv/new_hostname');
    assetService.getSubnetByIdc({ idc: '机房A' });
    expect(httpMock.get).toHaveBeenCalledWith('/asset/ip/statistics?idc=%E6%9C%BA%E6%88%BFA');
  });
});
