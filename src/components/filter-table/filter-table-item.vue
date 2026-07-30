<template>
  <div class="filter-table-item">
    <label class="filter-table-item-label" :style="labelStyle" v-if="label || $slots.label">
      <slot name="label">{{label + filterTable.labelSuffix}}</slot>
    </label>
    <div class="filter-table-item-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FilterTableItem',
  provide() {
    return {
      filterTableItem: this
    };
  },
  inject: ['filterTable'],
  props: {
    label: String,
    prop: String
  },
  computed: {
    labelStyle() {
      const ret = {};
      const labelWidth = this.labelWidth || this.filterTable.labelWidth;
      if (labelWidth) {
        ret.width = labelWidth;
      }
      return ret;
    },
    contentStyle() {
      const ret = {};
      const label = this.label;
      if (!label && !this.labelWidth) return ret;
      const labelWidth = this.labelWidth || this.filterTable.labelWidth;
      if (labelWidth) {
        ret.marginLeft = labelWidth;
      }
      return ret;
    }
  }
};
</script>
