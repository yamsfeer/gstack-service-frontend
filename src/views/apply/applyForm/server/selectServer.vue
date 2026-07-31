<template>
  <gs-modal
    class="server-modal"
    :value="show"
    :title="title || '选择服务器'"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="1200px"
  >
    <div class="tip-box" v-if="!!tip">
      <p><i class="gs-icon-info-circle warning"></i> {{tip}}</p>
    </div>
    <div class="select-server-search">
      <div>
      <template v-for="(value, key) in filterCondition" :key="key">
        <gs-tag v-if="!!value">{{value}}</gs-tag>
      </template>
      </div>
      <gs-input
        v-model.trim="keywords"
        placeholder="请输入关键词查询"
        icon="search"
        @keyup.enter="filterData"
      >
        <template #prepend>
          <gs-select v-model="keywordType">
            <gs-option value="name" label="主机名"></gs-option>
            <gs-option value="ip" label="IP地址"></gs-option>
          </gs-select>
        </template>
      </gs-input>
    </div>
    <gs-table
      ref="serverTable"
      v-loading="loading"
      :data="tableData"
      :pagination="pagination"
      paging
      @page-change="pageChange"
      @size-change="sizeChange"
      @selection-change="handleSelect">
      <gs-table-column label="选择" width="40" v-if="!multiple">
        <template #default="scope">
          <gs-radio-group v-model="selected" @change="handleSelect">
            <gs-radio :label="scope.row" :disabled="disableSelectRadio(scope.row)">&nbsp;</gs-radio>
          </gs-radio-group>
        </template>
      </gs-table-column>
      <gs-table-column v-if="multiple" type="selection" :selectable="selectable" width="35"></gs-table-column>
      <gs-table-column label="主机名" show-overflow-tooltip prop="logicalHostName"></gs-table-column>
      <gs-table-column label="IP地址" show-overflow-tooltip prop="logicalIp"></gs-table-column>
      <gs-table-column label="服务器类型" show-overflow-tooltip prop="assetServerType"></gs-table-column>
      <gs-table-column label="产品线" show-overflow-tooltip prop="assetProduct"></gs-table-column>
      <gs-table-column label="机房" show-overflow-tooltip prop="assetIdc"></gs-table-column>
      <gs-table-column label="级别" show-overflow-tooltip prop="assetLevel"></gs-table-column>
      <gs-table-column label="宿主机" show-overflow-tooltip prop="logicalHostMachine"></gs-table-column>
      <gs-table-column label="描述" show-overflow-tooltip prop="assetUsage"></gs-table-column>
    </gs-table>
  </gs-modal>
</template>
<script>
import {
  mapActions,
  mapGetters
} from '@/stores/vuex-compat';
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String
    },
    selectedServer: {
      type: Array,
      default: _ => []
    },
    multiple: {
      type: Boolean,
      default: true
    },
    // 机房的筛选条件
    idcFilterCondition: {
      type: Object,
      default: _ => ({})
    },
    pageFilterCondition: {
      type: Object,
      default: _ => ({})
    },
    tip: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: Infinity
    },
    tenant: Object
  },
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO'
    }),
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
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.filterCondition = {};
        this.selectedServerObj = {};
        this.selected = this.multiple ? [] : {};
        this.keywords = '';
        this.keywordType = 'name';
        // this.selected = [];
        // this.selectedRadio = undefined;
        if (!this.multiple && this.selectedServer.length > 0) {
          let selectedServerObj = {};
          this.selectedServer.forEach(item => {
            selectedServerObj[item.logicalHostName] = true;
          });
          this.selectedServerObj = selectedServerObj;
          this.filterCondition = {
            logicalIpSubnet: this.selectedServer[0].logicalIpSubnet,
            assetIdc: this.selectedServer[0].assetIdc
          };
        }

        if (this.multiple) {
          this.selectedServer.forEach(row => {
            this.$refs.serverTable.toggleRowSelection(row, true);
          });
        }
        this.filterData();
      }
    },
    idcFilterCondition(newVal) {
      if (newVal.idc || newVal.subNet) {
        this.filterCondition = {
          logicalIpSubnet: newVal.subNet || '',
          assetIdc: newVal.idc || ''
        };
        this.filterData();
      }
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
      selected: [],
      // selectedRadio: undefined,
      tableData: [],
      filterCondition: {},
      selectedServerObj: {},
      keywordType: 'name'
    };
  },
  methods: {
    ...mapActions('asset', [
      'getServer'
    ]),
    disableSelectRadio(row) {
      if (this.selectedServer.length >= this.maxSize) {
        return true;
      }
      return this.selectedServerObj[row.logicalHostName];
    },
    selectable(row, index) {
      return !this.selectedServer.find(server => server.logicalIp === row.logicalIp);
    },
    confirm() {
      if ((typeof this.selected === 'object' && Object.keys(this.selected).length === 0) || (Array.isArray(this.selected) && this.selected.length === 0)) {
        this.$Message.warning('请选择主机！');
        return;
      }
      // 保证emit出去的是数组
      let selected = Array.isArray(this.selected) ? this.selected : [this.selected];
      // this.$emit('confirm', this.multiple ? this.selected : this.selectedRadio ? [this.selectedRadio] : []);
      this.$emit('confirm', selected);
      this.$refs.serverTable.clearSelection();
    },
    close() {
      this.$emit('update:visible', false);
      this.$refs.serverTable.clearSelection();
      this.show = false;
      this.$emit('close', false);
    },
    handleSelect(selected) {
      this.selected = JSON.parse(JSON.stringify(selected));
    },
    // handleSelectRadio (selected) {
    //   this.selectedRadio = JSON.parse(JSON.stringify(selected));
    // },
    pageChange(pageNum) {
      this.pageNum = pageNum;
      this.getTableList();
    },
    sizeChange(size) {
      this.pageSize = size;
      this.getTableList();
    },
    shouldFetchData() {
      this.pageNum = 1;
    },
    getTableList() {
      this.loading = true;
      let param = {
        page: this.pageNum,
        size: this.pageSize,
        equals: {
          ...this.pageFilterCondition
        },
        contains: {
          // logicalHostName: this.keywords
          // logicalIpListIpAddress: this.keywords
        },
        'not_equals': {
          logicalIpListIpAddress: ''
        },
        tenant: this.tenant && {
          tenant_name: this.tenant.tenant_name,
          tenant_id: this.tenant.tenant_id,
        },
        user_id: this.userInfo.id
      };
      if (this.filterCondition.assetIdc) {
        param.equals.assetIdc = this.filterCondition.assetIdc;
        param.contains.logicalIpListSubnet = this.filterCondition.logicalIpSubnet;
      }
      if (this.keywordType === 'name') {
        param.contains.logicalHostName = this.keywords;
      } else {
        param.contains.logicalIpListIpAddress = this.keywords;
      }
      this.getServer(param).then(res => {
        this.loading = false;
        const data = res.data.result;
        this.total = res.data.meta.total;
        this.tableData = data;
      });
    },
    filterData() {
      this.pageNum = 1;
      this.getTableList();
    }
  },
  created() {
  }
};
</script>

<style lang="scss">
.select-server-search {
  width: 100% !important;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  .gs-tag + .gs-tag {
    margin-left: 4px;
  }
  .gs-input {
    width: 400px;
  }
}
.server-modal {
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
