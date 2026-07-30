<template>
  <div class="selected-server">
    <!-- <div class="selected-header">
      <gs-button @click="handleDel(-1)">批量删除</gs-button>
    </div> -->
    <gs-table
      ref="serverTable"
      :data="tableData"
      :rowKey="rowKey"
      :pagination="pagination"
      paging
      @page-change="pageChange"
      @size-change="sizeChange">
      <gs-table-column label="主机名" show-overflow-tooltip prop="logicalHostName"></gs-table-column>
      <gs-table-column label="IP地址" show-overflow-tooltip prop="logicalIp"></gs-table-column>
      <gs-table-column label="服务器类型" show-overflow-tooltip prop="assetServerType"></gs-table-column>
      <!-- <gs-table-column label="级别" show-overflow-tooltip prop="assetLevel"></gs-table-column> -->
      <gs-table-column label="宿主机" show-overflow-tooltip prop="logicalHostMachine"></gs-table-column>
      <gs-table-column label="描述" show-overflow-tooltip prop="assetUsage"></gs-table-column>
      <gs-table-column label="操作">
        <template slot-scope="{ row }">
          <gs-button type="text-primary" @click="handleDel(row.assetServerUuid)">删除</gs-button>
        </template>
      </gs-table-column>
    </gs-table>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Array,
      required: true
    },
    total: {
      type: Number,
      default: 0
    }
  },
  computed: {
    tableData() {
      const { pageSize, pageNum, originData } = this;
      const start = pageSize * (pageNum - 1);
      const end = Math.min(pageSize * pageNum, originData.length);
      return originData.slice(start, end);
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
  data() {
    return {
      originData: [],
      pageSize: 10,
      pageNum: 1,
      keywords: '',
      deletion: []
    };
  },
  watch: {
    value: {
      handler (val) {
        this.originData = JSON.parse(JSON.stringify(val));
        this.pageSize = 10;
        this.pageNum = 1;
        this.keywords = '';
      },
      immediate: true
    }
  },
  methods: {
    rowKey (row) {
      return row['assetServerUuid'];
    },
    selectDeletion (selected) {
      this.deletion = selected.map(item => item['assetServerUuid']);
    },
    pageChange (pageNum) {
      this.pageNum = pageNum;
    },
    sizeChange (size) {
      this.pageSize = size;
      this.pageNum = Math.min(this.pageNum, Math.ceil(this.total / size));
    },
    shouldFetchData () {
      this.pageNum = 1;
    },
    handleDel (host) {
      if (host === -1 && !this.deletion.length) {
        this.$Message.warning('请勾选要删除的主机！');
        return;
      }
      let hosts = [];
      if (host !== -1) {
        hosts.push(host);
      } else {
        hosts = this.deletion;
      }
      this.$Modal.confirm({
        title: `确定删除吗？`,
        onOk: () => {
            this.del(hosts);
          }
        });
    },
    del (hosts = []) {
      this.originData = this.originData.filter(item => !hosts.includes(item['assetServerUuid']));
      this.$emit('input', this.originData);
      this.shouldFetchData();
    }
  }
};
</script>

<style lang="scss">
.selected-server {
  .gs-table-pagination {
    .gs-select-wrap {
      line-height: 16px;
    }
  }
}
</style>
