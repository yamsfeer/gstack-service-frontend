// ============================================================
// detailLayout.vue 通用详情/编辑组件测试
// 覆盖：initForm / formatApiData / turnToEdit / cancelEdit /
//       getParam / addPort / delData / openModal / updateData /
//       分页 / 集群VIP联动 / 管理IP唯一性 / 各类 watch
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
  stubs: {
    transition: false,
    'router-link': { template: '<a :href="to"><slot /></a>' },
    'gs-server-table': { template: '<div class="st" />', methods: { doLayout() {}, clearSelection() {} } },
  },
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

// 覆盖各 display 分支的最小 keyMap
const KEY_MAP = {
  asset: {
    label: '资产属性',
    prop: [
      { key: 'assetAssetId', label: '公司资产编号' },
      { key: 'assetServerType', label: '服务器类型', display: 'select', option: ['物理机', '虚拟机'], defaultValue: '物理机' },
      { key: 'assetOwner', detailKey: 'owner', formKey: 'ownerEmail', label: '所属人', unit: '@example.com' },
      {
        key: 'assetLifecycle', label: '生命周期', display: 'list',
        physicalProp: [{ key: 'assetLifecyclePhysicalServerWarrantyTime', label: '质保时间', width: 12 }],
        virtualProp: [{ key: 'assetLifecycleVirtualServerCreateTime', label: '创建时间', width: 12 }],
      },
      {
        key: 'logicalDiskPartitions', label: '逻辑分区', type: 'jsonString', display: 'table', width: 24,
        columns: [{ label: '路径', prop: 'path' }],
      },
      {
        key: 'logicalIpList', label: 'IP列表', type: 'jsonString', display: 'table', width: 24,
        modalType: 'ip', isAdd: true, isDelete: true, isEdit: true,
        columns: [{ label: 'IP地址', prop: 'ip_address', type: 'text' }, { label: '管理IP', prop: 'is_admin_ip', type: 'boolean' }],
      },
      {
        key: 'memberHostList', label: '成员主机', type: 'jsonString', display: 'table', width: 24,
        columns: [{ label: '主机名', prop: 'logicalHostName' }],
      },
      {
        key: 'privateVipList', label: '私网VIP', type: 'jsonString', display: 'table', width: 24,
        columns: [{ label: 'VIP', prop: 'vip' }],
      },
      { key: 'assetLbGroup', label: '集群', display: 'search', modalType: 'lbgroup' },
      { key: 'assetLevel', label: '业务级别', display: 'select', option: ['测试', '生产'], defaultValue: '测试' },
      { key: 'logicalTotalMemorySizeInGb', label: '内存', unit: 'GB' },
      { key: 'assetAssetStatus', label: '资产状态', display: 'select', physicalOption: ['正常运行'], virtualOption: ['关机保留'] },
      { key: 'assetUsage', label: '描述', display: 'textarea' },
      { key: 'assetExpiredTime', label: '过期时间', display: 'date' },
    ],
  },
  virtualServer: {
    label: '旗下虚拟机', onlyDetail: true,
    prop: [{ key: 'virtualServer', label: '', display: 'table', columns: [{ label: '主机名', prop: 'logicalHostName' }] }],
  },
};

const SERVER_EDIT = {
  assetServerUuid: 'uuid-1',
  assetServerType: '物理机',
  assetOwner: '管理员',
  assetOwnerEmail: 'admin@example.com',
  logicalDiskPartitions: JSON.stringify([{ path: '/', file_system: 'ext4' }]),
  logicalIpList: JSON.stringify([
    { ip_address: '192.168.1.1', is_admin_ip: true },
    { ip_address: '192.168.1.2', is_admin_ip: false },
  ]),
  assetLifecyclePhysicalServerWarrantyTime: '2026-12-31',
};

describe('views/assets/modules/detailLayout.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    assetMock.getSubnetByIdc = vi.fn().mockResolvedValue({
      error_code: 0,
      data: { statistics: [{ sub_net: '192.168.1.0/24', count: 50 }] },
    });
  });

  async function mountLayout(type = 'server', editData = {}) {
    const DetailLayout = (await import('@/views/assets/modules/detailLayout.vue')).default;
    const wrapper = createMounter(DetailLayout, {
      global,
      props: { type, keyMap: KEY_MAP, rules: {}, editData, option: { products: ['产品线A'] }, virtualServer: [] },
    });
    return wrapper;
  }

  it('created 初始化表单（jsonString / 默认值 / 日期字段）', async () => {
    const wrapper = await mountLayout();
    await wait(20);
    // logicalIpList isAdd=true → []
    expect(wrapper.vm.form.logicalIpList).toEqual([]);
    // logicalDiskPartitions 无 isAdd → [{}]
    expect(wrapper.vm.form.logicalDiskPartitions).toEqual([{}]);
    // 带 defaultValue 的字段
    expect(wrapper.vm.form.assetServerType).toBe('物理机');
    expect(wrapper.vm.form.assetLevel).toBe('测试');
    // 日期字段进入 dateTimeKey
    expect(wrapper.vm.dateTimeKey).toContain('assetExpiredTime');
  });

  it('editData 变化触发 formatApiData：解析 jsonString 并特殊处理 server 所属人', async () => {
    const wrapper = await mountLayout('server', {});
    await wrapper.setProps({ editData: SERVER_EDIT });
    await wait(20);
    expect(wrapper.vm.detailData.logicalDiskPartitions).toEqual([{ path: '/', file_system: 'ext4' }]);
    expect(wrapper.vm.detailData.logicalIpList).toHaveLength(2);
    // server 类型特殊处理 owner
    expect(wrapper.vm.detailData.owner).toBe('管理员(admin@example.com)');
    expect(wrapper.vm.detailData.ownerEmail).toBe('admin');
  });

  it('editData 为 {} 时不格式化；空对象 JSON 直接返回', async () => {
    const wrapper = await mountLayout();
    await wrapper.setProps({ editData: {} });
    await wait(20);
    expect(wrapper.vm.detailData).toEqual({});
  });

  it('cluster 类型 formatApiData 补充主备分发器名称', async () => {
    const wrapper = await mountLayout('cluster', {});
    await wrapper.setProps({
      editData: {
        subNet: '192.168.1.0/24', idc: '机房A',
        memberHostList: JSON.stringify([
          { assetServerUuid: 'u1', logicalHostName: 'web-1' },
          { assetServerUuid: 'u2', logicalHostName: 'web-2' },
        ]),
        privateVipList: JSON.stringify([{ vip: '192.168.1.10', director_master_uuid: 'u1' }]),
      },
    });
    await wait(50);
    const vip = wrapper.vm.detailData.privateVipList[0];
    expect(vip.director_master_uuid_name).toBe('web-1');
    expect(vip.director_backup_uuid_list_name).toBe('web-2');
  });

  it('turnToEdit / cancelEdit / resetForm', async () => {
    const wrapper = await mountLayout('server', SERVER_EDIT);
    await wait(20);
    wrapper.vm.turnToEdit();
    await wait(20);
    expect(wrapper.vm.isEditing).toBe(true);
    wrapper.vm.cancelEdit();
    expect(wrapper.vm.isEditing).toBe(false);
    wrapper.vm.resetForm();
    // resetForm 重新 initForm
    expect(wrapper.vm.form.logicalIpList).toEqual([]);
  });

  it('getParam 组装参数：jsonString 拆 camelCase、日期格式化', async () => {
    const wrapper = await mountLayout('server', SERVER_EDIT);
    await wait(20);
    wrapper.vm.form.logicalIpList = [{ ip_address: '1.1.1.1', is_admin_ip: true }, { ip_address: '1.1.1.2', is_admin_ip: false }];
    wrapper.vm.form.assetExpiredTime = '2026-08-01';
    wrapper.vm.isEditing = true;
    await wait(20);
    const param = wrapper.vm.getParam();
    expect(param.logicalIpListIpAddress).toBe('1.1.1.1,1.1.1.2');
    expect(param.logicalIpListIsAdminIp).toBe('True,False');
    expect(param.logicalIpList).toContain('"is_admin_ip"');
  });

  it('addPort 合法端口加入，非法端口提示', async () => {
    const wrapper = await mountLayout();
    wrapper.vm.form.logicalDiskPartitions = [];
    wrapper.vm.port = 'abc';
    wrapper.vm.addPort('logicalDiskPartitions');
    expect(wrapper.vm.form.logicalDiskPartitions).toEqual([]);
    wrapper.vm.port = '8080';
    wrapper.vm.addPort('logicalDiskPartitions');
    expect(wrapper.vm.form.logicalDiskPartitions).toEqual([8080]);
    // 重复端口不重复添加
    wrapper.vm.addPort('logicalDiskPartitions');
    expect(wrapper.vm.form.logicalDiskPartitions).toEqual([8080]);
  });

  it('delData 删除指定项', async () => {
    const wrapper = await mountLayout();
    wrapper.vm.form.logicalIpList = [{ ip_address: '1.1.1.1' }, { ip_address: '1.1.1.2' }];
    wrapper.vm.delData('logicalIpList', 0);
    expect(wrapper.vm.form.logicalIpList).toEqual([{ ip_address: '1.1.1.2' }]);
  });

  it('openModal 向父级 emit', async () => {
    const wrapper = await mountLayout();
    wrapper.vm.form.logicalIpList = [{ ip_address: '1.1.1.1' }];
    wrapper.vm.openModal(0, 'ip', 'logicalIpList');
    expect(wrapper.emitted('openModal')[0][0]).toEqual({
      modalType: 'ip', key: 'logicalIpList', index: 0, form: wrapper.vm.form,
    });
  });

  it('updateData 集群字段特殊处理，其余直接赋值', async () => {
    const wrapper = await mountLayout('cluster');
    wrapper.vm.updateData({ key: 'assetLbGroup', newData: { groupName: '集群A', logicalIp: '192.168.1.1' } });
    expect(wrapper.vm.form.assetLbGroup).toBe('集群A');
    expect(wrapper.vm.form.directorMasterUuid).toBe('192.168.1.1');
    expect(wrapper.vm.form.LbGroup.groupName).toBe('集群A');
    wrapper.vm.updateData({ key: 'foo', newData: 'bar' });
    expect(wrapper.vm.form.foo).toBe('bar');
  });

  it('分页 currentChange / sizeChange', async () => {
    const wrapper = await mountLayout();
    wrapper.vm.table.allData = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    wrapper.vm.table.total = 25;
    wrapper.vm.currentChange(1);
    expect(wrapper.vm.table.data).toHaveLength(10);
    wrapper.vm.sizeChange(25);
    expect(wrapper.vm.table.pageSize).toBe(25);
    expect(wrapper.vm.table.data).toHaveLength(25);
  });

  it('virtualServer prop 变化填充旗下虚拟机表格', async () => {
    const wrapper = await mountLayout();
    await wrapper.setProps({ virtualServer: [{ assetServerUuid: 'u1', logicalHostName: 'vm-1' }] });
    await wait(20);
    expect(wrapper.vm.table.total).toBe(1);
    expect(wrapper.vm.table.data).toHaveLength(1);
  });

  it('cluster 成员主机变化时 changeVipByMember 联动 VIP 备分发器', async () => {
    const wrapper = await mountLayout('cluster');
    wrapper.vm.form.privateVipList = [
      { vip: '192.168.1.10', director_master_uuid: 'u1' },
      { vip: '192.168.1.11', director_master_uuid: 'u9' },
    ];
    wrapper.vm.form.memberHostList = [
      { assetServerUuid: 'u1', logicalHostName: 'web-1' },
      { assetServerUuid: 'u2', logicalHostName: 'web-2' },
    ];
    wrapper.vm.changeVipByMember();
    // u9 不在成员中，对应 VIP 被移除
    expect(wrapper.vm.form.privateVipList).toHaveLength(1);
    expect(wrapper.vm.form.privateVipList[0].director_backup_uuid_list_name).toBe('web-2');
  });

  it('selectDirectorMaster 设置备分发器', async () => {
    const wrapper = await mountLayout('cluster');
    wrapper.vm.form.memberHostList = [
      { assetServerUuid: 'u1', logicalHostName: 'web-1' },
      { assetServerUuid: 'u2', logicalHostName: 'web-2' },
    ];
    wrapper.vm.form.privateVipList = [{ vip: '1.1.1.1', director_master_uuid: '' }];
    wrapper.vm.selectDirectorMaster('u1', 0);
    expect(wrapper.vm.form.privateVipList[0].director_backup_uuid_list).toEqual(['u2']);
  });

  it('changeAmdinIp 保证管理 IP 唯一', async () => {
    const wrapper = await mountLayout();
    wrapper.vm.form.logicalIpList = [
      { ip_address: '1.1.1.1', is_admin_ip: true },
      { ip_address: '1.1.1.2', is_admin_ip: true },
      { ip_address: '1.1.1.3', is_admin_ip: false },
    ];
    wrapper.vm.changeAmdinIp(true, 'is_admin_ip', 1);
    expect(wrapper.vm.form.logicalIpList[0].is_admin_ip).toBe(false);
    expect(wrapper.vm.form.logicalIpList[1].is_admin_ip).toBe(true);
    expect(wrapper.vm.form.logicalIpList[2].is_admin_ip).toBe(false);
  });

  it('judgeArrNull / judgeShowDeviceProp 判断逻辑', async () => {
    const wrapper = await mountLayout('server', SERVER_EDIT);
    await wait(20);
    expect(wrapper.vm.judgeArrNull([])).toBe(true);
    expect(wrapper.vm.judgeArrNull([{}])).toBe(true);
    expect(wrapper.vm.judgeArrNull([{ a: 1 }])).toBe(false);
    // 服务器类型为虚拟机时不显示设备属性与旗下虚拟机
    wrapper.vm.detailData.assetServerType = '虚拟机';
    expect(wrapper.vm.judgeShowDeviceProp('device')).toBe(false);
    expect(wrapper.vm.judgeShowDeviceProp('virtualServer')).toBe(false);
    expect(wrapper.vm.judgeShowDeviceProp('asset')).toBe(true);
  });

  it('convertToCamelCase / convertBoolean 工具方法', async () => {
    const wrapper = await mountLayout();
    expect(wrapper.vm.convertToCamelCase('logicalIpList', 'ip_address')).toBe('logicalIpListIpAddress');
    expect(wrapper.vm.convertBoolean(['True', 'False'])).toEqual(['True', 'False']);
    expect(wrapper.vm.convertBoolean([true, false])).toEqual(['True', 'False']);
    expect(wrapper.vm.convertBoolean([])).toEqual([]);
  });

  it('form.idc 变化（cluster）重新拉取子网', async () => {
    const wrapper = await mountLayout('cluster');
    wrapper.vm.form.idc = '机房A';
    await wait(50);
    expect(assetMock.getSubnetByIdc).toHaveBeenCalled();
    expect(wrapper.vm.option.subNets).toEqual(['192.168.1.0/24']);
  });

  it('form.subNet 变化（lvs）清空已选集群与IP', async () => {
    const wrapper = await mountLayout('lvs');
    wrapper.vm.form.publicVip = '10.0.0.1';
    wrapper.vm.form.assetLbGroup = '集群A';
    wrapper.vm.form.directorMasterUuid = 'u1';
    wrapper.vm.form.rsUuidList = ['u1'];
    wrapper.vm.form.subNet = '192.168.2.0/24';
    await wait(20);
    expect(wrapper.vm.form.publicVip).toBe('');
    expect(wrapper.vm.form.assetLbGroup).toBe('');
    expect(wrapper.vm.form.directorMasterUuid).toBe('');
    expect(wrapper.vm.form.rsUuidList).toEqual([]);
  });

  it('form.assetServerType 变化重置资产状态', async () => {
    const wrapper = await mountLayout('server', SERVER_EDIT);
    await wait(20);
    wrapper.vm.form.assetServerType = '虚拟机';
    await wait(20);
    expect(wrapper.vm.form.assetAssetStatus).toBe('正常运行');
  });

  it('cluster editData 变化拉取子网（type=cluster watch 分支）', async () => {
    const wrapper = await mountLayout('cluster', {});
    await wrapper.setProps({ editData: { subNet: '192.168.1.0/24', idc: '机房A', memberHostList: '[]', privateVipList: '[]' } });
    await wait(50);
    expect(assetMock.getSubnetByIdc).toHaveBeenCalledWith({ idcList: ['机房A'] });
  });
});
