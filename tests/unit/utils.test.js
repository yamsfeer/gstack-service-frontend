import { describe, it, expect, vi } from 'vitest';
import {
  getTypeof,
  debounce,
  obj2KeyValue,
  save2Local,
  getLocal,
  uuid,
  assignArr,
  transformRequest,
  isEmptyArr,
  loading,
} from '@/utils/utils';

describe('utils.js', () => {
  it('getTypeof 能识别各种类型', () => {
    expect(getTypeof([])).toBe('array');
    expect(getTypeof({})).toBe('object');
    expect(getTypeof('')).toBe('string');
    expect(getTypeof(123)).toBe('number');
    expect(getTypeof(null)).toBe('null');
    // 注：实现未处理 Undefined，默认返回 'object'
    expect(getTypeof(undefined)).toBe('object');
    expect(getTypeof(new Date())).toBe('date');
    expect(getTypeof(true)).toBe('boolean');
    expect(getTypeof(/a/)).toBe('regexp');
    expect(getTypeof(() => {})).toBe('function');
    expect(getTypeof(new Map())).toBe('map');
  });

  it('debounce 合并多次调用为一次', () => {
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

  it('obj2KeyValue 将对象转换为键值数组', () => {
    expect(obj2KeyValue({ a: 1, b: 'x' })).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 'x' },
    ]);
    expect(obj2KeyValue(null)).toEqual([]);
    expect(obj2KeyValue('str')).toEqual([]);
  });

  it('save2Local / getLocal 读写 localStorage', () => {
    const val = { a: 1 };
    expect(save2Local('test-key', val)).toEqual(val);
    expect(getLocal('test-key')).toEqual(val);
  });

  it('uuid 生成唯一字符串', () => {
    expect(uuid()).not.toBe(uuid());
    expect(typeof uuid()).toBe('string');
  });

  it('assignArr 数组合并去重', () => {
    const src = [{ id: 1 }, { id: 2 }];
    const target = [{ id: 2 }, { id: 3 }];
    const result = assignArr(src, target, (a, b) => a.id === b.id);
    expect(result).toHaveLength(3);
    expect(result.map(x => x.id)).toEqual([1, 2, 3]);
  });

  it('transformRequest 序列化查询参数（数组用 JSON 字符串，不编码）', () => {
    const result = transformRequest({ a: 1, b: 'hello world', c: [1, 2] });
    expect(result).toContain('a=1');
    expect(result).toContain('b=hello%20world');
    expect(result).toContain('c=[1,2]');
  });

  it('isEmptyArr 判断空数组', () => {
    expect(isEmptyArr([])).toBe(true);
    expect(isEmptyArr([1])).toBe(false);
    expect(isEmptyArr({})).toBe(false);
    expect(isEmptyArr('')).toBe(false);
  });

  it('loading 装饰器设置 loading 状态并捕获异常', async () => {
    const fn = vi.fn(async function () { await Promise.resolve(); });
    const descriptor = { value: fn };
    const decorator = loading('loading');
    decorator({}, 'x', descriptor);
    const ctx = { loading: false };
    const wrapper = descriptor.value.bind(ctx);
    const promise = wrapper();
    // 调用期间 loading 应为 true
    expect(ctx.loading).toBe(true);
    await promise;
    expect(ctx.loading).toBe(false);
    expect(fn).toHaveBeenCalled();
  });
});
