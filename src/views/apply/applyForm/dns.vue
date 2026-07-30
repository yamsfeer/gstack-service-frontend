<template>
  <div class="apply-form-page-dns">
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
      <gs-form-item label="域名：" prop="domain">
        <gs-input class="width-626" v-model="form.sub_domain" placeholder="域名，如“media”；文本长度不超过63个字符">
          <template slot="append">
            <div class="ip-box">
              <span class="dot">.</span>
              <gs-cascader-select
                placeholder="请选择主域名"
                class="width-300"
                :options.sync='domain'
                v-model='form.primary_domain'>
              </gs-cascader-select>
              <!-- <gs-select class="width-300" v-model="form.sub_domain"></gs-select> -->
            </div>
          </template>
        </gs-input>
      </gs-form-item>
      <!-- <gs-form-item label="产品：" prop="production">
        <gs-select class="width-300" v-model="form.production">
          <gs-option v-for="item in production" :key="item.name" :value="item.name" :label="item.name"></gs-option>
        </gs-select>
      </gs-form-item> -->
      <gs-form-item label="解析类型：">
        <gs-tag type="primary">A记录</gs-tag>
      </gs-form-item>
      <gs-form-item label="解析地址：" prop="values">
        <gs-tag
          v-for="(ip, i) in form.values"
          :key="i"
          closable
          @close="delIP(i)"
        >
          {{ip}}
        </gs-tag>
        <gs-input :class="{'margin-left-16': form.values && form.values.length > 0}" class="width-200 no-append-padding" v-model.trim="ip" placeholder="ip地址，如xx.xx.xx.xx" @keyup.enter="addIP()">
          <template slot="append">
            <gs-button type="text" icon="plus" @click="addIP()"></gs-button>
          </template>
        </gs-input>
      </gs-form-item>
      <gs-form-item label="记录缓存时间：" prop="ttl">
        <gs-input class="width-300" v-model="form.ttl">
          <template slot="append">seconds</template>
        </gs-input>
      </gs-form-item>
      <gs-form-item label="申请理由：" prop="description">
        <gs-textarea class="width-874" v-model="form.description"></gs-textarea>
        <word-limit :val="form.description" :max="200"></word-limit>
      </gs-form-item>
      <gs-form-item label="">
        <div class="tip-box width-874">
          <p>DNS需满足以下条件，才能提交申请：</p>
          <p>
            ① 不允许重复添加，域名和解析地址不存在绑定。
            <span v-if="checkResult.isExist === 'loading'"><i class="gs-icon-loading primary"></i>检查中</span>
            <i class="gs-icon-check-circle success" v-if="checkResult.isExist === 'success'"></i>
            <i class="gs-icon-close-circle danger" v-if="checkResult.isExist === 'fail'"></i>
            <span>{{checkResult.errorText || ''}}</span>
          </p>
          <p>
            ② 校验“域名”，“解析地址”和“记录缓存时间”的参数的合法性。
            <span v-if="checkResult.isParamRight === 'loading'"><i class="gs-icon-loading primary"></i>检查中</span>
            <i class="gs-icon-check-circle success" v-if="checkResult.isParamRight === 'success'"></i>
            <i class="gs-icon-close-circle danger" v-if="checkResult.isParamRight === 'fail'"></i>
            <span>{{checkResult.paramErrorText || ''}}</span>
          </p>
        </div>
      </gs-form-item>
    </gs-form>
  </div>
</template>

<script>
import './style.scss';
import { dnsConfig } from './constant';
import { rules_dns } from './formRules';
import { ruleTypes } from '@/utils/validator';
import { mapActions } from 'vuex';

export default {
  name: 'dns',
  props: {
    tenantList: {
      type: Array,
      default: _ => []
    }
  },
  data() {
    return {
      form: this.initForm(),
      rules: rules_dns,
      ip: '',
      domain: [
        {
          label: '公网',
          value: 'public',
          children: []
        },
        {
          label: '私网',
          value: 'private',
          children: []
        },
        {
          label: '公网&私网',
          value: 'all',
          children: []
        }
      ],
      production: [],
      checkResult: {
        isExist: '',
        errorText: '',
        isParamRight: '',
        paramErrorText: ''
      }
    };
  },
  watch: {
    'form.sub_domain': {
      handler(newVal, oldVal) {
        this.form.domain[0] = this.form.sub_domain;
        this.$refs.form.validateField('domain');
      },
      deep: true
    },
    'form.primary_domain': {
      handler(newVal, oldVal) {
        this.form.domain[1] = this.form.primary_domain;
        this.$refs.form.validateField('domain');
      },
      deep: true
    }
  },
  methods: {
    ...mapActions('asset', [
      'getDomain',
      'getProduction'
    ]),
    ...mapActions('order', [
      'checkDns',
      'checkDnsParam'
    ]),
    addIP() {
      if (!ruleTypes.regexpIP(this.ip)) {
        this.$Message.error('请输入合法的IP');
        return;
      }
      if (this.form.values.indexOf(this.ip) === -1) {
        this.form.values.push(this.ip);
      }
      this.ip = null;
      this.$nextTick(_ => { this.$refs.form.validateField('values'); });
    },
    delIP(i) {
      this.form.values.splice(i, 1);
      this.$nextTick(_ => { this.$refs.form.validateField('values'); });
    },
    initForm() {
      return { ...dnsConfig.defaultForm };
    },
    getParam() {
      let param = {
        'tenant_id': parseInt(this.form.tenant_id),
        'description': this.form.description,
        'resource': {
          ...this.form,
          'record_type': 'A',
          'sub_domain': this.form.sub_domain,
          scope: this.form.primary_domain[0],
          usage: this.form.description
        }
      };
      param.resource['primary_domain'] = this.form.primary_domain[1];
      return param;
    },
    resetForm() {
      this.$refs.form.resetFields();
      this.form = this.initForm();
      this.checkResult = {
        isExist: '',
        errorText: '',
        isParamRight: '',
        paramErrorText: ''
      };
      this.form.values = [];
    },
    getOption() {
      this.getDomain({ scope: 'private' }).then(res => {
        if (res.error_code !== 0) return;
        this.domain[1].children = res.data.map(item => { return { label: item, value: item }; });
      });
      this.getDomain({ scope: 'public' }).then(res => {
        if (res.error_code !== 0) return;
        this.domain[0].children = res.data.map(item => { return { label: item, value: item }; });
      });
      this.getDomain({ scope: 'all' }).then(res => {
        if (res.error_code !== 0) return;
        this.domain[2].children = res.data.map(item => { return {label: item, value: item}; });
      });
      this.getProduction({ all: true }).then(res => {
        if (res.error_code !== 0) return;
        this.production = res.data.result;
      });
    },
    validateForm() {
      return new Promise(resolve => {
        this.$refs.form.validate(valid => valid && resolve(valid));
      });
    },
    async checkParam() {
      const valid = await this.validateForm();
      if (!valid) return;

      // const isDomainCorrect = [
      //   // this.form.values.length,
      //   this.form.sub_domain,
      //   this.form.primary_domain.length
      // ].every(item => !!item);

      // if (!isDomainCorrect) {
      //   this.$Message.error({
      //     content: '请输入域名'
      //   });
      //   return;
      // }
      // if (this.form.sub_domain.length > 30) {
      //   this.$Message.error({
      //     content: '域名长度不超过30个字符！'
      //   });
      //   return;
      // }

      const param = {
        'sub_domain': this.form.sub_domain,
        'scope': this.form.primary_domain[0],
        'primary_domain': this.form.primary_domain[1],
        'values': this.form.values.join(','),
        'ttl': this.form.ttl
      };
      this.checkResult.isExist = 'loading';
      const isExist = await this.checkDns(param).then(res => {
        if (res.error_code === 0) {
          this.checkResult.isExist = res.data.exist ? 'fail' : 'success';
          this.checkResult.errorText = res.error_msg || '';
        } else {
          this.checkResult.isExist = 'fail';
          this.checkResult.errorText = res.error_msg || '';
        }
        return this.checkResult.isExist === 'success';
      });
      this.checkResult.isParamRight = 'loading';
      const isParamRight = await this.checkDnsParam(param).then(res => {
        if (res.error_code === 0) {
          this.checkResult.isParamRight = res.data.pass ? 'success' : 'fail';
          this.checkResult.paramErrorText = res.error_msg || '';
        } else {
          this.checkResult.isParamRight = 'fail';
          this.checkResult.paramErrorText = res.error_msg || '';
        }
        return this.checkResult.isParamRight === 'success';
      });
      return isParamRight && isExist ? 'success' : 'fail';
    }
  },
  created() {
    this.form.values = [];
    this.getOption();
  },
  beforeDestroy() {
    this.form.values = [];
  }
};
</script>
