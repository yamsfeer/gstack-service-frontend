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
         <div class="label">要删除的虚拟机：</div>
         <div>
           <gs-table :data="configData" class="bordered-table">
              <gs-table-column label="操作" min-width="55">
                <template #default="scope">
                  <gs-button class="small-btn" @click="openLog(scope.row)">日志</gs-button>
                  <gs-button class="small-btn" type="danger" @click="delHost(scope.$index, scope.row.id)" :disabled="formatTaskStates(scope.row.status) === 'success' || formatTaskStates(scope.row.status) === 'progress' || disabled">删除</gs-button>
                </template>
              </gs-table-column>
              <gs-table-column show-overflow-tooltip label="删除的虚拟机" prop="vm_name"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="宿主机" prop="hm_name"></gs-table-column>
              <gs-table-column label="dns" min-width="120">
                <template #default="scope">
                    <div class="choose-box line-height-22" @click="openChoose('dns', scope.$index, scope.row)">
                      <gs-tag v-for="dns in scope.row.dns || []" :key="dns.id">{{ dns.sub_domain }}</gs-tag>
                      <i class="gs-icon-search"></i>
                    </div>
                </template>
              </gs-table-column>
              <gs-table-column
                label="状态"
                width="40"
                class-name="center"
                label-class-name="center">
                <template #default="{ row }">
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
          <gs-button type="primary" @click="handleSubmit()" :disabled="disabled">{{ baseInfo.state === 5? '重试':'删除'}}</gs-button>
          <gs-button type="danger" @click="immediateSubmit()" :disabled="disabled">立即删除</gs-button>
        </div>
      </div>
    </transition>
     <dns
      :ip="dnsIp"
      :visible.sync="dnsVisible"
      @confirm="confirmSelect"
    ></dns>
    <log-modal
      :visible.sync="logVisible"
      :log="logInfo"
      @close="logVisible = false"
    ></log-modal>
  </div>
</template>

<script>
import { mapActions } from '@/stores/vuex-compat';
import primaryRound from '@/assets/icon-round-primary.png';
import '../style.scss';
import dns from './chose/dns.vue';
import logModal from './log-modal.vue';
import { taskClassMap } from '../constant';
import { debounce } from '@/utils/utils';
const statusText = {
  'pending': '等待中',
  'progress': '删除中',
  'success': '完成',
  'failure': '删除失败'
};
export default {
  name: 'VmDeleteConfig',
  props: {
    baseInfo: {
      type: Object,
      default: _ => ({})
    },
    handleInfo: {
      type: Object,
      default: _ => ({})
    },
    isAudit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    dns,
    logModal
  },
  data() {
    return {
      statusText,
      primaryRound,
      showInfo: true,
      configData: [],
      dnsIp: '',
      selected: {},
      dnsVisible: false,
      form: { description: '' },
      disabled: true,
      logVisible: false,
      logInfo: '',

      submitFun: debounce(500, this.submit),
      isImmediate: false
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
      'updateOrder',
      'delVmDeleteTask',
      'getVmDeleteLog',
      'getConfigData'
    ]),
    openChoose(type, index, selected) {
      if (this.disabled) return;
      this.currentChooseIndex = index;
      this.selected = selected.dns || {};
      // this.dnsIp = selected.ip_list;
      this.dnsIp = selected.server_ip;
      this[`${type}Visible`] = true;
    },
    confirmSelect({ selected, type }) {
      this.configData[this.currentChooseIndex][type] = JSON.parse(JSON.stringify(selected));
      this.configData[this.currentChooseIndex] = this.configData[this.currentChooseIndex];
      this[`${type}Visible`] = false;
    },
    handleSubmit(isImmediate) {
      this.isImmediate = !!isImmediate;
      this.submitFun();
    },
    immediateSubmit() {
      this.$Modal.confirm({
        title: `立即删除中间环节不再等待，将会立即删除。是否确定立即删除虚拟机？`,
        onOk: () => {
          this.handleSubmit(true);
        }
      });
    },
    submit() {
      let dns = [];
      this.configData.forEach(item => {
        item.dns.forEach(itemDns => {
          dns.push({
            ...itemDns,
            server_uuid: item.server_uuid
          });
        });
        // dns[item.server_uuid] = item.dns;
      });
      const param = {
        configurations: {
          is_immediate: this.isImmediate,
          dns
        },
        description: this.form.description
      };
      this.$emit('action', param);
    },
    // 删除主机，即更新这个工单的信息，将resource和configurations重新覆盖
    delHost(index, id) {
      if (this.configData.length === 1) {
        this.$Message.error('不允许删除最后一个!');
        return;
      }
      this.$Modal.confirm({
        title: `是否确定删除？`,
        onOk: () => {
          let newConfigurations = {};
          let newResource = JSON.parse(JSON.stringify(this.baseInfo.resource));
          let delItem = newResource.virtual_machines.splice(index, 1);
          if (this.baseInfo.state > 3) {
            let configurations = JSON.parse(JSON.stringify(this.baseInfo.configurations.dns));
            newConfigurations['dns'] = configurations.filter(dns => dns.server_uuid !== delItem.server_uuid);
          }
          const param = {
            id: id,
            param: {
              resource: newResource,
              configurations: newConfigurations
            }
          };
          this.delVmDeleteTask(param).then(res => {
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
        }
      });
    },
    init() {
      if (this.baseInfo.state > 3) {
        this.form.description = this.handleInfo.description || '无';
      }
      this.setBtnStatus();
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
    openLog(data) {
      this.getVmDeleteLog({
        ticket_id: this.baseInfo.id,
        server_uuid: data.server_uuid
      }).then(res => {
        if (res.error_code === 0) {
          this.logInfo = res.data.description || '无';
          this.logVisible = true;
        }
      });
      this.logVisible = true;
    },
    getConfig() {
      this.getConfigData({
        'ticket_id': this.baseInfo.id
      }).then(res => {
        if (res.error_code === 0) {
          this.configData = res.data.vm_collection_tasks;
          // 从detail中获取dns
          const allDns = (this.baseInfo.configurations && this.baseInfo.configurations.dns) || [];
          this.configData.forEach(item => {
            item.dns = allDns.filter(dns => dns.server_uuid === item.server_uuid) || [];
          });
        }
      });
    },
    formatTaskStates(status) {
      return taskClassMap[status];
    },
    formatHandlerName(name) {
      return (name && name.split('(')[0]) || '';
    }
  },
  created() {
    this.init();
    this.getConfig();
  }
};
</script>
