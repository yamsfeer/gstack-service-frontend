<template>
<div>
  <div class="detail-step-item start" :class="{'dash-line': isEnd}" v-if="isStart">
    <div class="icon">
      <span class="number">1</span>
      <span class="line"></span>
      <i class="gs-icon-caret-down"></i>
    </div>
    <div class="info">
      <div class="hander">申请人：<gs-tooltip :title="item.handler" placement="top"><span>{{ formatHandlerName(item.handler) }}</span></gs-tooltip></div>
      <div class="date">{{ item.update_time || ''}}</div>
      <div class="action">提交</div>
    </div>
  </div>
  <div class="detail-step-item end" :class="{'blue-bg': isFinish, 'default': !isFinish}" v-else-if="isEnd">
    <div class="icon">
      <i class="gs-icon-poweroff"></i>
    </div>
    <div class="info" v-if="isFinish">
      <div class="hander">部署：系统服务</div>
      <div class="date">{{ item.update_time || ''}}</div>
      <div class="action success" v-if="item.action === 11">已完成</div>
      <div class="action danger" v-else>已废弃</div>
    </div>
  </div>
  <div class="detail-step-item action" :class="{'dash-line': !isFinish && item.isEnd}" v-else>
    <div class="icon">
      <span class="number">{{index + 2}}</span>
      <span class="line"></span>
      <i class="gs-icon-caret-down"></i>
    </div>
    <div class="info">
      <div class="hander">{{item.action === 3 ? '开通':'审核'}}人：<gs-tooltip :title="item.handler" placement="top"><span>{{ formatHandlerName(item.handler) }}</span></gs-tooltip></div>
      <div class="desc" v-if="!item.actionText">留言：{{ item.description || '无'}}</div>
      <div class="date">{{ item.update_time }}</div>
      <div class="action">{{ OrderAction[item.action] || item.actionText}}</div>
    </div>
  </div>
</div>
</template>
<script>
import { OrderAction } from '@/views/apply/constant.js'
export default {
  props: {
    value: {
      type: Object,
      default: () => ({})
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
    },
    isFinish: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      OrderAction,
      item: this.value
    };
  },
  methods: {
    formatHandlerName(name) {
      return (name && name.split('(')[0]) || '';
    }
  },
  watch: {
    value(val) {
      this.item = val;
    }
  }
};
</script>
<style lang="scss">
.detail-step-item {
  display: flex;
  margin-bottom: 16px;
  min-height: 50px;
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
    font-size: 12px;
    .name {
      font-weight: 600;
      padding: 8px 8px 0px;
      color: #2794f5;
    }
    .hander {
      padding-left: 8px;
      color: #555;
      display: flex;
      margin-top: 8px;
      font-weight: 600;
    }
    .desc {
      padding: 0px 8px 0px;
      color: #888;
      word-break: break-all;
    }
    .date {
      padding: 0px 8px 8px;
      color: #888;
    }
    .action {
      position: absolute;
      right: 8px;
      top: 8px;
      color: #7ac9ff;
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
  .margin-bottom-16 {
    margin-bottom: 16px;
  }
  &.default {
    .name {
      color: #333;
      padding: 0px 8px 0px;
    }
    .info {
      background: #fff;
      height: 50px;
    }
  }
  &.start {
    .line {
      height: 20px;
    }
  }
  &.end {
    .icon {
      i {
        color: #c5c5c5;
      }
    }
    .gs-icon-poweroff {
      font-size: 20px;
      margin-left: 1px;
    }
  }
  &.blue-bg {
    .icon {
      i {
        color: #7ac9ff;
      }
    }
  }
  &.dash-line {
    .line {
      border: 1px dashed #c5c5c5;
    }
  }
  .success {
    color: #66cc00 !important;
  }
  .danger {
    color: #ff3300 !important;
  }
}
</style>