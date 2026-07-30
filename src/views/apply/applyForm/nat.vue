<template>
  <div class="apply-form-page-nat">
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
      <gs-form-item label="业务等级：" prop="level">
        <gs-radio-group type="button" v-model="form.level">
          <gs-radio label="测试">测试</gs-radio>
          <gs-radio label="生产">生产</gs-radio>
        </gs-radio-group>
      </gs-form-item>
      <gs-form-item label="产品：" prop="product">
        <gs-select class="width-300" v-model="form.product" searchable :loading="assetLoading">
          <gs-option v-for="item in production" :key="item.name" :value="item.name" :label="item.name"></gs-option>
        </gs-select>
      </gs-form-item>
      <gs-form-item label="使用独立外网IP地址：" prop="specified_public_vip">
        <gs-radio-group type="button" v-model="form.specified_public_vip">
          <gs-radio :label="true">是</gs-radio>
          <gs-radio :label="false">否</gs-radio>
        </gs-radio-group>
        <gs-popover trigger="hover" placement="top" width="400px">
          <i class="gs-icon-question-circle-o" slot='reference'></i>
          <span>{{natConfig.tip.ip}}</span>
        </gs-popover>
        <span class="tip">特殊要求使用独立外网IP请选"是"，我们将为您每一台后端主机都配置独立的外网IP地址。如果您选择"否"，我们会默认给您安排一个外网IP地址。</span>
      </gs-form-item>
      <gs-form-item label="是否为爬虫业务：" prop="is_spider">
        <gs-radio-group type="button" v-model="form.is_spider">
          <gs-radio :label="true">是</gs-radio>
          <gs-radio :label="false">否</gs-radio>
        </gs-radio-group>
        <span class="tip">机房B不能申请爬虫业务。</span>
      </gs-form-item>
      <gs-form-item label="预估带宽峰值：" prop="peak_prediction_in_mbps">
        <gs-radio-group type="button" v-model="form.peak_prediction_in_mbps">
          <gs-radio v-for="(value, index) in natConfig.peak" :class="{'is-checked': form.peak_prediction_in_mbps == value}" :label="value" :key="index">{{ value }}</gs-radio>
        </gs-radio-group>
        <gs-input class="width-150 margin-left-16" type="number" v-model="form.peak_prediction_in_mbps">
          <template slot="append">mbps</template>
        </gs-input>
        <span class="tip">为这次申请预估一个使用带宽的峰值，我们会以此为根据为您分配贴合的资源。</span>
      </gs-form-item>
      <gs-form-item label="后端列表：" prop="rs_uuids">
        <div class="margin-bottom-16">
          <gs-button type="primary" @click="selectVisible = true">添加</gs-button>
        </div>
        <selected-server
          class="width-874"
          v-model="form['rs_uuids']"
          :total="form['rs_uuids'].length"
        ></selected-server>
      </gs-form-item>
      <gs-form-item label="申请理由：" prop="usage">
        <gs-textarea class="width-874" v-model="form.usage"></gs-textarea>
        <word-limit :val="form.usage" :max="200"></word-limit>
      </gs-form-item>
    </gs-form>
    <select-server
      :visible.sync="selectVisible"
      :multiple="false"
      :selectedServer="form['rs_uuids']"
      :pageFilterCondition="pageFilterCondition"
      :tip="tip"
      @confirm="confirmSelect"
    ></select-server>
  </div>
</template>

<script>
import './style.scss';
import { natConfig } from './constant';
import { rules_nat } from './formRules';
import selectServer from './server/selectServer';
import selectedServer from './server/selectedServer';
import { mapActions } from 'vuex';
export default {
  name: 'nat',
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
      natConfig,
      form: this.initForm(),
      rules: rules_nat,
      selectVisible: false,
      production: [],
      pageFilterCondition: {
        assetAssetStatus: '正常运行'
      },
      tip: '申请主动访问公网资源时，所有主机必须在同一机房，同一子网。',
      assetLoading: false
    };
  },
  methods: {
    ...mapActions('asset', [
      'getProduction'
    ]),
    initForm () {
      return {...natConfig.defaultForm};
    },
    getParam () {
      let filterCondition = {
        subnet: this.form.rs_uuids[0].logicalIpSubnet,
        idc: this.form.rs_uuids[0].assetIdc
      };
      let param = {
        'tenant_id': parseInt(this.form.tenant_id),
        'description': this.form.usage,
        'resource': {
          ...this.form,
          ...filterCondition,
          'rs_uuids': this.form.rs_uuids.map(item => item.assetServerUuid)
        }
      };
      // delete param.resource.is_specified_public_vip;
      return param;
    },
    resetForm() {
      this.$refs.form.resetFields();
      this.form = this.initForm();
    },
    confirmSelect (selected) {
      this.form['rs_uuids'] = this.form['rs_uuids'].concat(selected);
      this.selectVisible = false;
      this.validateField('rs_uuids');
    },
    getOption() {
      this.assetLoading = true;
      this.getProduction({all: true}).then(res => {
        if (res.error_code !== 0) return;
        this.production = res.data.result;
        this.assetLoading = false;
      });
    },
    // 一些选择控件设置不会触发表单校验，需要手动触发
    validateField(key) {
      this.$nextTick(_ => {
        this.$refs.form.validateField(key);
      });
    }
  },
  created() {
    this.getOption();
  }
};
</script>
