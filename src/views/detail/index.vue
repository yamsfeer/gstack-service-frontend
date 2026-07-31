<template>
  <div class="detail-page" v-loading="loading || updateLoading">
    <div class="page-left">
      <div class="page-header">工单详情</div>
      <div class="page-main">
        <div class="step">
          <gs-steps :active="step" align-center>
            <template slot="header">
              <gs-step title="待处理"></gs-step>
              <gs-step title="审核中"></gs-step>
              <gs-step title="待开通"></gs-step>
              <gs-step v-if="orderDetail.state === statesMap.DEPRECATED || orderDetail.state === statesMap.ABANDONED" title="废弃中"></gs-step>
              <gs-step v-else title="开通中"></gs-step>
              <gs-step v-if="orderDetail.state === statesMap.DEPRECATED || orderDetail.state === statesMap.ABANDONED" title="已废弃"></gs-step>
              <gs-step v-else title="已完成"></gs-step>
            </template>
          </gs-steps>
        </div>
        <div class="components">
          <!-- 基本信息部分 -->
          <detail :baseInfo="orderDetail" :type="type"></detail>
          <!-- 审核部分 -->
          <comment v-if="!isOpen && isAudit" :handleInfo="handleInfo" @action="handleAction"></comment>
          <!-- 开通配置部分 -->
          <div class="step-config box" v-if="configComponent !== null && isOpen">
            <component ref="component" :is='configComponent' :isAudit="isAudit" :baseInfo="orderDetail" :handleInfo="handleInfo" @action="handleAction" @update="getData()"></component>
            <!-- 录入失败 -->
            <div class="entry-tip" v-if="orderDetail.state === 7 && isAudit">
              <span class="entry-tip-text">
                <i class="gs-icon-info-circle"></i>
                <span>资产录入失败，需重试！</span>
              </span>
              <gs-button type="default" @click="handleAction">录入重试</gs-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-right">
      <right-box :baseInfo="orderDetail" :isAudit="isAudit" :type="type" :id="id" @update="getData()"></right-box>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapActions,
  mapGetters
} from '@/stores/vuex-compat';
import {
  checkLoading,
  checkSuccess
} from '@/stores/vuex-compat';
import { serviceType } from './step/constant';
import Detail from './step/detail.vue';
import { VmConfig, LvsAndNatConfig, VmDeleteConfig, dnsConfig } from './step/config/index.js';
import Comment from './step/comment.vue';
import RightBox from './rightBox/index.vue';
import './style.scss';
import {
  OrderState,
  statesMap,
  seperators
} from '@/views/apply/constant';

export default {
  components: {
    Detail,
    VmConfig,
    LvsAndNatConfig,
    VmDeleteConfig,
    dnsConfig,
    Comment,
    RightBox
  },
  data() {
    return {
      statesMap,
      OrderState,
      serviceType,
      step: 1,
      configComponent: 'VmConfig',
      isCommentComponent: false,
      type: '',
      id: '',
      // 审核人是否为当前用户
      isAudit: false,
      // 是否完成审核过程，执行到“开通”的步骤
      isOpen: false,
      handleInfo: {},
      updateLoading: false
    };
  },
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO'
    }),
    ...mapState('order', {
      orderDetailStatus: 'orderDetailStatus',
      orderDetail: 'orderDetail'
    }),
    loading() {
      return checkLoading(this.orderDetailStatus);
    },
    success() {
      return checkSuccess(this.orderDetailStatus);
    }
  },
  watch: {
    orderDetail(newVal) {
      const state = newVal.state || statesMap.PENDING;
      // 是否打开开通配置的页面
      this.isOpen = state > statesMap.REVIEWING;
      this.step = seperators.findIndex(seperator => state <= seperator);
      this.findHandleInfo();
    }
  },
  methods: {
    ...mapActions('order', [
      'getOrderDetail',
      'updateStateByAction'
    ]),
    setConfigPage() {
      const type = parseInt(this.$route.params.type);
      const data = this.serviceType.find(item => item.id === type);
      const pageConfig = data.page;
      this.configComponent = pageConfig[1];
    },
    getData() {
      this.getOrderDetail(this.id).then(res => {
        this.isAudit = this.userInfo.groups.findIndex(item => item.group_name === this.orderDetail.group) > -1;
        const isMine = this.$route.path.indexOf('detail') > -1;
        if (isMine) {
          // 在详情页没有审核权限
          this.isAudit = false;
        }
        if (this.$refs.component && this.$refs.component.getConfig) {
          this.$refs.component.getConfig();
        }
      });
    },
    handleAction(param) {
      if (param.description && param.description.length > 200) return;
      this.updateLoading = true;
      const stateActionMap = {
        3: 3, // 开通
        5: 6, // 重试
        7: 9  // 重新录入
      };
      if (stateActionMap[this.orderDetail.state]) {
        param.action = stateActionMap[this.orderDetail.state];
      }
      this.updateStateByAction({ id: this.id, param }).then(res => {
        if (res.error_code === 0) {
          this.$Message.success('操作成功！');
          this.getData();
        } else {
          this.$Notify.error({
            title: '失败',
            desc: res.error_msg
          });
        }
        this.updateLoading = false;
      });
    },
    findHandleInfo() {
      const handle = (this.orderDetail.action_logs || []).filter(item => item.action === 3 || item.action === 6);
      if (handle.length) {
        this.handleInfo = handle[handle.length - 1] || {};
      }
    }
  },
  created() {
    this.id = this.$route.params.id;
    this.type = this.$route.params.type;
    // this.isAudit = this.$route.path.indexOf('audit') > -1;
    this.setConfigPage();
    this.getData();
  }
};
</script>
