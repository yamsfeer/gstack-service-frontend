<template>
  <gs-modal
    class="choose-modal"
    :value="show"
    title="选择IP"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="800px"
  >
    <div>
      <gs-table
        class="margin-bottom-16"
        :data="idcData">
        <gs-table-column label="选择" width="40">
          <template slot-scope="scope">
            <gs-radio-group v-model="subnet">
              <gs-radio :label="scope.row.subnet">&nbsp;</gs-radio>
            </gs-radio-group>
          </template>
        </gs-table-column>
        <gs-table-column label="机房" prop="idc"></gs-table-column>
        <gs-table-column label="网段" show-overflow-tooltip prop="subnet"></gs-table-column>
        <gs-table-column label="剩余数量" show-overflow-tooltip prop="count"></gs-table-column>
      </gs-table>
      <gs-table
        ref="serverTable"
        v-loading="loading"
        :data="tableData"
        :pagination="pagination"
        paging
        @page-change="pageChange"
        @size-change="sizeChange">
        <gs-table-column label="选择" width="40">
          <template slot-scope="scope">
            <gs-radio-group v-model="selected">
              <gs-radio :label="scope.row.ip" :disabled="selectedList[scope.row.ip]">&nbsp;</gs-radio>
            </gs-radio-group>
          </template>
        </gs-table-column>
        <gs-table-column label="IP地址" show-overflow-tooltip prop="ip" min-width="100"></gs-table-column>
        <gs-table-column label="机房" show-overflow-tooltip prop="idc" width="100"></gs-table-column>
        <gs-table-column label="子网掩码" show-overflow-tooltip prop="netmask" width="100"></gs-table-column>
        <gs-table-column label="网关" show-overflow-tooltip prop="gateway" width="100"></gs-table-column>
      </gs-table>
    </div>
    <div class="choose-tip-box">当前选中：{{selected}}</div>
  </gs-modal>
</template>
<script>
import {
  mapActions
} from '@/stores/vuex-compat';
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    value: {
      type: [Object, String],
      default: _ => {}
    },
    selectedList: {
      type: [Array, Object],
      default: _ => {}
    },
    idc: {
      type: String,
      default: ''
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
    visible () {
      this.selected = this.value || '';
      if (this.value && this.value.ip) {
        this.allIpList.push({
          ip: this.value.ip,
          netmask: this.value.netmask,
          gateway: this.value.gateway
        });
      }
    },
    subnet () {
      this.pageNum = 1;
      this.getTableList();
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
      selected: this.value,
      tableData: [],
      allIpList: [],
      idcData: [],
      subnet: ''
    };
  },
  methods: {
    ...mapActions('asset', [
      'getVmIp',
      'getVmIdcSubnet'
    ]),
    confirm() {
      if (!this.selected) {
        this.$Message.warning('请选择IP');
        return;
      }
      const data = this.allIpList.find(item => item.ip === this.selected) || {};
      // const selected = {
      //   ip: data.ip,
      //   netmask: data.netmask,
      //   gateway: data.gateway
      // };
      this.$emit('confirm', {selected: data, type: 'ip'});
    },
    close() {
      this.$emit('update:visible', false);
      this.show = false;
      this.$emit('close', false);
    },
    pageChange (pageNum) {
      this.pageNum = pageNum;
      this.tableData = this.allIpList.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize);
      // this.getTableList();
    },
    sizeChange (size) {
      this.pageSize = size;
      this.tableData = this.allIpList.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize);
      // this.getTableList();
    },
    shouldFetchData () {
      this.pageNum = 1;
    },
    getTableList () {
      this.loading = true;
      const params = {
        // page: this.pageNum,
        // size: this.pageSize,
        idc: this.idc,
        subnet: this.subnet
      };
      this.getVmIp(params).then(res => {
        this.loading = false;
        const data = res.data.subnet_ips;
        this.total = data.length;
        this.tableData = data.slice((this.pageNum - 1) * this.pageSize, this.pageNum * this.pageSize);
        this.allIpList = data;
      });
    },
    filterData () {
      this.pageNum = 1;
      this.getTableList();
    },
    getSubnet () {
      this.getVmIdcSubnet(this.idc).then(res => {
        const data = res.data.idc_subnet || {};
        let idc = [];
        for (let subnet in data) {
          idc.push({
            idc: this.idc,
            subnet: subnet,
            count: data[subnet]
          });
        }
        this.idcData = idc;
        this.subnet = this.idcData[0] && this.idcData[0].subnet;
      });
    }
  },
  created() {
    this.getSubnet();
  }
};
</script>

<style lang="scss">
.select-server-search {
  width: 400px;
  margin-bottom: 10px;
}
</style>
