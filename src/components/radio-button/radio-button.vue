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
      <template v-for="(item, index) in data">
        <span
          :key="index"
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
    value: {
      required: true
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
      active: this.value,
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
      this.active = [...val];
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
        this.$delete(this.active, index);
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
