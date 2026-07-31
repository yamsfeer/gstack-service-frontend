<template>
  <div class="detail-layout-page floatfix" v-loading="loading">
    <!-- 详情展示 -->
    <gs-form key="1" v-if="!isEditing" class="data-form" label-width="140px">
      <div class="block" v-for="(item, key) in keyMap" :key="key" v-if="judgeShowDeviceProp(key)">
        <div class="header">{{ item.label }}</div>
        <div class="main">
          <gs-col v-for="(prop, index) in item.prop" :key="index" :span="prop.width || 8">
            <gs-form-item :label="`${prop.display === 'list' ? (detailData.assetServerType || ''):''}${prop.label}${prop.label ? '：': ''}`" >
              <!-- list 服务器的生命周期-->
              <div v-if="prop.display === 'list'" class="list floatfix">
                <gs-col v-for="(col, index) in (detailData.assetServerType === '虚拟机' ? prop.virtualProp : prop.physicalProp)" :key="index" :span="8">
                  <gs-form-item :label="`${col.label}：`">
                    <span>{{ detailData[col.key] }}</span>
                  </gs-form-item>
                </gs-col>
              </div>
              <!-- 旗下虚拟机 -->
              <div v-else-if="prop.display === 'table' && prop.key === 'virtualServer'" class="table">
                <gs-server-table
                  slot="table"
                  v-loading="loading"
                  :table-data="table.data"
                  :total-num="table.total"
                  :page-size="table.pageSize"
                  :page-number="table.pageNum"
                  @currentChange="currentChange"
                  @sizeChange="sizeChange"
                >
                  <gs-table-column
                    v-for="(col, index) in prop.columns"
                    :key="index"
                    :prop="col.prop"
                    :label="col.label">
                    <template slot-scope="{ row }">
                      <router-link
                        v-if="col.prop === 'logicalHostName'"
                        :to="`/main/assets/server/detail/${row.assetServerUuid}`"
                      >{{ row.logicalHostName }}</router-link>
                      <span v-else>{{ row[col.prop] }}</span>
                    </template>
                  </gs-table-column>
                </gs-server-table>
              </div>
              <!-- table -->
              <div v-else-if="prop.display === 'table'" class="table">
                <gs-table v-if="(detailData[prop.key] && !judgeArrNull(detailData[prop.key])) || prop.isAdd" :data="detailData[prop.key] || []">
                  <gs-table-column
                    v-for="(col, index) in prop.columns"
                    :key="index"
                    :prop="col.prop"
                    :label="col.label">
                    <template slot-scope="{ row }">
                      <span v-if="col.type === 'boolean'">{{row[col.prop] ? '是' : '否'}}</span>
                      <span v-else>{{ row[col.detailProp || col.prop] || col.value }}</span>
                    </template>
                  </gs-table-column>
                </gs-table>
              </div>
              <div v-else-if="prop.display === 'prot'">
                <gs-tag
                  v-for="(port, i) in detailData[prop.key]"
                  :key="i"
                >
                  {{port}}
                </gs-tag>
              </div>
              <!-- 其他 -->
              <div v-else>
                <span>{{ detailData[prop.detailKey || prop.key] }}</span>
                <span v-if="!prop.detailKey">{{prop.unit || ''}}</span>
              </div>
            </gs-form-item>
          </gs-col>
        </div>
      </div>
    </gs-form>
    <!-- 编辑 -->
    <gs-form key="2" v-else ref="form" class="edit-form" label-width="140px" :model="form" :rules="rules">
      <div class="block" v-for="(item, key) in keyMap" :key="key" v-if="!item.onlyDetail && judgeShowDeviceProp(key)">
        <div class="header">{{ item.label }}</div>
        <div class="main">
          <gs-col v-for="(prop, index) in item.prop" :key="index" :span="prop.width || 8">
            <gs-form-item :prop="prop.formKey || prop.key" :label="`${prop.display === 'list' ? form.assetServerType:''}${prop.label}${prop.label ? '：': ''}`">
              <!-- list -->
              
              <div v-if="prop.display === 'list'" class="list floatfix">
                <gs-col v-for="(col, index) in (form.assetServerType === '虚拟机' ? prop.virtualProp : prop.physicalProp)" :key="index" :span="8">
                  <gs-form-item :label="`${col.label}：`">
                     <gs-date-picker v-model="form[col.key]" type='date' input-type="input" format="YYYY-MM-DD"></gs-date-picker>
                  </gs-form-item>
                </gs-col>
              </div>
              <!-- table -->
              <div v-else-if="prop.display === 'table'" class="table">
                <gs-table :data="form[prop.key]">
                  <gs-table-column
                    v-if="prop.isDelete || prop.isEdit"
                    prop="operation"
                    label="操作"
                    max-width="40">
                    <template slot-scope="scope">
                      <i class="gs-icon-delete-o icon-btn margin-right-4" v-if="prop.isDelete" @click="delData(prop.key, scope.$index)"></i>
                      <i class="gs-icon-edit icon-btn" v-if="prop.isEdit" @click="openModal(scope.$index, prop.modalType, prop.key)"></i>
                    </template>
                  </gs-table-column>
                  <gs-table-column
                    v-for="(col, index) in prop.columns"
                    :key="index"
                    :prop="col.prop"
                    :label="col.label"
                    width="100">
                    <template slot-scope="{ row, $index }">
                      <gs-checkbox v-if="col.type === 'boolean'" v-model="row[col.prop]" @change="changeAmdinIp($event, col.prop, $index)"></gs-checkbox>
                      <gs-select v-else-if="col.type === 'select'" v-model="row[col.prop]" :disabled="!row.isNew" @change="selectDirectorMaster($event, $index)">
                        <gs-option v-for="(item, index) in form.memberHostList || []" :key="index" :label="item.logicalHostName" :value="item.assetServerUuid"></gs-option>
                      </gs-select>
                      <span v-else-if="col.type === 'text'">{{ row[col.detailProp || col.prop] || col.value}}</span>
                      <gs-input v-else v-model="row[col.prop]" />
                    </template>
                  </gs-table-column>
                </gs-table>
                <div
                  v-if="prop.isAdd"
                  class="add-ip-headers"
                  @click="openModal(-1, prop.modalType, prop.key)"
                >+ 添 加</div>
              </div>
              <!-- select -->
              <div v-else-if="prop.display === 'select' && prop.key === 'assetAssetStatus'">
                <gs-select v-model="form[prop.key]">
                  <gs-option v-for="(option, index) in (form.assetServerType === '虚拟机' ? prop.virtualOption : prop.physicalOption)" :value="option" :label="option" :key="index"></gs-option>
                </gs-select>
              </div>
              <!-- select -->
              <div v-else-if="prop.display === 'select'">
                <gs-select v-model="form[prop.key]" searchable :disabled="prop.disabledKey && form[prop.disabledKey] && form[prop.disabledKey].length > 0">
                  <gs-option v-for="(option, index) in prop.option || option[prop.optionKey]" :value="option" :label="option" :key="index"></gs-option>
                </gs-select>
              </div>
              <!-- search -->
              <div v-else-if="prop.display === 'search'" class="choose-box gs-input gs-input-validate" @click="openModal(-1, prop.modalType, prop.key)">
                {{ form[prop.formKey || prop.key] }}
                <i class="gs-icon-search"></i>
              </div>
              <!-- date -->
              <div v-else-if="prop.display === 'date'">
                <gs-date-picker :clearable="!prop.disClearable" v-model="form[prop.key]" type='date' input-type="input" class="picker-width-100" format="YYYY-MM-DD"></gs-date-picker>
              </div>
              <!-- prot -->
              <div v-else-if="prop.display === 'prot'">
                <gs-tag
                  v-for="(port, i) in form[prop.key]"
                  :key="i"
                  closable
                  @close="delData(prop.key, i)"
                >
                  {{port}}
                </gs-tag>
                <gs-input :class="{'margin-left-16': form[prop.key] && form[prop.key].length > 0}" class="width-150 no-append-padding" type="number" v-model="port" placeholder="添加端口" @keyup.enter="addPort(prop.key)" min="1" max="65535">
                  <template slot="append">
                    <gs-button type="text" icon="plus" @click="addPort(prop.key)"></gs-button>
                  </template>
                </gs-input>
              </div>
              <!-- 其他 -->
              <div v-else>
                <gs-textarea v-model="form[prop.key]" v-if="prop.display === 'textarea'" />
                <gs-input v-model="form[prop.formKey || prop.key]" v-else :disabled="prop.disabled">
                  <template slot="append" v-if="prop.unit">{{ prop.unit }}</template>
                </gs-input>
                <!-- <gs-input v-model="form[prop.key]" v-else :disabled="prop.disabled" /> -->
              </div>
            </gs-form-item>
          </gs-col>
        </div>
      </div>
    </gs-form>
  </div>
</template>
<script>
import moment from 'moment';
import { ruleTypes } from '@/utils/validator';
import { getSubnetByIdc } from '@/service/asset';

export default {
  props: {
    type: {
      required: true,
      type: String
    },
    keyMap: {
      required: true,
      type: Object
    },
    rules: {
      required: true,
      type: Object
    },
    editData: {
      required: true,
      type: Object
    },
    virtualServer: {
      type: Array,
      default: () => []
    },
    option: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isEditing: false,
      jsonStringKey: [],
      dateTimeKey: [],
      detailData: {},
      form: {},
      loading: true,
      port: '',
      // 旗下虚拟机的数据
      table: {
        data: [],
        total: 0,
        pageSize: 10,
        pageNum: 1,
        allData: []
      }
    };
  },
  watch: {
    editData(val) {
      if (JSON.stringify(val) === '{}') return;
      this.formatApiData();
      if (this.type === 'cluster') {
        this.option['subNets'] = [val.subNet];
        getSubnetByIdc({ idcList: [val.idc] }).then(res => {
          this.option.subNets = (res.data.statistics || []).map(item => item.sub_net);
        });
      }
    },
    virtualServer(val) {
      this.table.allData = val;
      this.table.total = val.length;
      this.currentChange(1);
    },
    // 服务器
    'form.assetServerType': {
      handler(newVal) {
        this.form.assetAssetStatus = '正常运行';
      },
      deep: true
    },
    // 集群
    'form.idc': {
      handler(newVal) {
        if (!newVal || this.type !== 'cluster') return;
        getSubnetByIdc({ idcList: [newVal] }).then(res => {
          this.option['subNets'] = (res.data.statistics || [].map(item => item.sub_net));
          const isFind = this.option.subNets.find(item => item === this.form.subNet);
          if (!isFind) this.form.subNet = '';
        });
      },
      deep: true
    },
    'form.memberHostList': {
      handler(newVal) {
        if (this.type !== 'cluster') return;
        this.changeVipByMember();
      },
      deep: true
    },
    // lvs 当网段改变时，选中ip和集群要重新选择
    'form.subNet': {
      handler(newVal, oldVal) {
        if (this.type !== 'lvs' || newVal === oldVal) return;
        this.form.publicVip = '';
        this.form.assetLbGroup = '';
        this.form.directorMasterUuid = '';
        this.form.rsUuidList = [];
      },
      deep: true
    }
  },
  methods: {
    currentChange(pageNum) {
      this.table.pageNum = pageNum;
      this.table.data = this.table.allData.slice((this.table.pageNum - 1) * this.table.pageSize, this.table.pageNum * this.table.pageSize);
    },
    sizeChange(size) {
      this.table.pageSize = size;
      this.table.pageNum = Math.min(this.table.pageNum, Math.ceil(this.table.total / size));
      this.table.data = this.table.allData.slice((this.table.pageNum - 1) * this.table.pageSize, this.table.pageNum * this.table.pageSize);
    },
    initForm() {
      let form = {};
      let jsonStringKey = [];
      let dateTimeKey = [];
      for (let key in this.keyMap) {
        if (this.keyMap[key].onlyDetail) continue;
        this.keyMap[key].prop.forEach(item => {
          if (item.display === 'list') {
            item.virtualProp.forEach(prop => {
              form[prop.key] = '';
              dateTimeKey.push(prop.key);
            });
            item.physicalProp.forEach(prop => {
              form[prop.key] = '';
              dateTimeKey.push(prop.key);
            });
          } else if (item.type === 'jsonString') {
            form[item.key] = item.isAdd ? [] : [{}];
            jsonStringKey.push(item.key);
          } else if (item.display === 'date') {
            form[item.key] = item.defaultValue || '';
            dateTimeKey.push(item.key);
          } else {
            form[item.key] = item.defaultValue || '';
          }
        });
      }
      this.jsonStringKey = jsonStringKey;
      this.dateTimeKey = dateTimeKey;
      this.form = form;
    },
    turnToEdit() {
      let data = JSON.parse(JSON.stringify(this.detailData));
      if (JSON.stringify(this.detailData) !== '{}') {
        this.dateTimeKey.forEach(key => {
          data[key] = data[key] ? moment(data[key]) : '';
        });
        this.jsonStringKey.forEach(key => {
          if (data[key] && !data[key].length && this.form[key].length) {
            data[key] = [{}];
          }
        });
      }
      this.form = Object.assign({}, this.form, data);
      this.$nextTick(_ => {
        this.isEditing = true;
        this.loading = false;
      });
    },
    cancelEdit() {
      this.isEditing = false;
    },
    resetForm() {
      this.initForm();
    },
    formatApiData() {
      this.loading = false;
      let data = JSON.parse(JSON.stringify(this.editData));
      this.jsonStringKey.forEach(key => {
        !data[key] ? data[key] = [] : data[key] = JSON.parse(data[key]);
      });
      // 特殊处理
      if (this.type === 'server') {
        data.owner = data.assetOwnerEmail ? `${data.assetOwner}(${data.assetOwnerEmail})` : data.assetOwner;
        data.ownerEmail = (data.assetOwnerEmail || '').replace('@example.com', '');
      }
      if (this.type === 'cluster') {
        data.privateVipList.map(item => {
          const temp = data.memberHostList.find(server => server.assetServerUuid === item.director_master_uuid);
          const backup = data.memberHostList.filter(server => server.assetServerUuid !== item.director_master_uuid);
          item.director_master_uuid_name = temp.logicalHostName;
          item.director_backup_uuid_list_name = backup.map(item => item.logicalHostName).join(', ');
          return item;
        });
      }
      this.detailData = data;
    },
    // cmdb的数据结构，只有简单的字符串，无数组，数组会变成json字符串，并且拆成字段存储。。
    // 例如：ipList: [ip_address: '', gate: ''],对应拆成的字段：ipListIpAddress ipListGate
    convertToCamelCase(key, arrKey) {
      // 去除中划线分隔符获取单词数组
      let strArr = arrKey.split('_');
      strArr = strArr.map(item => {
        const temp = item[0].toUpperCase() + item.substring(1);
        return temp;
      });
      return key + strArr.join('');
    },
    convertBoolean(data) {
      let temp = data;
      if (data.length > 0 && typeof data[0] === 'boolean') {
        temp = data.map(item => {
          return item ? 'True' : 'False';
        });
      }
      return temp;
    },
    getParam() {
      this.$refs.form.validate();
      let param = JSON.parse(JSON.stringify(this.form));
      let camelCaseKeys = [];
      // 处理jsonString
      this.jsonStringKey.forEach(key => {
        this.form[key].forEach(item => {
          for (let arrKey in item) {
            const camelCaseKey = this.convertToCamelCase(key, arrKey);
            if (!param[camelCaseKey] || typeof param[camelCaseKey] === 'string') {
              param[camelCaseKey] = [];
              camelCaseKeys.push(camelCaseKey);
            }
            param[camelCaseKey].push(item[arrKey]);
          }
        });
        param[key] = JSON.stringify(param[key]);
      });
      camelCaseKeys.forEach(key => {
        param[key] = this.convertBoolean(param[key]).join(',');
      });
      // 处理日期的数据
      this.dateTimeKey.forEach(key => {
        if (param[key]) {
          param[key] = moment(param[key]).format('YYYY-MM-DD');
        }
      });
      return param;
    },
    openModal(index, modalType, key) {
      this.$emit('openModal', { modalType, key, index, form: this.form });
    },
    updateData({ key, newData }) {
      // 集群特殊处理
      if (key === 'assetLbGroup') {
        this.form['assetLbGroup'] = newData.groupName;
        this.form['directorMasterUuid'] = newData.logicalIp;
        this.form['LbGroup'] = newData;
      } else {
        this.form[key] = newData;
      }
    },
    delData(key, index) {
      this.form[key].splice(index, 1);
    },

    // 集群，vip选择主分发器，设置对应的备分发器
    selectDirectorMaster(val, index) {
      const backup = this.form.memberHostList.filter(server => server.assetServerUuid !== val);
      this.form.privateVipList[index].director_backup_uuid_list_name = backup.map(item => item.logicalHostName).join(', ');
      this.form.privateVipList[index].director_backup_uuid_list = backup.map(item => item.assetServerUuid);
    },
    // 集群的成员主机改变时，对应的vip的改变
    changeVipByMember() {
      const newPrivateVipList = [];
      this.form.privateVipList.forEach(item => {
        const temp = this.form.memberHostList.find(server => server.assetServerUuid === item.director_master_uuid);
        const backup = this.form.memberHostList.filter(server => server.assetServerUuid !== item.director_master_uuid);
        if (temp) {
          item.director_backup_uuid_list_name = backup.map(item => item.logicalHostName).join(', ');
          item.director_backup_uuid_list = backup.map(item => item.assetServerUuid);
          newPrivateVipList.push(item);
        }
      });
      this.form.privateVipList = newPrivateVipList;
    },
    addPort(key) {
      if (!ruleTypes.rightInt(this.port) || this.port === '') {
        this.$Message.warning('请输入合法的端口');
        return;
      }
      const port = parseInt(this.port);
      if (port < 1 || port > 65535) {
        this.$Message.warning('请输入[1, 65535]的端口号');
        return;
      }
      if (this.form[key].indexOf(port) === -1) {
        this.form[key].push(port);
      }
      this.port = null;
    },
    // 保证管理ip的唯一性
    changeAmdinIp(val, key, index) {
      if (key === 'is_admin_ip' && this.form.logicalIpList[index].is_admin_ip) {
        this.form.logicalIpList.forEach((item, indx) => {
          if (index !== indx) {
            item.is_admin_ip = false;
            this.form.logicalIpList[indx] = item;
          }
        });
      }
    },
    // 判断是否为空数组
    judgeArrNull(data) {
      return !data.length || JSON.stringify(data) === '[{}]';
    },
    // 服务器 判断是否为虚拟机，虚拟机不显示设备属性和旗下虚拟机
    judgeShowDeviceProp(currentProp) {
      return !((currentProp === 'device' || currentProp === 'virtualServer') && this.type === 'server' && this[`${this.isEditing ? 'form' : 'detailData'}`].assetServerType === '虚拟机');
    }
  },
  created() {
    this.initForm();
  }
};
</script>
<style lang="scss">
.detail-layout-page {
  .block:not(:first-of-type) {
    padding-top: 36px;
  }
  .block {
    clear: both;
    color: #333;
    .header {
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
      font-weight: 600;
      color: #0073e8;
    }
    .main {
      padding: 16px 0px;
    }
    .gs-form-item-label {
      // color: #6b7baa;
    }
    .table {
      margin-bottom: 16px;
      .gs-table {
        padding-top: 4px;
        table {
          border-collapse: collapse;
        }
      }
      .gs-table-header-wrapper thead th {
        background-color: #fff;
      }
      .gs-table td, .gs-table th.is-leaf {
        border: 1px solid #eee;
      }
    }
  }
  .data-form {
    .gs-form-item {
      margin-bottom: 4px;
    }
    .list {
      padding: 8px;
      border: 1px solid #eee;
      border-radius: 3px;
      margin-top: 8px;
    }
    .table {
      margin-bottom: 16px;
      .gs-table th {
        height: 36px;
      }
      .gs-table .cell, .gs-table th>.cell {
        line-height: 36px;
      }
    }
  }
  .edit-form {
    .list {
      border: 1px solid #eee;
      border-radius: 3px;
      margin-top: 8px;
      padding-top: 24px;
    }
    .table {
      margin-bottom: 16px;
      .gs-table th {
        height: 32px;
      }
      .gs-table th>.cell {
        line-height: 32px;
      }
      .gs-table td {
        height: 48px;
      }
      .gs-table .cell {
        line-height: 48px;
      }
    }
    .add-ip-headers {
      border-bottom: 1px #eee solid;
      text-align: center;
      cursor: pointer;
    }
    .icon-btn {
      cursor: pointer;
      & + .icon-btn {
        margin-right: 4px;
      }
    }
    .choose-box {
      border: 1px solid #ddd;
      height: 28px;
      line-height: 26px;
      width: 100%;
      border-radius: 3px;
      padding: 0px 4px;
      display: inline-block;
      cursor: pointer;
      .gs-icon-search {
        float: right;
        margin-top: 6px;
      }
    }
  }
  .gs-form-item-label {
    font-size: 14px;
    color: #6b7baa;
  }
  .gs-form-item-content > div {
    font-size: 14px !important;
  }
  .width-150 {
    width: 150px;
  }
  .no-append-padding {
    .gs-input-group-append {
      padding: 0px;
    }
  }
  .margin-left-16 {
    margin-left: 16px;
  }
  .gs-tag + .gs-tag {
    margin-left: 8px;
  }
  .icon-btn {
    cursor: pointer;
  }
  .margin-right-4 {
    margin-right: 4px;
  }
}
.floatfix:after {
  content: "";
  display: table;
  clear: both;
}
</style>
