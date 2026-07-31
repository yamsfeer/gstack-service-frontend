<template>
  <div class="apply-form-page-lvs">
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
      <gs-form-item label="占用端口：" prop="port_list">
        <gs-tag
          v-for="(port, i) in form.port_list"
          :key="i"
          closable
          @close="delPort(i)"
        >
          {{port}}
        </gs-tag>
        <gs-input :class="{'margin-left-16': form.port_list && form.port_list.length > 0}" class="width-150 no-append-padding" type="number" v-model="port" placeholder="添加端口" @keyup.enter="addPort()" min="1" max="65535">
          <template slot="append">
            <gs-button type="text" icon="plus" @click="addPort()"></gs-button>
          </template>
        </gs-input>
        <span class="tip">请根据实际需要输入，我们仅为您提供了默认的80端口，如果需要HTTPS请添加443号端口。</span>
        <span class="warning-tip">不常用端口有可能被防火墙拦截，如无法检测通过，请注意防火墙配置！</span>
      </gs-form-item>
      <gs-form-item label="预估带宽峰值：" prop="peak_prediction_in_mbps">
        <gs-radio-group type="button" v-model="form.peak_prediction_in_mbps">
          <gs-radio v-for="(value, index) in lvsConfig.peak" :class="{'is-checked': form.peak_prediction_in_mbps == value}" :label="value" :key="index">{{ value }}</gs-radio>
        </gs-radio-group>
        <gs-input class="width-150 margin-left-16" type="number" v-model="form.peak_prediction_in_mbps">
          <template slot="append">mbps</template>
        </gs-input>
        <span class="tip">为这次申请预估一个使用带宽的峰值，我们会以此为根据为您分配贴合的资源。</span>
      </gs-form-item>
      <gs-form-item label="会话保持时间：" prop="persistent">
        <gs-input class="width-300" v-model="form.persistent">
          <template slot="append">seconds</template>
        </gs-input>
        <span class="tip">推荐默认900秒，但是如果您需要连接时间较长时（如：1个小时才能返回值的API等）则需要修改该值。</span>
      </gs-form-item>
      <gs-form-item label="调度算法：" prop="lb_algo">
        <gs-select class="width-300" v-model="form.lb_algo">
          <gs-option v-for="(item, index) in lvsConfig.lbAlgo" :key="index" :value="item.value" :label="item.label"></gs-option>
        </gs-select>
        <gs-popover trigger="hover" placement="top" width="400px">
          <i class="gs-icon-question-circle-o" slot='reference'></i>
          <span>{{lvsConfig.tip.lbAlgo}}</span>
        </gs-popover>
        <span class="tip">如果您的业务有类似带有登录的逻辑，请使用选择“源地址散列”。</span>
      </gs-form-item>
      <gs-form-item label="后端健康检查方式：" prop="check_method">
        <gs-select class="width-300" v-model="form.check_method">
          <gs-option v-for="(item, index) in lvsConfig.checkMethod" :key="index" :value="item" :label="item"></gs-option>
        </gs-select>
        <gs-popover trigger="hover" placement="top" width="400px">
          <i class="gs-icon-question-circle-o" slot='reference'></i>
          <span>{{lvsConfig.tip.checkMethod}}</span>
        </gs-popover>
        <span class="tip">如果您的业务是WEB服务，请选择HTTP。</span>
        <a v-if="form.check_method === 'HTTP'" :href="downLoadUrl" download="heartbeat.gif" target="_blank">请下载检查文件</a>
        <!-- <a v-if="form.check_method === 'HTTP'" href="javascript:;" @click="downloadFile(downLoadUrl, 'heartbeat.gif')">请下载检查文件</a> -->
        <span v-if="form.check_method === 'HTTP'" class="warning-tip">将下载文件放入各后端主机的Web服务中。放置路径必须为：/lvsheartbeat/heartbeat.gif，并请确保该文件不被删除。</span>
      </gs-form-item>
      <gs-form-item label="后端列表：" prop="rs_uuid_list">
        <div class="margin-bottom-16">
          <gs-button type="primary" @click="selectVisible = true" :disabled="form['rs_uuid_list'] && form['rs_uuid_list'].length > 9">添加</gs-button>
          <p class="tip">被公网访问工单最多允许添加10台后端主机。</p>
        </div>
        <selected-server
          class="width-874"
          v-model="form['rs_uuid_list']"
          :total="form['rs_uuid_list'].length"
        ></selected-server>
        <div class="tip-box width-874">
          <p>LVS的多台后端主机需满足以下条件，才能提交申请：</p>
          <p>
            ① 各后端主机对应的占用端口必须开通，若失败请重试；
            <span v-if="checkResult.isOpenPort === 'loading'"><i class="gs-icon-loading primary"></i>检查中</span>
            <i class="gs-icon-check-circle success" v-if="checkResult.isOpenPort === 'success'"></i>
            <i class="gs-icon-close-circle danger" v-if="checkResult.isOpenPort === 'fail'"></i>
            <ul class="check-port-list" v-if="checkResult.isOpenPort !== 'loading'">
              <li v-for="(value, key) in checkPortList" :key="key">
                <span class="server-ip">{{key}}</span>
                <gs-tooltip
                  v-for="item in value"
                  :key="item.port"
                  :title="item.result ? `${item.port}端口成功` : `${item.port}端口失败，请重试`"
                  placement="top">
                  <span class="server-port">
                      <span>{{item.port}}</span>
                      <i class="gs-icon-check-circle success" v-if="item.result"></i>
                      <i class="gs-icon-close-circle danger" v-if="!item.result"></i>
                  </span>
                </gs-tooltip>
              </li>
            </ul>
          </p>
          <p>② 多台后端虚拟机不能在同一物理机，且对应的物理机要在不同的机柜，若失败请重新选择后端主机。
            <span v-if="checkResult.isSame === 'loading'"><i class="gs-icon-loading primary"></i>检查中</span>
            <i class="gs-icon-check-circle success" v-if="checkResult.isSame === 'success'"></i>
            <i class="gs-icon-close-circle danger" v-if="checkResult.isSame === 'fail'"></i>
          </p>
          <gs-button type="primary" v-if="checkResult.isOpenPort === 'fail'" @click="checkPort(); checkSameServer()">重新检测</gs-button>
        </div>
      </gs-form-item>
      <gs-form-item label="申请理由：" prop="usage">
        <gs-textarea class="width-874" v-model="form.usage"></gs-textarea>
        <word-limit :val="form.usage" :max="200"></word-limit>
      </gs-form-item>
    </gs-form>
    <select-server
      :multiple="false"
      :visible.sync="selectVisible"
      :selectedServer="form['rs_uuid_list']"
      :pageFilterCondition="pageFilterCondition"
      :tip="tip"
      :maxSize="10"
      @confirm="confirmSelect"
    ></select-server>
  </div>
</template>

<script>
import './style.scss';
import { lvsConfig } from './constant';
import { rules_lvs } from './formRules';
import { ruleTypes } from '@/utils/validator';
import { downloadFileWithAuth } from '@/utils/downloadFileWithAuth';
import selectServer from './server/selectServer.vue';
import selectedServer from './server/selectedServer.vue';
import { mapActions } from '@/stores/vuex-compat';
import config from '@/config';

const URL = config.API_GOD;
// const ASSET = '/lvs/local/api/v1';
const ASSET = config.API_GOD_LVS;
export default {
  name: 'lvs',
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
      lvsConfig,
      form: this.initForm(),
      rules: rules_lvs,
      hostList: [],
      port: null,
      downLoadUrl: `${URL}${ASSET}/download/heartbeat.gif`,
      // LVS的后端检查：1，检查端口，需要调用后端的接口，时间会比较长；2，不在统一机柜和物理机。
      // 3种值【loading success fail】
      checkResult: {
        isOpenPort: '',
        isSame: ''
      },
      checkPortData: [],
      selectVisible: false,
      production: [],
      pageFilterCondition: {
        assetAssetStatus: '正常运行'
      },
      tip: '申请被公网访问资源时，所有主机必须在同一机房，同一子网。',
      assetLoading: false
    };
  },
  computed: {
    // 检查主机端口是否开通的结果显示, 按IP分类
    checkPortList() {
      const data = {};
      const selectedServer = this.form.rs_uuid_list;
      let checkPortData = [];
      this.checkPortData.forEach(item => {
        let { logicalHostName } = selectedServer.find(({ logicalIp }) => logicalIp === item.address) || '';
        item.address = logicalHostName;
        if (logicalHostName) checkPortData.push(item);
      });
      checkPortData.forEach(item => {
        const key = item.address;
        if (data[key]) {
          data[key].push(item);
        } else {
          data[key] = [item];
        }
      });
      return data;
    }
  },
  watch: {
    'form.rs_uuid_list': {
      handler(newVal, oldVal) {
        if (newVal.length > oldVal.length) {
          this.checkPort();
          this.checkSameServer();
          return;
        }
        if (this.checkResult.isOpenPort !== 'success') {
          this.checkPort();
        }
        if (this.checkResult.isSame !== 'success') {
          this.checkSameServer();
        }
      },
      deep: true
    },
    'form.port_list': {
      handler(newVal, oldVal) {
        this.checkPort();
      },
      deep: true
    },
    'form.check_method': {
      handler(newVal, oldVal) {
        this.checkPort();
      },
      deep: true
    }
  },
  methods: {
    ...mapActions('order', [
      'checkLvs',
      'checkCabinet'
    ]),
    ...mapActions('asset', [
      'getProduction'
    ]),
    initForm() {
      return { ...lvsConfig.defaultForm };
    },
    addPort() {
      if (!ruleTypes.rightInt(this.port) || this.port === '') {
        this.$Message.warning('请输入合法的端口');
        return;
      }
      const port = parseInt(this.port);
      if (port < 1 || port > 65535) {
        this.$Message.warning('请输入[1, 65535]的端口号');
        return;
      }
      if (this.form.port_list.indexOf(port) === -1) {
        this.form.port_list.push(port);
      }
      this.port = null;
      this.validateField('port_list');
    },
    delPort(i) {
      this.form.port_list.splice(i, 1);
      this.validateField('port_list');
    },
    getParam() {
      let filterCondition = {
        subnet: this.form.rs_uuid_list[0].logicalIpSubnet,
        idc: this.form.rs_uuid_list[0].assetIdc
      };
      let param = {
        'tenant_id': parseInt(this.form.tenant_id),
        'description': this.form.usage,
        'resource': {
          ...this.form,
          ...filterCondition,
          'rs_uuid_list': this.form.rs_uuid_list.map(item => item.assetServerUuid)
        }
      };
      return param;
    },
    resetForm() {
      this.$refs.form.resetFields();
      this.form = this.initForm();
      this.checkResult = {
        isOpenPort: '',
        isSame: ''
      };
    },
    downloadFile(url, name) {
      downloadFileWithAuth(url, name);
    },
    checkPort() {
      if (!this.form.port_list.length || !this.form.rs_uuid_list.length) return;
      this.checkResult.isOpenPort = 'loading';
      this.$emit('check-status-change', this.checkResult.isOpenPort);
      let ips = [];
      this.form.rs_uuid_list.forEach(item => { ips.push(item.logicalIp); });
      const param = {
        type: this.form.check_method,
        port_list: this.form.port_list,
        master_ip_list: ips
      };
      this.checkLvs(param).then(res => {
        if (res.error_code === 0) {
          this.checkResult.isOpenPort = res.data.every(item => item.result) ? 'success' : 'fail';
          this.$emit('check-status-change', this.checkResult.isOpenPort);
          this.checkPortData = res.data;
        } else {
          this.checkResult.isOpenPort = 'fail';
          const msg = typeof res.error_msg === 'string' ? res.error_msg : JSON.stringify(res.error_msg);
          this.$Message.error(msg);
        }
      });
    },
    checkSameServer() {
      // 检查是否在同一物理机
      // 检查是否在同一机柜
      this.checkResult.isSame = 'loading';
      let uuid = [];
      this.form.rs_uuid_list.forEach(item => { uuid.push(item.assetServerUuid); });
      this.checkCabinet({ 'server_uuids': uuid }).then(res => {
        this.checkResult.isSame = res.data ? 'success' : 'fail';
      });
    },
    confirmSelect(selected) {
      this.form['rs_uuid_list'] = this.form['rs_uuid_list'].concat(selected);
      this.selectVisible = false;
      this.validateField('rs_uuid_list');
    },
    checkParam() {
      return this.checkResult.isSame === 'success' && this.checkResult.isOpenPort === 'success' ? 'success' : 'fail';
    },
    getOption() {
      this.assetLoading = true;
      this.getProduction({ all: true }).then(res => {
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
    this.form.port_list = [80];
    this.getOption();
  },
  beforeDestroy() {
    this.form.port_list = [80];
  }
};
</script>
