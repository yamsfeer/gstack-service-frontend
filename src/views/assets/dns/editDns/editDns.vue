<template>
  <gs-modal
    class="edit-dns"
    v-model="modalVisible"
    :title="title"
    :before-close="cancel"
    has-form
    width="600px"
    @confirm="confirm"
  >
    <gs-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="120px"
      style="padding-right: 16px"
    >
      <gs-form-item label="域名：" prop="subDomain">
        <gs-input v-model="form.subDomain" />
      </gs-form-item>
      <gs-form-item label="TTL：" prop="ttl">
        <gs-input v-model="form.ttl">
          <template slot="append">second</template>
        </gs-input>
      </gs-form-item>
      <gs-form-item label="解析地址：" prop="value">
        <gs-input v-model="form.value" />
      </gs-form-item>
    </gs-form>
  </gs-modal>
</template>
<script>
import rules from './formRules';

export default {
  name: 'EditDns',
  props: {
    title: {
      type: String,
      required: true,
    },
    visible: Boolean,
    editData: {
      type: Object,
      default: _ => {}
    }
  },
  watch: {
    editData(val) {
      this.form.subDomain = val.subDomain;
      this.form.ttl = val.ttl;
      this.form.value = val.value;
    },
    visible(val) {
      this.modalVisible = val;
    }
  },
  data() {
    return {
      modalVisible: this.visible,
      form: {
        subDomain: '',
        ttl: '',
        value: ''
      },
      rules,
    };
  },
  methods: {
    cancel() {
      this.$emit('update:visible', false);
      this.$refs.form.resetFields();
    },
    confirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.domain = this.form.subDomain + '.' + this.editData.primaryDomain;
          this.$emit('submit', this.form);
        }
      });
    },
  }
};
</script>
