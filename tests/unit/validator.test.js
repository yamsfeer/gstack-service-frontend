import { describe, it, expect } from 'vitest';
import { ruleTypes, validatorGenerator } from '@/utils/validator';

describe('validator.js', () => {
  it('ruleTypes.empty 判断空值', () => {
    expect(ruleTypes.empty('abc')).toBe(true);
    expect(ruleTypes.empty('')).toBeFalsy();
    expect(ruleTypes.empty(null)).toBeFalsy();
  });

  it('ruleTypes.rightInt 判断整数', () => {
    expect(ruleTypes.rightInt('123')).toBe(true);
    expect(ruleTypes.rightInt('-12')).toBe(true);
    expect(ruleTypes.rightInt('1.5')).toBe(false);
    expect(ruleTypes.rightInt('abc')).toBe(false);
    expect(ruleTypes.rightInt('')).toBe(true);
  });

  it('ruleTypes.rightFloat 判断浮点数', () => {
    expect(ruleTypes.rightFloat('1.5')).toBe(true);
    expect(ruleTypes.rightFloat('123')).toBe(true);
    expect(ruleTypes.rightFloat('abc')).toBe(false);
  });

  it('ruleTypes.regexp 判断正则', () => {
    const r = ruleTypes.regexp(/^abc$/);
    expect(r('abc')).toBe(true);
    expect(r('abd')).toBe(false);
    const multi = ruleTypes.regexp([/^a/, /c$/]);
    expect(multi('abc')).toBe(true);
    expect(multi('abd')).toBe(false);
    // 非正则/非数组类型返回 false
    const invalid = ruleTypes.regexp('not-a-regex');
    expect(invalid('abc')).toBe(false);
  });

  it('ruleTypes.regexpIP 判断 IP 地址', () => {
    expect(ruleTypes.regexpIP('192.168.1.1')).toBe(true);
    expect(ruleTypes.regexpIP('256.1.1.1')).toBe(false);
    expect(ruleTypes.regexpIP('abc')).toBe(false);
  });

  it('ruleTypes.regexpPhone / regexpEmail', () => {
    expect(ruleTypes.regexpPhone('13812345678')).toBe(true);
    expect(ruleTypes.regexpPhone('12345')).toBe(false);
    expect(ruleTypes.regexpEmail('a@b.com')).toBe(true);
    expect(ruleTypes.regexpEmail('not-an-email')).toBe(false);
  });

  it('ruleTypes.length 判断长度范围', () => {
    const l = ruleTypes.length(2, 5);
    expect(l('abc')).toBe(true);
    expect(l('a')).toBe(false);
    expect(l('abcdef')).toBe(false);
    expect(l(123)).toBe(false);
  });

  it('ruleTypes.range 判断数值范围', () => {
    const r = ruleTypes.range(1, 10);
    expect(r(5)).toBe(true);
    expect(r(0)).toBe(false);
    expect(r(11)).toBe(false);
    expect(r('abc')).toBe(false);
  });

  it('ruleTypes.gte 判断下限', () => {
    const g = ruleTypes.gte(5);
    expect(g(5)).toBe(true);
    expect(g(4)).toBe(false);
    expect(g('abc')).toBe(false);
  });

  it('ruleTypes.repeat 存在（空实现兼容）', () => {
    expect(ruleTypes.repeat('x')).toBeUndefined();
  });

  it('validatorGenerator 依次执行规则并回调错误', () => {
    const validator = validatorGenerator([
      { expr: ruleTypes.empty, err: '不能为空' },
      { expr: ruleTypes.length(1, 10), err: '长度不合法' },
    ]);
    const errors = [];
    const cb = err => { if (err) errors.push(err.message); };
    validator({}, 'too long text here', cb);
    expect(errors).toEqual(['长度不合法']);
    // 注：empty 对空字符串返回 ''（falsy），不满足 === true，两个规则都会报错
    errors.length = 0;
    validator({}, '', cb);
    expect(errors).toEqual(['不能为空', '长度不合法']);
    errors.length = 0;
    validator({}, 'ok', cb);
    expect(errors).toEqual([]);
  });

  it('validatorGenerator 支持 context 绑定', () => {
    const ctx = { max: 5 };
    const validator = validatorGenerator([
      {
        expr: function (v) { return v <= this.max; },
        err: '超限',
      },
    ], ctx);
    const errors = [];
    validator({}, 3, e => { if (e) errors.push(e.message); });
    expect(errors).toEqual([]);
    validator({}, 9, e => { if (e) errors.push(e.message); });
    expect(errors).toEqual(['超限']);
  });
});
