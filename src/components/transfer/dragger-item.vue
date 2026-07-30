<template>
  <div
    ref="dragger"
    :class="{
      'gs-transfer-panel-item is-sortable': true,
      'is-disabled': item.disabled
    }"
  >
    <gs-checkbox
      v-if="textToChcked"
      :value="checkedKeys.indexOf(item.value) !== -1"
      :disabled="item.disabled"
      @change="handleChange(item.value, $event)"
    ><span>{{ item.label }}</span></gs-checkbox>
    <gs-checkbox
      v-if="!textToChcked"
      :value="checkedKeys.indexOf(item.value) !== -1"
      :disabled="item.disabled"
      @change="handleChange(item.value, $event)"
    />
    <span v-handle class="gs-transfer-panel-item-text" v-if="!textToChcked">{{ item.label }}</span>
    <!-- <gs-icon name="arrow-down-o" @click="handleSortBtn($event, index, 1)" />
    <gs-icon name="arrow-up-o" @click="handleSortBtn($event, index, -1)" /> -->
  </div>
</template>

<script>
import { HandleDirective } from 'vue-slicksort';

export default {
  directives: { handle: HandleDirective },
  props: {
    item: Object,
    index: Number,
    checkedKeys: Array,
    textToChcked: Boolean,
  },

  methods: {
    handleChange(val, e) {
      this.$emit('change', val, e);
    },
    handleSortBtn(e, current, direction) {
      const $item = e.target.parentNode;
      const newPos = current + direction;

      this.$emit('sort', $item, current, newPos);
    },
  },
};
</script>
