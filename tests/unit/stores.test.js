import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// mock service 模块
const { orderServiceMock, manageServiceMock, userServiceMock, assetServiceMock } = vi.hoisted(() => ({
  orderServiceMock: {
    getConfigData: vi.fn(), getOrderType: vi.fn(), getOrderList: vi.fn(), getOrderDetail: vi.fn(),
    createOrder: vi.fn(), updateOrder: vi.fn(), delVmDeleteTask: vi.fn(),
    batchUpdateStateByAction: vi.fn(), updateStateByAction: vi.fn(), checkLvs: vi.fn(),
    checkDnsParam: vi.fn(), checkDns: vi.fn(), getRelatedLvs: vi.fn(), getRelatedNat: vi.fn(),
    checkCabinet: vi.fn(), getVmDeleteLog: vi.fn(), getLvsLog: vi.fn(), getNatLog: vi.fn(),
    getVmLog: vi.fn(), getVmConfig: vi.fn(), deleteVmTask: vi.fn(),
  },
  manageServiceMock: {
    getManageList: vi.fn(), createProcess: vi.fn(), deleteProcess: vi.fn(),
    updateProcess: vi.fn(), getProcessDetail: vi.fn(), isExistName: vi.fn(),
  },
  userServiceMock: {
    detail: vi.fn(), create: vi.fn(), getUserList: vi.fn(), getGroupList: vi.fn(),
    getUserByIds: vi.fn(), getGroupByIds: vi.fn(), getUserTenant: vi.fn(),
  },
  assetServiceMock: {},
}));

vi.mock('@/service/order', () => orderServiceMock);
vi.mock('@/service/manage', () => manageServiceMock);
vi.mock('@/service/user', () => userServiceMock);

import { useOrderStore } from '@/stores/order';
import { useManageStore } from '@/stores/manage';
import { useUserStore } from '@/stores/user';
import { useLoginInfoStore } from '@/stores/loginInfo';
import { useStoreParamsStore } from '@/stores/storeParams';
import * as vuexCompat from '@/stores/vuex-compat';

describe('stores/order.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getOrderType 成功更新 orderType', async () => {
    const store = useOrderStore();
    orderServiceMock.getOrderType.mockResolvedValue({ error_code: 0, data: [{ id: 1 }] });
    await store.getOrderType();
    expect(store.orderType).toEqual({ error_code: 0, data: [{ id: 1 }] });
    expect(store.orderTypeStatus).toBe('SUCCESS');
  });

  it('getOrderType 失败置 FAIL', async () => {
    const store = useOrderStore();
    orderServiceMock.getOrderType.mockResolvedValue({ error_code: 1 });
    await store.getOrderType();
    expect(store.orderTypeStatus).toBe('FAIL');
    orderServiceMock.getOrderType.mockRejectedValue(new Error('net'));
    await store.getOrderType();
    expect(store.orderTypeStatus).toBe('FAIL');
  });

  it('getOrderList 成功更新列表', async () => {
    const store = useOrderStore();
    orderServiceMock.getOrderList.mockResolvedValue({ error_code: 0, data: { tickets: [{ id: 1 }], total: 1 } });
    await store.getOrderList({ page: 1 });
    expect(store.orderList).toEqual([{ id: 1 }]);
    expect(store.orderListTotal).toBe(1);
    expect(store.orderListStatus).toBe('SUCCESS');
  });

  it('getOrderDetail 成功更新详情', async () => {
    const store = useOrderStore();
    orderServiceMock.getOrderDetail.mockResolvedValue({ error_code: 0, data: { id: 1, state: 1 } });
    await store.getOrderDetail(1);
    expect(store.orderDetail).toEqual({ id: 1, state: 1 });
  });

  it('getOrderList / getOrderDetail 失败置 FAIL', async () => {
    const store = useOrderStore();
    orderServiceMock.getOrderList.mockRejectedValue(new Error('net'));
    await store.getOrderList({});
    expect(store.orderListStatus).toBe('FAIL');
    orderServiceMock.getOrderDetail.mockRejectedValue(new Error('net'));
    await store.getOrderDetail(1);
    expect(store.orderDetailStatus).toBe('FAIL');
  });

  it('透传动作方法', async () => {
    const store = useOrderStore();
    orderServiceMock.createOrder.mockResolvedValue({ error_code: 0 });
    await store.createOrder({ type: 1 });
    expect(orderServiceMock.createOrder).toHaveBeenCalledWith({ type: 1 });

    orderServiceMock.updateStateByAction.mockResolvedValue({ error_code: 0 });
    await store.updateStateByAction({ id: 1, param: { action: 1 } });
    expect(orderServiceMock.updateStateByAction).toHaveBeenCalledWith(1, { action: 1 });

    orderServiceMock.batchUpdateStateByAction.mockResolvedValue({ error_code: 0 });
    await store.batchUpdateStateByAction({ ids: [1] });
    expect(orderServiceMock.batchUpdateStateByAction).toHaveBeenCalledWith({ ids: [1] });
  });
});

describe('stores/manage.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getManageList 成功更新流程列表', async () => {
    const store = useManageStore();
    manageServiceMock.getManageList.mockResolvedValue({ error_code: 0, data: { processes: [{ id: 1 }], total: 1 } });
    await store.getManageList({});
    expect(store.manageList).toEqual([{ id: 1 }]);
    expect(store.manageListTotal).toBe(1);
    expect(store.manageListStatus).toBe('SUCCESS');
  });

  it('getManageList 失败置 FAIL', async () => {
    const store = useManageStore();
    manageServiceMock.getManageList.mockRejectedValue(new Error('x'));
    await store.getManageList({});
    expect(store.manageListStatus).toBe('FAIL');
  });

  it('getManageList 失败置 FAIL（网络错误与业务错误）', async () => {
    const store = useManageStore();
    manageServiceMock.getManageList.mockRejectedValue(new Error('net'));
    await store.getManageList({});
    expect(store.manageListStatus).toBe('FAIL');
    manageServiceMock.getManageList.mockResolvedValue({ error_code: 1 });
    await store.getManageList({});
    expect(store.manageListStatus).toBe('FAIL');
  });

  it('createProcess / deleteProcess / updateProcess / getProcessDetail 透传', async () => {
    const store = useManageStore();
    manageServiceMock.createProcess.mockResolvedValue({ error_code: 0 });
    await store.createProcess({ name: 'x' });
    expect(manageServiceMock.createProcess).toHaveBeenCalledWith({ name: 'x' });

    manageServiceMock.deleteProcess.mockResolvedValue({ error_code: 0 });
    await store.deleteProcess(1);
    expect(manageServiceMock.deleteProcess).toHaveBeenCalledWith(1);

    manageServiceMock.updateProcess.mockResolvedValue({ error_code: 0 });
    await store.updateProcess({ id: 1, param: { enable: true } });
    expect(manageServiceMock.updateProcess).toHaveBeenCalledWith(1, { enable: true });

    manageServiceMock.getProcessDetail.mockResolvedValue({ error_code: 0, data: { name: 'x' } });
    await store.getProcessDetail(1);
    expect(manageServiceMock.getProcessDetail).toHaveBeenCalledWith(1);
  });

  it('isExistName 返回布尔值', async () => {
    const store = useManageStore();
    manageServiceMock.isExistName.mockResolvedValue({ error_code: 0, data: { exists: true } });
    expect(await store.isExistName({ name: 'x' })).toBe(true);
    manageServiceMock.isExistName.mockResolvedValue({ error_code: 1 });
    expect(await store.isExistName({ name: 'x' })).toBe(false);
  });
});

describe('stores/user.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('getUserDetail 更新详情', async () => {
    const store = useUserStore();
    userServiceMock.detail.mockResolvedValue({ error_code: 0, data: { username: 'a' } });
    await store.getUserDetail(1);
    expect(store.detail).toEqual({ username: 'a' });
    expect(store.detailStatus).toBe('SUCCESS');
  });

  it('getUserList / getGroupList 更新列表', async () => {
    const store = useUserStore();
    userServiceMock.getUserList.mockResolvedValue({ error_code: 0, data: { users: [{ id: 1 }], total: 1 } });
    await store.getUserList({});
    expect(store.userList).toEqual([{ id: 1 }]);
    userServiceMock.getGroupList.mockResolvedValue({ error_code: 0, data: { groups: [{ id: 1 }], total: 1 } });
    await store.getGroupList({});
    expect(store.groupList).toEqual([{ id: 1 }]);
  });

  it('getUserByIds / getGroupByIds / getUserTenant 透传', async () => {
    const store = useUserStore();
    userServiceMock.getUserByIds.mockResolvedValue({ error_code: 0 });
    await store.getUserByIds({ user_id_list: [1] });
    expect(userServiceMock.getUserByIds).toHaveBeenCalledWith({ user_id_list: [1] });
    userServiceMock.getUserTenant.mockResolvedValue({ error_code: 0 });
    await store.getUserTenant(true);
    expect(userServiceMock.getUserTenant).toHaveBeenCalledWith(true);
  });
});

describe('stores/loginInfo.js', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('初始状态与 getters', () => {
    const store = useLoginInfoStore();
    expect(store.userInfo).toEqual({});
    expect(store.GET_USER_INFO).toEqual({});
    expect(store.GET_TOKEN).toBe('');
    expect(store.GET_TENANT).toEqual([]);
  });

  it('UPDATE_* actions 更新状态', () => {
    const store = useLoginInfoStore();
    store.UPDATE_USER_INFO({ name: 'a' });
    store.UPDATE_TOKEN('tk');
    store.UPDATE_TENANT([{ tenant_id: '1' }]);
    expect(store.GET_USER_INFO).toEqual({ name: 'a' });
    expect(store.GET_TOKEN).toBe('tk');
    expect(store.GET_TENANT).toEqual([{ tenant_id: '1' }]);
  });
});

describe('stores/storeParams.js', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('SET_STORE_PARAMS 保存参数', () => {
    const store = useStoreParamsStore();
    store.SET_STORE_PARAMS({ namespace: 'ns', params: { a: 1 } });
    expect(store.GET_STORE_PARAMS.ns).toEqual({ a: 1 });
  });
});

describe('stores/vuex-compat.js', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('checkLoading / checkSuccess 状态判断', () => {
    expect(vuexCompat.checkLoading('LOADING')).toBe(true);
    expect(vuexCompat.checkLoading('SUCCESS')).toBe(false);
    expect(vuexCompat.checkSuccess('SUCCESS')).toBe(true);
    expect(vuexCompat.checkSuccess('FAIL')).toBe(false);
  });

  it('mapState 支持 namespace 对象形式（loginInfo）', () => {
    const loginStore = useLoginInfoStore();
    loginStore.UPDATE_USER_INFO({ name: 'x' });
    const mapped = vuexCompat.mapState({ user: 'GET_USER_INFO' });
    expect(typeof mapped.user).toBe('function');
    // pinia 使用当前 active pinia，映射函数可直接调用
    expect(mapped.user()).toEqual({ name: 'x' });
  });

  it('mapActions 数组形式映射到 store', async () => {
    const mapped = vuexCompat.mapActions('order', ['createOrder']);
    expect(typeof mapped.createOrder).toBe('function');
    orderServiceMock.createOrder.mockResolvedValue({ error_code: 0 });
    const ctx = { createOrder: mapped.createOrder };
    const ret = await ctx.createOrder({ type: 1 });
    expect(ret.error_code).toBe(0);
    expect(orderServiceMock.createOrder).toHaveBeenCalledWith({ type: 1 });
  });

  it('mapActions 对象形式', async () => {
    const mapped = vuexCompat.mapActions('manage', { del: 'deleteProcess' });
    manageServiceMock.deleteProcess.mockResolvedValue({ error_code: 0 });
    await mapped.del(5);
    expect(manageServiceMock.deleteProcess).toHaveBeenCalledWith(5);
  });

  it('mapActions 未知 namespace 返回空', () => {
    expect(vuexCompat.mapActions('unknown', ['a'])).toEqual({});
  });

  it('mapMutations 映射到 storeParams / loginInfo', () => {
    const storeParams = useStoreParamsStore();
    const mapped = vuexCompat.mapMutations({ save: 'SET_STORE_PARAMS' });
    mapped.save({ namespace: 'n', params: { x: 1 } });
    expect(storeParams.GET_STORE_PARAMS.n).toEqual({ x: 1 });

    const loginStore = useLoginInfoStore();
    const mappedArr = vuexCompat.mapMutations(['UPDATE_TOKEN']);
    mappedArr.UPDATE_TOKEN('t');
    expect(loginStore.GET_TOKEN).toBe('t');
  });

  it('mapGetters 映射 loginInfo getters', () => {
    const loginStore = useLoginInfoStore();
    loginStore.UPDATE_USER_INFO({ name: 'x' });
    const mapped = vuexCompat.mapGetters({ userInfo: 'GET_USER_INFO' });
    const fn = mapped.userInfo;
    const ctx = { $pinia: undefined };
    const result = fn.call(ctx);
    expect(result).toEqual({ name: 'x' });
  });

  it('mapGetters GET_STORE_PARAMS 映射到 storeParams', () => {
    const storeParams = useStoreParamsStore();
    storeParams.SET_STORE_PARAMS({ namespace: 'ns', params: { a: 1 } });
    const mapped = vuexCompat.mapGetters({ storedParams: 'GET_STORE_PARAMS' });
    expect(mapped.storedParams()).toEqual({ ns: { a: 1 } });
  });
});
