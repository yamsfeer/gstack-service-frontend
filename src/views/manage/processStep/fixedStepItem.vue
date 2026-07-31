<template>
  <div>
    <div class="step-item default start" v-if="isStart">
      <div class="icon">
        <span class="number"></span>
        <span class="line"></span>
        <i class="gs-icon-caret-down"></i>
      </div>
      <div class="info">
        <div class="name">提交工单</div>
        <div class="addBtn">
          <i class="gs-icon-plus-circle"></i>
          <gs-button @click="$emit('add-step')">添加环节</gs-button>
        </div>
      </div>
    </div>
    <div class="step-item default" v-else-if="isEnd">
      <div class="icon">
        <span class="number"></span>
      </div>
      <div class="info">
        <div class="name">部署环节</div>
      </div>
    </div>
    <div class="step-item" v-else-if="item.isOpen">
      <div class="icon">
        <span class="number">{{ index }}</span>
        <span class="line"></span>
        <i class="gs-icon-caret-down"></i>
      </div>
      <div class="info">
        <div class="name">开通环节</div>
        <div class="hander margin-bottom-16">
          开通组：
          {{ item.handlerName }}
          <span v-if="!item.handlerName">请编辑，建议选择运维人员</span>
          <i class="gs-icon-edit" @click="$emit('edit-step')"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    // Vue 3 v-model 绑定 modelValue；无值时兼容 Vue 2 :value 语法
    modelValue: {
      type: Object,
      default: undefined
    },
    index: {
      type: Number,
      default: 0
    },
    isStart: {
      type: Boolean,
      default: false
    },
    isEnd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      item: this.modelValue !== undefined ? this.modelValue : this.value
    };
  },
  watch: {
    value(val) {
      this.item = val;
    },
    modelValue(val) {
      if (val !== undefined) this.item = val;
    }
  }
};
</script>
<style lang="scss">
.step-item {
  display: flex;
  margin-bottom: 16px;
  .icon {
    margin-right: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .number {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #7ac9ff;
      text-align: center;
      border-radius: 50%;
      color: #fff;
      padding-bottom: 4px;
      line-height: 20px;
    }
    .line {
      height: 100%;
      width: 2px;
      border: 1px solid #c5c5c5;
      margin-top: 1px;
      display: inline-block;
    }
    i {
      color: #c5c5c5;
    }
  }
  .info {
    background: #f7f7f7;
    width: 100%;
    line-height: 24px;
    /* padding: 8px; */
    border-radius: 3px;
    position: relative;
    .name {
      font-weight: 600;
      padding: 8px 8px 0px;
      color: #2794f5;
    }
    .hander {
      padding-left: 8px;
      color: #888;
      display: flex;
      margin-top: 8px;
    }
    .desc {
      padding: 0px 8px 8px;
      color: #888;
    }
    .gs-icon-close {
      position: absolute;
      right: 10px;
      top: 10px;
    }
    .gs-icon-edit {
      position: absolute;
      right: 30px;
      top: 10px;
    }
    i {
      cursor: pointer;
      &:hover {
        color: #7ac9ff;
      }
    }
    .addBtn {
      position: absolute;
      right: 0px;
      top: 0px;
    }
  }
  &.default {
    .number {
      background: #ddd;
    }
    .name {
      color: #333;
      padding: 0px 8px 0px;
    }
    .info {
      background: #fff;
    }
  }
  .width-280 {
    width: 280px;
  }
  .margin-bottom-16 {
    margin-bottom: 16px;
  }
  &.start {
    .line {
      border: 1px dashed #7ac9ff;
    }
    .addBtn {
      position: absolute;
      left: -36px;
      top: 40px;
      .gs-icon-plus-circle {
        font-size: 20px;
        margin-right: 20px;
        color: #7ac9ff;
      }
    }
    .gs-icon-caret-down {
      color: #7ac9ff;
    }
    .info {
      height: 100px;
    }
  }
  &.header-handle {
    cursor: move;
  }
}
.handler-tool {
  position: absolute;
  top: 10px;
  right: 10px;
  .gs-icon-edit {
    margin-right: 8px;
  }
  i {
    cursor: pointer;
    &:hover {
      color: #7ac9ff;
    }
  }
}
</style>
