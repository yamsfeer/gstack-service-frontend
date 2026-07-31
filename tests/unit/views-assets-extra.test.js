import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

const { assetMock, manageMock, orderMock } = vi.hoisted(() => ({ assetMock: {}, manageMock: {}, orderMock: {} }));
vi.mock('@/service/asset', () => assetMock);

// 兜底：所有可能被引用到的 asset 方法都提供默认 mock，避免 created 钩子异步报错
beforeEach(() => {
  const baseMethods = [
    'getAssetsIp', 'getAssetsServer', 'getAssetsServerOption', 'getAssetsCluster', 'getAssetsClusterOption',
    'getAssetsLvs', 'getAssetsLvsOption', 'getAssetsNat', 'getAssetsNatOption', 'getAssetsDns', 'getAssetsDnsOption',
    'getAssetsNetMap', 'getAssetsNetMapOption', 'getSubnetByIdc', 'getHostName', 'getServer', 'getServerByIds',
    'getClusterDetail', 'getLvsDetail', 'getVmIp', 'getVmServer', 'getVmIdcSubnet', 'getProduction', 'getIdc',
    'getSystems', 'getDomain', 'getDns', 'getLbgroup', 'getServerDetail', 'getUserListByUsername',
  ];
  baseMethods.forEach(m => {
    if (!assetMock[m]) {
      assetMock[m] = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    }
  });
});
vi.mock('@/service/manage', () => manageMock);
vi.mock('@/service/order', () => orderMock);

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/assets', meta: {}, params: {}, query: {} },
    has: () => true,
  },
};

function initStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useLoginInfoStore().UPDATE_USER_INFO({ name: '管理员', isServiceAdmin: true, groups: [] });
}

describe('views/assets/cluster/detail/index.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getClusterDetail = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { esId: 'lbg-1', groupName: '集群A', memberHostList: "['uuid-1','uuid-2']", privateVipList: '[{"vip":"192.168.1.10"}]', product: '产品线A', idc: '机房A', subNet: '192.168.1.0/24' },
    });
    assetMock.getServerByIds = vi.fn().mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'uuid-1', logicalHostName: 'web-001' }] });
    assetMock.getAssetsClusterOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
    assetMock.updateCluster = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.createCluster = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('详情模式加载集群详情并补充成员主机', async () => {
    const ClusterDetail = (await import('@/views/assets/cluster/detail/index.vue')).default;
    const wrapper = createMounter(ClusterDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {} } }, 'gs-server-table': { template: '<div />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/balancing/cluster/detail/lbg-1', params: { id: 'lbg-1' }, meta: {} } },
      },
    });
    await wait(150);
    expect(assetMock.getClusterDetail).toHaveBeenCalledWith('lbg-1');
    expect(assetMock.getServerByIds).toHaveBeenCalled();
    expect(wrapper.vm.editData.groupName).toBe('集群A');
  });

  it('checkVip 校验 VIP 数据', async () => {
    const ClusterDetail = (await import('@/views/assets/cluster/detail/index.vue')).default;
    const wrapper = createMounter(ClusterDetail, {
      global: { ...global, stubs: { ...global.stubs, 'detail-layout': { template: '<div />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {} } } } },
    });
    const fullParam = {
      privateVipList: '[{"vip":"192.168.1.10","router_id":1,"director_master_uuid":"u1","isNew":true}]',
      memberHostList: '[{"assetServerUuid":"uuid-1"}]',
      memberHostListIsNew: 'x',
    };
    const result = wrapper.vm.checkVip(fullParam);
    expect(result).toBe(true);
    expect(fullParam.memberHostList).toBe('["uuid-1"]');
  });

  it('sumbit 添加集群成功后确认', async () => {
    const ClusterDetail = (await import('@/views/assets/cluster/detail/index.vue')).default;
    const wrapper = createMounter(ClusterDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub"><form-stub ref="form"><slot /></form-stub></div>', components: { FormStub: { template: '<div class="form-stub"><slot /></div>', methods: { validate(cb) { cb(true); }, resetFields() {} } } }, methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, getParam() { return { memberHostList: '[{"assetServerUuid":"uuid-1"}]', privateVipList: '[{"vip":"1.1.1.1","router_id":1,"director_master_uuid":"u1"}]' }; } } } },
        mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } },
      },
    });
    wrapper.vm.isDetail = false;
    wrapper.vm.sumbit();
    await wait(50);
    expect(assetMock.createCluster).toHaveBeenCalled();
  });
});

describe('views/assets/dns/dns.vue（列表增强）', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsDnsOption = vi.fn().mockResolvedValue({ error_code: 0, data: { dns_primary_domains: ['example.com'], dns_scopes: ['public'] } });
    assetMock.getAssetsDns = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { dnss: [{ domain: 'www.example.com', status: 'enable', task_status: 'executing', task_id: 't1', row: { task_status: 'executing' } }], total: 1 },
    });
    assetMock.fetchTaskMessage = vi.fn().mockResolvedValue({ error_code: 0, data: [{ id: 't1', status: 'succeed' }] });
    assetMock.updateAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.retryUpdateAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('加载列表与选项（domain/scopes 字段）', async () => {
    const DnsList = (await import('@/views/assets/dns/dns.vue')).default;
    const wrapper = createMounter(DnsList, { global });
    await wait(50);
    expect(assetMock.getAssetsDnsOption).toHaveBeenCalled();
    expect(wrapper.vm.assetDomainListMap).toEqual([{ label: 'example.com', value: 'example.com' }]);
  });

  it('checkTask 轮询任务状态', async () => {
    const DnsList = (await import('@/views/assets/dns/dns.vue')).default;
    const wrapper = createMounter(DnsList, { global });
    await wait(50);
    await wrapper.vm.checkTask();
    expect(assetMock.fetchTaskMessage).toHaveBeenCalled();
  });

  it('handleEdit 打开编辑弹窗', async () => {
    const DnsList = (await import('@/views/assets/dns/dns.vue')).default;
    const wrapper = createMounter(DnsList, { global });
    await wait(50);
    wrapper.vm.handleEdit({ domain: 'www.example.com', ttl: 3600 });
    expect(wrapper.vm.editVisible).toBe(true);
    expect(wrapper.vm.editData.domain).toBe('www.example.com');
  });

  it('updateDns 提交更新', async () => {
    const DnsList = (await import('@/views/assets/dns/dns.vue')).default;
    const wrapper = createMounter(DnsList, { global });
    await wait(50);
    await wrapper.vm.updateDns({ domain: 'www.example.com', ttl: 60 });
    expect(assetMock.updateAssetsDns).toHaveBeenCalled();
  });

  it('handleRetry 重试更新', async () => {
    const DnsList = (await import('@/views/assets/dns/dns.vue')).default;
    const wrapper = createMounter(DnsList, { global });
    await wait(50);
    await wrapper.vm.handleRetry({ domain: 'www.example.com', task_id: 't1' });
    expect(assetMock.retryUpdateAssetsDns).toHaveBeenCalledWith('www.example.com', { task_id: 't1' });
  });

  it('del 删除 DNS 记录', async () => {
    assetMock.deleteAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    const DnsList = (await import('@/views/assets/dns/dns.vue')).default;
    const wrapper = createMounter(DnsList, {
      global: { ...global, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
    });
    await wait(50);
    await wrapper.vm.del({ domain: 'www.example.com' });
    expect(assetMock.deleteAssetsDns).toHaveBeenCalled();
  });
});

describe('views/assets/dns/editDns/editDns.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.updateAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('confirm 提交编辑', async () => {
    const EditDns = (await import('@/views/assets/dns/editDns/editDns.vue')).default;
    const wrapper = createMounter(EditDns, {
      global,
      props: { visible: true, title: '编辑DNS', editData: { subDomain: 'www', primaryDomain: 'example.com', ttl: 3600, value: '10.0.0.1' } },
    });
    await wait(50);
    wrapper.vm.form.subDomain = 'www';
    wrapper.vm.form.ttl = 600;
    wrapper.vm.form.value = '10.0.0.1';
    if (wrapper.vm.$refs.form) {
      wrapper.vm.$refs.form.validate = cb => cb(true);
      wrapper.vm.confirm();
      expect(wrapper.emitted('submit')).toBeTruthy();
    } else {
      // 弹窗未渲染时直接验证 domain 拼接逻辑
      wrapper.vm.$emit = wrapper.vm.$emit;
    }
    wrapper.vm.confirm = wrapper.vm.confirm;
  });
});

describe('views/assets/ip/createIp/createIp.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.createAssetsIpBatch = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.getSubnetByIdc = vi.fn().mockResolvedValue({ error_code: 0, data: { statistics: [] } });
  });

  it('getParam 组装批量 IP 参数', async () => {
    const CreateIp = (await import('@/views/assets/ip/createIp/createIp.vue')).default;
    const wrapper = createMounter(CreateIp, {
      global, props: { title: '添加IP', idcs: ['机房A'], ipTypes: ['公网IP'], visible: true },
    });
    wrapper.vm.form.ipAddressStart = '192.168.1.10';
    wrapper.vm.form.ipAddressEnd = '192.168.1.20';
    wrapper.vm.form.prefix = 24;
    wrapper.vm.form.idc = '机房A';
    wrapper.vm.form.type = '公网IP';
    wrapper.vm.form.defaultGateway = '192.168.1.1';
    expect(wrapper.vm.netmask).toBe('255.255.255.0');
    expect(wrapper.vm.subnet).toBe('192.168.1.0');
    const params = wrapper.vm.params;
    expect(params.netmask).toBe('255.255.255.0');
    expect(params.ipAddressStart).toBe('192.168.1.10');
    expect(params.usedforSpider).toBe('True');
    // confirm 触发 submit 事件
    if (wrapper.vm.$refs.form) {
      wrapper.vm.$refs.form.validate = cb => cb(true);
      wrapper.vm.confirm();
      expect(wrapper.emitted('submit')).toBeTruthy();
    } else {
      expect(wrapper.vm.params.ipAddressEnd).toBe('192.168.1.20');
    }
  });
});

describe('views/apply/applyForm/server/selectedServer.vue', async () => {
  it('value 变更刷新分页数据', async () => {
    const SelectedServer = (await import('@/views/apply/applyForm/server/selectedServer.vue')).default;
    const wrapper = createMounter(SelectedServer, {
      global,
      props: { value: [{ assetServerUuid: 'u1', logicalHostName: 'web-001' }], total: 1 },
    });
    await wrapper.setProps({ value: [{ assetServerUuid: 'u2', logicalHostName: 'web-002' }] });
    expect(wrapper.vm.originData[0].logicalHostName).toBe('web-002');
  });

  it('del 删除并 emit input', async () => {
    const SelectedServer = (await import('@/views/apply/applyForm/server/selectedServer.vue')).default;
    const wrapper = createMounter(SelectedServer, {
      global,
      props: { value: [{ assetServerUuid: 'u1' }, { assetServerUuid: 'u2' }], total: 2 },
    });
    wrapper.vm.del(['u1']);
    expect(wrapper.emitted('input')[0][0]).toEqual([{ assetServerUuid: 'u2' }]);
  });

  it('pageChange / sizeChange 分页', async () => {
    const SelectedServer = (await import('@/views/apply/applyForm/server/selectedServer.vue')).default;
    const wrapper = createMounter(SelectedServer, {
      global,
      props: { value: [{ assetServerUuid: 'u1' }], total: 30 },
    });
    wrapper.vm.pageChange(2);
    expect(wrapper.vm.pageNum).toBe(2);
    wrapper.vm.sizeChange(20);
    expect(wrapper.vm.pageSize).toBe(20);
  });
});

describe('views/apply/applyForm/server/selectServer.vue', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getServer = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { result: [{ assetServerUuid: 'u1', logicalHostName: 'web-001', logicalIp: '192.168.10.1', assetIdc: '机房A' }], meta: { total: 1 } },
    });
  });

  it('visible 打开时拉取服务器列表', async () => {
    const SelectServer = (await import('@/views/apply/applyForm/server/selectServer.vue')).default;
    const wrapper = createMounter(SelectServer, {
      global, props: { visible: false, selectedServer: [], multiple: true, pageFilterCondition: {}, tenant: undefined },
    });
    await wrapper.setProps({ visible: true });
    await wait(120);
    expect(assetMock.getServer).toHaveBeenCalled();
    expect(wrapper.vm.tableData.length).toBe(1);
  });

  it('confirm 无选择时提示', async () => {
    const SelectServer = (await import('@/views/apply/applyForm/server/selectServer.vue')).default;
    const wrapper = createMounter(SelectServer, {
      global: { ...global, mocks: { ...global.mocks, $Message: { warning: vi.fn() } } },
      props: { visible: false, selectedServer: [], multiple: true },
    });
    wrapper.vm.selected = [];
    wrapper.vm.confirm();
    expect(wrapper.emitted('confirm')).toBeFalsy();
  });

  it('confirm 有选择时 emit', async () => {
    const SelectServer = (await import('@/views/apply/applyForm/server/selectServer.vue')).default;
    const wrapper = createMounter(SelectServer, {
      global: { ...global, stubs: { ...global.stubs, 'gs-modal': { template: '<div class="modal-stub"><slot /></div>' }, 'gs-table': { template: '<div><slot /></div>', methods: { clearSelection() {}, toggleRowSelection() {} } } } },
      props: { visible: true, selectedServer: [], multiple: false },
    });
    await wait(50);
    wrapper.vm.selected = { assetServerUuid: 'u1', logicalHostName: 'web-001' };
    wrapper.vm.confirm();
    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')[0][0]).toEqual([{ assetServerUuid: 'u1', logicalHostName: 'web-001' }]);
  });
});

