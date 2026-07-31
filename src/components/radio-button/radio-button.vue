<template>
  <div class="radio-button">
    <div
      ref="container"
      class="radio-button-container"
      :class="{
        tohide: showType !== 'always',
      }"
      :style="{'white-space': this.isShow ? 'normal' : 'nowrap'}"
    >
      <span
        class="radio-button-item"
        :class="{ 'active': isSelectAll }"
        @click="clear"
      >全部</span>
      <template v-for="(item, index) in data" :key="index">
        <span
          class="radio-button-item"
          :class="{ 'active': active.includes(item.value || item) }"
          @click="handleClick(item, index)"
        >
          <span>{{item.label}}</span>
        </span>
      </template>
    </div>
    <div class="radio-button-switch" v-if="showType !== 'always'" onselectstart="return false;">
      <template v-if="showType === 'scroll'">
        <gs-icon class="switch" type="primary" name="left" @click="scroll('left')"/>
        <gs-icon class="switch" type="primary" name="right" @click="scroll('right')"/>
      </template>
      <gs-icon
        v-if="showType === 'toggle'"
        class="switch"
        type="primary"
        :name="isShow ? 'up' : 'down'"
        @click="toggle"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',
  props: {
    data: Array,
    // Vue 2 语法 :value；Vue 3 下 v-model 绑定 modelValue，二者兼容
    value: {
      default: () => []
    },
    // modelValue 用于 Vue 3 v-model；无 default 时未传即为 undefined，从而兼容 Vue 2 :value 语法
    modelValue: {
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showType: {
      type: String,
      default: 'always',
      validator(value) {
        return ['always', 'toggle', 'scroll'].includes(value);
      }
    }
  },
  data() {
    return {
      // v-model(modelValue) 优先，兼容旧 :value 用法
      active: this.modelValue !== undefined ? this.modelValue : this.value,
      timer: null,
      isShow: false
    };
  },
  computed: {
    isSelectAll() {
      return this.active.length === 0;
    }
  },
  watch: {
    value(val) {
      if (this.modelValue === undefined) this.active = [...val];
    },
    modelValue(val) {
      if (val !== undefined) this.active = [...val];
    },
  },
  methods: {
    clear() {
      this.active = [];
      this.$emit('input', this.active);
    },
    handleClick(item, index) {
      if (this.multiple && this.active.includes(item.value)) {
        const index = this.active.findIndex(a => a === item.value);
        // Vue 3 中 $delete 已移除，使用 splice
        this.active.splice(index, 1);
      } else {
        this.active = this.multiple
          ? [...this.active, item.value]
          : [item.value];
      }
      this.$emit('input', this.active);
      this.$emit('active-change', this.active, index);
    },
    scroll(direction) {
      if (this.timer) {
        return;
      }
      const step = direction === 'left' ? -1 : 1;
      const max = 50;
      const container = this.$refs.container;
      let count = 0;
      this.timer = setInterval(() => {
        if (count < max) {
          container.scrollLeft = container.scrollLeft + step;
          count++;
        } else {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 2);
    },
    toggle() {
      this.isShow = !this.isShow;
    }
  }
};
</script>
