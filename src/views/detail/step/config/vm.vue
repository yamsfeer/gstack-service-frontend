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
         <div class="label">操作：</div>
         <div>
           <gs-table :data="configData" class="bordered-table">
              <gs-table-column label="操作" min-width="55">
                <template slot-scope="scope">
                    <gs-button class="small-btn" @click="openLog(scope.row.task_id)" :disabled="!scope.row.task_id">日志</gs-button>
                    <gs-button class="small-btn" type="danger" :disabled="scope.row.status === 'running' || scope.row.status === 'success' || disabled" @click="delHost(scope.$index, scope.row.task_id)">删除</gs-button>
                </template>
              </gs-table-column>
              <gs-table-column label="服务器IP" width="120">
                <template slot-scope="scope">
                    <div class="choose-box" @click="openChoose('ip', scope.$index, scope.row.ip_info.ip, scope.row.status)">
                      {{ scope.row.ip_info.ip }}
                      <i class="gs-icon-search"></i>
                    </div>
                </template>
              </gs-table-column>
              <gs-table-column v-if="baseInfo.state > 3" show-overflow-tooltip label="主机名">
                <template slot-scope="scope">
                    <span>{{ scope.row.hostname || '' }}</span>
                </template>
              </gs-table-column>
              <gs-table-column label="宿主机" width="120">
                <template slot-scope="scope">
                    <div class="choose-box" @click="openChoose('server', scope.$index, scope.row.host_machine, scope.row.status)">
                      {{ scope.row.host_machine }}
                      <i class="gs-icon-search"></i>
                    </div>
                </template>
              </gs-table-column>
              <gs-table-column label="状态" width="40" class-name="center" label-class-name="center">
                <template slot-scope="{ row }">
                    <gs-tooltip :title="statusText[formatTaskStates(row.status)]" placement="top">
                      <span :class="['dot', 'status', formatTaskStates(row.status)]"></span>
                    </gs-tooltip>
                </template>
              </gs-table-column>
            </gs-table>
          </div>
        <div class="label margin-top-16">评论：</div>
        <div>
          <gs-textarea class="width-1000" v-model.trim="form.description" :disabled="disabled"></gs-textarea>
          <p class="error-tip" v-if="form.description.length > 200">请输入不超过200个字符</p>
        </div>
        <div class="operation margin-top-16" v-if="isAudit && !disabled">
          <gs-button type="primary" @click="handleSubmit" :disabled="disabled">{{ baseInfo.state === 5? '重试':'开通'}}</gs-button>
          <!-- <gs-button type="primary" :disabled="disabled">不开通，直接录入</gs-button> -->
        </div>
      </div>
    </transition>
    <server
      :value="selected"
      :visible.sync="serverVisible"
      :filterCondition="serverFilterCondition"
      :minCondition="minCondition"
      :selectedList="selectedList"
      :currentChooseIndex="currentChooseIndex"
      @confirm="confirmSelect"
    ></server>
    <ip
      :value="selected"
      :visible.sync="ipVisible"
      :selectedList="selectedList"
      :idc="baseInfo.resource && baseInfo.resource.idc"
      @confirm="confirmSelect"
    ></ip>
    <log-modal
      :visible.sync="logVisible"
      :log="logInfo"
      :isHtml="true"
      @close="logVisible = false"
    ></log-modal>
  </div>
</template>

<script>
import primaryRound from '@/assets/icon-round-primary.png';
import '../style.scss';
import server from './chose/server.vue';
import ip from './chose/ip.vue';
import logModal from './log-modal.vue';
import { mapActions } from '@/stores/vuex-compat';
import { debounce } from '@/utils/utils';
const statusText = {
  'pending': '等待开通',
  'progress': '开通中',
  'success': '开通成功',
  'failure': '开通失败'
};
export default {
  name: 'VmConfig',
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
    server,
    ip,
    logModal
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
  data() {
    return {
      statusText,
      primaryRound,
      showInfo: true,
      configData: [],
      serverVisible: false,
      ipVisible: false,
      currentChooseIndex: '',
      selectedList: {},
      selected: '',
      disabled: true,
      form: { description: '' },
      logVisible: false,
      logInfo: '',

      submitFun: debounce(500, this.submit),
      serverFilterCondition: {},
      minCondition: {}
    };
  },
  methods: {
    ...mapActions('order', [
      'updateOrder',
      'getVmLog',
      'getVmConfig',
      'deleteVmTask'
    ]),
    confirmSelect({ selected, type }) {
      const keyMapping = { ip: 'ip_info', server: 'host_machine' };
      this.configData[this.currentChooseIndex][keyMapping[type]]= JSON.parse(JSON.stringify(selected));
      this.configData[this.currentChooseIndex] = this.configData[this.currentChooseIndex];
      this[`${type}Visible`] = false;
    },
    openChoose(type, index, selected, status) {
      if (this.disabled || status === 'success' || status === 'running') return;
      this.currentChooseIndex = index;
      this.selected = selected;
      if (type === 'ip') {
        // 保存已选择的ip
        let selectedList = {};
        this.configData.forEach(item => {
          let ip = item['ip_info'].ip || '';
          if (ip && ip !== selected) selectedList[ip] = true;
        });
        this.selectedList = selectedList;
      }
      if (type === 'server') {
        if (!this.configData[index].ip_info.subnet) {
          this.$Message.warning('请先选择服务器IP！');
          return;
        }
        let selectedList = JSON.parse(JSON.stringify(this.configData));
        this.selectedList = selectedList;

        delete this.serverFilterCondition.subnet;
        delete this.serverFilterCondition.idc;
        this.serverFilterCondition = {
          subnet: this.configData[index].ip_info.subnet,
          idc: this.configData[index].ip_info.idc,
          ...this.serverFilterCondition
        };
      }
      this[`${type}Visible`] = true;
    },
    checkParam() {
      if (!this.configData.length) return false;
      let nullCount = 0;
      this.configData.forEach(item => {
        if (!item.ip_info.ip || !item.host_machine) nullCount++;
      });
      return !nullCount;
    },
    handleSubmit() {
      this.submitFun();
    },
    submit() {
      if (!this.checkParam()) {
        this.$Message.error('请选择完整的配置！');
        return;
      }
      // 开通用each_config，重试用tasks字段
      const congfigKey = this.baseInfo.state === 5 ? 'tasks' : 'each_config';
      let param = {
        configurations: {},
        description: this.form.description
      };
      param.configurations[congfigKey] = this.configData;
      this.$emit('action', param);
    },
    init() {
      if (this.baseInfo.state > 3) {
        this.form.description = this.handleInfo.description || '无';
      }
      this.setBtnStatus();
      // 初始化筛选条件
      this.serverFilterCondition = {
        free_memory: this.baseInfo.resource.memory_size_in_gb,
        free_disk: this.baseInfo.resource.disk_size_in_gb,
        total_cpu_cores: this.baseInfo.resource.vm_count,
        business_level: this.baseInfo.resource.business_level,
        product: this.baseInfo.resource.product
      };
      // 磁盘和内存的最小额度
      this.minCondition = {
        memory: this.baseInfo.resource.memory_size_in_gb,
        disk: this.baseInfo.resource.disk_size_in_gb
      };
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
    // 删除主机，即更新这个工单的信息，将resource和configurations重新覆盖
    delHost(index, taskId, status) {
      if (this.configData.length === 1) {
        this.$Message.error('不允许删除最后一个!');
        return;
      }
      this.$Modal.confirm({
        title: `是否确定删除？`,
        onOk: () => {
          // let newConfigurations = {};
          let newResource = { ...this.baseInfo.resource };
          newResource.vm_count--;
          // if (this.baseInfo.state > 3) {
          //   let configurations = JSON.parse(JSON.stringify(this.baseInfo.configurations.allocation));
          //   configurations.splice(index, 1);
          //   newConfigurations['allocation'] = configurations;
          // }
          const param = {
            id: this.baseInfo.id,
            param: {
              resource: newResource
              // configurations: newConfigurations
            }
          };
          this.updateOrder(param).then(res => {
            if (res.error_code === 0) {
              this.$Message.success('删除成功！');
              this.$emit('update');
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg
              });
            }
          });
          if (taskId) {
            this.deleteVmTask(taskId);
          }
        }
      });
    },
    openLog(taskId) {
      // 传taskId
      this.getVmLog(taskId).then(res => {
        if (res.error_code === 0) {
          this.logInfo = res.data.logs.map(item => `[${item.time}] ${item.msg}`);
          this.logInfo = this.logInfo.join('<br \>');
          this.logVisible = true;
        }
      });
      this.logVisible = true;
    },
    getConfig() {
      this.getVmConfig(this.baseInfo.id).then(res => {
        if (res.error_code === 0 && res.data.result.length) {
          this.configData = res.data.result;
        } else {
          this.configData = [];
          const count = (this.baseInfo.resource && this.baseInfo.resource.vm_count) || 1;
          for (let i = 0; i < count; i++) {
            let temp = { ip_info: {}, host_machine: '' };
            this.configData.push(temp);
          }
        }
      });
    },
    formatTaskStates(status) {
      const mapping = {preparing: 'pending',running: 'progress',success: 'success', failed: 'failure'};
      return mapping[status] || 'pending';
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
