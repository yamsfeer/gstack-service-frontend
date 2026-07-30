<template>
  <gs-table
    :data="tableData"
    ref="gsmultipleTable"
    :default-sort="defaultSort"
    @sort-change="sortChange"
    @selection-change="selectionChange"
    paging
    :stripe="false"
    :row-key="rowKey"
    :row-class-name="rowClassName"
    :row-style="rowStyle"
    :pagination="pagination"
    :expand-row-keys="expandRowKeys"
    @row-click="rowClick"
    @cell-click="cellClick"
    @page-change="handleCurrentChange"
    @size-change="handlePageSizeChange"
    :height="height"
  >
    <slot></slot>
  </gs-table>
</template>
<script>
export default {
  name: 'GsServerTable',
  data() {
    return {
      pagination: {
        pageSizes: this.sizeTypes,
        pageSize: this.pageSize,
        current: this.pageNumber,
        total: this.totalNum,
        layout: 'pagesizes,total,pager,jumper,jumpbtn'
      }
    };
  },
  props: {
    tableData: {
      type: Array,
      required: true
    },
    expandRowKeys: {
      type: Array,
      default() {
        return [];
      }
    },
    rowKey: [Function, String],
    rowClassName: [Function, String],
    rowStyle: [Function, Object],
    defaultSort: {
      type: Object,
      default() {
        return {};
      }
    },
    totalNum: {
      type: Number,
      required: true
    },
    sizeTypes: {
      type: Array,
      default() {
        return [5, 10, 20, 50];
      }
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageNumber: {
      type: Number,
      default: 1
    },
    height: {
      type: [String, Number],
      default: ''
    }
  },
  watch: {
    sizeTypes(val) {
      this.pagination.pageSizes = val;
    },
    pageSize(val) {
      this.pagination.pageSize = val;
    },
    pageNumber(val) {
      this.pagination.current = val;
    },
    totalNum(val) {
      this.pagination.total = val;
    }
  },
  methods: {
    sortChange(obj) {
      this.$emit('sortChange', obj);
    },
    selectionChange(val) {
      this.$emit('selectionChange', val);
    },
    rowClick(row, event) {
      this.$emit('rowClick', row, event);
    },
    cellClick(row, column, cell, event) {
      this.$emit('cellClick', row, column, cell, event);
    },
    handleCurrentChange(val) {
      this.$emit('currentChange', val, this.pageSize);
    },
    handlePageSizeChange(val) {
      this.$emit('sizeChange', val, this.pageNumber);
    }
  }
};
</script>
