<template>
  <div>
    <div class="header">
      <div class="width-200"><img :src="primaryRound" alt=""> 2，工单申请 > 配置</div>
      <div class="width-160">开通人：<gs-tooltip :title="handleInfo.handler" placement="top"><span>{{ formatHandlerName(handleInfo.handler) }}</span></gs-tooltip></div>
      <div class="width-210">开通时间：{{handleInfo.create_time}}</div>
      <i :class="{'gs-icon-down': showInfo, 'gs-icon-up': !showInfo}" @click="showInfo = !showInfo"></i>
    </div>
    <transition name="gs-zoom-in-top">
      <div class="main" v-show="showInfo">
         <div class="label">选择负载均衡集群：</div>
         <div>
           <gs-table :data="configData" class="bordered-table">
              <gs-table-column label="操作" min-width="50">
                <template slot-scope="scope">
                  <gs-button class="small-btn" @click="openLog(scope.row)">日志</gs-button>
                </template>
              </gs-table-column>
              <gs-table-column show-overflow-tooltip label="负载均衡集群" min-width="100">
                <template slot-scope="{ row }">
                    <div class="choose-box" @click="openChoose()">
                      {{ row.groupName }}
                      <i class="gs-icon-search"></i>
                    </div>
                </template>
              </gs-table-column>
              <gs-table-column show-overflow-tooltip label="主负载均衡分发器" prop="logicalIp" min-width="120"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="网络地址" prop="subNet"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="产品线" prop="product"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="机房" prop="idc"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="描述" prop="usage"></gs-table-column>
            </gs-table>
          </div>
        <div class="label margin-top-16">评论：</div>
        <div>
          <gs-textarea class="width-1000" v-model.trim="form.description" :disabled="disabled"></gs-textarea>
          <p class="error-tip" v-if="form.description.length > 200">请输入不超过200个字符</p>
        </div>
        <div class="operation margin-top-16" v-if="isAudit && !disabled">
          <gs-button type="primary" @click="handleSubmit" :disabled="disabled">{{ baseInfo.state === 5? '重试':'开通'}}</gs-button>
        </div>
      </div>
    </transition>
    <lbgroup
      :visible.sync="lbgroupVisible"
      :filterCondition="filterCondition"
      @confirm="confirmSelect"
    ></lbgroup>
    <log-modal
      :visible.sync="logVisible"
      :log.sync="logInfo"
      @close="logVisible = false"
    ></log-modal>
  </div>
</template>

<script>
import primaryRound from '@/assets/icon-round-primary.png';
import '../style.scss';
import lbgroup from './chose/lbgroup.vue';
import logModal from './log-modal.vue';
import { mapActions } from '@/stores/vuex-compat';
import { debounce } from '@/utils/utils';
export default {
  name: 'LvsAndNatConfig',
  props: {
    baseInfo: {
      type: Object,
      default: _ => {}
    },
    handleInfo: {
      type: Object,
      default: _ => {}
    },
    isAudit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    lbgroup,
    logModal
  },
  data() {
    return {
      primaryRound,
      showInfo: true,
      configData: [{}],
      lbgroupVisible: false,
      form: {description: ''},
      disabled: true,
      logVisible: false,
      filterCondition: null,
      logInfo: '',
      
      submitFun: debounce(500, this.submit)
    };
  },
  watch: {
    baseInfo() {
      this.init();
    },
    isAudit(newVal) {
      // 控制页面操作按钮的状态
      this.setBtnStatus();
    }
  },
  methods: {
    ...mapActions('order', [
      'getLvsLog',
      'getNatLog'
    ]),
    openChoose() {
      if (this.disabled) return;
      this.lbgroupVisible = true;
    },
    confirmSelect({ selectedLbg, selectedServer }) {
      const data = {
        ...selectedLbg,
        ...selectedServer
      };
      this.configData[0] = data;
      this.lbgroupVisible = false;
    },
    handleSubmit() {
      this.submitFun();
    },
    submit() {
      if (!this.configData[0].groupName) {
        this.$Message.warning('请选择集群！');
        return;
      }
      const param = {
        configurations: {
          'asset_lb_group': this.configData[0].esId,
          'director_master_uuid': this.configData[0].assetServerUuid,
          ...this.configData[0]
        },
        description: this.form.description
      };
      this.$emit('action', param);
    },
    init() {
      this.configData = [{}];
      if (this.baseInfo.state > 3) {
        this.form.description = this.handleInfo.description || '无';
        this.configData[0] = this.baseInfo.configurations;
      }
      this.filterCondition = {
        subNet: this.baseInfo.resource.subnet,
        idc: this.baseInfo.resource.idc
      };
      this.setBtnStatus();
    },
    openLog(data) {
      const orderType = this.baseInfo.type === 3 ? 'NAT' : 'LVS';
      this[orderType === 'NAT' ? 'getNatLog' : 'getLvsLog'](this.baseInfo.id).then(res => {
        if (res.error_code === 0) {
          this.logInfo = orderType === 'NAT' ? res.data.log : res.data || '无';
          this.logVisible = true;
        }
      });
    },
    setBtnStatus() {
      if (!this.baseInfo.state) return;
      this.disabled = this.baseInfo.state !== 3 && this.baseInfo.state !== 5;
      if (!this.isAudit) {
        this.disabled = true;
      } else if (this.isAudit && this.baseInfo.state === 5) {
        // 当处于重试状态时，要把那个评论清空
        this.form.description = '';
      }
    },
    formatHandlerName(name) {
      return (name && name.split('(')[0]) || '';
    }
  },
  created() {
    this.init();
  }
};
</script>
