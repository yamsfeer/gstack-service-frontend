<template>
  <SortableList lockAxis="y" v-model="steps" :useDragHandle="true">
    <slot></slot>
  </SortableList>
</template>
<script>
import { ContainerMixin } from 'vue-slicksort';
import { h } from 'vue';
import StepItem from './stepItem.vue';

const SortableList = {
  name: 'SortableList',
  mixins: [ContainerMixin],
  render() {
    return h('ul', { class: 'list' }, this.$slots.default ? this.$slots.default() : null);
  },
};
export default {
  components: {
    StepItem,
    SortableList
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    // Vue 3 v-model 绑定 modelValue；无值时兼容 Vue 2 :value 语法
    modelValue: {
      type: Array,
      default: undefined
    }
  },
  data() {
    return {
      steps: this.modelValue !== undefined ? this.modelValue : this.value
    };
  },
  watch: {
    value(val) {
      // 外层传入的steps是对象数组 需要watch
      // 否则steps一直是第一次传入时的值
      this.steps = val;
    },
    modelValue(val) {
      if (val !== undefined) this.steps = val;
    },
    steps(val) {
      this.$emit('update:modelValue', val);
      this.$emit('input', val);
    }
  }
};
</script>
