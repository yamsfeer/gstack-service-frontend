<template>
  <gs-modal
    class="col-config"
    title="配置显示列"
    v-model="modalVisible"
    width="650px"
    @confirm="confirm"
    @cancel="cancel"
  >
    <transfer
      ref="transfer"
      class="transfer"
      :data="data"
      v-model="sortCol"
      filterable
      sortable
      no-data-text="暂无数据"
    />
  </gs-modal>
</template>
<script>

/**
 * 按顺序筛选，从大数组中筛选出和小数组一样顺序的结果
 * 样例： [{prop1: foo}, {prop2: bar}] && [foo] -> [{prop1: foo}]
 * @param {Array} src 大数组
 * @param {Array} target 小数组
 * @param {function} filter 过滤函数，通常是判断某属性是否相等
 * @returns {Array} 返回过滤后和target数组一样顺序的数组
 */
function sortFilter(src = [], target = [], filter) {
  return target.map(item => {
    return src.find(s => filter(s, item));
  });
}

export default {
  name: 'ColConfig',
  props: {
    data: {
      type: Array,
      required: true
    },
    value: {
      type: Array,
      default: () => []
    },
    // Vue 3 v-model 绑定 modelValue；未传时兼容 Vue 2 :value 语法
    modelValue: {
      type: Array,
      default: undefined
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const val = this.modelValue !== undefined ? this.modelValue : this.value;
    const initSortCol = sortFilter(
      this.data,
      val,
      (src, sortValue) => src.value === sortValue.value
    )
      .map(item => item.value);
    return {
      modalVisible: this.visible,
      sortCol: initSortCol
    };
  },
  computed: {
    formatData() {
      return sortFilter(
        this.data,
        this.sortCol,
        (src, sortValue) => src.value === sortValue
      );
    }
  },
  watch: {
    visible(val) {
      this.modalVisible = val;
    },
    modelValue(val) {
      if (val !== undefined) {
        this.sortCol = sortFilter(this.data, val, (src, sortValue) => src.value === sortValue.value)
          .map(item => item.value);
      }
    }
  },
  methods: {
    confirm() {
      this.$emit('update:modelValue', this.formatData);
      this.$emit('input', this.formatData);
      this.$emit('confirm', this.formatData);
    },
    cancel() {
      this.$refs.transfer.reset();
      this.$emit('update:visible', this.modalVisible);
    }
  }
};
</script>
<style lang="scss">
  .col-config {
    .transfer {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
