<template>
  <div class="process-form-page" v-loading="pageLoading">
    <div class="page-header">工单流程</div>
    <div class="main">
      <gs-form
        :model="processForm"
        :rules="rules_process"
        label-width="120px"
        ref='processForm'>
        <gs-form-item label="流程名称：" prop="name">
          <gs-input v-model="processForm.name"></gs-input>
          <word-limit :val="processForm.name" :max="50"></word-limit>
        </gs-form-item>
        <gs-form-item label="描述：" prop="description">
          <gs-textarea v-model="processForm.description"></gs-textarea>
          <word-limit :val="processForm.description" :max="200"></word-limit>
        </gs-form-item>
        <gs-form-item label="流程设置：" prop="steps">
          <div class="step-box">
            <!-- 开始 -->
            <fixed-step-item :is-start="true" @add-step="openStepModal()"/>
            <!-- 中间的审核环节，可拖拽 -->
            <step-list v-model="processForm.steps" ref="stepList">
              <step-item
                v-for="(step, stepIndex) in processForm.steps"
                v-model="processForm.steps[stepIndex]"
                :index="stepIndex"
                @del-step="delStep(stepIndex)"
                @edit-step="openStepModal(step, stepIndex)"
                :key="step.name"
              >
              </step-item>
            </step-list>
            <!-- 开通环节 -->
            <fixed-step-item v-model="openStep" :index="processForm.steps.length + 1" @edit-step="openStepModal(openStep)"/>
            <!-- 结束 -->
            <fixed-step-item :is-end="true"/>
          </div>
        </gs-form-item>
      </gs-form>
      <div class="footer">
        <gs-button type="primary" @click="submit">{{isEdit ? '保存':'提交'}}</gs-button>
        <gs-button type="default" @click="$router.push('/main/manage')">取消</gs-button>
      </div>
    </div>
    <step-modal
      :visible="stepModalVisible"
      :stepNames="stepNames"
      :isEdit="stepForm.isEdit"
      :edit-data="stepForm.data"
      @close="closeStepModal"
      @add-step="addStep"
      @edit-step="editStep"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import './style.scss';
import FixedStepItem from '../processStep/fixedStepItem.vue';
import StepItem from '../processStep/stepItem.vue';
import StepList from '../processStep/stepList.vue';
import StepModal from './step-modal.vue';
import rulesMix from './formRules';
import editProcessMixin from './editProcessMixin';
const initOpenStep = {
  name: '开通环节',
  handler: null,
  handlerName: '',
  description: '',
  isOpen: true
};

export default {
  mixins: [rulesMix, editProcessMixin],
  components: {
    FixedStepItem,
    StepItem,
    StepList,
    StepModal
  },
  data() {
    return {
      processForm: {
        name: '',
        description: '',
        steps: []
      },
      stepForm: {},
      stepModalVisible: false,
      openStep: JSON.parse(JSON.stringify(initOpenStep))
    };
  },
  computed: {
    stepNames() {
      let steps = this.processForm.steps.map(item => item.name);
      return ['提交工单', '部署环节', '开通环节', ...steps];
    }
  },
  methods: {
    ...mapActions('manage', [
      'createProcess',
      'isExistName'
    ]),
    getParam() {
      let { name, description, steps } = JSON.parse(JSON.stringify(this.processForm));
      let stepsData = [];
      steps.push(this.openStep);
      steps.forEach((item, index) => {
        stepsData.push({
          name: item.name,
          group_id: parseInt(item.handler),
          sequence: index + 1,
          description: item.description,
          is_hidden: false
        });
      });
      return {
        name,
        description,
        steps: stepsData
      };
    },
    submit() {
      this.$refs.processForm.validate((valid) => {
        if (valid) {
          this.isEdit ? this.handlerUpdateProcess() : this.handlerCreateProcess();
        }
      });
    },
    handlerCreateProcess() {
      const param = this.getParam();
      this.createProcess(param).then(res => {
        if (res.error_code === 0) {
          this.$Modal.confirm({
            title: `创建工单流程成功！`,
            modalProps: {
              'confirm-text': '确定',
              'cancel-text': '继续创建'
            },
            onOk: () => {
              this.$router.push('/main/manage');
            },
            onCancel: () => {
              this.resetForm();
            }
          });
        } else {
          this.$Notify.error({
            title: '失败',
            desc: res.error_msg
          });
        }
      });
    },
    closeStepModal() {
      this.stepModalVisible = false;
    },
    openStepModal(data, index) {
      this.stepForm = {
        isEdit: !!data,
        data: { ...data, index }
      };
      this.stepModalVisible = true;
    },
    addStep(data) {
      // this.processForm.steps.splice(this.processForm.steps.length - 1, 0, data);
      this.processForm.steps.push(data);
    },
    delStep(index) {
      this.$Modal.confirm({
        title: `是否确定删除环节？`,
        onOk: () => {
          this.processForm.steps.splice(index, 1);
        }
      });
    },
    editStep(data) {
      if (data.isOpen) {
        this.openStep = { ...data };
        this.$refs.processForm.validateField('steps');
      } else {
        this.$set(this.processForm.steps, data.index, data);
      }
    },
    resetForm() {
      this.$refs.processForm.resetFields();
      this.openStep = JSON.parse(JSON.stringify(initOpenStep));
    }
  }
};
</script>
