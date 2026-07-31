<template>
  <div>
    <div class="header">
      <div class="width-200"><img :src="primaryRound" alt=""> 2，工单申请 > 备注</div>
      <div class="width-160">开通人：<gs-tooltip :title="handleInfo.handler" placement="top"><span>{{ formatHandlerName(handleInfo.handler) }}</span></gs-tooltip></div>
      <div class="width-210">开通时间：{{handleInfo.create_time}}</div>
      <i :class="{'gs-icon-down': showInfo, 'gs-icon-up': !showInfo}" @click="showInfo = !showInfo"></i>
    </div>
    <transition name="gs-zoom-in-top">
      <div class="main" v-show="showInfo">
        <div class="label">评论：</div>
        <div>
          <gs-textarea class="width-1000" v-model.trim="form.description" :disabled="disabled"></gs-textarea>
          <p class="error-tip" v-if="form.description.length > 200">请输入不超过200个字符</p>
        </div>
        <div class="operation margin-top-16" v-if="isAudit && !disabled">
          <gs-button type="primary" @click="submit" :disabled="disabled">{{ baseInfo.state === 5? '重试':'开通'}}</gs-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import primaryRound from '@/assets/icon-round-primary.png';
import '../style.scss';
export default {
  name: 'VmConfig',
  props: {
    baseInfo: {
      type: Object,
      default: _ => ({})
    },
    handleInfo: {
      type: Object,
      default: _ => ({})
    },
    isAudit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      primaryRound,
      showInfo: true,
      form: { description: '' },
      disabled: true
    };
  },
  watch: {
    baseInfo() {
      this.init();
    },
    isAudit(newVal) {
      // 控制页面操作按钮的状态
      this.setBtnStatus();
    }
  },
  methods: {
    submit() {
      const param = {
        configurations: {},
        description: this.form.description
      };
      this.$emit('action', param);
    },
    init() {
      if (this.baseInfo.state > 3) {
        this.form.description = this.handleInfo.description || '无';
      }
      this.setBtnStatus();
    },
    setBtnStatus() {
      if (!this.baseInfo.state) return;
      this.disabled = this.baseInfo.state !== 3 && this.baseInfo.state !== 5;
      if (!this.isAudit) {
        this.disabled = true;
      } else if (this.isAudit && this.baseInfo.state === 5) {
        // 当处于重试状态时，要把那个评论清空
        this.form.description = '';
      }
    },
    formatHandlerName(name) {
      return (name && name.split('(')[0]) || '';
    }
  },
  created() {
    this.init();
  }
};
</script>
