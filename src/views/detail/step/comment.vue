<template>
  <div class="step-comment box">
    <div class="header">
      <div class="width-200"><img :src="primaryRound" alt=""> 2，工单申请 > 审核</div>
      <div class="width-160">审核人：{{handleInfo.handler}}</div>
      <div class="width-210">审核时间：{{handleInfo.create_time}}</div>
      <i :class="{'gs-icon-down': showInfo, 'gs-icon-up': !showInfo}" @click="showInfo = !showInfo"></i>
    </div>
    <transition name="gs-zoom-in-top">
      <div class="main" v-show="showInfo">
        <div class="label">备注：</div>
        <div>
          <gs-textarea class="width-1000" v-model.trim="form.description"></gs-textarea>
          <p class="error-tip" v-if="form.description.length > 200">请输入不超过200个字符</p>
          <p class="error-tip" v-if="isNullError">请输入备注信息</p>
        </div>
        <div class="operation margin-top-16">
          <gs-button type="primary" @click="submit(1)">同意</gs-button>
          <gs-button type="danger" @click="submit(2)">驳回</gs-button>
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
    handleInfo: {
      type: Object,
      default: _ => {}
    }
  },
  data() {
    return {
      primaryRound,
      showInfo: true,
      form: { description: '' },
      isNullError: false
    };
  },
  methods: {
    submit(action) {
      if (!this.form.description) this.isNullError = true;
      if (!this.form.description || this.form.description.length > 200) return;
      this.isNullError = false;
      // 1：同意  2: 驳回
      const param = {
        action: action,
        description: this.form.description
      };
      this.$emit('action', param);
    }
  },
  watch: {
    'form.description': {
      handler(newVal) {
        this.isNullError = newVal.length === 0;
      },
      deep: true
    }
  }
};
</script>
