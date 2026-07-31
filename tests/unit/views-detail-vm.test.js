// ============================================================
// detail/step/config/vm.vue 虚拟机开通配置测试
// 覆盖：init / setBtnStatus / getConfig / submit / delHost /
//       openLog / openChoose / confirmSelect / 状态映射等
// ============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

const { orderMock } = vi.hoisted(() => ({ orderMock: {} }));
vi.mock('@/service/order', () => orderMock);

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: {
    transition: false,
    'router-link': { template: '<a :href="to"><slot /></a>' },
    'chose-server': { template: '<div class="chose-server" />' },
    'chose-ip': { template: '<div class="chose-ip" />' },
    'log-modal': { template: '<div class="log-modal" />' },
  },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/order/detail/1/10001', meta: {}, params: {}, query: {} },
    has: () => true,
    $Modal: { confirm: vi.fn() },
    $Message: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
    $Notify: { success: vi.fn(), error: vi.fn() },
  },
};

function initStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useLoginInfoStore().UPDATE_USER_INFO({ name: '管理员', isServiceAdmin: true, groups: [] });
}

function baseInfo(overrides = {}) {
  return {
    id: 10001,
    state: 3,
    type: 1,
    resource: { vm_count: 2, memory_size_in_gb: 4, disk_size_in_gb: 100, business_level: '测试', product: '产品线A' },
    configurations: {},
    ...overrides,
  };
}

describe('views/detail/step/config/vm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    orderMock.updateOrder = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    orderMock.getVmLog = vi.fn().mockResolvedValue({ error_code: 0, data: { logs: [{ time: '2025-01-01 10:00:00', msg: '开始创建' }] } });
    orderMock.getVmConfig = vi.fn().mockResolvedValue({ error_code: 0, data: { result: [] } });
    orderMock.deleteVmTask = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  async function mountVm(props = {}) {
    const VmConfig = (await import('@/views/detail/step/config/vm.vue')).default;
    return createMounter(VmConfig, {
      global,
      props: { baseInfo: baseInfo(), handleInfo: {}, isAudit: true, ...props },
    });
  }

  it('init 初始化筛选条件与最小额度', async () => {
    const wrapper = await mountVm();
    await wait(20);
    expect(wrapper.vm.serverFilterCondition.free_memory).toBe(4);
    expect(wrapper.vm.serverFilterCondition.free_disk).toBe(100);
    expect(wrapper.vm.minCondition.memory).toBe(4);
  });

  it('setBtnStatus 非审核人或非开通状态时禁用', async () => {
    const wrapper = await mountVm({ isAudit: false });
    await wait(20);
    expect(wrapper.vm.disabled).toBe(true);
    const wrapper2 = await mountVm({ baseInfo: baseInfo({ state: 4 }), isAudit: true });
    await wait(20);
    expect(wrapper2.vm.disabled).toBe(true);
    const wrapper3 = await mountVm({ baseInfo: baseInfo({ state: 5 }), isAudit: true });
    await wait(20);
    expect(wrapper3.vm.disabled).toBe(false);
  });

  it('getConfig 有历史配置时使用配置，否则按 vm_count 生成空配置', async () => {
    const wrapper = await mountVm();
    wrapper.vm.getConfig();
    await wait(50);
    expect(wrapper.vm.configData).toHaveLength(2);
    orderMock.getVmConfig = vi.fn().mockResolvedValue({ error_code: 0, data: { result: [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'host-1' }] } });
    const wrapper2 = await mountVm();
    wrapper2.vm.getConfig();
    await wait(50);
    expect(wrapper2.vm.configData).toHaveLength(1);
  });

  it('openLog 拉取日志并展示', async () => {
    const wrapper = await mountVm();
    wrapper.vm.openLog('task-1');
    await wait(50);
    expect(orderMock.getVmLog).toHaveBeenCalledWith('task-1');
    expect(wrapper.vm.logInfo).toContain('开始创建');
    expect(wrapper.vm.logVisible).toBe(true);
  });

  it('delHost 仅剩一个时禁止删除', async () => {
    const wrapper = await mountVm();
    wrapper.vm.configData = [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'h1' }];
    wrapper.vm.delHost(0, 'task-1');
    expect(global.mocks.$Message.error).toHaveBeenCalled();
    expect(orderMock.deleteVmTask).not.toHaveBeenCalled();
  });

  it('delHost 确认后更新资源数量并删除任务', async () => {
    let onOk;
    const VmConfig = (await import('@/views/detail/step/config/vm.vue')).default;
    const wrapper = createMounter(VmConfig, {
      global: {
        ...global,
        mocks: { ...global.mocks, $Modal: { confirm: (cfg) => { onOk = cfg.onOk; } } },
      },
      props: { baseInfo: baseInfo(), handleInfo: {}, isAudit: true },
    });
    await wait(20);
    wrapper.vm.configData = [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'h1' }, { ip_info: { ip: '1.1.1.2' }, host_machine: 'h2' }];
    wrapper.vm.delHost(0, 'task-1');
    onOk();
    await wait(50);
    expect(orderMock.updateOrder).toHaveBeenCalled();
    expect(orderMock.deleteVmTask).toHaveBeenCalledWith('task-1');
    expect(wrapper.emitted('update')).toBeTruthy();
  });

  it('delHost 更新失败时提示错误', async () => {
    orderMock.updateOrder = vi.fn().mockResolvedValue({ error_code: 1, error_msg: '更新失败' });
    let onOk;
    const VmConfig = (await import('@/views/detail/step/config/vm.vue')).default;
    const wrapper = createMounter(VmConfig, {
      global: { ...global, mocks: { ...global.mocks, $Modal: { confirm: (cfg) => { onOk = cfg.onOk; } } } },
      props: { baseInfo: baseInfo(), handleInfo: {}, isAudit: true },
    });
    await wait(20);
    wrapper.vm.configData = [{ ip_info: { ip: '1' }, host_machine: 'h1' }, { ip_info: { ip: '2' }, host_machine: 'h2' }];
    wrapper.vm.delHost(0);
    onOk();
    await wait(50);
    expect(global.mocks.$Notify.error).toHaveBeenCalled();
  });

  it('submit 配置不完整时提示', async () => {
    const wrapper = await mountVm();
    wrapper.vm.configData = [{ ip_info: {}, host_machine: '' }];
    wrapper.vm.handleSubmit();
    await wait(700); // debounce 500ms
    expect(global.mocks.$Message.error).toHaveBeenCalled();
    expect(wrapper.emitted('action')).toBeFalsy();
  });

  it('submit 配置完整时 emit action（state=3 用 each_config）', async () => {
    const wrapper = await mountVm();
    await wait(50);
    wrapper.vm.configData = [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'h1' }, { ip_info: { ip: '1.1.1.2' }, host_machine: 'h2' }];
    wrapper.vm.handleSubmit();
    await wait(700);
    const payload = wrapper.emitted('action')[0][0];
    expect(payload.configurations.each_config).toHaveLength(2);
    expect(payload.description).toBeDefined();
  });

  it('submit 重试状态（state=5）用 tasks 字段', async () => {
    const wrapper = await mountVm({ baseInfo: baseInfo({ state: 5 }), isAudit: true });
    await wait(50);
    wrapper.vm.configData = [{ ip_info: { ip: '1.1.1.1' }, host_machine: 'h1' }];
    wrapper.vm.handleSubmit();
    await wait(700);
    const payload = wrapper.emitted('action')[0][0];
    expect(payload.configurations.tasks).toHaveLength(1);
    expect(payload.configurations.each_config).toBeUndefined();
  });

  it('openChoose ip 收集已选 IP', async () => {
    const wrapper = await mountVm();
    wrapper.vm.configData = [
      { ip_info: { ip: '1.1.1.1', subnet: '192.168.1.0/24', idc: '机房A' }, host_machine: 'h1' },
      { ip_info: { ip: '1.1.1.2', subnet: '192.168.1.0/24', idc: '机房A' }, host_machine: 'h2' },
    ];
    wrapper.vm.openChoose('ip', 1, '1.1.1.2', 'running');
    expect(wrapper.vm.ipVisible).toBe(false); // running/success 状态不可选
    wrapper.vm.openChoose('ip', 1, '1.1.1.2', 'failed');
    expect(wrapper.vm.ipVisible).toBe(true);
    expect(wrapper.vm.selectedList).toEqual({ '1.1.1.1': true });
  });

  it('openChoose server 未选 IP 时警告', async () => {
    const wrapper = await mountVm();
    wrapper.vm.configData = [{ ip_info: {}, host_machine: '' }];
    wrapper.vm.openChoose('server', 0, '', 'failed');
    expect(global.mocks.$Message.warning).toHaveBeenCalled();
  });

  it('confirmSelect 更新对应字段并关闭弹窗', async () => {
    const wrapper = await mountVm();
    wrapper.vm.configData = [{ ip_info: {}, host_machine: '' }];
    wrapper.vm.currentChooseIndex = 0;
    wrapper.vm.confirmSelect({ selected: { ip: '9.9.9.9', subnet: '192.168.1.0/24', idc: '机房A' }, type: 'ip' });
    expect(wrapper.vm.configData[0].ip_info.ip).toBe('9.9.9.9');
    expect(wrapper.vm.ipVisible).toBe(false);
    wrapper.vm.confirmSelect({ selected: { uuid: 'u1', hostname: 'host-9' }, type: 'server' });
    expect(wrapper.vm.configData[0].host_machine.uuid).toBe('u1');
  });

  it('formatTaskStates / formatHandlerName 映射', async () => {
    const wrapper = await mountVm();
    expect(wrapper.vm.formatTaskStates('running')).toBe('progress');
    expect(wrapper.vm.formatTaskStates('success')).toBe('success');
    expect(wrapper.vm.formatTaskStates('failed')).toBe('failure');
    expect(wrapper.vm.formatTaskStates('unknown')).toBe('pending');
    expect(wrapper.vm.formatHandlerName('管理员(admin@example.com)')).toBe('管理员');
    expect(wrapper.vm.formatHandlerName('')).toBe('');
  });

  it('baseInfo 变化重新 init', async () => {
    const wrapper = await mountVm();
    await wrapper.setProps({ baseInfo: baseInfo({ state: 4 }) });
    await wait(20);
    expect(wrapper.vm.disabled).toBe(true);
  });
});
