import { getTypeof } from '@/utils/utils.js';

const regList = {
  'IPV4': /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/igm,
  'EMAIL': '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$',
  'email': /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$/,
  'URL': /^(http:\/\/www.|https:\/\/www.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
  'PHONE': '^(0\\d{2,3}-){0,1}\\d{5,8}$',
  'MOBILE': '^1(3|4|5|7|8)\\d{9}$',
  'URL2': '^((ht|f)tps?):\\/\\/([\\w-]+(\\.[\\w-]+)*\\/?)+(\\?([\\w\\-\\.,@?^=%&:\\/~\\+#]*)+)?$',
  'TEMPLATE': /{{[a-zA-Z][\d\w\-.]*}}/g
};

export const ruleTypes = {
  empty: value => {
    return value && value.length > 0;
  },
  rightInt: value => {
    const regInt = /^-?[0-9]\d*$/;
    return regInt.test(value) || !value;
  },
  rightFloat: value => {
    const regFloat = /^[0-9]+.?[0-9]*$/;
    return regFloat.test(value) || !value;
  },
  regexp(reg) {
    return value => {
      if (getTypeof(reg) === 'regexp') {
        return reg.test(value);
      } else if (getTypeof(reg) === 'array') {
        return reg.every(r => r.test(value));
      }
      return false;
    };
  },
  regexpIP: value => {
    const reg = new RegExp(regList.IPV4);
    return reg.test(value);
  },
  regexpPhone: value => {
    const reg = new RegExp(regList.MOBILE);
    return reg.test(value);
  },
  regexpEmail: value => {
    const reg = new RegExp(regList.email);
    return reg.test(value);
  },
  repeat(value) { },
  length(min = 1, max = 100) {
    return value => {
      if (getTypeof(value) !== 'string') {
        return false;
      }
      const length = value.trim().length;
      return length >= min && length <= max;
    };
  },
  range(min = 1, max = 100) {
    return value => {
      value = Number(value);
      if (Number.isNaN(value)) {
        return false;
      }
      return value >= min && value <= max;
    };
  },
  gte(min = 0) {
    return value => {
      value = Number(value);
      if (Number.isNaN(value)) {
        return false;
      }
      return value >= min;
    };
  }
};

export function validatorGenerator(rules = [], context) {
  if (!Array.isArray(rules)) {
    rules = [rules];
  }
  const tasks = rules.map(rule => {
    return (value, callback) => {
      const { expr, err } = rule;
      // context可以为undefined
      if (expr.bind(context)(value) !== true) {
        return callback(new Error(err));
      }
    };
  });
  return (rule, value, callback) => {
    tasks.forEach(p => p(value, callback));
    callback();
  };
}
