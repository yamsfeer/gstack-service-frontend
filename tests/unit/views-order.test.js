import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, nextTick, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

const { orderMock, assetMock } = vi.hoisted(() => ({
  orderMock: {
    getOrderList: vi.fn(), getOrderDetail: vi.fn(), updateStateByAction: vi.fn(),
    createOrder: vi.fn(), getRelatedLvs: vi.fn(), getRelatedNat: vi.fn(),
    getVmLog: vi.fn(), getVmConfig: vi.fn(), deleteVmTask: vi.fn(), updateOrder: vi.fn(),
  },
  assetMock: { getServerByIds: vi.fn() },
}));
vi.mock('@/service/order', () => orderMock);
vi.mock('@/service/asset', () => assetMock);

// 兜底：vm 开通配置引用的资产接口
beforeEach(() => {
  const baseMethods = ['getVmIdcSubnet', 'getVmIp', 'getVmServer', 'getLbgroup', 'getServerByIds', 'getProduction'];
  baseMethods.forEach(m => {
    if (!assetMock[m]) {
      const data = m === 'getVmIp' ? { subnet_ips: [], idc_subnet: {} }
        : m === 'getVmIdcSubnet' ? { idc_subnet: {} }
        : m === 'getVmServer' ? { hosts: [] }
        : m === 'getLbgroup' ? { result: [], meta: { total: 0 } }
        : m === 'getProduction' ? { result: [] }
        : {};
      assetMock[m] = vi.fn().mockResolvedValue({ error_code: 0, data });
    }
  });
});

import MineOrder from '@/views/mineOrder/index.vue';
import Audit from '@/views/audit/index.vue';
import HandleModal from '@/views/audit/handle-modal.vue';
import DetailIndex from '@/views/detail/index.vue';
import DetailStep from '@/views/detail/step/detail.vue';
import RightBox from '@/views/detail/rightBox/index.vue';
import Comment from '@/views/detail/step/comment.vue';
import VmConfig from '@/views/detail/step/config/vm.vue';
import LvsNatConfig from '@/views/detail/step/config/lvsNat.vue';
import VmDeleteConfig from '@/views/detail/step/config/vmDelete.vue';

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/order/mine', meta: {}, params: {}, query: {} },
  },
};

function initStore(userInfo = { name: '管理员', isServiceAdmin: true, groups: [] }) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const login = useLoginInfoStore();
  login.UPDATE_USER_INFO(userInfo);
  login.UPDATE_TENANT([{ tenant_id: '1001', tenant_name: '平台研发部' }]);
  return pinia;
}

const TICKET_LIST = [
  { id: 10001, type: 1, state: 1, creator: '管理员', group: '运维值班组', description: '测试工单', tenant: '平台研发部', create_time: '2025-01-01 10:00:00' },
  { id: 10002, type: 4, state: 10, creator: '管理员', group: '运维值班组', description: '已完成工单', tenant: '平台研发部', create_time: '2025-01-02 10:00:00' },
  { id: 10003, type: 5, state: 11, creator: '管理员', group: '运维值班组', description: '已废弃工单', tenant: '平台研发部', create_time: '2025-01-03 10:00:00' },
];

describe('views/mineOrder/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    orderMock.getOrderList.mockResolvedValue({ error_code: 0, data: { tickets: TICKET_LIST, total: 3 } });
  });

  it('加载我的工单列表并格式化状态', async () => {
    const wrapper = createMounter(MineOrder, { global });
    await wait(50);
    expect(orderMock.getOrderList).toHaveBeenCalled();
    const param = orderMock.getOrderList.mock.calls[0][0];
    expect(param.creator).toBe('管理员');
    expect(wrapper.vm.formatType(1)).toBe('虚拟机');
    expect(wrapper.vm.formatType(2)).toBe('虚拟机删除');
    expect(wrapper.vm.formatType(3)).toBe('主动访问公网');
    expect(wrapper.vm.formatType(4)).toBe('被公网访问');
    expect(wrapper.vm.formatType(5)).toBe('DNS');
    expect(wrapper.vm.formatState(1).text).toBe('待处理');
    expect(wrapper.vm.formatState(10).text).toBe('已完成');
  });

  it('切换 tab 重置筛选并重新加载', async () => {
    const wrapper = createMounter(MineOrder, { global });
    await wait(50);
    wrapper.vm.changeTab('all');
    expect(wrapper.vm.activeTab).toBe('all');
    expect(wrapper.vm.query.type).toBe(0);
    const param = orderMock.getOrderList.mock.calls[orderMock.getOrderList.mock.calls.length - 1][0];
    // 全部工单 tab 不传 creator（searchForm.creator 为空字符串）
    expect(param.creator).toBe('');
  });

  it('changeType 切换工单类型', async () => {
    const wrapper = createMounter(MineOrder, { global });
    await wait(50);
    wrapper.vm.changeType(1);
    const param = orderMock.getOrderList.mock.calls[orderMock.getOrderList.mock.calls.length - 1][0];
    expect(param.type).toEqual([1]);
  });

  it('fetchListData 组装状态筛选参数', async () => {
    const wrapper = createMounter(MineOrder, { global });
    await wait(50);
    wrapper.vm.searchForm.state = '1,2';
    wrapper.vm.fetchListData();
    const param = orderMock.getOrderList.mock.calls[orderMock.getOrderList.mock.calls.length - 1][0];
    expect(param.state).toEqual([1, 2]);
  });

  it('pageChange / sizeChange 分页', async () => {
    const wrapper = createMounter(MineOrder, { global });
    await wait(50);
    wrapper.vm.pageChange(2);
    expect(wrapper.vm.page.pageNum).toBe(2);
    wrapper.vm.page.pageNum = 5;
    wrapper.vm.sizeChange(50);
    expect(wrapper.vm.page.pageSize).toBe(50);
  });

  it('reSubmit 对已废弃工单重新发起审核', async () => {
    orderMock.createOrder.mockResolvedValue({ error_code: 0, data: { id: 999 } });
    const wrapper = createMounter(MineOrder, {
      global: {
        ...global,
        mocks: {
          ...global.mocks,
          $Modal: { confirm: ({ onOk }) => onOk() },
        },
      },
    });
    await wait(50);
    wrapper.vm.getCreateParam = vi.fn(() => ({ tenant_id: '1001', type: 5, resource: {}, description: 'x' }));
    wrapper.vm.reSubmit(TICKET_LIST[2]);
    await wait(50);
    expect(orderMock.createOrder).toHaveBeenCalled();
  });

  it('getCreateParam 组装重新审核参数', () => {
    const wrapper = createMounter(MineOrder, { global });
    const param = wrapper.vm.getCreateParam({ tenant_id: '1001', type: 5, resource: { a: 1 }, description: 'x' });
    expect(param).toEqual({ tenant_id: '1001', type: 5, resource: { a: 1 }, description: 'x' });
  });

  it('linkToOrder 跳转提交工单', () => {
    const push = vi.fn();
    const wrapper = createMounter(MineOrder, { global: { ...global, mocks: { ...global.mocks, $router: { push } } } });
    wrapper.vm.query.type = 3;
    wrapper.vm.linkToOrder();
    expect(push).toHaveBeenCalledWith('/main/order/apply/nat');
  });
});

describe('views/audit/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    orderMock.getOrderList.mockResolvedValue({ error_code: 0, data: { tickets: TICKET_LIST, total: 3 } });
  });

  it('默认加载需处理工单（status=2）', async () => {
    const wrapper = createMounter(Audit, { global });
    await wait(50);
    expect(wrapper.vm.query.status).toBe(2);
    const param = orderMock.getOrderList.mock.calls[0][0];
    expect(param.status).toBe(2);
  });

  it('changeType 切换状态页并重置', async () => {
    const wrapper = createMounter(Audit, { global });
    await wait(50);
    wrapper.vm.changeType(4);
    expect(wrapper.vm.query.status).toBe(4);
    const param = orderMock.getOrderList.mock.calls[orderMock.getOrderList.mock.calls.length - 1][0];
    expect(param.state).toEqual([10, 11]);
  });

  it('formatStateOption 按状态页裁剪选项', () => {
    const wrapper = createMounter(Audit, { global });
    wrapper.vm.query.status = 2;
    wrapper.vm.formatStateOption();
    expect(wrapper.vm.stateOptions.length).toBe(4);
    wrapper.vm.query.status = 4;
    wrapper.vm.formatStateOption();
    expect(wrapper.vm.stateOptions.length).toBe(2);
  });

  it('openHandleModal 打开操作弹窗', () => {
    const wrapper = createMounter(Audit, { global });
    wrapper.vm.openHandleModal({ id: 10001 }, 1);
    expect(wrapper.vm.handleModalVisible).toBe(true);
    expect(wrapper.vm.handleForm).toEqual({ id: 10001, action: 1 });
  });

  it('formatType / formatState', () => {
    const wrapper = createMounter(Audit, { global });
    expect(wrapper.vm.formatType(4)).toBe('被公网访问');
    expect(wrapper.vm.formatState(11).text).toBe('已废弃');
  });
});

describe('views/audit/handle-modal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    orderMock.updateStateByAction.mockResolvedValue({ error_code: 0, data: {} });
  });

  it('确认操作调用 updateStateByAction', async () => {
    const wrapper = createMounter(HandleModal, { global, props: { visible: true, id: 10001, action: 1 } });
    await wait(50);
    expect(wrapper.vm.$refs.form).toBeTruthy();
    wrapper.vm.form.description = '同意申请';
    // 直接调用原始 confirm（绕过防抖），触发表单校验后提交
    wrapper.vm.confirm();
    await wait(50);
    // handleModal 经 store 转发，最终调用 service.updateStateByAction(id, param)
    expect(orderMock.updateStateByAction).toHaveBeenCalledWith(10001, { action: 1, description: '同意申请' });
  });

  it('actionName 映射', async () => {
    const wrapper = createMounter(HandleModal, { global, props: { visible: false, id: 1, action: 1 } });
    expect(wrapper.vm.actionName).toBe('同意');
    await wrapper.setProps({ action: 2 });
    expect(wrapper.vm.actionName).toBe('驳回');
    await wrapper.setProps({ action: 3 });
    expect(wrapper.vm.actionName).toBe('开通');
    await wrapper.setProps({ action: 12 });
    expect(wrapper.vm.actionName).toBe('丢弃');
  });

  it('close 触发 close 事件', () => {
    const wrapper = createMounter(HandleModal, { global, props: { visible: true, id: 1, action: 12 } });
    wrapper.vm.close();
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

describe('views/detail/step/comment.vue', () => {
  it('提交同意/驳回动作', () => {
    const wrapper = createMounter(Comment, { global, props: { handleInfo: {} } });
    wrapper.vm.form.description = '';
    wrapper.vm.submit(1);
    expect(wrapper.vm.isNullError).toBe(true);
    wrapper.vm.form.description = '同意';
    wrapper.vm.submit(1);
    expect(wrapper.emitted('action')).toEqual([[{ action: 1, description: '同意' }]]);
  });
});

describe('views/detail/step/detail.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getServerByIds.mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'u1', logicalHostName: 'web-001' }] });
    orderMock.getRelatedLvs.mockResolvedValue({ error_code: 0, data: {} });
    orderMock.getRelatedNat.mockResolvedValue({ error_code: 0, data: [] });
  });

  it('按类型渲染基本配置', () => {
    const wrapper = createMounter(DetailStep, {
      global,
      props: { baseInfo: { state: 1, creator: '管理员', create_time: '2025-01-01', resource: { vm_count: 1, os_name: 'CentOS 7.9', business_level: '测试', product: '产品线A', idc: '机房A' } }, type: 1 },
    });
    expect(wrapper.vm.config.length).toBeGreaterThan(0);
    expect(wrapper.vm.formatState(1).text).toBe('待处理');
  });

  it('computeExpriedDate 计算过期时间', () => {
    const wrapper = createMounter(DetailStep, { global, props: { baseInfo: {}, type: 1 } });
    expect(wrapper.vm.computeExpriedDate('2025-01-01', 2)).toBe('2025-03-02');
    expect(wrapper.vm.computeExpriedDate('', 0)).toBe('无');
  });

  it('vmDelete 类型获取关联 lvs/nat', async () => {
    orderMock.getRelatedLvs.mockResolvedValue({ error_code: 0, data: { 'u1': [{ instanceName: 'lvs-1', product: '产品线A', publicVip: '1.1.1.1' }] } });
    orderMock.getRelatedNat.mockResolvedValue({ error_code: 0, data: [{ 'u1': { instanceName: 'nat-1', product: '产品线A' } }] });
    const wrapper = createMounter(DetailStep, {
      global,
      props: {
        baseInfo: { state: 1, creator: '管理员', resource: { virtual_machines: [{ server_uuid: 'u1', host_name: 'web-001' }] } },
        type: 2,
      },
    });
    wrapper.vm.getRelatedLvsNat([{ server_uuid: 'u1', host_name: 'web-001' }]);
    await wait(50);
    expect(wrapper.vm.lvsList.length).toBe(1);
    expect(wrapper.vm.natList.length).toBe(1);
  });

  it('array_table 类型通过 serverKey 获取服务器', async () => {
    const wrapper = createMounter(DetailStep, {
      global,
      props: { baseInfo: { state: 1, creator: '管理员', resource: { rs_uuid_list: ['u1'] } }, type: 4 },
    });
    wrapper.vm.getServers(['u1']);
    await wait(50);
    expect(assetMock.getServerByIds).toHaveBeenCalledWith({ server_uuids: ['u1'] });
  });
});

describe('views/detail/rightBox/index.vue', () => {
  it('过滤不展示的动作日志并标记末尾', () => {
    const wrapper = createMounter(RightBox, {
      global,
      props: {
        baseInfo: {
          state: 2, creator: '管理员', create_time: '2025-01-01',
          action_logs: [
            { action: 1, handler: 'a', description: '同意', update_time: '2025-01-02' },
            { action: 4, handler: 'a', description: '开通失败确认', update_time: '2025-01-03' },
          ],
        },
        type: 1, id: 10001,
      },
    });
    expect(wrapper.vm.actionLogs.length).toBe(1);
    expect(wrapper.vm.actionLogs[0].action).toBe(1);
  });

  it('setBtnStatus 按审核权限控制丢弃按钮', async () => {
    const wrapper = createMounter(RightBox, {
      global: { ...global, mocks: { ...global.mocks, $route: { path: '/main/order/audit/1/10001', meta: {}, params: {} } } },
      props: { baseInfo: { state: 2, creator: '管理员', action_logs: [] }, type: 1, id: 10001, isAudit: true },
    });
    await wait(20);
    expect(wrapper.vm.disabled).toBe(false);
    await wrapper.setProps({ baseInfo: { state: 10, creator: '管理员', action_logs: [] } });
    expect(wrapper.vm.disabled).toBe(true);
  });
});

describe('views/detail/step/config/vm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
  });

  it('init 初始化筛选条件', () => {
    const wrapper = createMounter(VmConfig, {
      global,
      props: {
        baseInfo: { state: 3, id: 10001, resource: { memory_size_in_gb: 4, disk_size_in_gb: 100, vm_count: 1, business_level: '测试', product: '产品线A' } },
        handleInfo: {}, isAudit: true,
      },
    });
    expect(wrapper.vm.serverFilterCondition.free_memory).toBe(4);
    expect(wrapper.vm.disabled).toBe(false);
  });

  it('getConfig 无配置时按 vm_count 初始化空行', async () => {
    orderMock.getVmConfig.mockResolvedValue({ error_code: 0, data: { result: [] } });
    const wrapper = createMounter(VmConfig, {
      global,
      props: {
        baseInfo: { state: 3, id: 10001, resource: { memory_size_in_gb: 4, disk_size_in_gb: 100, vm_count: 2, business_level: '测试', product: '产品线A' } },
        handleInfo: {}, isAudit: true,
      },
    });
    wrapper.vm.getConfig();
    await wait(50);
    expect(wrapper.vm.configData.length).toBe(2);
    expect(wrapper.vm.configData[0]).toEqual({ ip_info: {}, host_machine: '' });
  });

  it('checkParam 检查配置完整性', () => {
    const wrapper = createMounter(VmConfig, {
      global,
      props: {
        baseInfo: { state: 3, id: 10001, resource: {} }, handleInfo: {}, isAudit: true,
      },
    });
    expect(wrapper.vm.checkParam()).toBe(false);
    wrapper.vm.configData = [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'hyper-1' }];
    expect(wrapper.vm.checkParam()).toBe(true);
  });

  it('submit 组装开通配置参数', async () => {
    orderMock.getVmConfig.mockResolvedValue({ error_code: 0, data: { result: [] } });
    const wrapper = createMounter(VmConfig, {
      global,
      props: {
        baseInfo: { state: 3, id: 10001, resource: { memory_size_in_gb: 4, disk_size_in_gb: 100, vm_count: 1, business_level: '测试', product: '产品线A' } },
        handleInfo: {}, isAudit: true,
      },
    });
    wrapper.vm.configData = [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'hyper-1' }];
    wrapper.vm.submit();
    await wait(50);
    expect(wrapper.emitted('action')).toBeTruthy();
    const payload = wrapper.emitted('action')[0][0];
    expect(payload.configurations.each_config).toEqual([{ ip_info: { ip: '1.1.1.1' }, host_machine: 'hyper-1' }]);
  });

  it('openLog 获取日志', async () => {
    orderMock.getVmLog.mockResolvedValue({ error_code: 0, data: { logs: [{ time: 't', msg: 'm' }] } });
    const wrapper = createMounter(VmConfig, {
      global,
      props: { baseInfo: { state: 3, id: 1, resource: {} }, handleInfo: {}, isAudit: true },
    });
    wrapper.vm.openLog('task-1');
    await wait(50);
    expect(wrapper.vm.logVisible).toBe(true);
    expect(wrapper.vm.logInfo).toContain('m');
  });
});

describe('views/detail/step/config/lvsNat.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    orderMock.getVmConfig.mockResolvedValue({ error_code: 0, data: { result: [] } });
  });

  it('LVS 类型获取集群配置', async () => {
    const wrapper = createMounter(LvsNatConfig, {
      global,
      props: { baseInfo: { state: 3, id: 10001, type: 4, resource: {} }, handleInfo: {}, isAudit: true },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('openLog 拉取 lvs 日志', async () => {
    orderMock.getLvsLog = vi.fn().mockResolvedValue({ error_code: 0, data: 'lvs log' });
    const wrapper = createMounter(LvsNatConfig, {
      global,
      props: { baseInfo: { state: 3, id: 10001, type: 4, resource: {} }, handleInfo: {}, isAudit: true },
    });
    wrapper.vm.openLog();
    await wait(50);
    expect(wrapper.vm.logVisible).toBe(true);
  });
});

describe('views/detail/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore({ name: '管理员', isServiceAdmin: true, groups: [{ group_name: '运维值班组' }] });
    orderMock.getOrderDetail.mockResolvedValue({
      error_code: 0,
      data: { id: 10001, type: 1, state: 1, creator: '管理员', group: '运维值班组', action_logs: [], resource: {} },
    });
  });

  it('created 加载工单详情', async () => {
    const wrapper = createMounter(DetailIndex, {
      global: { ...global, mocks: { ...global.mocks, $route: { path: '/main/order/detail/1/10001', params: { type: '1', id: '10001' }, meta: {} } } },
    });
    await wait(50);
    expect(orderMock.getOrderDetail).toHaveBeenCalledWith('10001');
    expect(wrapper.vm.id).toBe('10001');
    expect(wrapper.vm.type).toBe('1');
  });

  it('handleAction 组装状态动作', async () => {
    orderMock.updateStateByAction.mockResolvedValue({ error_code: 0, data: {} });
    const wrapper = createMounter(DetailIndex, {
      global: { ...global, mocks: { ...global.mocks, $route: { path: '/main/order/detail/1/10001', params: { type: '1', id: '10001' }, meta: {} } } },
    });
    await wait(50);
    wrapper.vm.orderDetail.state = 3;
    wrapper.vm.handleAction({ description: '开通' });
    await wait(50);
    // store 层透传：updateStateByAction(params) → service.updateStateByAction(params.id, params.param)
    expect(orderMock.updateStateByAction).toHaveBeenCalledWith('10001', { action: 3, description: '开通' });
  });

  it('findHandleInfo 提取最近的开通动作', async () => {
    const wrapper = createMounter(DetailIndex, {
      global: { ...global, mocks: { ...global.mocks, $route: { path: '/main/order/detail/1/10001', params: { type: '1', id: '10001' }, meta: {} } } },
    });
    await wait(50);
    wrapper.vm.orderDetail.action_logs = [
      { action: 3, handler: 'a', description: 'x', create_time: 't1' },
      { action: 6, handler: 'b', description: 'y', create_time: 't2' },
    ];
    wrapper.vm.findHandleInfo();
    expect(wrapper.vm.handleInfo.description).toBe('y');
  });
});
