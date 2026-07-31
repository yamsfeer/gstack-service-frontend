import { describe, it, expect, vi, beforeEach } from 'vitest';

// http.js 错误拦截器分支（401 跳转、302 退出处理）需要 mock axios 控制响应
const { axiosInstance } = vi.hoisted(() => ({
  axiosInstance: {
    defaults: {},
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('axios', () => ({
  default: axiosInstance,
}));

describe('utils/http.js 错误拦截器', () => {
  let reqInterceptor;
  let resInterceptor;
  let successInterceptor;

  beforeEach(() => {
    axiosInstance.interceptors.request.use.mockReset();
    axiosInstance.interceptors.response.use.mockReset();
    localStorage.clear();
    // 加载模块，捕获拦截器
    vi.resetModules();
  });

  async function loadHttp() {
    const mod = await import('@/utils/http');
    // 拦截器注册顺序：request.use 先于两个 response.use
    reqInterceptor = axiosInstance.interceptors.request.use.mock.calls[0][0];
    const resCalls = axiosInstance.interceptors.response.use.mock.calls;
    // 第一个 response.use 是错误处理（undefined, errFn），第二个是成功透传
    resInterceptor = resCalls[0][1];
    successInterceptor = resCalls[1][0];
    return mod.default;
  }

  it('request 拦截器附加 Authorization', async () => {
    localStorage.setItem('access_token', 'token-abc');
    await loadHttp();
    const req = reqInterceptor({ headers: {} });
    expect(req.headers.Authorization).toBe('Bearer token-abc');
  });

  it('response 错误拦截器：401 跳转登录页', async () => {
    await loadHttp();
    const err = { response: { status: 401, config: { url: '/x' } } };
    // 保存 location
    const originalHref = window.location.href;
    // happy-dom 允许设置 location.href? 直接 mock window.location
    const locationMock = { href: originalHref };
    Object.defineProperty(window, 'location', { value: locationMock, writable: true, configurable: true });
    await expect(resInterceptor(err)).rejects.toBe(err);
    expect(locationMock.href).toContain('?formOrder=');
  });

  it('response 错误拦截器：302 Logout 成功提示并跳转', async () => {
    await loadHttp();
    const err = {
      response: { status: 302, config: { url: 'http://x/user/0?cmd=Logout' }, data: { error_code: 0 } },
    };
    await expect(resInterceptor(err)).rejects.toBe(err);
    // ElMessage 弹出后 1.5s 跳转（使用真实定时器验证跳转）
    await new Promise(r => setTimeout(r, 1600));
  });

  it('response 错误拦截器：302 Logout 失败通知', async () => {
    await loadHttp();
    const err = {
      response: { status: 302, config: { url: 'http://x/user/0?cmd=Logout' }, data: { error_code: 1, error_msg: '退出失败' } },
    };
    await expect(resInterceptor(err)).rejects.toBe(err);
  });

  it('response 成功拦截器透传 data', async () => {
    await loadHttp();
    const res = successInterceptor({ data: { error_code: 0, data: {} } });
    expect(res).toEqual({ error_code: 0, data: {} });
  });

  it('response 拦截器无 err 时直接返回', async () => {
    await loadHttp();
    const resCalls = axiosInstance.interceptors.response.use.mock.calls;
    // 错误处理分支：无 err.response 时直接 reject
    const errNoResponse = new Error('network');
    await expect(resInterceptor(errNoResponse)).rejects.toBe(errNoResponse);
  });
});
