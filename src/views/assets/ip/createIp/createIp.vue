<template>
  <gs-modal
    class="create-ip"
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
      v-loading="loading"
      label-width="120px"
      style="padding-right: 16px"
    >
      <gs-form-item label="所在机房：" prop="idc">
        <gs-select v-model="form.idc" placeholder="">
          <template v-for="idc in idcs" :key="idc">
            <gs-option
              :label="idc.label"
              :value="idc.value"
            />
          </template>
        </gs-select>
      </gs-form-item>
      <gs-form-item label="IP类型：" prop="type">
        <gs-select v-model="form.type" placeholder="">
          <template v-for="type in ipTypes" :key="type">
            <gs-option
              :label="type.label"
              :value="type.value"
            />
          </template>
        </gs-select>
      </gs-form-item>
      <gs-form-item
        label="爬虫专用网络："
        prop="usedforSpider"
        v-if="form.type === 'public'"
      >
        <gs-select v-model="form.usedforSpider" placeholder="">
          <gs-option label="是" value="true" />
          <gs-option label="否" value="false" />
        </gs-select>
      </gs-form-item>
      <gs-form-item label="从：" prop="ipAddressStart">
        <gs-input v-model="form.ipAddressStart" placeholder="网段中的第一个IP 如192.168.1.1" />
      </gs-form-item>
      <gs-form-item label="到：" prop="ipAddressEnd">
        <gs-input v-model="form.ipAddressEnd" placeholder="网段中的最后一个IP 如192.168.1.254" />
      </gs-form-item>
      <gs-form-item label="掩码位：" prop="prefix">
        <gs-input v-model="form.prefix" placeholder="范围是16至32的整数" />
      </gs-form-item>
      <gs-form-item label="子网掩码：" prop="netmask">
        <gs-input v-model="netmask" disabled />
      </gs-form-item>
      <gs-form-item label="子网地址：" prop="subNet">
        <gs-input v-model="subnet" placeholder="网段的标识 如192.168.1.0" disabled />
      </gs-form-item>
      <gs-form-item label="网关：" prop="defaultGateway">
        <gs-input v-model="form.defaultGateway" placeholder="如192.168.1.1" />
      </gs-form-item>
    </gs-form>
  </gs-modal>
</template>
<script>
import formRules from './formRules';
import {
  ipAndMask,
  number2Mask,
  isGatewayLegal,
  broadcast,
  network,
  isIpLegal,
} from '@/utils/ipValidate';
import { cloneDeep } from 'lodash';

export default {
  name: 'CreateIp',
  props: {
    title: {
      type: String,
      required: true,
    },
    idcs: {
      type: Array,
      default: () => []
    },
    ipTypes: {
      type: Array,
      default: () => []
    },
    visible: Boolean,
    loading: Boolean,

  },
  data() {
    const rules = cloneDeep(formRules);
    rules.defaultGateway = {
      trigger: 'blur',
      validator: (rule, value, cb) => {
        if (!value) {
          return cb();
        }
        const { ipAddressStart: ip } = this.form;
        const { netmask } = this;
        const isLegal = isGatewayLegal(ip, netmask, value);
        if (!isLegal) {
          cb(new Error('请输入正确的网关'));
        }
        cb();
      },
    };
    rules.ipAddressEnd = {
      required: true,
      trigger: 'blur',
      validator: (rule, value, cb) => {
        const { ipAddressStart: start, prefix: maskBit } = this.form;
        const { netmask } = this;
        const isLegal = ipAndMask(start, netmask) === ipAndMask(value, netmask);
        const isLgip = isIpLegal(value);
        if (!isLgip) {
          cb(new Error('请输入正确的ip地址'));
        }
        if (!isLegal) {
          cb(new Error('请输入和起始ip属于相同网段的ip地址'));
        }
        const isBroadcast = broadcast(start, maskBit) === value;
        if (isBroadcast) {
          cb(new Error('不能使用广播地址'));
        }
        cb();
      },
    };
    rules.ipAddressStart = {
      required: true,
      trigger: 'blur',
      validator: (rule, value, cb) => {
        const { ipAddressStart: start, prefix: maskBit } = this.form;
        const isLgip = isIpLegal(value);
        if (!isLgip) {
          cb(new Error('请输入正确的ip地址'));
        }
        const isNetwork = network(start, maskBit) === value;
        if (isNetwork) {
          cb(new Error('不能使用网络地址'));
        }
        cb();
      },
    };
    return {
      modalVisible: this.visible,
      form: {
        idc: '',
        type: '',
        usedforSpider: 'true',
        ipAddressStart: '',
        ipAddressEnd: '',
        prefix: '',
        netmask: '',
        defaultGateway: '',
        subNet: '',
      },
      rules,
    };
  },
  computed: {
    netmask() {
      const bit = this.form.prefix;
      return number2Mask(bit, false);
    },
    subnet() {
      const { ipAddressStart: ip } = this.form;
      const { netmask } = this;
      return ipAndMask(ip, netmask);
    },
    params() {
      const { form, netmask, subnet } = this;
      const params = {
        ...form,
        netmask,
        subNet: subnet,
        usedforSpider: form.usedforSpider ? 'True' : 'False'
      };
      return params;
    }
  },
  watch: {
    // idcs() {
    //   const [defaultIdc] = this.idcs;
    //   this.form.idc = defaultIdc.value;
    // },
    // ipTypes() {
    //   const [defaultType] = this.ipTypes;
    //   this.form.type = defaultType.value;
    // },
    visible(val) {
      this.modalVisible = val;
      const [defaultIdc] = this.idcs;
      const [defaultType] = this.ipTypes;
      if (defaultIdc) this.form.idc = defaultIdc.value;
      if (defaultType) this.form.type = defaultType.value;
    }
  },
  methods: {
    cancel() {
      this.$emit('update:visible', false);
      this.$refs.form.resetFields();
    },
    confirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', this.params);
        }
      });
    },
  }
};
</script>
