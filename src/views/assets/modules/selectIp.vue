<template>
  <gs-modal
    class="choose-ip-modal"
    :value="show"
    :title="title || '选择IP'"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="900px"
  >
    <div>
      <div class="tool">
        <gs-select class="width-220 margin-right-4" v-model="search.idc" @change="filterData" :disabled="!!pageFilterCondition.idc">
          <gs-option value="机房A" label="机房A"></gs-option>
          <gs-option value="机房B" label="机房B"></gs-option>
          <gs-option value="机房C" label="机房C"></gs-option>
          <gs-option value="机房D" label="机房D"></gs-option>
        </gs-select>
        <gs-select class="width-220 margin-right-4" v-model="search.type" @change="filterData">
          <gs-option value="public" label="public"></gs-option>
          <gs-option value="private" label="private"></gs-option>
        </gs-select>
        <gs-search v-model="search.keywords" @search="filterData" @clear="filterData" />
      </div>
      <gs-table
        ref="serverTable"
        v-loading="loading"
        :data="tableData"
        :pagination="pagination"
        :height="350"
        paging
        @page-change="pageChange"
        @size-change="sizeChange">
        <gs-table-column label="选择" width="60">
          <template slot-scope="scope">
            <gs-radio-group v-model="selected" @change="selectIp">
              <gs-radio :label="scope.row.ipAddress" :disabled="selectedListObj[scope.row.ipAddress]">&nbsp;</gs-radio>
            </gs-radio-group>
          </template>
        </gs-table-column>
        <gs-table-column label="IP地址" show-overflow-tooltip prop="ipAddress" min-width="150"></gs-table-column>
        <gs-table-column label="IP类型" show-overflow-tooltip prop="type" width="100"></gs-table-column>
        <gs-table-column label="网关" show-overflow-tooltip prop="defaultGateway" width="100"></gs-table-column>
        <gs-table-column label="子网地址" show-overflow-tooltip prop="subNet" width="100"></gs-table-column>
        <gs-table-column label="子网掩码" show-overflow-tooltip prop="netmask" width="100"></gs-table-column>
        <gs-table-column label="掩码位数" show-overflow-tooltip prop="prefix" width="100"></gs-table-column>
        <gs-table-column label="所在机房" show-overflow-tooltip prop="idc" width="100"></gs-table-column>
      </gs-table>
    </div>
    <div class="choose-tip-box">当前选中：{{selected}}</div>
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
    title: {
      type: String
    },
    value: {
      type: [Object, String],
      default: _ => {}
    },
    selectedList: {
      type: [Array, Object],
      default: _ => []
    },
    pageFilterCondition: {
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
    }
  },
  watch: {
    visible() {
      this.selected = this.value || '';
      this.selectedListObj = {};
      this.selectedList.forEach(item => {
        this.selectedListObj[item.ip_address || item.vip] = true;
      });
    },
    pageFilterCondition() {
      this.search.idc = this.pageFilterCondition.idc || '';
      this.search.subnet = this.pageFilterCondition.subNet || '';
      this.filterData();
    }
  },
  data() {
    return {
      loading: false,
      total: 0,
      pageSize: 10,
      pageNum: 1,
      keywords: '',
      selected: this.value,
      selectedObj: {},
      selectedListObj: {},
      tableData: [],
      search: {
        idc: '机房A',
        type: '',
        keywords: '',
        subnet: ''
      }
    };
  },
  methods: {
    ...mapActions('asset', [
      'getAssetsIp'
    ]),
    confirm() {
      if (!this.selected) {
        this.$Message.warning('请选择IP');
        return;
      }
      this.$emit('confirm', { selected: this.selectedObj, type: 'ip' });
    },
    close() {
      this.$emit('update:visible', false);
      this.show = false;
      this.$emit('close', false);
    },
    pageChange(pageNum) {
      this.pageNum = pageNum;
      this.getTableList();
    },
    sizeChange(size) {
      this.pageSize = size;
      this.getTableList();
    },
    getTableList() {
      this.loading = true;
      const params = {
        page: this.pageNum,
        size: this.pageSize,
        idcList: this.search.idc ? [this.search.idc] : [],
        subNetList: this.search.subnet ? [this.search.subnet] : [],
        typeList: this.search.type ? [this.search.type] : [],
        search_condition: this.search.keywords
      };
      if (this.pageFilterCondition.isUsed) {
        params.isUsed = this.pageFilterCondition.isUsed;
      }
      this.getAssetsIp(params).then(res => {
        this.loading = false;
        this.total = res.data.total;
        this.tableData = res.data.ips;
      });
    },
    filterData() {
      this.pageNum = 1;
      this.getTableList();
    },
    selectIp(val) {
      const ip = this.tableData.find(item => item.ipAddress === val);
      const temp = {
        'ip_address': ip.ipAddress,
        'idc': ip.idc,
        'netmask': ip.netmask,
        'prefix': ip.prefix,
        'subnet': ip.subNet,
        'type': ip.type,
        'gateway': ip.defaultGateway,
        'is_cluster_ip': false,
        'is_admin_ip': false
      };
      this.selectedObj = temp;
    }
  },
  created() {
    this.getTableList();
  }
};
</script>

<style lang="scss">
.choose-ip-modal {
  .tool {
    display: flex;
    margin-bottom: 10px;
    .margin-right-4 {
      margin-right: 4px;
      width: 120px;
    }
  }
  .choose-tip-box {
    position: absolute;
    bottom: 18px;
    color: #73d13d;
  }
}
</style>
