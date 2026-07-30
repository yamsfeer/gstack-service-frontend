export default {
  data() {
    return {
      idKey: 'id',
      tableData: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      orderBy: '',
      orderMethod: '',
    };
  },
  methods: {
    rowKey(row) {
      return row[this.idKey];
    },
    getTableList() {
      this.tableData = [];
    },
    currentChange(pageNum) {
      this.pageNum = pageNum;
      this.getTableList();
    },
    sizeChange(size) {
      this.pageSize = size;
      this.pageNum = Math.min(this.pageNum, Math.ceil(this.total / size));
      this.getTableList();
    },
    sortChange({ order, prop }) {
      this.orderBy = prop;
      this.orderMethod = order === 'ascending' ? 'asc' : 'desc';
      this.fetchTable();
    },
    fetchTable() {
      this.pageNum = 1;
      this.getTableList();
    },
  },
};
