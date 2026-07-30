import { cloneDeep } from 'lodash';

// 默认策略中，任一属性不等则认为本地列配置过期
function isChangeStrategy(fresh = {}, local = {}) {
  // const attrs = ['width', 'sortable', 'disabled', 'label', 'value'];
  const freshAttrs = Object.keys(fresh);
  const localAttrs = Object.keys(local);
  if (freshAttrs.length !== localAttrs.length) {
    return true;
  }
  return freshAttrs.some(attr => fresh[attr] !== local[attr]);
}

export default {
  methods: {
    // 可直接使用merge，全部使用默认策略
    mergeCol(localData = [], freshData = [], strategy) {
      const isExpired = this.isLocalExpired(localData, freshData, strategy);
      return isExpired ? this.defaultSelectCol(freshData) : localData;
    },
    /**
     * 判断是否有任何一列和本地保存的不一致，过期策略可传
     * @param {Array.<Object>} localData 本地localStorage存储的列配置
     * @param {number} localTotal 本地只存储选中的列，localTotal表示可选列的总数
     * @param {Array.<Object>} freshData 当前新的列配置信息，即columns.js里的配置项
     * @param {function(Object, Object):boolean=} strategy 判断是否过期的条件
     * @returns {boolean} 本地列配置是否过期
     */
    isLocalExpired(localData = [], freshData = [], strategy) {
      // 本地没有已存的列配置，则认为是过期
      if (!localData.length) {
        return true;
      }
      strategy = strategy || isChangeStrategy;
      const hasChange = localData.some(localCol => freshData.every(freshCol => strategy(freshCol, localCol)));
      return hasChange;
    },
    // 本地存储过期（如列名改变），默认选择前6列显示
    defaultSelectCol(freshData = [], num = 6) {
      const _freshData = cloneDeep(freshData);
      const len = Math.min(_freshData.length, num);

      return _freshData.slice(0, len);
    },
  },
};
