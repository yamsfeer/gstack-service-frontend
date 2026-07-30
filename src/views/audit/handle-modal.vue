<template>
  <gs-modal
    :value="show"
    title="确认"
    @confirm="handleConfirm"
    has-form
    @cancel="close"
    :before-close="close"
    top="86px"
    width="500px"
    class="handle-modal"
  >
    <p class="tip">
      <i class="gs-icon-exclamation-circle"></i>
      是否确认{{actionName}}工单？
    </p>
    <gs-form
      :model="form"
      :rules="rules"
      label-width="60px"
      ref='form'>
      <gs-form-item label="备注：" prop="description">
        <gs-textarea v-model="form.description"></gs-textarea>
        <word-limit :val="form.description" :max="200"></word-limit>
      </gs-form-item>
    </gs-form>
  </gs-modal>
</template>
<script>
import {
  mapActions
} from 'vuex';
import { debounce } from '@/utils/utils';
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    action: {
      type: Number
    },
    id: {
      type: [Number, String]
    }
  },
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(val) {
        return val;
      }
    },
    actionName() {
      const map = ['', '同意', '驳回', '开通'];
      return map[this.action] || '丢弃';
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$refs.form.resetFields();
      }
    }
  },
  data() {
    return {
      form: { description: '' },
      rules: {
        description: {
          max: 200,
          required: true,
          trigger: 'blur',
          message: '请输入1-200个字符'
        }
      },
      confirmFn: debounce(500, this.confirm)
    };
  },
  methods: {
    ...mapActions('order', [
      'updateStateByAction'
    ]),
    handleConfirm() {
      this.confirmFn();
    },
    confirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const param = {
            action: this.action,
            description: this.form.description
          };
          this.updateStateByAction({id: this.id, param}).then(res => {
            if (res.error_code === 0) {
              this.$Message.success('操作成功！');
              this.$emit('update');
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg
              });
            }
          });
          this.close();
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
.handle-modal {
  .gs-modal-body {
    overflow: hidden;
  }
  .gs-form-item-content {
    position: relative;
    margin-right: 50px;
  }
  .tip {
    padding: 0px 58px 20px;
    color: #888;
    i {
      font-size: 18px;
      color: #ffb83d;
    }
  }
}
</style>
