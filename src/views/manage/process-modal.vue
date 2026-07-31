<template>
  <gs-modal
    :value="show"
    title="创建工单流程"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="700px"
  >
    <gs-form
      :model="processForm"
      label-width="100px"
      ref='processForm'>
      <gs-form-item label="流程名称" prop="name">
        <gs-input v-model="processForm.name"></gs-input>
      </gs-form-item>
      <gs-form-item label="描述" prop="desc">
        <gs-input v-model="processForm.desc"></gs-input>
      </gs-form-item>
      <gs-form-item label="流程设置" prop="">
        <div class="step-box">
          <step-item :is-start="true"/>
          <step-list v-model="processForm.steps" ref="stepList">
            <step-item
              v-for="(step, stepIndex) in processForm.steps"
              v-model="processForm.steps[stepIndex]"
              :index="stepIndex + 1"
              @del-step="delStep(stepIndex)"
              add-step-node="addStepNode(stepIndex, step.step_type)"
              :key="stepIndex"
            >
            </step-item>
          </step-list>
          <step-item :is-end="true"/>
        </div>
      </gs-form-item>
    </gs-form>
  </gs-modal>
</template>
<script>
import {
  mapState,
  mapActions
} from '@/stores/vuex-compat';
import StepItem from './processStep/stepItem.vue';
import StepList from './processStep/stepList.vue';
export default {
  components: {
    StepItem,
    StepList
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object
    }
  },
  computed: {
    ...mapState('user', {
      userList: 'userList'
    }),
    show: {
      get() {
        return this.visible;
      },
      set(val) {
        return val;
      }
    }
  },
  data() {
    return {
      processForm: {
        name: '', 
        desc: '', 
        steps: [
          {
            name: '环节一',
            hander: 'zhangsan',
            desc: ''
          },
          {
            name: '环节二',
            hander: 'lisi',
            desc: ''
          },
          {
            name: '环节三',
            hander: 'lisi',
            desc: ''
          }
        ]
      }
    };
  },
  methods: {
    ...mapActions('manage', [
      'createProcess',
      'updateProcess'
    ]),
    confirm() {
      this.$refs.processForm.validate((valid) => {
        if (valid) {
          // todo
        }
      });
    },
    close() {
      this.show = false;
      this.$emit('close', false);
    }
  }
};
</script>

<style lang="scss">
.step-box {
  padding: 16px;
  border: 1px solid #eee;
}
</style>
