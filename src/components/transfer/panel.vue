<template>
  <div class="gs-transfer-panel">
    <div class="gs-transfer-panel-header">
      <gs-search
        v-if="filterable"
        v-model="searchVal"
        :placeholder="filterPlaceholder"
      />
      <gs-checkbox
        :value="isOverOneChecked"
        :indeterminate="isIndeterminate"
        :disabled="empty"
        @change="handleAllChange"
      >{{ title }}</gs-checkbox>
    </div>
    <div class="gs-transfer-panel-body" ref="panelBody">
      <gs-checkbox
        class="gs-transfer-panel-item"
        v-if="!sortable"
        v-for="item in list"
        :key="item.value"
        :value="checkedKeys.indexOf(item.value) !== -1"
        :disabled="item.disabled"
        @change="handleChange(item.value, $event)"
      >{{ item.label }}</gs-checkbox>
      <slick-list
        v-if="sortable"
        v-model="list"
        lock-axis="y"
        helper-class="gs-transfer-helper"
        @input="handleSortInput"
        use-drag-handle
      >
        <slick-item
          v-for="(item, index) in list"
          :index="index"
          :key="item.value"
        >
          <dragger-item
            :index="index"
            :item="item"
            :checked-keys="checkedKeys"
            :text-to-chcked="textToChcked"
            @change="handleChange"
          />
        </slick-item>
      </slick-list>
      <div class="gs-transfer-panel-empty" v-if="empty">
        {{ noDataText }}
      </div>
      <div
        class="gs-transfer-panel-flag"
        v-if="dragging"
        :style="{
          top: `${flagTop}px`
        }"
      >
        <div class="gs-transfer-panel-flag-inner"></div>
      </div>
    </div>
    <div class="gs-transfer-panel-footer">

    </div>
  </div>
</template>

<script>
import {
  SlickList,
  SlickItem,
} from 'vue-slicksort';
import DraggerItem from './dragger-item.vue';
import './style.scss';

export default {
  components: {
    DraggerItem,
    SlickList,
    SlickItem,
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    title: String,
    filterable: Boolean,
    filterPlaceholder: String,
    filterMethod: Function,
    noDataText: String,
    sortable: Boolean,
    textToChcked: Boolean,
  },
  data() {
    return {
      pageX: 0,
      pageY: 0,
      dragging: false,
      draggingItem: null,
      draggingIndex: null,
      endIndex: null,
      flagTop: 0,
      searchVal: '',
      checkedKeys: this.value,
      list: [],
    };
  },
  watch: {
    value(val) {
      this.checkedKeys = val;
    },
    renderList: {
      handler(val) {
        this.list = val;
      },
      immediate: true,
    },
  },
  computed: {
    isAllChecked() {
      let checked = true;

      this.list.forEach(item => {
        if (!item.disabled && this.checkedKeys.indexOf(item.value) === -1) {
          checked = false;
        }
      });
      return checked;
    },
    isOverOneChecked() {
      return this.list.filter(item => this.checkedKeys.indexOf(item.value) !== -1).length > 0;
    },
    isIndeterminate() {
      return this.isOverOneChecked && !this.isAllChecked;
    },
    renderList() {
      const {
        searchVal,
        filterMethod = (label) => label.indexOf(searchVal) !== -1,
      } = this;

      return this.data.filter(item => !searchVal || filterMethod(item.label));
    },
    empty() {
      return this.list.length === 0;
    },
  },
  methods: {
    handleChange(val, e) {
      const { checked } = e.target;

      if (checked) {
        this.checkedKeys.push(val);
      } else {
        const index = this.checkedKeys.indexOf(val);

        this.checkedKeys.splice(index, 1);
      }

      this.$emit('input', this.checkedKeys);
    },
    handleAllChange(e) {
      const { checked } = e.target;
      this.list.forEach(item => {
        if (!item.disabled) {
          if (!checked) {
            const index = this.checkedKeys.indexOf(item.value);

            this.checkedKeys.splice(index, 1);
          } else {
            this.checkedKeys.push(item.value);
          }
        }
      });

      this.$emit('input', this.checkedKeys);
    },
    handleSortInput(input) {
      this.$emit('sort', input.map(item => item.value));
    },
  },
};
</script>
