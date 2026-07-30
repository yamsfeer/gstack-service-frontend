export const getTypeof = (() => {
  const class2type = {};
  const types = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Null', 'Symbol', 'Map'];

  types.forEach(type => {
    class2type[`[object ${type}]`] = type.toLowerCase();
  });

  return obj => class2type[Object.prototype.toString.call(obj)] || 'object';
})();

export function debounce(idle, action) {
  var last;
  return function () {
    var ctx = this;
    var args = arguments;
    clearTimeout(last);
    last = setTimeout(function () {
      action.apply(ctx, args);
    }, idle);
  };
}

export function obj2KeyValue(obj) {
  if (getTypeof(obj) !== 'object') {
    return [];
  }
  return Object.keys(obj).map(key => {
    return {
      key,
      value: obj[key]
    };
  });
}

export function save2Local(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getLocal(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function uuid() {
  return Math.random().toString().slice(2);
}

/**
 * 数组合并并去重, 类比Object.assign
 * @param {Array} src src
 * @param {Array} target target
 * @param {Function} filter filter
 */
export function assignArr(src, target, filter) {
  const concat = target.filter(_target => {
    return !src.find(_src => filter(_src, _target));
  });
  return src.concat(concat);
}

export function transformRequest(obj) {
  let str = [];
  for (let p in obj) {
    if (obj[p] instanceof Array) {
      str.push(encodeURIComponent(p) + '=' + JSON.stringify(obj[p]));
    } else {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}

export function isEmptyArr(arr) {
  return Array.isArray(arr) && arr.length === 0;
}

/**
 * 调用api时设置loading的装饰器
 * 在调用前、调用后及捕获异常时设置loading的状态
 * 使用示例
 * @loading('loadingName')
 * request() {
 *   your request api code
 * }
 *
 * @export
 * @param {string} [loading='loading'] vue组件中loading的字段名
 * @returns {function} 返回装饰器函数
 */
export function loading(loading = 'loading') {
  return function (target, name, desciptor) {
    const fn = desciptor.value;
    desciptor.value = async function (...args) {
      this[loading] = true;
      try {
        let value = await fn.apply(this, args);
        this[loading] = false;
        return value;
      } catch (e) {
        this[loading] = false;
        console.error(e);
      }
    };
  };
}
