import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';

const { orderServiceMock } = vi.hoisted(() => ({
  orderServiceMock: { createOrder: vi.fn() },
}));
vi.mock('@/service/order', () => orderServiceMock);

const baseGlobal = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a :href="to"><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main/order/apply/vm', meta: {}, params: { type: 'vm' }, query: {} },
  },
};

function makeVmStub(validateResult = true, getParamResult = {}) {
  return {
    template: '<div class="vm-stub"><form-stub ref="form" /></div>',
    components: {
      FormStub: {
        template: '<div class="form-stub" />',
        methods: {
          validate(cb) { cb(validateResult); },
          resetFields() {},
        },
      },
    },
    methods: {
      getParam() { return getParamResult; },
      checkParam() { return 'success'; },
      resetForm() {},
    },
  };
}

describe('views/apply/applyForm/apply-index.vue 成功路径', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    orderServiceMock.createOrder.mockResolvedValue({ error_code: 0, data: { id: 100 } });
  });

  it('submit 校验通过后创建工单并确认跳转', async () => {
    const push = vi.fn();
    const ApplyFormIndex = (await import('@/views/apply/applyForm/apply-index.vue')).default;
    const wrapper = createMounter(ApplyFormIndex, {
      global: {
        ...baseGlobal,
        stubs: { ...baseGlobal.stubs, vm: makeVmStub(true, { description: 'test', resource: {} }) },
        mocks: {
          ...baseGlobal.mocks,
          $router: { push },
          $Modal: { confirm: ({ onOk }) => onOk() },
        },
      },
    });
    await wait(30);
    wrapper.vm.submit();
    await wait(80);
    expect(orderServiceMock.createOrder).toHaveBeenCalled();
    // type 来自 serviceOptions: vm.id = 1
    const call = orderServiceMock.createOrder.mock.calls[0][0];
    expect(call.type).toBe(1);
    expect(push).toHaveBeenCalledWith('/main/order/mine');
  });

  it('submit 失败时提示错误', async () => {
    orderServiceMock.createOrder.mockResolvedValue({ error_code: 1, error_msg: '参数错误' });
    const notify = vi.fn();
    const ApplyFormIndex = (await import('@/views/apply/applyForm/apply-index.vue')).default;
    const wrapper = createMounter(ApplyFormIndex, {
      global: {
        ...baseGlobal,
        stubs: { ...baseGlobal.stubs, vm: makeVmStub(true, { description: 'test' }) },
        mocks: { ...baseGlobal.mocks, $Notify: { error: notify } },
      },
    });
    await wait(30);
    wrapper.vm.submit();
    await wait(80);
    expect(orderServiceMock.createOrder).toHaveBeenCalled();
    expect(notify).toHaveBeenCalled();
  });

  it('submit dns 类型先执行 checkParam', async () => {
    const ApplyFormIndex = (await import('@/views/apply/applyForm/apply-index.vue')).default;
    const wrapper = createMounter(ApplyFormIndex, {
      global: {
        ...baseGlobal,
        stubs: {
          ...baseGlobal.stubs,
          dns: {
            template: '<div class="dns-stub"><form-stub ref="form" /></div>',
            components: { FormStub: { template: '<div />', methods: { validate(cb) { if (cb) cb(true); }, resetFields() {} } } },
            methods: { getParam() { return {}; }, checkParam() { return 'fail'; }, resetForm() {} },
          },
        },
        mocks: { ...baseGlobal.mocks, $route: { path: '/main/order/apply/dns', params: { type: 'dns' }, meta: {}, query: {} }, $Message: { error: vi.fn() } },
      },
    });
    await wait(30);
    wrapper.vm.submit();
    await wait(80);
    // checkParam 返回 fail → 不创建工单
    expect(orderServiceMock.createOrder).not.toHaveBeenCalled();
  });
});
