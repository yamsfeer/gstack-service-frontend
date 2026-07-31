import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, nextTick, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

const { assetMock, userMock } = vi.hoisted(() => ({
  assetMock: {},
  userMock: {},
}));
vi.mock('@/service/asset', () => assetMock);
vi.mock('@/service/user', () => userMock);

import ServerList from '@/views/assets/server/server.vue';
import ClusterList from '@/views/assets/cluster/cluster.vue';
import LvsList from '@/views/assets/lvs/lvs.vue';
import NatList from '@/views/assets/nat/nat.vue';
import IpList from '@/views/assets/ip/ip.vue';
import DnsList from '@/views/assets/dns/dns.vue';
import NetMapList from '@/views/assets/netmap/netmap.vue';
import ServerDetail from '@/views/assets/server/detail/index.vue';
import LvsDetail from '@/views/assets/lvs/detail/index.vue';
import CreateIp from '@/views/assets/ip/createIp/createIp.vue';
import EditDns from '@/views/assets/dns/editDns/editDns.vue';
import SelectIp from '@/views/assets/modules/selectIp.vue';

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/assets/server', meta: {}, params: {}, query: {} },
    has: () => true,
  },
};

function initStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const login = useLoginInfoStore();
  login.UPDATE_USER_INFO({ name: '管理员', isServiceAdmin: true, groups: [] });
  return pinia;
}

const SERVER_ROW = {
  assetServerUuid: 'uuid-1', logicalHostName: 'web-server-001', logicalIpListIpAddress: '192.168.10.1',
  logicalHostMachine: 'hyper-001', logicalHostMachineDetails: { logicalIpListIpAddress: '192.168.10.2' },
  assetProduct: '产品线A', assetLevel: '生产', assetIdc: '机房A', logicalOperationSystem: 'CentOS 7.9',
  assetOwner: '管理员', assetAssetStatus: '正常运行', assetServerType: '物理机', assetIsHostMachine: 'True',
};

function mockSearcher() {
  assetMock.getAssetsServerOption = vi.fn().mockResolvedValue({
    error_code: 0, data: { products: ['产品线A'], idcs: ['机房A'], server_levels: ['生产'], systems: ['CentOS'], server_types: ['物理机'], server_statuses: ['正常运行'] },
  });
  assetMock.getAssetsClusterOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
  assetMock.getAssetsLvsOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
  assetMock.getAssetsNatOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
  assetMock.getAssetsIpOption = vi.fn().mockResolvedValue({ error_code: 0, data: { idcs: [], ip_types: ['公网IP'] } });
  assetMock.getAssetsDnsOption = vi.fn().mockResolvedValue({ error_code: 0, data: { domains: [], scopes: [] } });
  assetMock.getAssetsNetMapOption = vi.fn().mockResolvedValue({ error_code: 0, data: { idcs: [], net_mapping_types: ['一对一'] } });
  assetMock.getSubnetByIdc = vi.fn().mockResolvedValue({ error_code: 0, data: { statistics: [{ sub_net: '192.168.1.0/24' }] } });
  assetMock.getHostName = vi.fn().mockResolvedValue({ error_code: 0, data: { uuid: 'uuid-new', hostname: 'new-server' } });
}

describe('views/assets/server/server.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsServer = vi.fn().mockResolvedValue({ error_code: 0, data: { servers: [SERVER_ROW], total: 1 } });
  });

  it('加载服务器列表与筛选选项', async () => {
    const wrapper = createMounter(ServerList, { global });
    await wait(50);
    expect(assetMock.getAssetsServer).toHaveBeenCalled();
    expect(wrapper.vm.tableData).toEqual([SERVER_ROW]);
    expect(wrapper.vm.assetProductListMap).toEqual([{ label: '产品线A', value: '产品线A' }]);
  });

  it('getParams 组装筛选参数并清理空值', () => {
    const wrapper = createMounter(ServerList, { global });
    wrapper.vm.keywords = 'web';
    wrapper.vm.form.assetProductList = ['产品线A'];
    wrapper.vm.form.assetLevelList = [];
    const params = wrapper.vm.getParams();
    expect(params.search_condition).toBe('web');
    expect(params.assetProductList).toEqual(['产品线A']);
    expect(params.assetLevelList).toBeUndefined();
  });

  it('getParams 中 assetOwner 替换为当前用户名', () => {
    const wrapper = createMounter(ServerList, { global });
    wrapper.vm.form.assetOwner = ['与我相关'];
    const params = wrapper.vm.getParams();
    expect(params.assetOwner).toBe('管理员');
  });

  it('highLightHtml 高亮关键词', () => {
    const wrapper = createMounter(ServerList, { global });
    wrapper.vm.keywords = 'web';
    expect(wrapper.vm.highLightHtml('web-server')).toContain('<span class="highLight">web</span>');
    expect(wrapper.vm.highLightHtml('other')).toBe('other');
  });

  it('assetsStatusMap 根据服务器类型联动资产状态选项', async () => {
    const wrapper = createMounter(ServerList, { global });
    wrapper.vm.form.assetServerTypeList = ['物理机'];
    await nextTick();
    expect(wrapper.vm.assetsStatusMap.map(s => s.value)).toEqual(['下架', '报废', '外调', '正常运行']);
  });

  it('saveColConfig 保存列配置', () => {
    const wrapper = createMounter(ServerList, {
      global: { ...global, stubs: { ...global.stubs, 'gs-server-table': { template: '<div class="stub-server-table" />' } } },
    });
    wrapper.vm.sortCol = [{ label: '主机名', value: 'logicalHostName' }];
    wrapper.vm.saveColConfig();
    expect(wrapper.vm.renderCol).toEqual([{ label: '主机名', value: 'logicalHostName' }]);
    expect(wrapper.vm.colConfigVisible).toBe(false);
  });
});

describe('views/assets/cluster/cluster.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsCluster = vi.fn().mockResolvedValue({ error_code: 0, data: { lb_groups: [{ groupName: '集群A', esId: 'lbg-1' }], total: 1 } });
  });

  it('加载集群列表', async () => {
    const wrapper = createMounter(ClusterList, { global });
    await wait(50);
    expect(assetMock.getAssetsCluster).toHaveBeenCalled();
    expect(wrapper.vm.tableData[0].groupName).toBe('集群A');
  });
});

describe('views/assets/lvs/lvs.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsLvs = vi.fn().mockResolvedValue({ error_code: 0, data: { lvss: [{ instanceName: 'lvs-1', instanceStatus: '正常' }], total: 1 } });
  });

  it('加载 LVS 列表', async () => {
    const wrapper = createMounter(LvsList, { global });
    await wait(50);
    expect(assetMock.getAssetsLvs).toHaveBeenCalled();
    expect(wrapper.vm.tableData[0].instanceName).toBe('lvs-1');
  });
});

describe('views/assets/nat/nat.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsNat = vi.fn().mockResolvedValue({ error_code: 0, data: { nats: [{ instanceName: 'nat-1', instanceStatus: '正常' }], total: 1 } });
    assetMock.delAssetsNat = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('加载 NAT 列表', async () => {
    const wrapper = createMounter(NatList, { global });
    await wait(50);
    expect(wrapper.vm.tableData[0].instanceName).toBe('nat-1');
  });
});

describe('views/assets/ip/ip.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsIp = vi.fn().mockResolvedValue({ error_code: 0, data: { ips: [{ esId: 'ip-1', ipAddress: '10.0.0.1', isUsed: 'False' }], total: 1 } });
    assetMock.updateAssetsIp = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.createAssetsIpBatch = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('加载 IP 列表', async () => {
    const wrapper = createMounter(IpList, { global });
    await wait(50);
    expect(wrapper.vm.tableData[0].ipAddress).toBe('10.0.0.1');
  });

  it('handleToggle 确认后切换占用状态', async () => {
    const wrapper = createMounter(IpList, {
      global: { ...global, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
    });
    await wait(50);
    wrapper.vm.handleToggle('True', { esId: 'ip-1', isUsed: 'False' });
    await wait(50);
    expect(assetMock.updateAssetsIp).toHaveBeenCalled();
  });

  it('handleCreateIp 打开创建弹窗', () => {
    const wrapper = createMounter(IpList, { global });
    wrapper.vm.handleCreateIp();
    expect(wrapper.vm.createVisible).toBe(true);
  });

  it('createIp 提交批量创建', async () => {
    const wrapper = createMounter(IpList, { global });
    await wait(50);
    wrapper.vm.createIp([{ ipAddress: '10.0.0.9' }]);
    await wait(50);
    expect(assetMock.createAssetsIpBatch).toHaveBeenCalled();
  });
});

describe('views/assets/dns/dns.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: { dnss: [{ domain: 'www.example.com', status: 'enable' }], total: 1 } });
  });

  it('加载 DNS 列表', async () => {
    const wrapper = createMounter(DnsList, { global });
    await wait(50);
    expect(wrapper.vm.tableData[0].domain).toBe('www.example.com');
  });
});

describe('views/assets/netmap/netmap.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsNetMap = vi.fn().mockResolvedValue({ error_code: 0, data: { net_mappings: [{ publicIp: '10.0.0.1', domains: '["a.com"]' }], total: 1 } });
  });

  it('加载内外网映射列表', async () => {
    const wrapper = createMounter(NetMapList, { global });
    await wait(50);
    expect(wrapper.vm.tableData[0].publicIp).toBe('10.0.0.1');
  });
});

describe('views/assets/server/detail/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getAssetsServerOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
    assetMock.getServerDetail = vi.fn().mockResolvedValue({ error_code: 0, data: { ...SERVER_ROW, assetServerUuid: 'uuid-1' } });
    assetMock.getUserListByUsername = vi.fn().mockResolvedValue({ error_code: 0, data: { user_list: [{ name: '管理员' }] } });
    assetMock.updateServer = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.createServer = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.getHostName = vi.fn().mockResolvedValue({ error_code: 0, data: { uuid: 'uuid-new', hostname: 'new-server' } });
  });

  it('详情模式加载服务器详情', async () => {
    const wrapper = createMounter(ServerDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, ip: { template: '<div class="ip-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/server/detail/uuid-1', params: { id: 'uuid-1' }, meta: {} } },
      },
    });
    await wait(50);
    expect(assetMock.getServerDetail).toHaveBeenCalledWith('uuid-1');
    expect(wrapper.vm.isDetail).toBe(true);
  });

  it('新增模式生成新主机名', async () => {
    const wrapper = createMounter(ServerDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, ip: { template: '<div class="ip-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/server/add', params: {}, meta: {} } },
      },
    });
    await wait(50);
    expect(wrapper.vm.isDetail).toBe(false);
    expect(assetMock.getHostName).toHaveBeenCalled();
    expect(wrapper.vm.isEditing).toBe(true);
  });

  it('getDetail 获取虚拟服务器列表', async () => {
    assetMock.getAssetsServer = vi.fn().mockResolvedValue({ error_code: 0, data: { servers: [SERVER_ROW], total: 1 } });
    const wrapper = createMounter(ServerDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, ip: { template: '<div class="ip-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/server/detail/uuid-1', params: { id: 'uuid-1' }, meta: {} } },
      },
    });
    await wait(50);
    expect(assetMock.getAssetsServer).toHaveBeenCalled();
  });

  it('turnToEdit / cancelEdit 切换编辑状态', async () => {
    const wrapper = createMounter(ServerDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, ip: { template: '<div class="ip-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/server/detail/uuid-1', params: { id: 'uuid-1' }, meta: {} } },
      },
    });
    await wait(50);
    wrapper.vm.$refs.layout = { turnToEdit: vi.fn(), cancelEdit: vi.fn(), resetForm: vi.fn(), updateData: vi.fn(), getParam: vi.fn(), $refs: { form: { validate: cb => cb(true) } } };
    wrapper.vm.turnToEdit();
    expect(wrapper.vm.isEditing).toBe(true);
    wrapper.vm.cancelEdit();
    expect(wrapper.vm.isEditing).toBe(false);
  });
});

describe('views/assets/lvs/detail/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    mockSearcher();
    assetMock.getLvsDetail = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { instanceName: 'lvs-1', assetLbGroup: 'lbg-1', directorMasterUuid: 'uuid-1', rsUuidList: '["uuid-1"]', subNet: '192.168.1.0/24' },
    });
    assetMock.getClusterDetail = vi.fn().mockResolvedValue({ error_code: 0, data: { groupName: '集群A' } });
    assetMock.getServerByIds = vi.fn().mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'uuid-1', logicalIp: '192.168.10.1' }] });
    assetMock.createLvs = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.deleteLvs = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.isLvsExistName = vi.fn().mockResolvedValue({ error_code: 0, data: { exists: false } });
  });

  it('详情模式加载 LVS 详情并补充关联信息', async () => {
    const wrapper = createMounter(LvsDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, server: { template: '<div class="s-stub" />' }, lbgroup: { template: '<div class="l-stub" />' }, ip: { template: '<div class="i-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/balancing/lvs/detail/lvs-1', params: { id: 'lvs-1' }, meta: {} } },
      },
    });
    await wait(50);
    expect(assetMock.getLvsDetail).toHaveBeenCalledWith('lvs-1');
    expect(assetMock.getClusterDetail).toHaveBeenCalledWith('lbg-1');
  });

  it('formatParam 组装 LVS 创建参数', () => {
    const wrapper = createMounter(LvsDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, server: { template: '<div class="s-stub" />' }, lbgroup: { template: '<div class="l-stub" />' }, ip: { template: '<div class="i-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/balancing/lvs/add', params: {}, meta: {} } },
      },
    });
    const param = wrapper.vm.formatParam({
      instanceName: 'lvs-new',
      subNet: '192.168.1.0/24',
      rsUuidList: '[{"assetServerUuid":"uuid-1"},{"assetServerUuid":"uuid-2"}]',
      LbGroup: { groupId: 'lbg-1', assetServerUuid: 'uuid-1' },
    });
    expect(param.instanceName).toBe('lvs-new');
    expect(param.rsUuidList).toBe('["uuid-1","uuid-2"]');
    expect(param.assetLbGroup).toBe('lbg-1');
    expect(param.directorMasterUuid).toBe('uuid-1');
    expect(param.LbGroup).toBeUndefined();
  });

  it('setValidateName 校验实例名是否重复', async () => {
    const wrapper = createMounter(LvsDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': { template: '<div class="dl-stub" />', methods: { turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {}, getParam() { return {}; } } }, server: { template: '<div class="s-stub" />' }, lbgroup: { template: '<div class="l-stub" />' }, ip: { template: '<div class="i-stub" />' } },
        mocks: { ...global.mocks, $route: { path: '/main/assets/balancing/lvs/add', params: {}, meta: {} } },
      },
    });
    const cb = vi.fn();
    await wrapper.vm.setValidateName().instanceName.validator(null, 'lvs-new', cb);
    await wait(20);
    expect(assetMock.isLvsExistName).toHaveBeenCalledWith('lvs-new');
  });
});

describe('views/assets/ip/createIp/createIp.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.createAssetsIpBatch = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.getSubnetByIdc = vi.fn().mockResolvedValue({ error_code: 0, data: { statistics: [{ sub_net: '192.168.1.0/24', count: 100 }] } });
  });

  it('netmask / subnet 计算属性', () => {
    const wrapper = createMounter(CreateIp, {
      global,
      props: { title: '添加IP', idcs: ['机房A'], ipTypes: ['公网IP'], visible: true },
    });
    wrapper.vm.form.ipAddressStart = '192.168.1.1';
    wrapper.vm.form.prefix = 24;
    expect(wrapper.vm.netmask).toBe('255.255.255.0');
    expect(wrapper.vm.subnet).toBe('192.168.1.0');
  });
});

describe('views/assets/dns/editDns/editDns.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.updateAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.retryUpdateAssetsDns = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('渲染编辑表单', () => {
    const wrapper = createMounter(EditDns, {
      global,
      props: { title: '编辑DNS', visible: true, editData: { domain: 'www.example.com', ttl: 3600 } },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

describe('views/assets/modules/selectIp.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsIp = vi.fn().mockResolvedValue({ error_code: 0, data: { ips: [{ esId: 'ip-1', ipAddress: '10.0.0.1', isUsed: 'False' }], total: 1 } });
  });

  it('visible 打开时拉取 IP 列表', async () => {
    const wrapper = createMounter(SelectIp, {
      global,
      props: { visible: true, value: '', selectedList: [], pageFilterCondition: {} },
    });
    await wait(50);
    expect(assetMock.getAssetsIp).toHaveBeenCalled();
  });

  it('confirm 确认选择', async () => {
    const wrapper = createMounter(SelectIp, {
      global,
      props: { visible: true, value: '', selectedList: [], pageFilterCondition: {} },
    });
    await wait(50);
    wrapper.vm.selected = { esId: 'ip-1', ip_address: '10.0.0.1' };
    wrapper.vm.confirm();
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });
});
