import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

// vue-slicksort 需要容器上下文，单独挂载时 mock 掉
vi.mock('vue-slicksort', () => ({
  ElementMixin: { mounted() {}, methods: { setDraggable() {}, removeDraggable() {} } },
  ContainerMixin: { methods: {} },
  HandleDirective: {},
  SlickList: { template: '<div class="slick-list"><slot /></div>' },
  SlickItem: { template: '<div class="slick-item"><slot /></div>' },
}));

const { orderMock, assetMock, manageMock } = vi.hoisted(() => ({
  orderMock: {},
  assetMock: {},
  manageMock: {},
}));
vi.mock('@/service/order', () => orderMock);
vi.mock('@/service/asset', () => assetMock);
vi.mock('@/service/manage', () => manageMock);

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/order/detail/2/10001', meta: {}, params: {}, query: {} },
    has: () => true,
  },
};

function initStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useLoginInfoStore().UPDATE_USER_INFO({ name: '管理员', isServiceAdmin: true, groups: [] });
}

describe('views/detail/step/config/vmDelete.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    orderMock.getConfigData = vi.fn().mockResolvedValue({ error_code: 0, data: { vm_collection_tasks: [{ id: 't1', server_uuid: 'u1', status: 'progress', dns: [{ sub_domain: 'www', primary_domain: 'example.com', value: '10.0.0.1', scope: 'public', record_type: 'A', ttl: 3600 }] }] } });
    orderMock.getVmDeleteLog = vi.fn().mockResolvedValue({ error_code: 0, data: { description: '删除完成' } });
    orderMock.delVmDeleteTask = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('created 初始化并加载收集任务', async () => {
    const VmDeleteConfig = (await import('@/views/detail/step/config/vmDelete.vue')).default;
    const wrapper = createMounter(VmDeleteConfig, {
      global,
      props: { baseInfo: { state: 4, id: 10001, type: 2, resource: {}, configurations: { dns: [] } }, handleInfo: {}, isAudit: true },
    });
    await wait(50);
    expect(orderMock.getConfigData).toHaveBeenCalled();
    expect(wrapper.vm.configData[0].id).toBe('t1');
  });

  it('submit 组装删除配置参数', async () => {
    const VmDeleteConfig = (await import('@/views/detail/step/config/vmDelete.vue')).default;
    const wrapper = createMounter(VmDeleteConfig, {
      global,
      props: { baseInfo: { state: 4, id: 10001, type: 2, resource: {}, configurations: { dns: [] } }, handleInfo: {}, isAudit: true },
    });
    wrapper.vm.configData = [{ id: 't1', server_uuid: 'u1', dns: [{ sub_domain: 'www', primary_domain: 'example.com', value: '10.0.0.1', scope: 'public', record_type: 'A', ttl: 3600 }] }];
    wrapper.vm.form.description = '删除完成';
    wrapper.vm.submit();
    await wait(20);
    expect(wrapper.emitted('action')).toBeTruthy();
    const payload = wrapper.emitted('action')[0][0];
    expect(payload.configurations).toBeTruthy();
  });

  it('openLog 获取删除日志', async () => {
    const VmDeleteConfig = (await import('@/views/detail/step/config/vmDelete.vue')).default;
    const wrapper = createMounter(VmDeleteConfig, {
      global,
      props: { baseInfo: { state: 4, id: 10001, type: 2, resource: {} }, handleInfo: {}, isAudit: true },
    });
    wrapper.vm.openLog({ task_id: 't1' });
    await wait(50);
    expect(wrapper.vm.logInfo).toBe('删除完成');
  });

  it('delHost 删除主机任务', async () => {
    const VmDeleteConfig = (await import('@/views/detail/step/config/vmDelete.vue')).default;
    const wrapper = createMounter(VmDeleteConfig, {
      global: { ...global, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
      props: { baseInfo: { state: 4, id: 10001, type: 2, resource: { virtual_machines: [{ server_uuid: 'u1' }, { server_uuid: 'u2' }] }, configurations: { dns: [{ server_uuid: 'u1' }] } }, handleInfo: {}, isAudit: true },
    });
    wrapper.vm.configData = [{ id: 't1', server_uuid: 'u1' }, { id: 't2', server_uuid: 'u2' }];
    wrapper.vm.delHost(0, 't1');
    await wait(50);
    expect(orderMock.delVmDeleteTask.mock.calls[0][0].id).toBe('t1');
  });

  it('formatTaskStates 映射任务状态', async () => {
    const VmDeleteConfig = (await import('@/views/detail/step/config/vmDelete.vue')).default;
    const wrapper = createMounter(VmDeleteConfig, {
      global, props: { baseInfo: { state: 4, id: 1, type: 2, resource: {} }, handleInfo: {}, isAudit: false },
    });
    // taskClassMap = ['', 'pending', 'progress', 'failure', 'progress', ...]
    expect(wrapper.vm.formatTaskStates(2)).toBe('progress');
    expect(wrapper.vm.formatTaskStates(6)).toBe('progress');
    expect(wrapper.vm.formatTaskStates(9)).toBe('pending');
  });
});

describe('views/detail/step/config/dns.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
  });

  it('submit 组装 DNS 开通备注参数', async () => {
    const DnsConfig = (await import('@/views/detail/step/config/dns.vue')).default;
    const wrapper = createMounter(DnsConfig, {
      global,
      props: { baseInfo: { state: 3, id: 10001, type: 5, resource: {} }, handleInfo: {}, isAudit: true },
    });
    wrapper.vm.form.description = '开通备注';
    wrapper.vm.submit();
    await wait(20);
    expect(wrapper.emitted('action')).toBeTruthy();
    expect(wrapper.emitted('action')[0][0].description).toBe('开通备注');
  });
});

describe('views/detail/step/config/log-modal.vue', async () => {
  it('渲染日志内容', async () => {
    const LogModal = (await import('@/views/detail/step/config/log-modal.vue')).default;
    const wrapper = createMounter(LogModal, {
      global, props: { visible: true, log: '<p>第1行</p>', isHtml: true },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

describe('views/detail/step/config/chose/ip.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getVmIp = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { subnet_ips: [{ ip: '192.168.1.200', idc: '机房A', netmask: '255.255.255.0', gateway: '192.168.1.1', subnet: '192.168.1.0/24' }], idc_subnet: {} },
    });
    assetMock.getVmIdcSubnet = vi.fn().mockResolvedValue({ error_code: 0, data: { idc_subnet: { '192.168.1.0/24': 50 } } });
  });

  it('visible 打开时加载子网', async () => {
    const IpChoose = (await import('@/views/detail/step/config/chose/ip.vue')).default;
    const wrapper = createMounter(IpChoose, {
      global,
      props: { visible: true, value: '', selectedList: [], idc: '机房A' },
    });
    await wait(50);
    expect(assetMock.getVmIdcSubnet).toHaveBeenCalled();
  });

  it('getTableList 加载子网 IP', async () => {
    const IpChoose = (await import('@/views/detail/step/config/chose/ip.vue')).default;
    const wrapper = createMounter(IpChoose, {
      global,
      props: { visible: true, value: '', selectedList: [], idc: '机房A' },
    });
    wrapper.vm.subnet = '192.168.1.0/24';
    wrapper.vm.getTableList();
    await wait(50);
    expect(wrapper.vm.tableData[0].ip).toBe('192.168.1.200');
  });
});

describe('views/detail/step/config/chose/server.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getVmServer = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { hosts: [{ uuid: 'u1', hostname: 'hyper-001', ip: '192.168.10.1', product: '产品线A', idc: '机房A', free_memory: 64, free_disk: 1000 }] },
    });
  });

  it('getTableList 加载宿主机列表', async () => {
    const ServerChoose = (await import('@/views/detail/step/config/chose/server.vue')).default;
    const wrapper = createMounter(ServerChoose, {
      global,
      props: { visible: true, value: '', filterCondition: {}, minCondition: {}, selectedList: {}, currentChooseIndex: 0 },
    });
    await wait(50);
    wrapper.vm.getTableList();
    await wait(50);
    expect(assetMock.getVmServer).toHaveBeenCalled();
  });

  it('confirm 确认选择宿主机', async () => {
    const ServerChoose = (await import('@/views/detail/step/config/chose/server.vue')).default;
    const wrapper = createMounter(ServerChoose, {
      global,
      props: { visible: true, value: '', filterCondition: {}, minCondition: {}, selectedList: {}, currentChooseIndex: 0 },
    });
    wrapper.vm.allData = [{ uuid: 'u1', hostname: 'hyper-001' }];
    wrapper.vm.selected = 'u1';
    wrapper.vm.confirm();
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });
});

describe('views/detail/step/config/chose/lbgroup.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getLbgroup = vi.fn().mockResolvedValue({ error_code: 0, data: { result: [{ esId: 'lbg-1', groupName: '集群A', subNet: '192.168.1.0/24' }], meta: { total: 1 } } });
    assetMock.getServerByIds = vi.fn().mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'u1', logicalIp: '192.168.10.1' }] });
  });

  it('getTableList 加载集群列表', async () => {
    const LbgroupChoose = (await import('@/views/detail/step/config/chose/lbgroup.vue')).default;
    const wrapper = createMounter(LbgroupChoose, {
      global: { ...global, stubs: { ...global.stubs, 'gs-table': { template: '<div><slot /></div>' }, 'gs-table-column': { template: '<div />' } } },
      props: { visible: true, filterCondition: {} },
    });
    wrapper.vm.getTableList();
    await wait(50);
    expect(assetMock.getLbgroup).toHaveBeenCalled();
    expect(wrapper.vm.tableData[0].groupName).toBe('集群A');
  });

  it('confirm 确认选择集群与服务器', async () => {
    const LbgroupChoose = (await import('@/views/detail/step/config/chose/lbgroup.vue')).default;
    const wrapper = createMounter(LbgroupChoose, {
      global: { ...global, stubs: { ...global.stubs, 'gs-table': { template: '<div><slot /></div>' }, 'gs-table-column': { template: '<div />' } } },
      props: { visible: true, filterCondition: {} },
    });
    wrapper.vm.selectedLbg = { esId: 'lbg-1', groupName: '集群A' };
    wrapper.vm.serverData = [{ assetServerUuid: 'u1', logicalIp: '192.168.10.1' }];
    wrapper.vm.confirm();
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });
});

describe('views/detail/step/config/chose/dns.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getDns = vi.fn().mockResolvedValue({ error_code: 0, data: [{ sub_domain: 'www', primary_domain: 'example.com', value: '10.0.0.1', scope: 'public', record_type: 'A', ttl: 3600 }] });
  });

  it('getTableList 加载 DNS 记录', async () => {
    const DnsChoose = (await import('@/views/detail/step/config/chose/dns.vue')).default;
    const wrapper = createMounter(DnsChoose, {
      global,
      props: { visible: true, filterCondition: {} },
    });
    await wrapper.setProps({ ip: '10.0.0.1' });
    await wait(20);
    wrapper.vm.getTableList();
    await wait(50);
    expect(assetMock.getDns).toHaveBeenCalled();
    expect(wrapper.vm.tableData.length).toBe(1);
  });
});

describe('views/manage/process-modal.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
  });

  it('渲染弹窗并触发 close', async () => {
    const ProcessModal = (await import('@/views/manage/process-modal.vue')).default;
    const wrapper = createMounter(ProcessModal, { global, props: { visible: true, data: {} } });
    wrapper.vm.close();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('confirm 校验通过后执行（todo 分支）', async () => {
    const ProcessModal = (await import('@/views/manage/process-modal.vue')).default;
    const wrapper = createMounter(ProcessModal, { global, props: { visible: true, data: {} } });
    await wait(50);
    expect(wrapper.vm.$refs.processForm).toBeTruthy();
    expect(() => wrapper.vm.confirm()).not.toThrow();
  });
});
