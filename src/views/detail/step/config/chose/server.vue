<template>
  <gs-modal
    class="choose-modal"
    :value="show"
    title="选择宿主机"
    @confirm="confirm"
    has-form
    :before-close="close"
    top="86px"
    width="1200px"
  >
    <div class="select-server-search">
      <div>
        <span>筛选条件：</span>
        <gs-tooltip :title="formatText(value, conditionKeyMap[key])" placement="bottom" v-for="(value, key) in filterCondition" :key="key">
          <gs-tag :closable="!conditionKeyMap[key].required" @close="delCondition(key)">{{conditionKeyMap[key].label}}</gs-tag>
        </gs-tooltip>
        <gs-popover
          v-model="showQueryBox"
          placement="top"
          :width="500"
          trigger="manual"
        >
          <div>
            <p class="title">添加筛选条件</p>
            <div class="query-box">
              <gs-select v-model="queryForm.key" placeholder="请选择">
                <gs-option v-for="(value, key) in conditionKeyMap" :key="key" :value="value" :label="value.label"></gs-option>
              </gs-select>
              <gs-input :value="queryForm.key.operation" disabled></gs-input>
              <gs-input v-model="queryForm.value" placeholder="请输入值"></gs-input>
            </div>
            <!-- <div class="errorText">{{ errorText }}</div> -->
            <div class="btn-box">
              <gs-button type="primary" @click="addCondition()">确定</gs-button>
              <gs-button type="default" @click="showQueryBox = false">取消</gs-button>
            </div>
          </div>
          <i class="gs-icon-plus-circle-o" @click="showQueryBox = true"></i>
        </gs-popover>
      </div>
      <gs-input
        v-model.trim="keywords"
        placeholder="请输入主机名或ip地址查询"
        icon="search"
        @keyup.enter="filterData"
      >
      </gs-input>
    </div>
    <gs-table
      ref="serverTable"
      v-loading="loading"
      :data="tableData" 
      :pagination="pagination"
      paging
      @page-change="pageChange"
      @size-change="sizeChange">
      <gs-table-column label="选择" width="60">
        <template #default="scope">
          <gs-radio-group v-model="selected">
            <gs-radio :label="scope.row.hostname">&nbsp;</gs-radio>
          </gs-radio-group>
        </template>
      </gs-table-column>
      <gs-table-column label="主机名" show-overflow-tooltip prop="hostname" width="130px"></gs-table-column>
      <gs-table-column label="IP地址" show-overflow-tooltip width="120px">
        <template #default="{ row }">
          {{ row.ip_list && row.ip_list.join(',') }}
        </template>
      </gs-table-column>
      <!-- <gs-table-column label="状态">
        <template #default="{ row }">
          <span v-if="row.status === '正常'" class="status success">正常</span>
          <span v-else class="status fail">异常</span>
        </template>
      </gs-table-column> -->
      <gs-table-column label="产品线" show-overflow-tooltip prop="product"></gs-table-column>
      <gs-table-column label="机房" show-overflow-tooltip prop="idc"></gs-table-column>
      <gs-table-column label="机柜" show-overflow-tooltip prop="cabinet"></gs-table-column>
      <gs-table-column label="级别" show-overflow-tooltip prop="business_level"></gs-table-column>
      <gs-table-column label="总核心CPU" show-overflow-tooltip prop="cpu_cores"></gs-table-column>
      <gs-table-column label="可用内存(GB)" show-overflow-tooltip prop="free_memory"></gs-table-column>
      <gs-table-column label="监控内存(GB)" show-overflow-tooltip prop="free_memory_monitor"></gs-table-column>
      <gs-table-column label="磁盘绝对剩余空间(GB)" show-overflow-tooltip prop="free_disk"></gs-table-column>
    </gs-table>
    <div class="choose-tip-box">当前选中：{{selected}}</div>
  </gs-modal>
</template>
<script>
import { mapActions } from '@/stores/vuex-compat';
import { conditionKeyMap } from '@/views/detail/step/constant';

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    value: {
      type: [Object, String],
      default: _ => ({})
    },
    filterCondition: {
      type: Object,
      default: _ => ({})
    },
    minCondition: {
      type: Object,
      default: _ => {
        return {memory: 0, disk: 0};
      }
    },
    selectedList: {
      type: [Array, Object],
      default: _ => []
    },
    currentChooseIndex: {
      type: [Number, String],
      default: 0
    },
    isCallBackObj: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(val) {
        return val;
      }
    },
    pagination () {
      const {pageSize, total, pageNum } = this;
      return {
        current: pageNum,
        pageSize: pageSize,
        pageSizes: [10, 20, 50],
        total: total
      };
    }
  },
  watch: {
    visible(newVal) {
      this.selected = this.value;
      if (newVal) {
        this.computeMemoryDisk();
        this.filterData();
      }
    },
    showQueryBox(newVal) {
      if (newVal) {
        // 清空之前输入的内容
        this.queryForm = {
          key: {},
          value: ''
        };
      }
    }
  },
  data() {
    return {
      conditionKeyMap,
      loading: false,
      originData: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      keywords: '',
      selected: [],
      tableData: [],
      allData: [],
      queryForm: {
        key: {},
        value: ''
      },
      showQueryBox: false,
      errorText: '',
      usedServer: {}
    };
  },
  methods: {
    ...mapActions('asset', [
      'getVmServer'
    ]),
    confirm() {
      if (!this.selected) {
        this.$Message.warning('请选择宿主机！');
        return;
      }
      this.$emit('confirm', { selected: this.selected, type: 'server' });
    },
    close() {
      this.$emit('update:visible', false);
      this.show = false;
      this.showQueryBox = false;
      this.$emit('close', false);
    },
    pageChange(pageNum) {
      this.pageNum = pageNum;
      this.tableData = this.allData.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize);
      // this.subtractUsedMemoryDisk();
    },
    sizeChange(size) {
      this.pageSize = size;
      this.tableData = this.allData.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize);
      // this.subtractUsedMemoryDisk();
    },
    shouldFetchData() {
      this.pageNum = 1;
    },
    getTableList() {
      this.loading = true;
      const params = {
        // page: this.pageNum,
        // size: this.pageSize,
        keyword: this.keywords,
        ...this.filterCondition
      };
      this.getVmServer(params).then(res => {
        this.loading = false;
        const data = res.data.hosts;
        this.allData = data;
        this.subtractUsedMemoryDisk();
      });
    },
    filterData() {
      this.pageNum = 1;
      this.getTableList();
    },
    formatText(value, data) {
      return data.label + data.operation + value + (data.unit || '');
    },
    delCondition(key) {
      delete this.filterCondition[key];
      this.filterData();
    },
    addCondition() {
      this.showQueryBox = false;
      if (!this.queryForm.value || !this.queryForm.key.key) return;
      this.filterCondition[this.queryForm.key.key] = this.queryForm.value;
      this.filterData();
    },
    // 宿主机的剩余内存和剩余磁盘的数据，要将当前工单中其他虚拟机已经分配的磁盘空间减去
    computeMemoryDisk() {
      let usedServer = {};
      this.selectedList.forEach((item, index) => {
        // 当前的虚拟机去掉，已完成开通的虚拟机也不用计算
        const hostname = item['host_machine'];
        if (hostname && item.status !== 'success' && this.currentChooseIndex !== index) {
          if (!usedServer[hostname]) usedServer[hostname] = 0;
          usedServer[hostname]++;
        }
      });
      this.usedServer = usedServer;
    },
    // 减去当前工单中其他虚拟机已经分配的磁盘空间
    subtractUsedMemoryDisk() {
      function isGtZero(value) {
        return value < 0 ? 0 : value;
      }

      this.allData.map(item => {
        if (this.usedServer[item.hostname]) {
          item['free_memory'] = isGtZero(item['free_memory'] - this.usedServer[item.hostname] * this.minCondition.memory);
          item['free_disk'] = isGtZero(item['free_disk'] - this.usedServer[item.hostname] * this.minCondition.disk);
        }
        return item;
      });
      // 将不足筛选条件的过滤掉
      this.allData = this.allData.filter(item => {
        const filterMinMemory = parseInt(this.filterCondition['free_memory']) || 0;
        const filterMinDisk = parseInt(this.filterCondition['free_disk']) || 0;
        return item['free_memory'] >= filterMinMemory && item['free_disk'] >= filterMinDisk;
      });
      this.total = this.allData.length;
      this.tableData = this.allData.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize);
    }
  }
};
</script>

<style lang="scss" scope>
.select-server-search {
  width: 100% !important;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  .gs-tooltip + .gs-tooltip {
    margin-left: 4px;
  }
  .gs-input {
    width: 400px;
  }
  .gs-icon-plus-circle-o {
    font-size: 20px;
    color: #2794f5;
    cursor: pointer;
  }
}
.gs-popover {
  .title {
    padding: 0px 8px 4px;
    color: #555;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
  }
  .query-box {
    display: flex;
    padding: 8px;
  }
  .btn-box {
    text-align: right;
    padding: 8px;
  }
}
.status.fail {
  color: #f56c6c;
}
.status.success {
  color: #67c23a;
}
</style>
