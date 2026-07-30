<template>
  <SortableList lockAxis="y" v-model="steps" :useDragHandle="true">
    <slot></slot>
  </SortableList>
</template>
<script>
import { ContainerMixin } from 'vue-slicksort';
import StepItem from './stepItem.vue';

const SortableList = {
  mixins: [ContainerMixin],
  template: `
  <ul class="list">
    <slot />
  </ul>
  `
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
    }
  },
  data() {
    return {
      steps: this.value
    };
  },
  watch: {
    value(val) {
      // 外层传入的steps是对象数组 需要watch
      // 否则steps一直是第一次传入时的值
      this.steps = val;
    },
    steps(val) {
      this.$emit('input', val);
    }
  }
};
</script>
