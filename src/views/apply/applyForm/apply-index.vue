<template>
  <div class="apply-form-page">
    <div class="page-header">创建工单</div>
    <div class="main">
      <component
        :is="currentComponent"
        ref="component"
        :tenantList="tenantList"
        @check-status-change="handleCheckChange"
      ></component>
      <div class="footer">
        <gs-button type="primary" @click="handleSubmit" :disabled="disableSubmit">提交</gs-button>
        <gs-button type="default" @click="$router.push('/main/order/apply')">取消</gs-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import './style.scss';
import vm from './vm.vue';
import lvs from './lvs.vue';
import nat from './nat.vue';
import dns from './dns.vue';
import vmDelete from './vmDelete.vue';
import { serviceOptions } from '../constant';
import { debounce } from '@/utils/utils';

export default {
  components: {
    vm,
    lvs,
    nat,
    dns,
    vmDelete
  },
  data() {
    return {
      serviceOptions,
      disableSubmit: false,
      // 防止重复提交
      submitFn: debounce(500, this.submit)
    };
  },
  computed: {
    ...mapGetters({
      tenantList: 'GET_TENANT'
    }),
    currentComponent() {
      return this.$route.params.type;
    }
  },
  methods: {
    ...mapActions('order', [
      'createOrder'
    ]),
    ...mapActions('user', [
      'getUserTenant'
    ]),
    handleSubmit() {
      this.submitFn();
    },
    handleCheckChange(status) {
      this.disableSubmit = status !== 'success';
    },
    async submit() {
      if (this.currentComponent === 'dns' || this.currentComponent === 'lvs') {
        this.$refs.component.$refs.form.validate();
        const check = await this.$refs.component.checkParam();
        console.log('提交工单前检查', check);
        if (check !== 'success') {
          this.$Message.error({ content: '参数校验失败' });
          return;
        };
      }
      this.$refs.component.$refs.form.validate(valid => {
        if (!valid) return;
        const param = this.$refs.component.getParam();
        const order = this.serviceOptions.find(item => item.name === this.$route.params.type);
        this.disableSubmit = true;
        this.createOrder({ type: order.id, ...param }).then(res => {
          if (res.error_code === 0) {
            this.$Modal.confirm({
              title: `创建工单成功！`,
              modalProps: {
                'confirm-text': '确定',
                'cancel-text': '继续创建'
              },
              onOk: () => {
                this.$router.push('/main/order/mine');
              },
              onCancel: () => {
                this.$refs.component.resetForm();
              }
            });
          } else {
            const msg = typeof res.error_msg === 'string' ? res.error_msg : JSON.stringify(res.error_msg);
            this.$Notify.error({
              title: '失败',
              desc: msg
            });
          }
          this.disableSubmit = false;
        });
      });
    }
    // getOption() {
    //   this.getUserTenant().then(res => {
    //     this.tenantList = res.data.tenant_list;
    //   });
    // }
  },
  created() {
    // this.getOption();
  }
};
</script>
