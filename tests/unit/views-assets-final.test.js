import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

const { assetMock } = vi.hoisted(() => ({ assetMock: {} }));
vi.mock('@/service/asset', () => assetMock);

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

describe('views/assets/cluster/cluster.vue 补充', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsClusterOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: ['产品线A'], idcs: ['机房A'] } });
    assetMock.getAssetsCluster = vi.fn().mockResolvedValue({ error_code: 0, data: { lb_groups: [{ esId: 'lbg-1', groupName: '集群A' }], total: 1 } });
    assetMock.delAssetsCluster = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('adminIp 解析管理 IP', async () => {
    const ClusterList = (await import('@/views/assets/cluster/cluster.vue')).default;
    const wrapper = createMounter(ClusterList, { global });
    await wait(80);
    expect(wrapper.vm.adminIp(JSON.stringify([{ is_admin_ip: true, ip_address: '10.0.0.1' }]))).toBe('10.0.0.1');
    expect(wrapper.vm.adminIp(JSON.stringify([{ is_cluster_ip: true, ip_address: '10.0.0.2' }]))).toBe('10.0.0.2');
    expect(wrapper.vm.adminIp(JSON.stringify([{ ip_address: '10.0.0.3' }]))).toBe('10.0.0.3');
    expect(wrapper.vm.adminIp('bad-json')).toBe('bad-json');
    expect(wrapper.vm.adminIp('[]')).toBe('');
  });

  it('del 删除集群', async () => {
    const ClusterList = (await import('@/views/assets/cluster/cluster.vue')).default;
    const wrapper = createMounter(ClusterList, {
      global: { ...global, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
    });
    await wait(80);
    wrapper.vm.del('lbg-1');
    await wait(50);
    expect(assetMock.delAssetsCluster).toHaveBeenCalledWith('lbg-1');
  });

  it('arr2str 过滤器解析数组字符串', async () => {
    const ClusterList = (await import('@/views/assets/cluster/cluster.vue')).default;
    const wrapper = createMounter(ClusterList, { global });
    const arr2str = wrapper.vm.arr2str;
    expect(arr2str('["a","b"]')).toBe('a,b');
    expect(arr2str('plain')).toBe('plain');
    expect(arr2str('')).toBe('');
  });

  it('getParams 清理空数组', async () => {
    const ClusterList = (await import('@/views/assets/cluster/cluster.vue')).default;
    const wrapper = createMounter(ClusterList, { global });
    wrapper.vm.form.productList = ['产品线A'];
    wrapper.vm.form.idcList = [];
    const params = wrapper.vm.getParams();
    expect(params.productList).toEqual(['产品线A']);
    expect(params.idcList).toBeUndefined();
  });
});

describe('views/assets/nat/nat.vue 补充', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsNatOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
    assetMock.getAssetsNat = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { nats: [{ esId: 'nat-1', instanceName: 'nat-1', assetLbGroup: 'lbg-1', assetLbGroupDetails: { groupName: '集群A', esId: 'lbg-1', assetServerUuid: 'u1', logicalIp: '192.168.10.1' }, instanceStatus: '正常', clientServerUuidMappingIps: ['1.1.1.1'] }], total: 1 },
    });
    assetMock.getServerByIds = vi.fn().mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'u1' }] });
    assetMock.delAssetsNat = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('handleBatchServer 查看后端主机', async () => {
    assetMock.batchServer = vi.fn().mockResolvedValue({ error_code: 0, data: { servers: [{ assetServerUuid: 'u1' }] } });
    const NatList = (await import('@/views/assets/nat/nat.vue')).default;
    const wrapper = createMounter(NatList, {
      global: { ...global, stubs: { ...global.stubs, 'gs-server-table': { template: '<div class="st" />' }, 'gs-table': { template: '<div><slot /></div>' }, 'gs-table-column': { template: '<div />' } } },
    });
    await wait(80);
    await wrapper.vm.handleBatchServer({ assetLbGroupDetails: { groupName: '集群A', esId: 'lbg-1', assetServerUuid: 'u1', logicalIp: '192.168.10.1' } });
    expect(assetMock.batchServer).toHaveBeenCalled();
  });

  it('del 删除 NAT 实例', async () => {
    const NatList = (await import('@/views/assets/nat/nat.vue')).default;
    const wrapper = createMounter(NatList, {
      global: { ...global, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
    });
    await wait(80);
    wrapper.vm.del('nat-1');
    await wait(50);
    expect(assetMock.delAssetsNat).toHaveBeenCalledWith('nat-1');
  });

  it('arr2str 过滤器', async () => {
    const NatList = (await import('@/views/assets/nat/nat.vue')).default;
    const wrapper = createMounter(NatList, { global });
    const arr2str = wrapper.vm.arr2str;
    expect(arr2str('["x"]')).toBe('x');
    expect(arr2str('raw')).toBe('raw');
  });
});

describe('views/assets/lvs/lvs.vue 补充', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsLvsOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
    assetMock.getAssetsLvs = vi.fn().mockResolvedValue({ error_code: 0, data: { lvss: [{ esId: 'lvs-1', instanceName: 'lvs-1', instanceStatus: '正常' }], total: 1 } });
  });

  it('handleBatchServer 查看 LVS 后端主机', async () => {
    assetMock.getAssetsLvs.mockResolvedValue({
      error_code: 0,
      data: { lvss: [{ esId: 'lvs-1', instanceName: 'lvs-1', assetLbGroup: 'lbg-1', assetLbGroupDetails: { groupName: '集群A', esId: 'lbg-1', assetServerUuid: 'u1', logicalIp: '192.168.10.1' } }], total: 1 },
    });
    assetMock.batchServer = vi.fn().mockResolvedValue({ error_code: 0, data: { servers: [{ assetServerUuid: 'u1' }] } });
    const LvsList = (await import('@/views/assets/lvs/lvs.vue')).default;
    const wrapper = createMounter(LvsList, { global });
    await wait(80);
    await wrapper.vm.handleBatchServer({ assetLbGroupDetails: { groupName: '集群A', esId: 'lbg-1', assetServerUuid: 'u1', logicalIp: '192.168.10.1' } });
    expect(assetMock.batchServer).toHaveBeenCalled();
  });
});

describe('views/assets/netmap/netmap.vue 补充', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsNetMapOption = vi.fn().mockResolvedValue({ error_code: 0, data: { idcs: ['机房A'], net_mapping_types: ['一对一'] } });
    assetMock.getAssetsNetMap = vi.fn().mockResolvedValue({ error_code: 0, data: { net_mappings: [{ publicIp: '10.0.0.1', domains: '["a.com"]' }], total: 1 } });
  });

  it('加载选项与列表', async () => {
    const NetMapList = (await import('@/views/assets/netmap/netmap.vue')).default;
    const wrapper = createMounter(NetMapList, { global });
    await wait(80);
    expect(wrapper.vm.mappingTypeListMap).toEqual([{ label: '一对一', value: '一对一' }]);
    expect(wrapper.vm.tableData[0].publicIp).toBe('10.0.0.1');
  });

  it('arr2str 过滤器', async () => {
    const NetMapList = (await import('@/views/assets/netmap/netmap.vue')).default;
    const wrapper = createMounter(NetMapList, { global });
    const arr2str = wrapper.vm.arr2str;
    // netmap 的 arr2str 使用中文逗号
    expect(arr2str('["a","b"]')).toBe('a，b');
    expect(arr2str('plain')).toBe('plain');
  });
});

describe('views/assets/modules/selectIp.vue 补充', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getAssetsIp = vi.fn().mockResolvedValue({ error_code: 0, data: { ips: [{ esId: 'ip-1', ipAddress: '10.0.0.1', isUsed: 'False' }], total: 1 } });
  });

  it('getTableList 组装查询参数并拉取', async () => {
    const SelectIp = (await import('@/views/assets/modules/selectIp.vue')).default;
    const wrapper = createMounter(SelectIp, {
      global: { ...global, stubs: { ...global.stubs, 'gs-table': { template: '<div><slot /></div>' }, 'gs-table-column': { template: '<div />' } } },
      props: { visible: true, value: '', selectedList: [], pageFilterCondition: { isUsed: 'False' } },
    });
    await wait(80);
    wrapper.vm.getTableList();
    await wait(50);
    const call = assetMock.getAssetsIp.mock.calls[assetMock.getAssetsIp.mock.calls.length - 1][0];
    expect(call.page).toBe(1);
    expect(call.isUsed).toBe('False');
  });

  it('pageChange / filterData', async () => {
    const SelectIp = (await import('@/views/assets/modules/selectIp.vue')).default;
    const wrapper = createMounter(SelectIp, {
      global: { ...global, stubs: { ...global.stubs, 'gs-table': { template: '<div><slot /></div>' }, 'gs-table-column': { template: '<div />' } } },
      props: { visible: false, value: '', selectedList: [], pageFilterCondition: {} },
    });
    await wait(80);
    wrapper.vm.pageChange(2);
    expect(wrapper.vm.pageNum).toBe(2);
    wrapper.vm.filterData();
    expect(wrapper.vm.pageNum).toBe(1);
  });
});

describe('补充：cluster/nat/createIp', () => {
  it('cluster saveColConfig 保存列配置（el-table 未渲染时防御）', async () => {
    const ClusterList = (await import('@/views/assets/cluster/cluster.vue')).default;
    const wrapper = createMounter(ClusterList, {
      global: { ...global, stubs: { ...global.stubs, 'gs-server-table': { template: '<div class="st" />' } } },
    });
    await wait(80);
    wrapper.vm.sortCol = [{ label: '集群名', value: 'groupName' }];
    wrapper.vm.saveColConfig();
    expect(wrapper.vm.renderCol).toEqual([{ label: '集群名', value: 'groupName' }]);
    expect(wrapper.vm.colConfigVisible).toBe(false);
  });

  it('nat getTableList 失败时清空列表并提示', async () => {
    assetMock.getAssetsNat = vi.fn().mockResolvedValue({ error_code: 1 });
    const NatList = (await import('@/views/assets/nat/nat.vue')).default;
    const wrapper = createMounter(NatList, {
      global: { ...global, stubs: { ...global.stubs, 'gs-server-table': { template: '<div class="st" />' } }, mocks: { ...global.mocks, $Notify: { error: vi.fn() } } },
    });
    await wait(80);
    expect(wrapper.vm.tableData).toEqual([]);
  });

  it('createIp confirm 校验失败不提交', async () => {
    const CreateIp = (await import('@/views/assets/ip/createIp/createIp.vue')).default;
    const wrapper = createMounter(CreateIp, {
      global, props: { title: '添加IP', idcs: [{ value: '机房A', label: '机房A' }], ipTypes: [{ value: '公网IP', label: '公网IP' }], visible: true },
    });
    await wait(80);
    wrapper.vm.$refs.form = { validate: cb => cb(false), resetFields: () => {} };
    wrapper.vm.confirm();
    expect(wrapper.emitted('submit')).toBeFalsy();
  });
});

describe('views/assets/ip/createIp/createIp.vue 补充', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.createAssetsIpBatch = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.getSubnetByIdc = vi.fn().mockResolvedValue({ error_code: 0, data: { statistics: [] } });
  });

  it('cancel 关闭弹窗', async () => {
    const CreateIp = (await import('@/views/assets/ip/createIp/createIp.vue')).default;
    const wrapper = createMounter(CreateIp, {
      global, props: { title: '添加IP', idcs: [{ value: '机房A', label: '机房A' }], ipTypes: [{ value: '公网IP', label: '公网IP' }], visible: true },
    });
    await wait(80);
    wrapper.vm.cancel();
    expect(wrapper.emitted('update:visible')).toBeTruthy();
  });

  it('visible 打开时默认选中机房与类型', async () => {
    const CreateIp = (await import('@/views/assets/ip/createIp/createIp.vue')).default;
    const wrapper = createMounter(CreateIp, {
      global, props: { title: '添加IP', idcs: [{ value: '机房B', label: '机房B' }], ipTypes: [{ value: '私网IP', label: '私网IP' }], visible: false },
    });
    await wrapper.setProps({ visible: true });
    await wait(30);
    expect(wrapper.vm.form.idc).toBe('机房B');
    expect(wrapper.vm.form.type).toBe('私网IP');
  });
});
