<template>
  <div class="apply-form-page-vmDelete">
    <gs-form
      :model="form"
      label-width="140px"
      ref='form'
      :rules="rules">
      <gs-form-item label="所属租户：" prop="tenant_id">
        <gs-select class="width-300" v-model="form.tenant_id" searchable no-data-tip="您未分配到租户，请联系管理员">
          <gs-option v-for="item in tenantList" :key="item.tenant_id" :value="item.tenant_id + ''" :label="item.tenant_name"></gs-option>
        </gs-select>
      </gs-form-item>
      <gs-form-item label="需要删除的虚拟机：" prop="virtual_machines">
        <div class="margin-bottom-16">
          <gs-popover
          v-if="!form.tenant_id"
          trigger="hover"
          placement="top"
          ref="popover"
          >
            <span>请先选择所属租户</span>
            <template #reference>
            <gs-button
            v-popover:popover
            type="primary"
            @click="selectVisible = true"
            :disabled="!form.tenant_id"
            >添加</gs-button>
            </template>
          </gs-popover>
        </div>
        <selected-server
          class="width-874"
          v-model="form['virtual_machines']"
          :total="form['virtual_machines'].length"
        ></selected-server>
      </gs-form-item>
      <gs-form-item label="申请理由：" prop="usage">
        <gs-textarea class="width-874" v-model="form.usage"></gs-textarea>
        <word-limit :val="form.usage" :max="200"></word-limit>
      </gs-form-item>
      <gs-form-item label="写给运维：" prop="remark">
        <gs-input class="width-874" v-model="form.remark"></gs-input>
        <word-limit :val="form.remark" :max="200"></word-limit>
      </gs-form-item>
    </gs-form>
    <select-server
      :visible.sync="selectVisible"
      :selectedServer="form['virtual_machines']"
      :pageFilterCondition="pageFilterCondition"
      rowkey="logicalIp"
      :tenant="selectedTenant"
      @confirm="confirmSelect"
    ></select-server>
  </div>
</template>

<script>
import './style.scss';
import { vmDeleteConfig } from './constant';
import { rules_vmDelete } from './formRules';
import selectServer from './server/selectServer.vue';
import selectedServer from './server/selectedServer.vue';
import { assignArr } from '@/utils/utils';
import { mapGetters } from '@/stores/vuex-compat';

export default {
  name: 'vmDelete',
  props: {
    tenantList: {
      type: Array,
      default: _ => []
    }
  },
  components: {
    selectServer,
    selectedServer
  },
  data() {
    return {
      form: this.initForm(),
      rules: rules_vmDelete,
      selectVisible: false,
      pageFilterCondition: {
        assetAssetStatus: '正常运行',
        assetServerType: '虚拟机',
        assetOwnerEmail: ''
      }
    };
  },
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO'
    }),
    selectedTenant() {
      return this.tenantList.find((tenant) => tenant.tenant_id * 1 === this.form.tenant_id * 1);
    }
  },
  watch: {
    userInfo: {
      handler(v) {
        this.pageFilterCondition.assetOwnerEmail = v && v.mail;
      },
      immediate: true
    }
  },
  methods: {
    initForm() {
      return { ...vmDeleteConfig.defaultForm };
    },
    getParam() {
      let delList = [];
      this.form.virtual_machines.forEach(item => {
        delList.push({
          // 'host_machine_salt_id': item.assetServerUuid,
          'host_name': item.logicalHostName,
          'host_server': item.logicalHostMachine,
          'ip_list': [item.logicalIp],
          'salt_id': item.assetServerUuid,
          'server_ip': item.logicalIp,
          'server_uuid': item.assetServerUuid,
          'vm_name': item.logicalHostName,
          'level': item.assetLevel,
          'type': item.assetServerType,
          'usage': item.assetUsage
        });
      });
      let param = {
        'tenant_id': parseInt(this.form.tenant_id),
        'description': this.form.usage,
        'resource': {
          ...this.form,
          'virtual_machines': delList
        }
      };
      return param;
    },
    resetForm() {
      this.$refs.form.resetFields();
      this.form = this.initForm();
    },
    confirmSelect(selected) {
      // this.form['virtual_machines'] = selected;
      this.form['virtual_machines'] = assignArr(this.form['virtual_machines'], selected, (src, target) => src.logicalIp === target.logicalIp);
      this.selectVisible = false;
      this.validateField('virtual_machines');
    },
    // 一些选择控件设置不会触发表单校验，需要手动触发
    validateField(key) {
      this.$nextTick(_ => {
        this.$refs.form.validateField(key);
      });
    }
  }
};
</script>
