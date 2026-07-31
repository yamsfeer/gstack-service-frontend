import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter, wait } from '../helpers';
import { createPinia, setActivePinia } from 'pinia';

const { userServiceMock } = vi.hoisted(() => ({
  userServiceMock: {
    getUserInfo: vi.fn(), getUserTenant: vi.fn(), getAuthToken: vi.fn(), logout: vi.fn(),
  },
}));
vi.mock('@/service/user', () => userServiceMock);
// downloadFileWithAuth 依赖 router.app.$store
vi.mock('@/router', () => ({
  default: { app: { $store: { getters: { GET_TOKEN: 'mock-token' } } } },
}));

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setActivePinia(createPinia());
    userServiceMock.getUserInfo.mockResolvedValue({
      error_code: 0,
      data: { user: { username: 'admin', name: '管理员', email: 'a@b.com', policies: [{ name: 'TicketFullAccess' }] } },
    });
    userServiceMock.getUserTenant.mockResolvedValue({
      error_code: 0,
      data: { tenat_list: [{ tenat_id: '1001', tenat_name: '平台研发部' }] },
    });
  });

  it('created 加载用户信息与租户（管理员走 tenat_list）', async () => {
    const App = (await import('@/App.vue')).default;
    const wrapper = createMounter(App, {});
    await wait(80);
    expect(userServiceMock.getUserInfo).toHaveBeenCalled();
    expect(userServiceMock.getUserTenant).toHaveBeenCalledWith(true);
    const login = wrapper.vm.loginInfoStore;
    expect(login.userInfo.name).toBe('管理员');
    expect(login.userInfo.isServiceAdmin).toBe(true);
    // 管理员租户字段映射 tenat_id -> tenant_id
    expect(login.tenantList[0]).toEqual({ tenat_id: '1001', tenat_name: '平台研发部', tenant_id: '1001', tenant_name: '平台研发部' });
  });

  it('created 普通用户走 tenant_list', async () => {
    userServiceMock.getUserInfo.mockResolvedValue({
      error_code: 0,
      data: { user: { username: 'zhangsan', name: '张三', policies: [{ name: 'TicketApply' }] } },
    });
    userServiceMock.getUserTenant.mockResolvedValue({
      error_code: 0,
      data: { tenant_list: [{ tenant_id: '1002', tenant_name: '基础架构部' }] },
    });
    const App = (await import('@/App.vue')).default;
    const wrapper = createMounter(App, {});
    await wait(80);
    const login = wrapper.vm.loginInfoStore;
    expect(login.userInfo.isServiceAdmin).toBe(false);
    expect(userServiceMock.getUserTenant).toHaveBeenCalledWith(false);
    expect(login.tenantList).toEqual([{ tenant_id: '1002', tenant_name: '基础架构部' }]);
  });

  it('已有 token 时同步到 store（用户信息仍会拉取）', async () => {
    localStorage.setItem('access_token', 'existing-token');
    const App = (await import('@/App.vue')).default;
    const wrapper = createMounter(App, {});
    await wait(80);
    expect(wrapper.vm.loginInfoStore.token).toBe('existing-token');
    // 用户信息为空仍会拉取用户信息
    expect(userServiceMock.getUserInfo).toHaveBeenCalled();
  });

  it('登录态已有用户信息时不重复拉取', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const { useLoginInfoStore } = await import('@/stores/loginInfo');
    const login = useLoginInfoStore();
    login.UPDATE_USER_INFO({ username: 'admin', name: '管理员', isServiceAdmin: true });
    const App = (await import('@/App.vue')).default;
    const wrapper = createMounter(App, {});
    await wait(80);
    expect(userServiceMock.getUserInfo).not.toHaveBeenCalled();
  });
});

describe('utils/http.js', () => {
  // 拦截器行为用单元方式验证（不依赖外部 mock server 进程，单测可独立运行）
  it('request 拦截器附加 Authorization 并返回 data', async () => {
    localStorage.setItem('access_token', 'test-token');
    const http = (await import('@/utils/http')).default;
    const reqConfig = { headers: {} };
    const intercepted = await http.interceptors.request.handlers[0].fulfilled(reqConfig);
    expect(intercepted.headers.Authorization).toBe('Bearer test-token');
    localStorage.removeItem('access_token');
  });

  it('response 拦截器透传 data', async () => {
    const http = (await import('@/utils/http')).default;
    // response 第一个 handler 是 error 拦截，第二个才是 success 透传
    const successHandler = http.interceptors.response.handlers[1].fulfilled;
    const res = { data: { error_code: 0, data: { user: { username: 'admin' } } } };
    const result = successHandler(res);
    expect(result).toBe(res.data);
    expect(result.data.user.username).toBe('admin');
  });
});

describe('mixins/autoRefresh.js', () => {
  it('created 启动定时刷新', async () => {
    vi.useFakeTimers();
    try {
      const m = (await import('@/mixins/autoRefresh')).default;
      const ctx = {};
      const data = m.data.call(ctx);
      Object.assign(ctx, data);
      Object.assign(ctx, m.methods);
      // 覆盖为 spy 以便断言
      ctx.refresh = vi.fn();
      m.created.call(ctx);
      expect(ctx.autoRefresh).toBeTruthy();
      vi.advanceTimersByTime(10000);
      expect(ctx.refresh).toHaveBeenCalled();
      clearInterval(ctx.autoRefresh);
    } finally {
      vi.useRealTimers();
    }
  });
});
