import { describe, it, expect, vi, beforeEach } from 'vitest';
import serverTableMixin from '@/mixins/serverTable';
import restoreMixin from '@/mixins/restore';
import localStorageMixin from '@/mixins/localStorage';
import colConfigMixin from '@/mixins/colConfig';
import mutiOperationMixin from '@/mixins/mutiOperation';

// 用组合式对象模拟 Vue mixin 的 data/methods/computed 挂载
function mountMixin(mixin, extra = {}) {
  const ctx = {
    ...(typeof mixin.data === 'function' ? mixin.data.call(extra) : {}),
    ...mixin.computed ? Object.fromEntries(Object.entries(mixin.computed).map(([k, v]) => {
      const c = typeof v === 'function' ? v.call(ctx) : v.get.call(ctx);
      return [k, c];
    })) : {},
    ...(mixin.methods || {}),
    ...extra,
  };
  return ctx;
}

describe('mixins/serverTable.js', () => {
  it('初始状态与分页方法', () => {
    const m = mountMixin(serverTableMixin, {
      getTableList: vi.fn(),
    });
    expect(m.pageSize).toBe(10);
    expect(m.pageNum).toBe(1);
    expect(m.total).toBe(0);
    expect(m.orderBy).toBe('');
  });

  it('currentChange 更新页码并重新拉取', () => {
    const getTableList = vi.fn();
    const m = mountMixin(serverTableMixin, { getTableList });
    m.currentChange(3);
    expect(m.pageNum).toBe(3);
    expect(getTableList).toHaveBeenCalled();
  });

  it('sizeChange 更新每页条数并修正页码', () => {
    const getTableList = vi.fn();
    const m = mountMixin(serverTableMixin, { getTableList });
    m.total = 100;
    m.pageNum = 8;
    m.sizeChange(50);
    expect(m.pageSize).toBe(50);
    expect(m.pageNum).toBe(2);
    expect(getTableList).toHaveBeenCalled();
  });

  it('sortChange 设置排序字段与方法', () => {
    const fetchTable = vi.fn();
    const m = mountMixin(serverTableMixin, { fetchTable });
    m.sortChange({ order: 'ascending', prop: 'name' });
    expect(m.orderBy).toBe('name');
    expect(m.orderMethod).toBe('asc');
    expect(fetchTable).toHaveBeenCalled();
  });

  it('fetchTable 重置到第一页', () => {
    const getTableList = vi.fn();
    const m = mountMixin(serverTableMixin, { getTableList });
    m.pageNum = 5;
    m.fetchTable();
    expect(m.pageNum).toBe(1);
    expect(getTableList).toHaveBeenCalled();
  });

  it('rowKey 返回 idKey 字段', () => {
    const m = mountMixin(serverTableMixin);
    m.idKey = 'uuid';
    expect(m.rowKey({ uuid: 'x' })).toBe('x');
  });

  it('getTableList 默认清空数据', () => {
    const m = mountMixin(serverTableMixin);
    m.tableData = [1, 2];
    m.getTableList();
    expect(m.tableData).toEqual([]);
  });
});

describe('mixins/restore.js', () => {
  beforeEach(() => localStorage.clear());

  it('store 保存参数到 storeParams', () => {
    const { store } = restoreMixin.methods;
    const setParams = vi.fn();
    const ctx = {
      storeNamespace: 'NS',
      keywords: 'k', pageNum: 1, pageSize: 10, orderBy: '', orderMethod: '', form: {},
      SET_STORE_PARAMS: setParams,
    };
    store.call(ctx);
    expect(setParams).toHaveBeenCalledWith({ namespace: 'NS', params: { keywords: 'k', pageNum: 1, pageSize: 10, orderBy: '', orderMethod: '', form: {} } });
  });

  it('restore 从 storeParams 还原参数', () => {
    const { restore } = restoreMixin.methods;
    const ctx = {
      storeNamespace: 'NS',
      storedParams: { NS: { keywords: 'k2', pageNum: 3, pageSize: 50, orderBy: 'name', orderMethod: 'asc', form: { a: 1 } } },
      keywords: '', pageNum: 1, pageSize: 10, orderBy: '', orderMethod: '', form: {},
    };
    restore.call(ctx);
    expect(ctx.keywords).toBe('k2');
    expect(ctx.pageNum).toBe(3);
    expect(ctx.pageSize).toBe(50);
    expect(ctx.orderBy).toBe('name');
    expect(ctx.form).toEqual({ a: 1 });
  });

  it('restore 无存储数据时保持默认', () => {
    const { restore } = restoreMixin.methods;
    const ctx = { storeNamespace: 'NS', storedParams: {}, keywords: '', pageNum: 1 };
    restore.call(ctx);
    expect(ctx.pageNum).toBe(1);
  });
});

describe('mixins/localStorage.js', () => {
  beforeEach(() => localStorage.clear());

  it('saveToLocal / getLocal 读写', () => {
    const m = mountMixin(localStorageMixin);
    m.saveToLocal('key', [{ a: 1 }]);
    expect(m.getLocal('key')).toEqual([{ a: 1 }]);
    expect(m.getLocal('no-exist')).toBeNull();
  });
});

describe('mixins/colConfig.js', () => {
  it('mergeCol 支持自定义过期策略', () => {
    const m = mountMixin(colConfigMixin);
    const fresh = [{ label: 'A', value: 'a' }];
    const local = [{ label: 'A', value: 'a', extra: 1 }];
    // 自定义策略只看 label
    const customStrategy = (freshCol, localCol) => freshCol.label !== localCol.label;
    const merged = m.mergeCol(local, fresh, customStrategy);
    expect(merged).toEqual(local);
    // 策略判定过期时回退到默认列
    const expired = m.mergeCol([{ label: 'X' }], fresh, customStrategy);
    expect(expired).toEqual(fresh);
  });
  it('mergeCol 本地数据过期时使用默认列', () => {
    const m = mountMixin(colConfigMixin);
    const fresh = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }];
    // 本地为空 → 过期 → 默认前6列（全部）
    expect(m.mergeCol([], fresh)).toEqual(fresh);
    // 本地数据与 fresh 完全一致 → 不过期
    const local = [{ label: 'A', value: 'a' }];
    const merged = m.mergeCol(local, fresh);
    expect(merged).toEqual(local);
  });

  it('mergeCol 本地数据有差异视为过期', () => {
    const m = mountMixin(colConfigMixin);
    const fresh = [{ label: 'A', value: 'a' }];
    const local = [{ label: 'A', value: 'different' }];
    expect(m.mergeCol(local, fresh)).toEqual(fresh);
  });

  it('defaultSelectCol 只保留前 N 列', () => {
    const m = mountMixin(colConfigMixin);
    const fresh = Array.from({ length: 10 }, (_, i) => ({ label: `L${i}`, value: `v${i}` }));
    expect(m.defaultSelectCol(fresh, 3)).toHaveLength(3);
  });

  it('isLocalExpired 判断逻辑', () => {
    const m = mountMixin(colConfigMixin);
    expect(m.isLocalExpired([], [{ a: 1 }])).toBe(true);
    expect(m.isLocalExpired([{ a: 1 }], [{ a: 1 }])).toBe(false);
  });
});

describe('mixins/mutiOperation.js', () => {
  it('handleMutiOperation 未勾选时拒绝', async () => {
    const m = mountMixin(mutiOperationMixin, { $message: { warning: vi.fn() }, $confirm: vi.fn() });
    await expect(m.handleMutiOperation()).rejects.toBe('has not selected');
  });

  it('handleMutiOperation 多选确认流程', async () => {
    const m = mountMixin(mutiOperationMixin, {
      $confirm: vi.fn(() => Promise.resolve()),
      $message: { warning: vi.fn() },
    });
    m.selected = [{ id: 1 }, { id: 2 }];
    const rows = await m.handleMutiOperation();
    expect(rows).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('handleMutiOperation 单选且无需确认', async () => {
    const m = mountMixin(mutiOperationMixin);
    const rows = await m.handleMutiOperation({ id: 1 }, false);
    expect(rows).toEqual([{ id: 1 }]);
  });
});
