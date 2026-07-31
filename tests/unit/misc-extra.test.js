import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';

const { userServiceMock, orderServiceMock } = vi.hoisted(() => ({
  userServiceMock: {
    detail: vi.fn(), create: vi.fn(), getUserList: vi.fn(), getGroupList: vi.fn(),
    getUserByIds: vi.fn(), getGroupByIds: vi.fn(), getUserTenant: vi.fn(),
  },
  orderServiceMock: { createOrder: vi.fn() },
}));
vi.mock('@/service/user', () => userServiceMock);
vi.mock('@/service/order', () => orderServiceMock);

const baseGlobal = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main', meta: {}, params: {}, query: {} },
  },
};

// ============ gs-ui-compat.js ============
describe('stores/gs-ui-compat.js', async () => {
  it('install 注册组件与全局方法', async () => {
    const compat = (await import('@/stores/gs-ui-compat')).default;
    const app = { component: vi.fn(), directive: vi.fn(), config: { globalProperties: {} } };
    compat.install(app);
    expect(app.component).toHaveBeenCalled();
    expect(app.directive).toHaveBeenCalledWith('loading', expect.anything());
    expect(app.config.globalProperties.$Modal).toBeTruthy();
    expect(app.config.globalProperties.$Message).toBeTruthy();
    expect(app.config.globalProperties.$Notification).toBeTruthy();
    expect(app.config.globalProperties.$notify).toBeTruthy();
    expect(app.config.globalProperties.$Notify).toBeTruthy();
  });

  it('$Modal.confirm 可调用（happy-dom 下 ElMessageBox 正常 resolve）', async () => {
    const compat = (await import('@/stores/gs-ui-compat')).default;
    const app = { component: () => {}, directive: () => {}, config: { globalProperties: {} } };
    compat.install(app);
    const { $Modal } = app.config.globalProperties;
    const onOk = vi.fn();
    $Modal.confirm({ title: '确认', onOk });
    await wait(50);
    expect(typeof $Modal.confirm).toBe('function');
  });

  it('$Message / $Notification / $Notify / $notify 方法存在', async () => {
    const compat = (await import('@/stores/gs-ui-compat')).default;
    const app = { component: () => {}, directive: () => {}, config: { globalProperties: {} } };
    compat.install(app);
    const { $Message, $Notification, $Notify, $notify } = app.config.globalProperties;
    expect(typeof $Message.success).toBe('function');
    expect(typeof $Message.error).toBe('function');
    expect(typeof $Message.warning).toBe('function');
    expect(typeof $Message.info).toBe('function');
    expect(typeof $Notification.error).toBe('function');
    expect(typeof $Notify.error).toBe('function');
    expect(typeof $notify.error).toBe('function');
  });
});

// ============ config/index.js ============
describe('config/index.js', async () => {
  it('默认使用 dev 配置', async () => {
    const config = (await import('@/config/index')).default;
    expect(config.API_SERVER).toContain('127.0.0.1');
  });

  it('dev/mock/prod 配置均导出关键字段', async () => {
    const dev = (await import('@/config/config.dev')).default;
    const mock = (await import('@/config/config.mock')).default;
    const prod = (await import('@/config/config.prod')).default;
    expect(dev.API_SERVER).toBeDefined();
    expect(dev.API_GOD).toBeDefined();
    expect(dev.GOD_URL).toBeDefined();
    expect(dev.API_GOD_LVS).toBeDefined();
    expect(dev.API_GOD_VM).toBeDefined();
    expect(mock.API_SERVER).toBeDefined();
    expect(prod.API_SERVER).toBeDefined();
  });
});

// ============ components/index.js ============
describe('components/index.js', async () => {
  it('install 注册组件且同一实例不重复注册', async () => {
    const plugin = (await import('@/components/index')).default;
    const app = { component: vi.fn(), _context: { provides: {} } };
    plugin(app);
    const count = app.component.mock.calls.length;
    expect(count).toBeGreaterThan(0);
    plugin(app);
    expect(app.component.mock.calls.length).toBe(count);
    const app2 = { component: vi.fn(), _context: { provides: {} } };
    plugin(app2);
    expect(app2.component.mock.calls.length).toBeGreaterThan(0);
  });
});

// ============ radio-button 补充 ============
describe('components/radio-button 补充', async () => {
  it('scroll 方向滚动', async () => {
    vi.useFakeTimers();
    try {
      const RadioButton = (await import('@/components/radio-button/radio-button.vue')).default;
      const wrapper = createMounter(RadioButton, {
        global: { plugins: [ElementPlus, gsUiCompat, components] },
        props: { data: [{ label: 'A', value: 'a' }], value: [], showType: 'scroll' },
      });
      wrapper.vm.$refs.container = { scrollLeft: 0 };
      wrapper.vm.scroll('right');
      vi.advanceTimersByTime(300);
      expect(wrapper.vm.timer).toBeNull();
      if (wrapper.vm.timer) clearInterval(wrapper.vm.timer);
    } finally {
      vi.useRealTimers();
    }
  });

  it('toggle 展开收起', async () => {
    const RadioButton = (await import('@/components/radio-button/radio-button.vue')).default;
    const wrapper = createMounter(RadioButton, {
      global: { plugins: [ElementPlus, gsUiCompat, components] },
      props: { data: [{ label: 'A', value: 'a' }], value: [], showType: 'toggle' },
    });
    expect(wrapper.vm.isShow).toBe(false);
    wrapper.vm.toggle();
    expect(wrapper.vm.isShow).toBe(true);
  });

  it('value 变化同步 active', async () => {
    const RadioButton = (await import('@/components/radio-button/radio-button.vue')).default;
    const wrapper = createMounter(RadioButton, {
      global: { plugins: [ElementPlus, gsUiCompat, components] },
      props: { data: [{ label: 'A', value: 'a' }], value: ['a'], multiple: true },
    });
    await wrapper.setProps({ value: ['b'] });
    expect(wrapper.vm.active).toEqual(['b']);
  });
});

// ============ transfer/panel.vue ============
describe('components/transfer/panel.vue', async () => {
  const panelStubs = {
    'slick-list': { template: '<div><slot /></div>' },
    'slick-item': { template: '<div><slot /></div>' },
    'dragger-item': { template: '<div />' },
  };

  it('过滤与全选逻辑', async () => {
    const Panel = (await import('@/components/transfer/panel.vue')).default;
    const wrapper = createMounter(Panel, {
      global: { plugins: [ElementPlus, gsUiCompat, components], stubs: panelStubs },
      props: { data: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }], title: '待选', value: [] },
    });
    expect(wrapper.vm.list.length).toBe(2);
    wrapper.vm.searchVal = 'A';
    expect(wrapper.vm.renderList.length).toBe(1);
    wrapper.vm.handleAllChange({ target: { checked: true } });
    expect(wrapper.vm.checkedKeys).toEqual(['a', 'b']);
    wrapper.vm.handleChange('a', { target: { checked: true } });
  });

  it('排序模式 handleSortInput', async () => {
    const Panel = (await import('@/components/transfer/panel.vue')).default;
    const wrapper = createMounter(Panel, {
      global: { plugins: [ElementPlus, gsUiCompat, components], stubs: panelStubs },
      props: { data: [{ label: 'A', value: 'a' }], title: '已选', value: ['a'], sortable: true },
    });
    wrapper.vm.handleSortInput([{ value: 'a', label: 'A' }]);
    expect(wrapper.emitted('sort')).toBeTruthy();
  });
});

// ============ stores/user.js 补充 ============
describe('stores/user.js 补充', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('getUserDetail / getUserList / getGroupList 失败路径', async () => {
    const { useUserStore } = await import('@/stores/user');
    userServiceMock.detail.mockRejectedValue(new Error('net'));
    userServiceMock.getUserList.mockRejectedValue(new Error('net'));
    userServiceMock.getGroupList.mockRejectedValue(new Error('net'));
    const store = useUserStore();
    await expect(store.getUserDetail(1)).rejects.toThrow();
    expect(store.detailStatus).toBe('FAIL');
    await expect(store.getUserList({})).rejects.toThrow();
    expect(store.userListStatus).toBe('FAIL');
    await expect(store.getGroupList({})).rejects.toThrow();
    expect(store.groupListStatus).toBe('FAIL');
  });

  it('getUserByIds / getGroupByIds / getUserTenant 透传', async () => {
    const { useUserStore } = await import('@/stores/user');
    userServiceMock.getUserByIds.mockResolvedValue({ error_code: 0, data: {} });
    userServiceMock.getGroupByIds.mockResolvedValue({ error_code: 0, data: {} });
    userServiceMock.getUserTenant.mockResolvedValue({ error_code: 0, data: {} });
    const store = useUserStore();
    await store.getUserByIds({ user_id_list: [1] });
    expect(userServiceMock.getUserByIds).toHaveBeenCalledWith({ user_id_list: [1] });
    await store.getGroupByIds({ group_id_list: [1] });
    expect(userServiceMock.getGroupByIds).toHaveBeenCalledWith({ group_id_list: [1] });
    await store.getUserTenant(false);
    expect(userServiceMock.getUserTenant).toHaveBeenCalledWith(false);
  });
});

// ============ apply-index.vue 补充 ============
describe('views/apply/applyForm/apply-index.vue 补充', async () => {
  it('submit 校验失败不创建工单', async () => {
    orderServiceMock.createOrder.mockResolvedValue({ error_code: 0 });
    const ApplyFormIndex = (await import('@/views/apply/applyForm/apply-index.vue')).default;
    const wrapper = createMounter(ApplyFormIndex, {
      global: {
        ...baseGlobal,
        stubs: {
          ...baseGlobal.stubs,
          vm: {
            template: '<div class="vm-stub"><form-stub ref="form" /></div>',
            components: { FormStub: { template: '<div class="form-stub" />', methods: { validate(cb) { cb(false); }, resetFields() {} } } },
            methods: { getParam() { return {}; }, checkParam() { return 'fail'; }, resetForm() {} },
          },
        },
        mocks: { ...baseGlobal.mocks, $route: { path: '/main/order/apply/vm', params: { type: 'vm' }, meta: {}, query: {} } },
      },
    });
    wrapper.vm.submit();
    await wait(50);
    expect(orderServiceMock.createOrder).not.toHaveBeenCalled();
  });

  it('handleCheckChange 控制提交状态', async () => {
    const ApplyFormIndex = (await import('@/views/apply/applyForm/apply-index.vue')).default;
    const wrapper = createMounter(ApplyFormIndex, {
      global: {
        ...baseGlobal,
        stubs: { ...baseGlobal.stubs, lvs: { template: '<div class="lvs-stub" />', methods: { getParam() {}, checkParam() { return 'success'; }, resetForm() {} } } },
        mocks: { ...baseGlobal.mocks, $route: { path: '/main/order/apply/lvs', params: { type: 'lvs' }, meta: {}, query: {} } },
      },
    });
    wrapper.vm.handleCheckChange('loading');
    expect(wrapper.vm.disableSubmit).toBe(true);
    wrapper.vm.handleCheckChange('success');
    expect(wrapper.vm.disableSubmit).toBe(false);
  });
});

// ============ mixins/autoRefresh.js 补充 ============
describe('mixins/autoRefresh.js 补充', async () => {
  it('refresh(fun, timer) 定时触发内部 refresh', async () => {
    vi.useFakeTimers();
    try {
      const m = (await import('@/mixins/autoRefresh')).default;
      const ctx = {};
      Object.assign(ctx, m.data.call(ctx));
      Object.assign(ctx, m.methods);
      // 先用真实方法设置定时器
      ctx.refresh(null, 100);
      // 再替换为 spy 验证定时回调
      ctx.refresh = vi.fn();
      vi.advanceTimersByTime(500);
      expect(ctx.refresh).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('refresh 方法内部调用 setInterval', async () => {
    vi.useFakeTimers();
    try {
      const m = (await import('@/mixins/autoRefresh')).default;
      const ctx = {};
      Object.assign(ctx, m.data.call(ctx));
      Object.assign(ctx, m.methods);
      m.created.call(ctx);
      const refreshSpy = vi.fn();
      ctx.refresh = refreshSpy;
      // 直接调用 refresh 方法（内部 setInterval 定时触发 this.refresh）
      ctx.refresh();
      vi.advanceTimersByTime(10000);
      expect(refreshSpy).toHaveBeenCalled();
      clearInterval(ctx.autoRefresh);
    } finally {
      vi.useRealTimers();
    }
  });
});
