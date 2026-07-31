<template>
  <div class="detail-page-rightBox">
    <div class="page-header">工单动态</div>
    <div class="page-main">
      <step-item v-model="startStepData" :is-start="true" :is-end="actionLogs.length === 0"/>
      <step-item
        v-for="(action, index) in actionLogs"
        v-model="actionLogs[index]"
        :index="index"
        :key="index"
        :isFinish="isFinish"
      >
      </step-item>
      <step-item v-model="endStepData" :is-end="true" :isFinish="isFinish"/>
      <div>
        <gs-button type="danger" @click="openHandleModal" :disabled="disabled">丢弃</gs-button>
      </div>
    </div>
    <handle-modal
      :visible="handleModalVisible"
      :id="handleForm.id"
      :action="handleForm.action"
      @close="closeHandleModal"
      @update="updateListData"
    ></handle-modal>
  </div>
</template>

<script>
import './style.scss';
import StepItem from './stepItem.vue';
import HandleModal from '@/views/audit/handle-modal.vue';
export default {
  name: 'Detail',
  components: {
    StepItem,
    HandleModal
  },
  props: {
    baseInfo: {
      type: Object,
      default: _ => ({})
    },
    type: {
      type: [Number, String],
      default: 1
    },
    id: {
      type: [Number, String]
    },
    isAudit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      handleModalVisible: false,
      handleForm: {},
      isMine: false,
      isFinish: false,
      endStepData: {},
      startStepData: {},
      disabled: false
    };
  },
  computed: {
    actionLogs() {
      if (!this.baseInfo.action_logs) return [];
      const notDisplayAction = [4, 5, 7, 8, 10, 11, 13, 14];
      let actionLogs = this.baseInfo.action_logs.filter(item => notDisplayAction.findIndex(action => action === item.action) === -1);
      if (actionLogs.length > 0) {
        actionLogs[actionLogs.length - 1].isEnd = true;
      }
      return actionLogs;
    }
  },
  watch: {
    isAudit(newVal) {
      // 控制页面操作按钮的状态
      this.setBtnStatus();
    },
    baseInfo() {
      this.isFinish = this.baseInfo && this.baseInfo.state >= 10;
      // 11,资产录入成功确认 12,废弃
      this.endStepData = (this.baseInfo.action_logs || []).find(item => item.action === 11 || item.action === 12) || {};
      this.startStepData = { handler: this.baseInfo.creator, update_time: this.baseInfo.create_time };
      this.setBtnStatus();
    }
  },
  methods: {
    openHandleModal() {
      this.handleForm = {
        id: this.id,
        action: 12 // 废弃
      };
      this.handleModalVisible = true;
    },
    closeHandleModal() {
      this.handleModalVisible = false;
    },
    updateListData() {
      this.$emit('update');
      this.handleModalVisible = false;
    },
    setBtnStatus() {
      this.disabled = false;
      if (this.isAudit) {
        this.disabled = this.baseInfo.state >= 10 || this.baseInfo.state === 8;
      } else {
        if (this.isMine) {
          this.disabled = this.baseInfo.state > 1;
        } else {
          this.disabled = true;
        }
      }
    }
  },
  created() {
    this.isMine = this.$route.path.indexOf('detail') > -1;
    this.setBtnStatus();
  }
};
</script>
