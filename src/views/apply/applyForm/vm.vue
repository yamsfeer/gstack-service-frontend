<template>
  <div class="apply-form-page-vm">
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
      <gs-form-item label="业务等级：" prop="business_level">
        <gs-radio-group type="button" v-model="form.business_level">
          <gs-radio label="测试">测试</gs-radio>
          <gs-radio label="生产">生产</gs-radio>
        </gs-radio-group>
      </gs-form-item>
      <gs-form-item label="过期时间：" prop="period" v-if="form.business_level === '测试'">
        <gs-radio-group type="button" v-model="form.period">
          <gs-radio :label="1">1个月</gs-radio>
          <gs-radio :label="2">2个月</gs-radio>
          <gs-radio :label="3">3个月</gs-radio>
        </gs-radio-group>
      </gs-form-item>
      <gs-form-item label="产品：" prop="product">
        <gs-select class="width-300" v-model="form.product" searchable :loading="assetLoading">
          <gs-option v-for="item in production" :key="item.name" :value="item.name" :label="item.name">
          </gs-option>
        </gs-select>
      </gs-form-item>
      <gs-form-item label="机房选择：" prop="idc">
        <radio-box :box-data="vmConfig.idc" v-model="form.idc"></radio-box>
      </gs-form-item>
      <gs-form-item label="配置选择：" prop="cpu_memory">
        <radio-box :box-data="form.business_level === '生产'? vmConfig.cpu : vmConfig.cpu.slice(0, 3)" v-model="form.cpu_memory"></radio-box>
        <span class="warning-tip">申请{{ form.business_level }}虚机内存上限{{ maxMemory }}GB，如有特殊需求请发ophelp邮件。</span>
        <p>更多机型配置，可以选择<a href="javascript:;" @click="showMoreConfig = !showMoreConfig">自定义配置 <i class="gs-icon-down" v-if="!showMoreConfig"></i><i class="gs-icon-up" v-if="showMoreConfig"></i></a></p>
        <div class="cpu-memory-box" v-if="showMoreConfig">
          <div>自定义机型配置</div>
          <div>
            <label>CPU核数：</label>
            <gs-input :class="{'not-error': form.cpu_core_quantity <= 64 }"  class="width-150 margin-left-16" v-model="form.cpu_core_quantity" type="number" min="1" max="64">
              <template slot="append">核</template>
            </gs-input>
            <label class="margin-left-24">内存容量：</label>
            <gs-input :class="{'not-error': form.memory_size_in_gb <= maxMemory }" class="width-150 margin-left-16" v-model="form.memory_size_in_gb" type="number" min="1" :max="maxMemory">
              <template slot="append">GB</template>
            </gs-input>
          </div>
        </div>
      </gs-form-item>
      <!-- <gs-form-item label="内存容量：" prop="memory_in_gb">
        <gs-radio-group type="button" v-model="form.memory_in_gb" @change="validateField('memory_in_gb')">
          <gs-radio v-for="(value, index) in vmConfig.memory" :label="value" :key="index">{{ value + 'GB'}}</gs-radio>
        </gs-radio-group>
        <gs-input class="width-150 margin-left-16" v-model="form.memory_in_gb">
          <template slot="append">GB</template>
        </gs-input>
      </gs-form-item> -->
      <gs-form-item label="额外磁盘容量：" prop="disk_size_in_gb">
        <gs-radio-group type="button" v-model="form.disk_size_in_gb" @change="validateField('disk_size_in_gb')">
          <gs-radio v-for="(value, index) in vmConfig.disk" :class="{'is-checked': form.disk_size_in_gb == value}" :label="value" :key="index">{{ value + 'GB'}}</gs-radio>
        </gs-radio-group>
        <gs-input class="width-150 margin-left-16" type="number" v-model="form.disk_size_in_gb">
          <template slot="append">GB</template>
        </gs-input>
        <span class="warning-tip">申请的虚拟机有sqlserver时，将自动挂载一个50GB的磁盘。</span>
      </gs-form-item>
      <gs-form-item label="申请数量：" prop="vm_count">
        <gs-input class="width-150" type="number" v-model="form.vm_count" max="5" min="1">
          <template slot="append">台</template>
        </gs-input>
      </gs-form-item>
      <gs-form-item label="系统模板：" prop="os_name">
        <gs-select class="width-150" v-model="form.template_type">
          <gs-option value="Windows" label="Windows"></gs-option>
          <gs-option value="CentOS" label="CentOS"></gs-option>
        </gs-select>
        <gs-select class="width-350 margin-left-16" v-model="form.os_name">
          <gs-option v-for="item in vmConfig.systemTemplate || []" v-if="item.type.toLowerCase() === form.template_type.toLowerCase()" :key="item.version" :value="item.version" :label="item.version">
            <span :title="item.version">{{ item.version }}</span>
          </gs-option>
        </gs-select>
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
  </div>
</template>

<script>
import './style.scss';
import { mapActions } from '@/stores/vuex-compat';
import RadioBox from '@/components/radio-box.vue';
import { vmConfig } from './constant';
import { rules_vm } from './formRules';
import { ruleTypes } from '@/utils/validator';
export default {
  name: 'vm',
  props: {
    tenantList: {
      type: Array,
      default: _ => []
    }
  },
  components: {
    RadioBox
  },
  data() {
    return {
      vmConfig,
      form: this.initForm(),
      rules: rules_vm,
      showMoreConfig: false,
      production: [],
      assetLoading: false
    };
  },
  watch: {
    'form.cpu_memory': {
      handler(newVal, oldVal) {
        const [cpu, memory] = newVal.split('核');
        this.form.cpu_core_quantity = parseInt(cpu);
        this.form.memory_size_in_gb = parseInt(memory);
      },
      deep: true
    },
    'form.memory_size_in_gb': {
      handler(newVal, oldVal) {
        this.form.cpu_memory = `${this.form.cpu_core_quantity}核${this.form.memory_size_in_gb}GB`;
        this.validateField('cpu_memory');
      },
      deep: true
    },
    'form.business_level': {
      handler(newVal, oldVal) {
        if (newVal === '测试' && this.form.cpu_memory === '4核32GB') {
          this.form.cpu_memory = '1核2G';
        }
        this.validateField('cpu_memory');
      },
      deep: true
    },
    'form.cpu_core_quantity': {
      handler(newVal, oldVal) {
        this.form.cpu_memory = `${this.form.cpu_core_quantity}核${this.form.memory_size_in_gb}GB`;
        this.validateField('cpu_memory');
      },
      deep: true
    }
  },
  computed: {
    maxMemory() {
      return this.form.business_level === '生产' ? 256 : 16;
    }
  },
  methods: {
    ...mapActions('asset', [
      'getSystems',
      'getIdc',
      'getProduction'
    ]),
    validatorCpuMempry(rule, value, cb) {
      let [cpu, memory] = value.split('核');
      cpu = parseInt(cpu);
      memory = parseInt(memory);
      if (!ruleTypes.rightInt(cpu) || !ruleTypes.rightInt(memory)) {
        cb(new Error('请输入整数'));
      }
      if (cpu < 1 || cpu > 64) {
        cb(new Error('请输入[1, 64]的cpu核数'));
      }
      if (memory < 1 || memory > this.maxMemory) {
        cb(new Error(`请输入[1, ${this.maxMemory}]的内存容量`));
      }
      cb();
    },
    // 一些选择控件设置不会触发表单校验，需要手动触发
    validateField(key) {
      this.$nextTick(_ => {
        this.$refs.form.validateField(key);
      });
    },
    validate() {
      return this.$refs.form.validate();
    },
    initForm() {
      return { ...vmConfig.defaultForm };
    },
    getParam() {
      let param = {
        'tenant_id': parseInt(this.form.tenant_id),
        'description': this.form.usage,
        'resource': {
          ...this.form,
          vm_count: parseInt(this.form.vm_count),
          disk_size_in_gb: parseInt(this.form.disk_size_in_gb),
          tenant_id: parseInt(this.form.tenant_id)
        }
      };
      if (this.form.business_level === '测试') {
        param.resource.period = this.form.period;
      } else {
        // 业务级别为生产的虚拟机，没有过期时间
        param.resource.period = 0;
      }
      return param;
    },
    resetForm() {
      this.$refs.form.resetFields();
      this.form = this.initForm();
    },
    getOption() {
      this.getSystems({ all: true }).then(res => {
        this.vmConfig.systemTemplate = res.data.result;
      });
      this.getIdc({ all: true }).then(res => {
        // console.log(res);
      });
      this.assetLoading = true;
      this.getProduction({ all: true }).then(res => {
        if (res.error_code !== 0) return;
        this.production = res.data.result;
        this.assetLoading = false;
      });
    }
  },
  created() {
    this.getOption();
    this.rules['cpu_memory'].validator = this.validatorCpuMempry;
  }
};
</script>
