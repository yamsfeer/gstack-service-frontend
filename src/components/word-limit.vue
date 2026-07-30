<template>
  <span class="word-limit">
    <span :class="showWarn ? 'warning' : ''">{{calcStrLen(val)}}</span>
    / {{max}}
  </span>
</template>
<script>
export default {
  name: 'WordLimit',
  props: {
    max: {
      type: Number,
      default: 16
    },
    val: {
      required: true
    }
  },
  computed: {
    showWarn() {
      let len = this.calcStrLen(this.val);
      if (len > this.max) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    calcStrLen(str) {
      str = !str ? '' : str.toString().trim();
      let len = 0;
      for (let i = 0; i < str.length; i++) {
        // let unicode = str.charCodeAt(i);
        // if ((unicode >= 0x0001 && unicode <= 0x007e) || (unicode >= 0xff60 && unicode <= 0xff9f)) {
        //     len += 0.5;
        // } else {
        //     len++;
        // }
        len++;
      }
      return Math.ceil(len);
    }
  },
  mounted() {},
  watch: {}
};
</script>
<style lang="scss" scoped>
.word-limit {
  position: absolute;
  top: 0px;
  font-weight: 100;
  color: #ccc;
  right: -100px;
  padding-left: 10px;
  width: 100px;
  &.bottom-word-limit {
    bottom: -22px;
    right: 2px;
    text-align: right;
    top: auto;
  }
}
.warning {
  color: red;
}
</style>
