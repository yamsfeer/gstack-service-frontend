import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, nextTick, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

// vue-slicksort 的 ElementMixin/ContainerMixin 依赖容器上下文，单独挂载时 mock 掉
vi.mock('vue-slicksort', () => ({
  ElementMixin: {
    mounted() {},
    methods: { setDraggable() {}, removeDraggable() {} },
  },
  ContainerMixin: {
    methods: {},
  },
  HandleDirective: {},
  SlickList: {
    template: '<div class="slick-list"><slot /></div>',
  },
  SlickItem: {
    template: '<div class="slick-item"><slot /></div>',
  },
}));

const { manageMock, userMock } = vi.hoisted(() => ({
  manageMock: {
    getManageList: vi.fn(), createProcess: vi.fn(), deleteProcess: vi.fn(),
    updateProcess: vi.fn(), getProcessDetail: vi.fn(), isExistName: vi.fn(),
  },
  userMock: { getGroupList: vi.fn(), getGroupByIds: vi.fn() },
}));
vi.mock('@/service/manage', () => manageMock);
vi.mock('@/service/user', () => userMock);

import ManageIndex from '@/views/manage/index.vue';
import ProcessForm from '@/views/manage/create-process/index.vue';
import StepModal from '@/views/manage/create-process/step-modal.vue';
import StepItem from '@/views/manage/processStep/stepItem.vue';
import FixedStepItem from '@/views/manage/processStep/fixedStepItem.vue';
import StepList from '@/views/manage/processStep/stepList.vue';

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/manage', meta: {}, params: {}, query: {} },
  },
};

const PROCESS_LIST = [
  { id: 1, name: '虚拟机申请流程', type: 1, description: '默认流程', enable: true, ready: true, create_time: 't', update_time: 't' },
  { id: 2, name: '自定义流程', type: 2, description: '自定义', enable: false, ready: true, create_time: 't', update_time: 't' },
];

function initStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const login = useLoginInfoStore();
  login.UPDATE_USER_INFO({ name: '管理员', isServiceAdmin: true, groups: [] });
  return pinia;
}

describe('views/manage/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    manageMock.getManageList.mockResolvedValue({ error_code: 0, data: { processes: PROCESS_LIST, total: 2 } });
  });

  // 表格渲染由 E2E 覆盖，单元测试 stub 掉 el-table
  const tableStubs = { 'gs-table': { template: '<div class="table-stub"><slot /></div>' }, 'gs-table-column': { template: '<div />' } };

  it('加载流程列表', async () => {
    const wrapper = createMounter(ManageIndex, { global: { ...global, stubs: { ...global.stubs, ...tableStubs } } });
    await wait(50);
    expect(manageMock.getManageList).toHaveBeenCalled();
    expect(wrapper.vm.manageList).toEqual(PROCESS_LIST);
  });

  it('filterData 搜索并重置页码', async () => {
    const wrapper = createMounter(ManageIndex, { global: { ...global, stubs: { ...global.stubs, ...tableStubs } } });
    await wait(50);
    wrapper.vm.page.pageNum = 3;
    wrapper.vm.query.search_condition = '虚拟机';
    wrapper.vm.filterData();
    expect(wrapper.vm.page.pageNum).toBe(1);
    const param = manageMock.getManageList.mock.calls[manageMock.getManageList.mock.calls.length - 1][0];
    expect(param.search_condition).toBe('虚拟机');
  });

  it('delProcess 确认后删除', async () => {
    manageMock.deleteProcess.mockResolvedValue({ error_code: 0, data: {} });
    const wrapper = createMounter(ManageIndex, {
      global: { ...global, stubs: { ...global.stubs, ...tableStubs }, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
    });
    await wait(50);
    wrapper.vm.delProcess(2);
    await wait(50);
    expect(manageMock.deleteProcess).toHaveBeenCalledWith(2);
  });

  it('openProcess 确认后启用流程', async () => {
    manageMock.updateProcess.mockResolvedValue({ error_code: 0, data: {} });
    const wrapper = createMounter(ManageIndex, {
      global: { ...global, stubs: { ...global.stubs, ...tableStubs }, mocks: { ...global.mocks, $Modal: { confirm: ({ onOk }) => onOk() } } },
    });
    await wait(50);
    wrapper.vm.openProcess(2);
    await wait(50);
    expect(manageMock.updateProcess).toHaveBeenCalledWith(2, { enable: true });
  });

  it('openProcessModal 设置编辑数据', () => {
    const wrapper = createMounter(ManageIndex, { global: { ...global, stubs: { ...global.stubs, ...tableStubs } } });
    wrapper.vm.openProcessModal({ id: 1 });
    expect(wrapper.vm.processForm.isEdit).toBe(true);
    expect(wrapper.vm.processModalVisible).toBe(true);
  });
});

describe('views/manage/create-process/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    userMock.getGroupList.mockResolvedValue({ error_code: 0, data: { groups: [], total: 0 } });
    manageMock.isExistName.mockResolvedValue({ error_code: 0, data: { exists: false } });
    manageMock.createProcess.mockResolvedValue({ error_code: 0, data: { id: 10 } });
    manageMock.getProcessDetail.mockResolvedValue({
      error_code: 0,
      data: {
        id: 1, name: 'x', description: 'd',
        steps: [{ name: '审批', group_id: 1, sequence: 1, description: '', is_hidden: false }, { name: '开通环节', group_id: 2, sequence: 2, description: '', is_hidden: false }],
      },
    });
    userMock.getGroupByIds.mockResolvedValue({ error_code: 0, data: { group_list: [{ id: 1, group_name: '运维值班组' }, { id: 2, group_name: '网络管理组' }] } });
  });

  it('getParam 组装流程步骤数据', () => {
    const wrapper = createMounter(ProcessForm, { global });
    wrapper.vm.processForm.name = '测试流程';
    wrapper.vm.processForm.description = '描述';
    wrapper.vm.processForm.steps = [{ name: '审批', handler: '1', description: '审核' }];
    wrapper.vm.openStep.handler = '2';
    const param = wrapper.vm.getParam();
    expect(param.name).toBe('测试流程');
    expect(param.steps.length).toBe(2);
    expect(param.steps[0]).toEqual({ name: '审批', group_id: 1, sequence: 1, description: '审核', is_hidden: false });
    expect(param.steps[1].group_id).toBe(2);
  });

  it('addStep / delStep / editStep 管理步骤', async () => {
    const wrapper = createMounter(ProcessForm, { global });
    wrapper.vm.addStep({ name: 'a', handler: '1' });
    expect(wrapper.vm.processForm.steps.length).toBe(1);
    wrapper.vm.editStep({ isOpen: false, index: 0, name: 'b', handler: '2' });
    expect(wrapper.vm.processForm.steps[0].name).toBe('b');
    wrapper.vm.editStep({ isOpen: true, handler: '3' });
    expect(wrapper.vm.openStep.handler).toBe('3');
    // delStep 需要确认
    wrapper.vm.$Modal = { confirm: ({ onOk }) => onOk() };
    wrapper.vm.delStep(0);
    expect(wrapper.vm.processForm.steps.length).toBe(0);
  });

  it('openStepModal 设置编辑数据', () => {
    const wrapper = createMounter(ProcessForm, { global });
    wrapper.vm.openStepModal({ name: 's' }, 1);
    expect(wrapper.vm.stepModalVisible).toBe(true);
    expect(wrapper.vm.stepForm.isEdit).toBe(true);
    expect(wrapper.vm.stepForm.data.index).toBe(1);
  });

  it('stepNames 计算属性包含内置步骤', () => {
    const wrapper = createMounter(ProcessForm, { global });
    wrapper.vm.processForm.steps = [{ name: '审批' }];
    expect(wrapper.vm.stepNames).toEqual(['提交工单', '部署环节', '开通环节', '审批']);
  });

  it('编辑模式加载流程详情', async () => {
    userMock.getGroupList.mockResolvedValue({ error_code: 0, data: { groups: [], total: 0 } });
    const wrapper = createMounter(ProcessForm, {
      global: { ...global, stubs: { ...global.stubs, 'gs-table': { template: '<div />' }, 'gs-table-column': { template: '<div />' } }, mocks: { ...global.mocks, $route: { path: '/main/manage/process/edit/1', params: { id: '1' }, meta: {} } } },
    });
    await wait(50);
    expect(manageMock.getProcessDetail).toHaveBeenCalledWith('1');
    expect(wrapper.vm.processForm.name).toBe('x');
    expect(wrapper.vm.openStep.handler).toBe('2');
  });

  it('handlerCreateProcess 创建成功后弹确认框', async () => {
    const wrapper = createMounter(ProcessForm, { global });
    wrapper.vm.handlerCreateProcess();
    await wait(50);
    expect(manageMock.createProcess).toHaveBeenCalled();
  });
});

describe('views/manage/create-process/step-modal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initStore();
    userMock.getGroupList.mockResolvedValue({ error_code: 0, data: { groups: [{ id: 1, group_name: '运维值班组' }], total: 1 } });
  });

  it('confirm 通过校验后 emit add-step', async () => {
    const wrapper = createMounter(StepModal, {
      global,
      props: { visible: true, stepNames: [], isEdit: false, editData: {} },
    });
    await wait(50);
    wrapper.vm.form.name = '审核环节';
    wrapper.vm.form.handler = '1';
    wrapper.vm.form.description = '审核';
    wrapper.vm.$refs.form.validate = cb => cb(true);
    wrapper.vm.confirm();
    await wait(20);
    expect(wrapper.emitted('add-step')).toBeTruthy();
  });

  it('编辑模式 emit edit-step', async () => {
    const wrapper = createMounter(StepModal, {
      global,
      props: { visible: true, stepNames: [], isEdit: true, editData: { name: '审批', handler: '1', handlerName: '运维值班组', description: 'd' } },
    });
    await wait(50);
    wrapper.vm.$refs.form.validate = cb => cb(true);
    wrapper.vm.confirm();
    await wait(20);
    expect(wrapper.emitted('edit-step')).toBeTruthy();
  });

  it('title 编辑/新增不同', () => {
    const wrapper = createMounter(StepModal, {
      global, props: { visible: false, stepNames: [], isEdit: false, editData: {} },
    });
    expect(wrapper.vm.title).toBe('添加环节');
  });

  it('searchUser 触发远程搜索', async () => {
    const wrapper = createMounter(StepModal, {
      global, props: { visible: false, stepNames: [], isEdit: false, editData: {} },
    });
    await wait(50);
    wrapper.vm.searchUser('运维');
    await wait(50);
    expect(userMock.getGroupList).toHaveBeenCalled();
  });
});

describe('views/manage/processStep/*', () => {
  it('stepItem 渲染步骤信息', () => {
    const wrapper = createMounter(StepItem, {
      global,
      props: { value: { name: '审批', handlerName: '运维值班组', description: 'desc' }, index: 0 },
    });
    expect(wrapper.text()).toContain('审批');
    expect(wrapper.text()).toContain('运维值班组');
  });

  it('fixedStepItem 渲染开始/结束/开通环节', () => {
    const start = createMounter(FixedStepItem, { global, props: { isStart: true } });
    expect(start.text()).toContain('提交工单');
    const end = createMounter(FixedStepItem, { global, props: { isEnd: true } });
    expect(end.text()).toContain('部署环节');
    const open = createMounter(FixedStepItem, { global, props: { value: { handlerName: '运维组', isOpen: true }, index: 3 } });
    expect(open.text()).toContain('开通环节');
  });

  it('stepList 双向绑定 steps', async () => {
    const wrapper = createMounter(StepList, { global, props: { value: [{ name: 'a' }] } });
    expect(wrapper.vm.steps.length).toBe(1);
    await wrapper.setProps({ value: [{ name: 'a' }, { name: 'b' }] });
    expect(wrapper.vm.steps.length).toBe(2);
  });
});
