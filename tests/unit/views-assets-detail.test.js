// ============================================================
// 资产详情/录入页组件测试
// 覆盖 server/detail、cluster/detail、lvs/detail 三个页面的
// 编辑/保存/删除/弹窗/信息联动等核心方法
// ============================================================
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
    $router: { push: vi.fn() },
    $route: { path: '/main/assets', meta: {}, params: {}, query: {} },
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

const LAYOUT_STUB = (getParamResult) => ({
  template: '<div class="dl"><form-stub ref="form" /></div>',
  components: {
    FormStub: {
      template: '<div class="form-stub"><slot /></div>',
      methods: { validate(cb) { cb(true); }, resetFields() {} },
    },
  },
  methods: {
    turnToEdit() {}, cancelEdit() {}, resetForm() {}, updateData() {},
    getParam() { return getParamResult(); },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  initStore();
  const base = [
    'getAssetsServerOption', 'getAssetsClusterOption', 'getAssetsLvsOption',
    'getServerDetail', 'updateServer', 'createServer', 'getUserListByUsername',
    'getAssetsServer', 'getHostName', 'getSubnetByIdc',
    'getClusterDetail', 'updateCluster', 'createCluster', 'getServerByIds',
    'getLvsDetail', 'createLvs', 'deleteLvs', 'isLvsExistName',
  ];
  base.forEach(m => {
    if (!assetMock[m]) assetMock[m] = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });
  assetMock.getAssetsServerOption = vi.fn().mockResolvedValue({
    error_code: 0,
    data: { products: ['产品线A'], idcs: ['机房A'], server_levels: ['生产'], systems: ['CentOS'], server_types: ['物理机'], server_statuses: ['正常运行'] },
  });
});

describe('views/assets/server/detail/index.vue', () => {
  function mountServer(path = '/main/assets/server/detail/uuid-1') {
    return import('@/views/assets/server/detail/index.vue').then(mod => {
      const ServerDetail = mod.default;
      return createMounter(ServerDetail, {
        global: {
          ...global,
          mocks: { ...global.mocks, $route: { path, meta: {}, params: { id: 'uuid-1' }, query: {} } },
          stubs: { ...global.stubs, 'detail-layout': LAYOUT_STUB(() => ({ ownerEmail: 'admin', assetServerUuid: 'uuid-1' })) },
        },
      });
    });
  }

  it('mounted 加载选项；详情模式拉取详情与旗下虚拟机', async () => {
    assetMock.getServerDetail = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { assetServerUuid: 'uuid-1', assetServerType: '物理机', assetIsHostMachine: 'True', logicalHostName: 'web-001' },
    });
    assetMock.getAssetsServer = vi.fn().mockResolvedValue({ error_code: 0, data: { servers: [{ assetServerUuid: 'vm-1' }] } });
    const wrapper = await mountServer();
    await wait(100);
    expect(assetMock.getServerDetail).toHaveBeenCalledWith('uuid-1');
    expect(assetMock.getAssetsServer).toHaveBeenCalled();
    expect(wrapper.vm.isDetail).toBe(true);
    expect(wrapper.vm.virtualServer).toEqual([{ assetServerUuid: 'vm-1' }]);
  });

  it('mounted 非详情模式进入编辑并获取新主机名', async () => {
    assetMock.getHostName = vi.fn().mockResolvedValue({ error_code: 0, data: { uuid: 'uuid-new', hostname: 'new-01' } });
    const wrapper = await mountServer('/main/assets/server/add');
    await wait(100);
    expect(wrapper.vm.isDetail).toBe(false);
    expect(wrapper.vm.saveNewHostname.uuid).toBe('uuid-new');
  });

  it('getDetail 接口失败不设置 editData', async () => {
    assetMock.getServerDetail = vi.fn().mockResolvedValue({ error_code: 1 });
    const wrapper = await mountServer();
    await wait(100);
    expect(wrapper.vm.editData).toEqual({});
  });

  it('sumbit 校验通过：详情模式更新服务器并提示', async () => {
    assetMock.getUserListByUsername = vi.fn().mockResolvedValue({ error_code: 0, data: { user_list: [{ name: '管理员' }] } });
    assetMock.updateServer = vi.fn().mockResolvedValue({ error_code: 0, data: { assetServerUuid: 'uuid-1' } });
    const wrapper = await mountServer();
    await wait(50);
    wrapper.vm.sumbit();
    await wait(50);
    expect(assetMock.updateServer).toHaveBeenCalled();
    expect(global.mocks.$Message.success).toBeTruthy();
  });

  it('sumbit 校验失败不提交', async () => {
    const stub = LAYOUT_STUB(() => ({ ownerEmail: 'admin' }));
    stub.components.FormStub.methods.validate = (cb) => cb(false);
    const ServerDetail = (await import('@/views/assets/server/detail/index.vue')).default;
    const wrapper = createMounter(ServerDetail, {
      global: { ...global, stubs: { ...global.stubs, 'detail-layout': stub } },
    });
    wrapper.vm.sumbit();
    await wait(20);
    expect(assetMock.getUserListByUsername).not.toHaveBeenCalled();
  });

  it('getUserName 创建模式调用 createServer 并弹确认框', async () => {
    assetMock.getUserListByUsername = vi.fn().mockResolvedValue({ error_code: 0, data: { user_list: [{ name: '管理员' }] } });
    assetMock.createServer = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    const wrapper = await mountServer('/main/assets/server/add');
    await wait(50);
    wrapper.vm.getUserName({ ownerEmail: 'admin' });
    await wait(50);
    expect(assetMock.createServer).toHaveBeenCalled();
    expect(global.mocks.$Modal.confirm).toHaveBeenCalled();
  });

  it('openModal / confirmSelectIp 联动 IP 弹窗', async () => {
    const wrapper = await mountServer();
    wrapper.vm.openModal({ modalType: 'ip', key: 'logicalIpList', index: 1, form: { logicalIpList: [{ ip_address: '1.1.1.1' }, { ip_address: '1.1.1.2' }] } });
    expect(wrapper.vm.ip.visible).toBe(true);
    expect(wrapper.vm.ip.selected).toBe('1.1.1.2');
    wrapper.vm.confirmSelectIp({ selected: { ip_address: '9.9.9.9' } });
    expect(wrapper.vm.ip.visible).toBe(false);
  });

  it('getVirtualServer 虚拟主机不拉取旗下虚拟机', async () => {
    const wrapper = await mountServer();
    wrapper.vm.editData = { assetServerType: '虚拟机' };
    wrapper.vm.getVirtualServer();
    await wait(20);
    expect(assetMock.getAssetsServer).not.toHaveBeenCalled();
  });
});

describe('views/assets/cluster/detail/index.vue', () => {
  function mountCluster(path = '/main/assets/balancing/cluster/detail/lbg-1') {
    return import('@/views/assets/cluster/detail/index.vue').then(mod => {
      const ClusterDetail = mod.default;
      return createMounter(ClusterDetail, {
        global: {
          ...global,
          mocks: { ...global.mocks, $route: { path, meta: {}, params: { id: 'lbg-1' }, query: {} } },
          stubs: { ...global.stubs, 'detail-layout': LAYOUT_STUB(() => ({ memberHostList: JSON.stringify([{ assetServerUuid: 'u1' }]), privateVipList: JSON.stringify([{ vip: '1.1.1.1', router_id: 1, director_master_uuid: 'u1' }]) })) },
        },
      });
    });
  }

  beforeEach(() => {
    assetMock.getClusterDetail = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { esId: 'lbg-1', groupName: '集群A', memberHostList: "['u1','u2']", privateVipList: '[]' },
    });
    assetMock.getServerByIds = vi.fn().mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'u1', logicalHostName: 'web-1' }] });
    assetMock.getAssetsClusterOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
    assetMock.updateCluster = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.createCluster = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('mounted 详情模式补充成员主机信息', async () => {
    const wrapper = await mountCluster();
    await wait(100);
    expect(assetMock.getClusterDetail).toHaveBeenCalledWith('lbg-1');
    expect(wrapper.vm.editData.memberHostList).toContain('web-1');
  });

  it('sumbit 未选成员主机时警告', async () => {
    const stub = LAYOUT_STUB(() => ({ memberHostList: '[]', privateVipList: '[]' }));
    const ClusterDetail = (await import('@/views/assets/cluster/detail/index.vue')).default;
    const wrapper = createMounter(ClusterDetail, { global: { ...global, stubs: { ...global.stubs, 'detail-layout': stub } } });
    wrapper.vm.sumbit();
    await wait(20);
    expect(global.mocks.$Message.warning).toHaveBeenCalled();
  });

  it('sumbit 校验通过：更新集群', async () => {
    const wrapper = await mountCluster();
    await wait(50);
    wrapper.vm.sumbit();
    await wait(50);
    expect(assetMock.updateCluster).toHaveBeenCalled();
  });

  it('sumbit 创建集群成功弹确认框', async () => {
    const wrapper = await mountCluster('/main/assets/balancing/cluster/add');
    await wait(50);
    wrapper.vm.sumbit();
    await wait(50);
    expect(assetMock.createCluster).toHaveBeenCalled();
    expect(global.mocks.$Modal.confirm).toHaveBeenCalled();
  });

  it('checkVip 缺少 router_id 返回 false 并警告', async () => {
    const wrapper = await mountCluster();
    const ok = wrapper.vm.checkVip({
      memberHostList: JSON.stringify([{ assetServerUuid: 'u1' }]),
      privateVipList: JSON.stringify([{ vip: '1.1.1.1', director_master_uuid: 'u1' }]),
    });
    expect(ok).toBe(false);
  });

  it('openModal 未选择机房网络时警告', async () => {
    const wrapper = await mountCluster();
    wrapper.vm.openModal({ modalType: 'ip', key: 'x', index: 0, form: {} });
    expect(global.mocks.$Message.warning).toHaveBeenCalled();
    wrapper.vm.openModal({ modalType: 'ip', key: 'x', index: 0, form: { idc: '机房A', subNet: '192.168.1.0/24', x: [{}] } });
    expect(wrapper.vm.ip.visible).toBe(true);
  });

  it('confirmSelectIp 添加私网 VIP 记录', async () => {
    const wrapper = await mountCluster();
    wrapper.vm.ip.key = 'privateVipList';
    wrapper.vm.ip.data = [];
    wrapper.vm.confirmSelectIp({ selected: { ip_address: '192.168.1.99' } });
    expect(wrapper.vm.ip.data[0].vip).toBe('192.168.1.99');
    expect(wrapper.vm.ip.data[0].isNew).toBe(true);
    expect(wrapper.vm.ip.visible).toBe(false);
  });

  it('confirmSelectServer 追加成员主机', async () => {
    const wrapper = await mountCluster();
    wrapper.vm.server.data = [];
    wrapper.vm.server.key = 'memberHostList';
    wrapper.vm.confirmSelectServer([{ assetServerUuid: 'u1', logicalHostName: 'web-1' }]);
    expect(wrapper.vm.server.data).toHaveLength(1);
    expect(wrapper.vm.server.visible).toBe(false);
  });

  it('getAssetsOption 失败时保持默认', async () => {
    assetMock.getAssetsClusterOption = vi.fn().mockResolvedValue({ error_code: 1 });
    const wrapper = await mountCluster();
    await wait(50);
    expect(wrapper.vm.option).toEqual({});
  });
});

describe('views/assets/lvs/detail/index.vue', () => {
  function mountLvs(path = '/main/assets/balancing/lvs/detail/lvs-1') {
    return import('@/views/assets/lvs/detail/index.vue').then(mod => {
      const LvsDetail = mod.default;
      return createMounter(LvsDetail, {
        global: {
          ...global,
          mocks: { ...global.mocks, $route: { path, meta: {}, params: { id: 'lvs-1' }, query: {} } },
          stubs: {
            ...global.stubs,
            'detail-layout': LAYOUT_STUB(() => ({ rsUuidList: JSON.stringify([{ assetServerUuid: 'u1' }]), LbGroup: { groupId: 'lbg-1', assetServerUuid: 'u2' } })),
            'ip': { template: '<div class="ip-stub" />' },
            'server': { template: '<div class="server-stub" />' },
            'lbgroup': { template: '<div class="lbgroup-stub" />' },
          },
        },
      });
    });
  }

  beforeEach(() => {
    assetMock.getLvsDetail = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { instanceName: 'lvs-1', rsUuidList: "['u1','u2']", assetLbGroup: 'lbg-1', directorMasterUuid: 'u1' },
    });
    assetMock.getClusterDetail = vi.fn().mockResolvedValue({ error_code: 0, data: { groupName: '集群A' } });
    assetMock.getServerByIds = vi.fn().mockResolvedValue({ error_code: 0, data: [{ assetServerUuid: 'u1', logicalIp: '192.168.1.1' }, { assetServerUuid: 'u2', logicalIp: '192.168.1.2' }] });
    assetMock.getAssetsLvsOption = vi.fn().mockResolvedValue({ error_code: 0, data: { products: [], idcs: [] } });
    assetMock.getSubnetByIdc = vi.fn().mockResolvedValue({ error_code: 0, data: { statistics: [{ sub_net: '192.168.1.0/24' }] } });
    assetMock.isLvsExistName = vi.fn().mockResolvedValue(false);
    assetMock.createLvs = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
    assetMock.deleteLvs = vi.fn().mockResolvedValue({ error_code: 0, data: {} });
  });

  it('mounted 详情模式加载 LVS 并补充集群/分发器信息', async () => {
    const wrapper = await mountLvs();
    await wait(150);
    expect(assetMock.getLvsDetail).toHaveBeenCalledWith('lvs-1');
    expect(wrapper.vm.editData.assetLbGroup).toBe('集群A');
    expect(wrapper.vm.editData.directorMasterUuid).toBe('192.168.1.1');
  });

  it('formatParam 重组提交参数', async () => {
    const wrapper = await mountLvs();
    const param = wrapper.vm.formatParam({
      rsUuidList: JSON.stringify([{ assetServerUuid: 'u1' }, { assetServerUuid: 'u2' }]),
      rsUuidListXxx: 'drop',
      LbGroup: { groupId: 'lbg-1', assetServerUuid: 'u2' },
    });
    expect(param.rsUuidList).toBe('["u1","u2"]');
    expect(param.assetLbGroup).toBe('lbg-1');
    expect(param.directorMasterUuid).toBe('u2');
    expect(param.rsUuidListXxx).toBeUndefined();
    expect(param.LbGroup).toBeUndefined();
  });

  it('sumbit 创建 LVS 成功弹确认框', async () => {
    const wrapper = await mountLvs('/main/assets/balancing/lvs/add');
    await wait(50);
    wrapper.vm.sumbit();
    await wait(50);
    expect(assetMock.createLvs).toHaveBeenCalled();
    expect(global.mocks.$Modal.confirm).toHaveBeenCalled();
  });

  it('deleteEvent 确认后删除并跳转', async () => {
    const confirmArgs = {};
    const LvsDetail = (await import('@/views/assets/lvs/detail/index.vue')).default;
    const wrapper = createMounter(LvsDetail, {
      global: {
        ...global,
        stubs: { ...global.stubs, 'detail-layout': LAYOUT_STUB(() => ({})), 'ip': { template: '<div />' }, 'server': { template: '<div />' }, 'lbgroup': { template: '<div />' } },
        mocks: { ...global.mocks, $Modal: { confirm: (cfg) => { confirmArgs.onOk = cfg.onOk; } } },
      },
    });
    wrapper.vm.editData = { instanceName: 'lvs-1' };
    wrapper.vm.deleteEvent();
    confirmArgs.onOk();
    await wait(50);
    expect(assetMock.deleteLvs).toHaveBeenCalledWith('lvs-1');
  });

  it('openModal 未选择网络时警告，选择后设置过滤条件', async () => {
    const wrapper = await mountLvs();
    wrapper.vm.openModal({ modalType: 'ip', key: 'x', index: 0, form: {} });
    expect(global.mocks.$Message.warning).toHaveBeenCalled();
    wrapper.vm.openModal({ modalType: 'ip', key: 'publicVip', index: 0, form: { subNet: '192.168.1.0/24', publicVip: [] } });
    expect(wrapper.vm.ip.visible).toBe(true);
    expect(wrapper.vm.ip.filterCondition.subNet).toBe('192.168.1.0/24');
  });

  it('confirmSelectIp / confirmSelectLbgroup / confirmSelectServer 更新表单', async () => {
    const wrapper = await mountLvs();
    wrapper.vm.ip.key = 'publicVip';
    wrapper.vm.confirmSelectIp({ selected: { ip_address: '10.0.0.1' } });
    wrapper.vm.lbgroup.key = 'assetLbGroup';
    wrapper.vm.confirmSelectLbgroup({ selectedLbg: { esId: 'lbg-1', groupName: '集群A' }, selectedServer: { logicalIp: '1.1.1.1', assetServerUuid: 'u1' } });
    wrapper.vm.server.key = 'rsUuidList';
    wrapper.vm.server.data = [];
    wrapper.vm.confirmSelectServer([{ assetServerUuid: 'u1' }]);
    await wait(20);
    expect(wrapper.emitted()).toBeTruthy();
  });

  it('setValidateName 校验名称（已存在时报错）', async () => {
    assetMock.isLvsExistName = vi.fn().mockResolvedValue(true);
    const wrapper = await mountLvs();
    const rule = wrapper.vm.setValidateName().instanceName;
    const cb = vi.fn();
    rule.validator(undefined, 'lvs-dup', cb);
    await wait(50);
    expect(cb).toHaveBeenCalledWith(new Error('名称已存在'));
  });

  it('getAssetsOption 拉取子网与选项', async () => {
    const wrapper = await mountLvs();
    wrapper.vm.getAssetsOption();
    await wait(50);
    expect(assetMock.getSubnetByIdc).toHaveBeenCalled();
    expect(assetMock.getAssetsLvsOption).toHaveBeenCalled();
  });
});
