<template>
  <gs-modal
    class="choose-modal"
    :value="show"
    title="选择DNS"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="900px"
  >
    <div>
      <div class="select-server-search">
        <gs-input
          :model-value="ip" @update:model-value="(val) => $emit('update:ip', val)"
          placeholder="请输入dns关键词"
          icon="search"
          disabled
          @keyup.enter="filterData"
        >
        </gs-input>
      </div>
      <gs-table
        ref="serverTable"
        v-loading="loading"
        :data="tableData" 
        :rowKey="rowKey"
        :pagination="pagination"
        paging
        @page-change="pageChange"
        @size-change="sizeChange"
        @selection-change="handleSelect">
        <gs-table-column type="selection" width="35" :reserve-selection="true"></gs-table-column>
        <gs-table-column label="域名" show-overflow-tooltip prop="sub_domain" min-width="100"></gs-table-column>
        <gs-table-column label="根域" show-overflow-tooltip prop="primary_domain" width="100"></gs-table-column>
        <gs-table-column label="解析地址" show-overflow-tooltip prop="value" width="140"></gs-table-column>
        <gs-table-column label="区域" show-overflow-tooltip width="100">
          <template slot-scope="{ row }">
            <!-- <span>{{ row.scope === 'public' ? '公网':'私网'}}</span> -->
            <span v-if="row.scope === 'all'">公网&私网</span>
            <span v-if="row.scope === 'public'">公网</span>
            <span v-if="row.scope === 'private'">私网</span>
          </template>
        </gs-table-column>
        <gs-table-column label="记录缓存时间(s)" prop="ttl" width="140"></gs-table-column>
        <gs-table-column label="用途" show-overflow-tooltip prop="description" width="100"></gs-table-column>
      </gs-table>
    </div>
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
    ip: {
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
    value () {
      this.selected = this.value;
    },
    ip () {
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
      selected: [],
      tableData: []
    };
  },
  methods: {
    ...mapActions('asset', [
      'getDns'
    ]),
    confirm() {
      // const data = this.tableData.filter(item => this.selected.includes(item['id']));
      this.$emit('confirm', {selected: this.selected, type: 'dns'});
      this.$refs.serverTable.clearSelection();
    },
    close() {
      this.$emit('update:visible', false);
      this.show = false;
      this.$emit('close', false);
      this.$refs.serverTable.clearSelection();
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
      if (!this.ip) return;
      this.loading = true;
      const param = {
        value: this.ip
      };
      this.getDns(param).then(res => {
        this.loading = false;
        const data = res.data;
        this.total = res.data.length;
        this.tableData = data;
      });
    },
    filterData () {
      this.pageNum = 1;
      this.getTableList();
    },
    rowKey(row) {
      return row['id'];
    },
    handleSelect (selected) {
      this.selected = JSON.parse(JSON.stringify(selected));
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
</style>
