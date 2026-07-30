<template>
  <div class="radio-box">
    <gs-radio-group type="button" v-model="val" @change="handleChange">
      <gs-radio v-for="(item,index) in boxData" :label="item.value" :key="index">
        <div class="title">{{item.title}}</div>
        <div class="desc">{{item.desc}}</div>
      </gs-radio>
    </gs-radio-group>
  </div>
</template>
<script>
/**
 * 单选框组件
 * 由于选项默认可见，不宜过多，若选项过多，建议使用 Select 选择器
 * 示例：
 *  <radio-box :boxData="data"></radio-box>
 * data示例：
 *  data:[
 *      {
 *          value: 1,
 *          title: '通用计算型',
 *          desc: '适用于一般计算'
 *      }
 *  ]
 */
export default {
  name: 'RadioBox',
  props: {
    boxData: {
      type: Array,
      required: true
    },
    value: [String, Number]
  },
  watch: {
    value() {
      this.val = this.value;
    }
  },
  data() {
    return {
      val: this.value
    };
  },
  methods: {
    handleChange(val) {
      this.$emit('input', val);
    }
  }
};
</script>

<style lang="scss">
.radio-box {
  .gs-radio-button {
    height: auto;
    width: 200px;
    padding: 0px;
    border-radius: 3px !important;
  }
  .gs-radio-button.is-checked {
    color: #0073e8;
    background-color: #fff;
    border-color: #0073e8;
    .title {
      background: #0073e8;
      color: #fff;
    }
  }
  .title {
    padding: 4px;
    font-weight: 600;
  }
  .desc {
    border-top: 1px solid #d9d9d9;
    padding: 4px;
  }
}
</style>
