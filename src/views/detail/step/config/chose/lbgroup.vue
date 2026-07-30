<template>
  <gs-modal
    class="choose-modal"
    :value="show"
    title="选择负载均衡集群"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="1200px"
  >
    <div class="tip-box" v-show="step === 1">
      <p><i class="gs-icon-info-circle warning"></i> 集群要与后端主机列表的主机在同一机房和同一网段。</p>
    </div>
    <!-- <div class="select-server-search" v-show="step === 1">
      <gs-input
        v-model.trim="keywords"
        placeholder="请输入主机id、主机名或ip地址查询"
        icon="search"
        @keyup.enter="filterData"
      >
      </gs-input>
    </div> -->
    <gs-table
      v-show="step === 1"
      ref="lbgTable"
      v-loading="loading"
      :data="tableData" 
      :pagination="pagination"
      paging
      @page-change="pageChange"
      @size-change="sizeChange">
      <gs-table-column label="选择" width="40">
        <template slot-scope="scope">
          <gs-radio-group v-model="selectedLbg">
            <gs-radio :label="scope.row">&nbsp;</gs-radio>
          </gs-radio-group>
        </template>
      </gs-table-column>
      <gs-table-column label="负载均衡集群名" show-overflow-tooltip prop="groupName"></gs-table-column>
      <gs-table-column label="创建日期" show-overflow-tooltip prop="dateCreated"></gs-table-column>
      <gs-table-column label="产品线" show-overflow-tooltip prop="product"></gs-table-column>
      <gs-table-column label="机房" show-overflow-tooltip prop="idc"></gs-table-column>
      <gs-table-column label="网络地址" show-overflow-tooltip prop="subNet"></gs-table-column>
      <gs-table-column label="描述" show-overflow-tooltip prop="usage"></gs-table-column>
    </gs-table>
    <p class="margin-bottom-16" v-show="step === 2">主负载均衡分发器选择：</p>
    <gs-table
      v-show="step === 2"
      ref="serverData"
      v-loading="loading"
      :data="serverData"
      :pagination="pagination"
      paging
      @page-change="pageChange"
      @size-change="sizeChange">
      <gs-table-column label="选择" width="40">
        <template slot-scope="scope">
          <gs-radio-group v-model="selectedServerUuid">
            <gs-radio :label="scope.row.assetServerUuid">&nbsp;</gs-radio>
          </gs-radio-group>
        </template>
      </gs-table-column>
      <gs-table-column label="主机名" show-overflow-tooltip prop="logicalHostName"></gs-table-column>
      <gs-table-column label="服务类型" show-overflow-tooltip prop="assetServerType"></gs-table-column>
      <gs-table-column label="管理ip" show-overflow-tooltip prop="logicalIp"></gs-table-column>
    </gs-table>
    <div class="choose-tip-box" v-if="step === 1">当前选中的集群：{{selectedLbg.groupName}}</div>
    <div class="choose-tip-box" v-if="step === 2">当前选中的主负载均衡分发器：{{selectedServer.logicalHostName}}</div>
    <div slot="footer">
      <gs-button type="primary" v-if="step === 1" @click="nextStep">下一步</gs-button>
      <gs-button type="primary" v-if="step === 2" @click="step = 1">上一步</gs-button>
      <gs-button type="primary" v-if="step === 2" @click="confirm">完成</gs-button>
      <gs-button type="default" @click="close()">取消</gs-button>
    </div>
  </gs-modal>
</template>
<script>
import {
  mapActions
} from 'vuex';
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    filterCondition: {
      type: Object,
      default: _ => {}
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
    pagination() {
      const { pageSize, total, pageNum } = this;
      return {
        current: pageNum,
        pageSize: pageSize,
        pageSizes: [10, 20, 50],
        total: total
      };
    },
    selectedServer() {
      return this.serverData.find(server => server.assetServerUuid === this.selectedServerUuid) || {};
    }
  },
  data() {
    return {
      loading: false,
      originData: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      keywords: '',
      selectedLbg: {},
      selectedServerUuid: {},
      tableData: [],
      step: 1,
      serverData: []
    };
  },
  watch: {
    filterCondition() {
      this.filterData();
    },
    visible(newVal) {
      if(newVal) {
        this.selectedLbg = {};
        this.selectedServerUuid = null;
      }
    },
    selectedLbg() {
      this.selectedServerUuid = null;
    }
  },
  methods: {
    ...mapActions('asset', [
      'getLbgroup',
      'getServerByIds'
    ]),
    confirm() {
      this.$emit('confirm', { selectedLbg: this.selectedLbg, selectedServer: this.selectedServer });
      this.step = 1;
    },
    close() {
      this.$emit('update:visible', false);
      this.show = false;
      this.$emit('close', false);
      this.step = 1;
    },
    handleSelect (selected) {
      this.selected = JSON.parse(JSON.stringify(selected));
    },
    pageChange (pageNum) {
      this.pageNum = pageNum;
      this.getTableList();
    },
    sizeChange (size) {
      this.pageSize = size;
      this.getTableList();
    },
    shouldFetchData () {
      this.pageNum = 1;
    },
    getTableList () {
      this.loading = true;
      const param = {
        page: this.pageNum,
        size: this.pageSize,
        // ...this.filterCondition
        contains: {
          groupName: this.keywords,
          subNet: this.filterCondition.subNet
        },
        equals: {
          idc: this.filterCondition.idc
        }
      };
      this.getLbgroup(param).then(res => {
        this.loading = false;
        const data = res.data.result;
        this.total = res.data.meta.total;
        this.tableData = data;
      }).catch(e => {
        this.loading = false;
      });
    },
    filterData () {
      this.pageNum = 1;
      this.getTableList();
    },
    nextStep() {
      if (!this.selectedLbg.groupName) {
        this.$Message.warning('请选择集群！');
        return;
      }
      const param = {
        'server_uuids': JSON.parse(this.selectedLbg.memberHostList.replace(/'/g, '"'))
      };
      this.loading = true;
      this.getServerByIds(param).then(res => {
        this.loading = false;
        this.serverData = res.data || [];
      }).catch(e => {
        this.loading = false;
      });
      this.step++;
    }
  },
  created() {
    this.getTableList();
  }
};
</script>

<style lang="scss">
.select-server-search {
  width: 400px;
  margin-bottom: 10px;
}
.margin-bottom-16 {
  margin-bottom: 16px;
}
.choose-modal {
  .tip-box {
    background-color: #e1f9ff;
    padding: 8px 24px;
    border-radius: 4px;
    border: 1px solid #b0fbff;
    margin-bottom: 16px;
    i {
      font-size: 18px;
      &.warning {
        color: #ffb83d;
      }
    }
  }
}
</style>
