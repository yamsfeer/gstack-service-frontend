import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// Create a test helper
function createTestSetup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return { pinia };
}

describe('路由配置', () => {
  it('应该包含所有主要路由', async () => {
    const routerModule = await import('../src/router/index.js');
    const { routes } = routerModule;
    
    expect(Array.isArray(routes)).toBe(true);
    
    // 顶层路由
    const routePaths = routes.map(r => r.path);
    expect(routePaths).toContain('/main');
    
    // 检查嵌套路由
    const mainRoute = routes.find(r => r.path === '/main');
    expect(mainRoute).toBeDefined();
    expect(mainRoute.children).toBeDefined();
    
    const childPaths = mainRoute.children.map(c => c.path);
    // 嵌套路由的 path 是相对路径
    expect(childPaths.some(p => p.includes('apply'))).toBe(true);
    expect(childPaths.some(p => p.includes('mine'))).toBe(true);
    expect(childPaths.some(p => p.includes('audit'))).toBe(true);
    expect(childPaths.some(p => p.includes('manage'))).toBe(true);
    expect(childPaths.some(p => p.includes('assets'))).toBe(true);
  });

  it('应该包含通配符路由重定向', async () => {
    const { routes } = await import('../src/router/index.js');
    const catchAll = routes.find(r => r.path === '/:pathMatch(.*)*');
    expect(catchAll).toBeDefined();
    expect(catchAll.redirect).toBe('/main/order/apply');
  });

  it('菜单配置应该有正确的结构', async () => {
    const { menus } = await import('../src/router/index.js');
    expect(Array.isArray(menus)).toBe(true);
    expect(menus.length).toBeGreaterThan(0);
    
    const firstMenu = menus[0];
    expect(firstMenu.children).toBeDefined();
    
    // 检查工单子菜单
    const orderMenu = firstMenu.children.find(c => c.title === '工单');
    expect(orderMenu).toBeDefined();
    expect(orderMenu.children.length).toBeGreaterThan(0);
  });
});

describe('Pinia Stores - LoginInfo', () => {
  beforeEach(() => {
    createTestSetup();
  });

  it('应该正确初始化', async () => {
    const { useLoginInfoStore } = await import('../src/stores/loginInfo');
    const store = useLoginInfoStore();
    
    expect(store.userInfo).toEqual({});
    expect(store.token).toBe('');
    expect(store.tenantList).toEqual([]);
  });

  it('UPDATE_USER_INFO 应该更新用户信息', async () => {
    const { useLoginInfoStore } = await import('../src/stores/loginInfo');
    const store = useLoginInfoStore();
    
    const user = { username: 'admin', name: '管理员', isServiceAdmin: true };
    store.UPDATE_USER_INFO(user);
    expect(store.GET_USER_INFO).toEqual(user);
  });

  it('UPDATE_TOKEN 应该更新 token', async () => {
    const { useLoginInfoStore } = await import('../src/stores/loginInfo');
    const store = useLoginInfoStore();
    
    store.UPDATE_TOKEN('test-token');
    expect(store.GET_TOKEN).toBe('test-token');
  });

  it('UPDATE_TENANT 应该更新租户列表', async () => {
    const { useLoginInfoStore } = await import('../src/stores/loginInfo');
    const store = useLoginInfoStore();
    
    const tenants = [{ tenant_id: '1', tenant_name: '测试租户' }];
    store.UPDATE_TENANT(tenants);
    expect(store.GET_TENANT).toEqual(tenants);
  });
});

describe('Pinia Stores - StoreParams', () => {
  beforeEach(() => {
    createTestSetup();
  });

  it('应该正确初始化', async () => {
    const { useStoreParamsStore } = await import('../src/stores/storeParams');
    const store = useStoreParamsStore();
    expect(store.GET_STORE_PARAMS).toEqual({});
  });

  it('SET_STORE_PARAMS 应该保存参数', async () => {
    const { useStoreParamsStore } = await import('../src/stores/storeParams');
    const store = useStoreParamsStore();
    
    store.SET_STORE_PARAMS({ namespace: 'test', params: { page: 1 } });
    expect(store.GET_STORE_PARAMS.test).toEqual({ page: 1 });
  });
});

describe('配置模块', () => {
  it('config.dev.js 应该导出正确的配置', async () => {
    const config = (await import('../src/config/config.dev.js')).default;
    expect(config.API_SERVER).toBeDefined();
    expect(config.API_GOD).toBeDefined();
    expect(config.GOD_URL).toBeDefined();
  });

  it('config.mock.js 应该导出正确的配置', async () => {
    const config = (await import('../src/config/config.mock.js')).default;
    expect(config.API_SERVER).toBeDefined();
  });

  it('config.prod.js 应该导出正确的配置', async () => {
    const config = (await import('../src/config/config.prod.js')).default;
    expect(config.API_SERVER).toBeDefined();
  });

  it('config/index.js 应该默认使用 dev 配置', async () => {
    const config = (await import('../src/config/index.js')).default;
    expect(config).toBeDefined();
    expect(config.API_SERVER).toBeDefined();
  });
});

describe('工具函数', () => {
  it('debounce 应该正确防抖', async () => {
    const { debounce } = await import('../src/utils/utils');
    vi.useFakeTimers();
    
    const fn = vi.fn();
    const debounced = debounce(500, fn);
    
    debounced();
    debounced();
    debounced();
    
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });

  it('uuid 应该生成唯一字符串', async () => {
    const { uuid } = await import('../src/utils/utils');
    const id1 = uuid();
    const id2 = uuid();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  it('isEmptyArr 应该正确判断空数组', async () => {
    const { isEmptyArr } = await import('../src/utils/utils');
    expect(isEmptyArr([])).toBe(true);
    expect(isEmptyArr([1, 2])).toBe(false);
    expect(isEmptyArr('string')).toBe(false);
  });

  it('getTypeof 应该正确判断类型', async () => {
    const { getTypeof } = await import('../src/utils/utils');
    expect(getTypeof([])).toBe('array');
    expect(getTypeof({})).toBe('object');
    expect(getTypeof('')).toBe('string');
    expect(getTypeof(123)).toBe('number');
    expect(getTypeof(null)).toBe('null');
  });

  it('transformRequest 应该正确转换对象', async () => {
    const { transformRequest } = await import('../src/utils/utils');
    const result = transformRequest({ a: 1, b: 'hello' });
    expect(result).toContain('a=1');
    expect(result).toContain('b=hello');
  });
});

describe('常量模块', () => {
  it('serviceOptions 应该包含所有工单类型', async () => {
    const { serviceOptions } = await import('../src/views/apply/constant');
    expect(Array.isArray(serviceOptions)).toBe(true);
    expect(serviceOptions.length).toBeGreaterThanOrEqual(5);
    expect(serviceOptions.find(s => s.name === 'vm')).toBeDefined();
    expect(serviceOptions.find(s => s.name === 'dns')).toBeDefined();
  });

  it('OrderState 应该包含所有状态', async () => {
    const { OrderState } = await import('../src/views/apply/constant');
    expect(OrderState[1]).toBe('待处理');
    expect(OrderState[10]).toBe('已完成');
    expect(OrderState[11]).toBe('已废弃');
  });

  it('stateTextMap 应该正确映射状态', async () => {
    const { stateTextMap } = await import('../src/views/apply/constant');
    const completed = stateTextMap.find(s => s.text === '已完成');
    expect(completed).toBeDefined();
    expect(completed.state).toContain(10);
    expect(completed.color).toBe('success');
  });

  it('statesMap 应该包含正确的状态码', async () => {
    const { statesMap } = await import('../src/views/apply/constant');
    expect(statesMap.PENDING).toBe(1);
    expect(statesMap.COMPLETED).toBe(10);
    expect(statesMap.DEPRECATED).toBe(11);
  });
});

describe('状态检查函数', () => {
  it('checkLoading 应该正确判断加载状态', async () => {
    const { checkLoading } = await import('../src/stores/vuex-compat');
    expect(checkLoading('LOADING')).toBe(true);
    expect(checkLoading('SUCCESS')).toBe(false);
    expect(checkLoading('FAIL')).toBe(false);
  });

  it('checkSuccess 应该正确判断成功状态', async () => {
    const { checkSuccess } = await import('../src/stores/vuex-compat');
    expect(checkSuccess('SUCCESS')).toBe(true);
    expect(checkSuccess('LOADING')).toBe(false);
    expect(checkSuccess('FAIL')).toBe(false);
  });
});
