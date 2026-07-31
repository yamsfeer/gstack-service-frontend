<template>
  <div class="step-detail box">
    <div class="header">
      <div class="width-200"><img :src="primaryRound" alt=""> 1，工单申请 > 详情</div>
      <div class="width-160">申请人：<gs-tooltip :title="baseInfo.creator" placement="top"><span>{{ formatHandlerName(baseInfo.creator) }}</span></gs-tooltip></div>
      <div class="width-210">申请时间：{{ baseInfo.create_time }}</div>
      <div>
        工单状态：
        <!-- <gs-tag type="warning" v-if="baseInfo.state === 1 || baseInfo.state === 2" class="status1 success_cancel">{{ formatState(baseInfo.state) }}</gs-tag>
        <gs-tag type="primary" v-if="baseInfo.state > 2 && baseInfo.state < 10" class="status1 running">{{ formatState(baseInfo.state) }}</gs-tag>
        <gs-tag type="danger" v-if="baseInfo.state === 11" class="status1 failure">{{ formatState(baseInfo.state) }}</gs-tag>
        <gs-tag type="success" v-if="baseInfo.state === 10" class="status1 finish">{{ formatState(baseInfo.state) }}</gs-tag> -->
        <gs-tag :type="formatState(baseInfo.state).color">{{ formatState(baseInfo.state).text }}</gs-tag>
      </div>
      <i :class="{'gs-icon-down': showInfo, 'gs-icon-up': !showInfo}" @click="showInfo = !showInfo"></i>
    </div>
    <transition name="gs-zoom-in-top">
      <div class="base-info" v-show="showInfo">
        <div class="base-info-item" v-for="(item, index) in config" :key="index">
          <label>{{ item.label }}</label>
          <span v-if="item.type === 'array_string'">{{(baseInfo.resource && baseInfo.resource[item.key] && baseInfo.resource[item.key].join('，'))}}{{item.unit || ''}}</span>
          <!-- 从后端获取的数据 -->
          <span v-else-if="item.type === 'array_table'" class="table-box">
            <gs-table :data="serverList">
              <gs-table-column show-overflow-tooltip label="主机名" prop="logicalHostName"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="IP" prop="logicalIp"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="类型" prop="assetServerType"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="级别" prop="assetLevel" width="55"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="宿主机" prop="logicalHostMachine"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="描述" prop="assetUsage"></gs-table-column>
            </gs-table>
          </span>
          <!-- 从详情数据获取的数据 -->
          <span v-else-if="item.type === 'vm_table'" class="table-box">
            <gs-table :data="baseInfo.resource && baseInfo.resource[item.key] || []">
              <gs-table-column show-overflow-tooltip label="主机名" prop="vm_name"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="IP" prop="ip_list"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="类型" prop="type"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="级别" prop="level" width="55"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="宿主机" prop="host_server"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="描述" prop="usage"></gs-table-column>
            </gs-table>
          </span>
          <span v-else-if="item.type === 'lvs_table'" :class="{'table-box': lvsList.length > 0}">
            <gs-table v-if="lvsList.length > 0" :data="lvsList">
              <gs-table-column show-overflow-tooltip label="实例名" prop="instanceName"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="产品线" prop="product"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="公网虚ip" prop="publicVip"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="主负载均衡分发器" prop="directorMasterUuid"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="描述" prop="usage"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="虚拟机" prop="hostName"></gs-table-column>
            </gs-table>
            <span v-else>无</span>
          </span>
          <span v-else-if="item.type === 'nat_table'" :class="{'table-box': natList.length > 0}">
            <gs-table v-if="natList.length > 0" :data="natList">
              <gs-table-column show-overflow-tooltip label="实例名" prop="instanceName"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="产品线" prop="product"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="独立公网IP" prop="specifiedPublicVip" width="50px"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="描述" prop="usage"></gs-table-column>
              <gs-table-column show-overflow-tooltip label="虚拟机" prop="hostName"></gs-table-column>
            </gs-table>
            <span v-else>无</span>
          </span>
          <span v-else-if="item.type === 'number_turn_date'">{{computeExpriedDate(baseInfo.create_time, baseInfo.resource && baseInfo.resource[item.key])}}</span>
          <span v-else-if="item.type === 'boolean'">{{(baseInfo.resource && baseInfo.resource[item.key] ? '是':'否')}}</span>
          <span v-else-if="item.alias">{{(baseInfo.resource && item.alias[baseInfo.resource[item.key]])}}{{item.unit || ''}}</span>
          <span v-else>{{(baseInfo.resource && baseInfo.resource[item.key] + '') || '无'}}{{item.unit || ''}}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import primaryRound from '@/assets/icon-round-primary.png';
import { serviceType } from './constant';
import { stateTextMap } from '@/views/apply/constant';
import { mapActions } from '@/stores/vuex-compat';
import moment from 'moment';
import './style.scss';

export default {
  name: 'Detail',
  props: {
    baseInfo: {
      type: Object,
      default: _ => {}
    },
    type: {
      type: [Number, String],
      default: 1
    }
  },
  watch: {
    type() {
      this.setConfig();
    },
    baseInfo() {
      if (this.serverKey) {
        this.getServers(this.baseInfo.resource[this.serverKey]);
      }
      // 虚拟机删除工单要获取删除的虚拟机关联的lvs和nat信息
      if (parseInt(this.type) === 2) {
        this.getRelatedLvsNat(this.baseInfo.resource.virtual_machines);
      }
    }
  },
  methods: {
    ...mapActions('asset', [
      'getServerByIds'
    ]),
    ...mapActions('order', [
      'getRelatedLvs',
      'getRelatedNat'
    ]),
    formatState(state) {
      return this.stateTextMap.find(item => item.state.indexOf(state) > -1) || {};
    },
    setConfig() {
      const type = parseInt(this.type);
      const data = this.serviceType.find(item => item.id === type);
      this.config = data.config;
      this.serverKey = data.serverKey;
    },
    getServers(ids) {
      const param = {
        'server_uuids': ids
      };
      this.getServerByIds(param).then(res => {
        this.serverList = res.data || [];
      });
    },
    computeExpriedDate(expired_date, expired_date_number) {
      if (!expired_date || !expired_date_number) return '无';
      // const date = new Date(expired_date);
      // const tDate = parseInt(expired_date_number);
      // const over_flow = ((date.getMonth() + tDate) > 11);
      // const new_date = (date.getFullYear() + (over_flow ? 1 : "")) +
      //                 '-' + (date.getMonth() + tDate + 1 - (over_flow ? 12 : 0)) +
      //                 '-' + date.getDate();
      // return new_date;
      return moment(expired_date).add(30 * expired_date_number, 'days').format('YYYY-MM-DD');
    },
    getRelatedLvsNat(vm) {
      let serverUuids = [];
      vm.forEach(item => { serverUuids.push(item.server_uuid); });
      // serverUuids = ['920920da-4cc0-11e7-97e8-00155d32680b', 'af4e5a3e-acf5-11e8-a27c-00155d32680b'];
      this.getRelatedLvs({ server_uuids: serverUuids }).then(res => {
        if (res.error_code !== 0) return;
        let lvsList = [];
        for (let id in res.data) {
          // 添加id对应的服务器名称
          let server = res.data[id].map(item => {
            let { host_name: hostName } = vm.find(vm => vm.server_uuid === id);
            item.hostName = hostName;
            return item;
          });
          lvsList = lvsList.concat(server);
        }
        // this.lvsList = this.unique(lvsList, 'esId');
        this.lvsList = lvsList;
      });
      this.getRelatedNat({ server_uuids: serverUuids }).then(res => {
        if (res.error_code !== 0) return;
        let natList = [];
        res.data.forEach(item => {
          for (let id in item) {
            if (item[id]) {
              let { host_name: hostName } = vm.find(vm => vm.server_uuid === id);
              item[id].hostName = hostName;
              natList.push(item[id]);
            }
          }
        });
        // this.natList = this.unique(natList, 'esId');
        this.natList = natList;
      });
    },
    unique(arr, key) {
      let newArr = [];
      let obj = {};
      arr.forEach(item => {
        if (!obj[item[key]]) {
          newArr.push(item);
          obj[item[key]] = true;
        }
      });
      return newArr;
    },
    formatHandlerName(name) {
      return (name && name.split('(')[0]) || '';
    }
  },
  data() {
    return {
      stateTextMap,
      serviceType,
      primaryRound,
      showInfo: true,
      config: [],
      serverKey: '',
      serverList: [],
      lvsList: [],
      natList: []
    };
  },
  created() {
    this.setConfig();
  }
};
</script>
