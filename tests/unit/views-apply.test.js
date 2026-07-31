import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, nextTick, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

// mock service 模块
const { orderMock, assetMock } = vi.hoisted(() => ({
  orderMock: {
    createOrder: vi.fn(), checkLvs: vi.fn(), checkCabinet: vi.fn(),
    checkDns: vi.fn(), checkDnsParam: vi.fn(), getConfigData: vi.fn(),
  },
  assetMock: {
    getProduction: vi.fn(), getSystems: vi.fn(), getIdc: vi.fn(),
    getDomain: vi.fn(), getServer: vi.fn(),
  },
}));
vi.mock('@/service/order', () => orderMock);
vi.mock('@/service/asset', () => assetMock);

import ApplyOverview from '@/views/apply/overview.vue';
import ApplyFormIndex from '@/views/apply/applyForm/apply-index.vue';
import VmForm from '@/views/apply/applyForm/vm.vue';
import LvsForm from '@/views/apply/applyForm/lvs.vue';
import NatForm from '@/views/apply/applyForm/nat.vue';
import DnsForm from '@/views/apply/applyForm/dns.vue';
import VmDeleteForm from '@/views/apply/applyForm/vmDelete.vue';

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/order/apply/vm', meta: {}, params: { type: 'vm' }, query: {} },
  },
};

const PRODUCTION_RESULT = { error_code: 0, data: { result: [{ name: '产品线A' }, { name: '产品线B' }] } };

describe('views/apply/overview.vue', () => {
  it('渲染工单分类与服务选项', () => {
    const wrapper = createMounter(ApplyOverview, { global });
    expect(wrapper.text()).toContain('请选择工单分类');
    expect(wrapper.text()).toContain('云主机服务');
    expect(wrapper.text()).toContain('虚拟机');
    expect(wrapper.text()).toContain('被公网访问');
    expect(wrapper.text()).toContain('主动访问公网');
    expect(wrapper.text()).toContain('DNS');
    expect(wrapper.text()).toContain('虚拟机删除');
    expect(wrapper.text()).toContain('申请虚拟机资源');
  });

  it('每个服务都有提交工单链接', () => {
    const wrapper = createMounter(ApplyOverview, { global });
    // router-link stub 把 to 渲染为属性，同时模板内部还有一层 a，过滤出带 to 的
    const links = wrapper.findAll('a').map(a => a.attributes('to')).filter(Boolean);
    expect(links).toContain('/main/order/apply/vm');
    expect(links).toContain('/main/order/apply/lvs');
    expect(links).toContain('/main/order/apply/nat');
    expect(links).toContain('/main/order/apply/dns');
    expect(links).toContain('/main/order/apply/vmDelete');
  });
});

describe('views/apply/applyForm/vm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assetMock.getProduction.mockResolvedValue(PRODUCTION_RESULT);
    assetMock.getSystems.mockResolvedValue({ error_code: 0, data: { result: [{ version: 'CentOS 7.9', type: 'CentOS' }, { version: 'Windows Server 2019', type: 'Windows' }] } });
    assetMock.getIdc.mockResolvedValue({ error_code: 0, data: { result: [] } });
  });

  it('初始化表单并加载产品线', async () => {
    const wrapper = createMounter(VmForm, { global, props: { tenantList: [{ tenant_id: '1001', tenant_name: '平台研发部' }] } });
    await wait(50);
    expect(wrapper.vm.form.tenant_id).toBe('');
    expect(wrapper.vm.form.business_level).toBe('测试');
    expect(wrapper.vm.production).toEqual([{ name: '产品线A' }, { name: '产品线B' }]);
    expect(assetMock.getProduction).toHaveBeenCalledWith({ all: true });
  });

  it('cpu_memory 变更联动 cpu_core_quantity 与 memory', async () => {
    const wrapper = createMounter(VmForm, { global });
    wrapper.vm.form.cpu_memory = '2核4GB';
    await nextTick();
    expect(wrapper.vm.form.cpu_core_quantity).toBe(2);
    expect(wrapper.vm.form.memory_size_in_gb).toBe(4);
  });

  it('maxMemory 生产/测试不同', async () => {
    const wrapper = createMounter(VmForm, { global });
    expect(wrapper.vm.maxMemory).toBe(16);
    wrapper.vm.form.business_level = '生产';
    await nextTick();
    expect(wrapper.vm.maxMemory).toBe(256);
  });

  it('getParam 生成符合 schema 的工单参数', async () => {
    const wrapper = createMounter(VmForm, { global });
    wrapper.vm.form.tenant_id = '1001';
    wrapper.vm.form.usage = '申请测试虚拟机';
    wrapper.vm.form.os_name = 'CentOS 7.9';
    wrapper.vm.form.template_type = 'CentOS';
    wrapper.vm.form.disk_size_in_gb = 100;
    wrapper.vm.form.vm_count = 1;
    const param = wrapper.vm.getParam();
    expect(param.tenant_id).toBe(1001);
    expect(param.description).toBe('申请测试虚拟机');
    expect(param.resource.business_level).toBe('测试');
    expect(param.resource.period).toBe(1);
    expect(param.resource.vm_count).toBe(1);
    expect(param.resource.tenant_id).toBe(1001);

    // 生产环境无过期时间
    wrapper.vm.form.business_level = '生产';
    const param2 = wrapper.vm.getParam();
    expect(param2.resource.period).toBe(0);
  });

  it('resetForm 重置表单', async () => {
    const wrapper = createMounter(VmForm, { global });
    wrapper.vm.form.usage = 'xxx';
    wrapper.vm.resetForm();
    expect(wrapper.vm.form.usage).toBe('');
  });

  it('校验 CPU 内存合法性', async () => {
    const wrapper = createMounter(VmForm, { global });
    const cb = vi.fn();
    wrapper.vm.validatorCpuMempry({}, 'abc', cb);
    expect(cb).toHaveBeenCalled();
    wrapper.vm.validatorCpuMempry({}, '1核2GB', cb);
    expect(cb).toHaveBeenCalledWith();
    // 超范围
    wrapper.vm.validatorCpuMempry({}, '99核1GB', cb);
    wrapper.vm.validatorCpuMempry({}, '1核99GB', cb);
    expect(cb.mock.calls.length).toBeGreaterThan(2);
  });

  it('validateField / validate 委托表单校验', async () => {
    const wrapper = createMounter(VmForm, { global });
    await wait(50);
    expect(wrapper.vm.$refs.form).toBeTruthy();
    expect(typeof wrapper.vm.validate).toBe('function');
    expect(typeof wrapper.vm.validateField).toBe('function');
    // 调用不抛错
    wrapper.vm.validateField('cpu_memory');
    await wrapper.vm.validate().catch(() => {});
  });

  it('watch 路径：memory_size / cpu_core_quantity 联动 cpu_memory', async () => {
    const wrapper = createMounter(VmForm, { global });
    wrapper.vm.$refs.form = { validateField: vi.fn(), validate: vi.fn(), resetFields: vi.fn() };
    wrapper.vm.form.memory_size_in_gb = 8;
    await nextTick();
    expect(wrapper.vm.form.cpu_memory).toContain('8GB');
    wrapper.vm.form.cpu_core_quantity = 4;
    await nextTick();
    expect(wrapper.vm.form.cpu_memory).toContain('4核');
  });
});

describe('views/apply/applyForm/lvs.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assetMock.getProduction.mockResolvedValue(PRODUCTION_RESULT);
    // watch 触发 checkSameServer 时的兜底
    orderMock.checkCabinet.mockResolvedValue({ error_code: 0, data: true });
  });

  it('初始化端口列表与默认值', async () => {
    const wrapper = createMounter(LvsForm, { global, props: { tenantList: [] } });
    await wait(50);
    expect(wrapper.vm.form.port_list).toEqual([80]);
    expect(wrapper.vm.form.persistent).toBe(900);
    expect(wrapper.vm.form.lb_algo).toBe('sh');
  });

  it('addPort 校验端口并去重', async () => {
    const wrapper = createMounter(LvsForm, { global });
    wrapper.vm.port = 'abc';
    wrapper.vm.addPort();
    expect(wrapper.vm.form.port_list).toEqual([80]);
    wrapper.vm.port = '443';
    wrapper.vm.addPort();
    expect(wrapper.vm.form.port_list).toContain(443);
    wrapper.vm.port = '443';
    wrapper.vm.addPort();
    expect(wrapper.vm.form.port_list.filter(p => p === 443).length).toBe(1);
    wrapper.vm.port = '70000';
    wrapper.vm.addPort();
    expect(wrapper.vm.form.port_list).not.toContain(70000);
  });

  it('delPort 移除端口', () => {
    const wrapper = createMounter(LvsForm, { global });
    wrapper.vm.form.port_list = [80, 443];
    wrapper.vm.delPort(0);
    expect(wrapper.vm.form.port_list).toEqual([443]);
  });

  it('checkPort 检查端口并更新 checkResult', async () => {
    orderMock.checkLvs.mockResolvedValue({ error_code: 0, data: [{ address: '1.1.1.1', port: 80, result: true }] });
    const wrapper = createMounter(LvsForm, { global });
    wrapper.vm.form.rs_uuid_list = [{ logicalIp: '1.1.1.1', assetServerUuid: 'u1' }];
    wrapper.vm.form.port_list = [80];
    wrapper.vm.checkPort();
    expect(wrapper.vm.checkResult.isOpenPort).toBe('loading');
    await wait(50);
    expect(wrapper.vm.checkResult.isOpenPort).toBe('success');
    expect(orderMock.checkLvs).toHaveBeenCalledWith({ type: 'HTTP', port_list: [80], master_ip_list: ['1.1.1.1'] });
  });

  it('checkSameServer 检查机柜', async () => {
    orderMock.checkCabinet.mockResolvedValue({ error_code: 0, data: true });
    const wrapper = createMounter(LvsForm, { global });
    wrapper.vm.form.rs_uuid_list = [{ assetServerUuid: 'u1' }];
    wrapper.vm.checkSameServer();
    await wait(50);
    expect(wrapper.vm.checkResult.isSame).toBe('success');
  });

  it('getParam 生成 LVS 工单参数', () => {
    const wrapper = createMounter(LvsForm, { global });
    wrapper.vm.form.tenant_id = '1001';
    wrapper.vm.form.usage = 'lvs 申请';
    wrapper.vm.form.rs_uuid_list = [{ assetServerUuid: 'u1', logicalIpSubnet: '192.168.1.0/24', assetIdc: '机房A' }];
    const param = wrapper.vm.getParam();
    expect(param.tenant_id).toBe(1001);
    expect(param.resource.rs_uuid_list).toEqual(['u1']);
    expect(param.resource.subnet).toBe('192.168.1.0/24');
    expect(param.resource.idc).toBe('机房A');
  });

  it('confirmSelect 合并选中主机', () => {
    const wrapper = createMounter(LvsForm, { global });
    wrapper.vm.confirmSelect([{ assetServerUuid: 'u2' }]);
    expect(wrapper.vm.form.rs_uuid_list).toEqual([{ assetServerUuid: 'u2' }]);
    expect(wrapper.vm.selectVisible).toBe(false);
  });

  it('checkParam 综合判断检查结果', async () => {
    const wrapper = createMounter(LvsForm, { global });
    expect(wrapper.vm.checkParam()).toBe('fail');
    wrapper.vm.checkResult = { isSame: 'success', isOpenPort: 'success' };
    expect(wrapper.vm.checkParam()).toBe('success');
  });
});

describe('views/apply/applyForm/nat.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assetMock.getProduction.mockResolvedValue(PRODUCTION_RESULT);
  });

  it('getParam 生成 NAT 工单参数', async () => {
    const wrapper = createMounter(NatForm, { global, props: { tenantList: [] } });
    await wait(50);
    wrapper.vm.form.tenant_id = '1002';
    wrapper.vm.form.usage = 'nat 申请';
    wrapper.vm.form.rs_uuids = [{ assetServerUuid: 'u1', logicalIpSubnet: '10.0.1.0/24', assetIdc: '机房B' }];
    const param = wrapper.vm.getParam();
    expect(param.tenant_id).toBe(1002);
    expect(param.resource.rs_uuids).toEqual(['u1']);
    expect(param.resource.subnet).toBe('10.0.1.0/24');
    expect(param.resource.idc).toBe('机房B');
  });

  it('confirmSelect 添加后端主机', () => {
    const wrapper = createMounter(NatForm, { global });
    wrapper.vm.confirmSelect([{ assetServerUuid: 'u2' }]);
    expect(wrapper.vm.form.rs_uuids).toEqual([{ assetServerUuid: 'u2' }]);
  });

  it('resetForm 重置', () => {
    const wrapper = createMounter(NatForm, { global });
    wrapper.vm.form.usage = 'x';
    wrapper.vm.resetForm();
    expect(wrapper.vm.form.usage).toBe('');
  });
});

describe('views/apply/applyForm/dns.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assetMock.getDomain.mockResolvedValue({ error_code: 0, data: ['example.com'] });
    assetMock.getProduction.mockResolvedValue(PRODUCTION_RESULT);
  });

  it('加载域名选项', async () => {
    const wrapper = createMounter(DnsForm, { global, props: { tenantList: [] } });
    await wait(50);
    expect(assetMock.getDomain).toHaveBeenCalledWith({ scope: 'private' });
    expect(wrapper.vm.domain[0].children).toEqual([{ label: 'example.com', value: 'example.com' }]);
  });

  it('addIP 校验 IP 并去重', async () => {
    const wrapper = createMounter(DnsForm, { global });
    wrapper.vm.ip = '10.20.1.99';
    wrapper.vm.addIP();
    expect(wrapper.vm.form.values).toEqual(['10.20.1.99']);
    wrapper.vm.ip = '10.20.1.99';
    wrapper.vm.addIP();
    expect(wrapper.vm.form.values.length).toBe(1);
    wrapper.vm.ip = 'bad-ip';
    wrapper.vm.addIP();
    expect(wrapper.vm.form.values.length).toBe(1);
  });

  it('delIP 移除解析地址', () => {
    const wrapper = createMounter(DnsForm, { global });
    wrapper.vm.form.values = ['1.1.1.1', '2.2.2.2'];
    wrapper.vm.delIP(0);
    expect(wrapper.vm.form.values).toEqual(['2.2.2.2']);
  });

  it('getParam 生成 DNS 工单参数', () => {
    const wrapper = createMounter(DnsForm, { global });
    wrapper.vm.form.tenant_id = '1001';
    wrapper.vm.form.description = 'dns 申请';
    wrapper.vm.form.sub_domain = 'www';
    wrapper.vm.form.primary_domain = ['public', 'example.com'];
    const param = wrapper.vm.getParam();
    expect(param.tenant_id).toBe(1001);
    expect(param.resource.record_type).toBe('A');
    expect(param.resource.scope).toBe('public');
    expect(param.resource.primary_domain).toBe('example.com');
    expect(param.resource.usage).toBe('dns 申请');
  });

  it('checkParam 调用 DNS 检查接口', async () => {
    orderMock.checkDns.mockResolvedValue({ error_code: 0, data: { exist: false, error_msg: '' } });
    orderMock.checkDnsParam.mockResolvedValue({ error_code: 0, data: { pass: true, error_msg: '' } });
    const wrapper = createMounter(DnsForm, { global });
    wrapper.vm.form.sub_domain = 'www';
    wrapper.vm.form.primary_domain = ['public', 'example.com'];
    wrapper.vm.form.values = ['10.20.1.99'];
    wrapper.vm.form.ttl = 3600;
    const result = await wrapper.vm.checkParam();
    expect(result).toBe('success');
    expect(orderMock.checkDns).toHaveBeenCalled();
    expect(orderMock.checkDnsParam).toHaveBeenCalled();
  });

  it('resetForm 重置检查结果', () => {
    const wrapper = createMounter(DnsForm, { global });
    wrapper.vm.checkResult.isExist = 'fail';
    wrapper.vm.form.values = ['1.1.1.1'];
    wrapper.vm.resetForm();
    expect(wrapper.vm.checkResult.isExist).toBe('');
    expect(wrapper.vm.form.values).toEqual([]);
  });
});

describe('views/apply/applyForm/vmDelete.vue', () => {
  it('getParam 生成虚拟机删除工单参数', async () => {
    const wrapper = createMounter(VmDeleteForm, { global, props: { tenantList: [] } });
    wrapper.vm.form.tenant_id = '1001';
    wrapper.vm.form.usage = '删除测试虚拟机';
    wrapper.vm.form.virtual_machines = [{ assetServerUuid: 'u1', logicalHostName: 'web-01', logicalHostMachine: 'hyper-01', logicalIp: '1.1.1.1', assetLevel: '测试', assetServerType: '虚拟机', assetUsage: 'test' }];
    const param = wrapper.vm.getParam();
    expect(param.tenant_id).toBe(1001);
    expect(param.resource.virtual_machines[0].salt_id).toBe('u1');
    expect(param.resource.virtual_machines[0].host_name).toBe('web-01');
    expect(param.resource.virtual_machines[0].server_uuid).toBe('u1');
  });

  it('confirmSelect 选择虚拟机', () => {
    const wrapper = createMounter(VmDeleteForm, { global });
    wrapper.vm.confirmSelect([{ assetServerUuid: 'u1' }]);
    expect(wrapper.vm.form.virtual_machines).toEqual([{ assetServerUuid: 'u1' }]);
  });
});

describe('views/apply/applyForm/apply-index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.createOrder.mockResolvedValue({ error_code: 0, data: { id: 1 } });
  });

  it('submit 校验通过后创建工单并弹确认框', async () => {
    const push = vi.fn();
    const wrapper = createMounter(ApplyFormIndex, {
      global: {
        ...global,
        mocks: { ...global.mocks, $router: { push } },
      },
      stubs: {
        vm: {
          template: '<div class="vm-stub"><input value="x" /></div>',
          methods: {
            getParam() { return { description: 'test', resource: {} }; },
            checkParam() { return 'success'; },
            resetForm() { return {}; },
          },
          computed: { tenantList: () => [] },
        },
      },
    });
    // 直接走提交逻辑
    wrapper.vm.submit();
    await wait(100);
    expect(orderMock.createOrder).toHaveBeenCalled();
    expect(wrapper.vm.disableSubmit).toBe(false);
  });

  it('handleCheckChange 控制提交按钮禁用状态', () => {
    const wrapper = createMounter(ApplyFormIndex, { global });
    wrapper.vm.handleCheckChange('loading');
    expect(wrapper.vm.disableSubmit).toBe(true);
    wrapper.vm.handleCheckChange('success');
    expect(wrapper.vm.disableSubmit).toBe(false);
  });

  it('currentComponent 从路由参数解析', () => {
    const wrapper = createMounter(ApplyFormIndex, { global });
    expect(wrapper.vm.currentComponent).toBe('vm');
  });
});
