export default {
  data() {
    return {
      mutiIdKey: 'id',
      selected: [],
      rows: [],
    };
  },
  methods: {
    rowKey(row) {
      return row[this.mutiIdKey];
    },
    handleMutiSelect(selected) {
      this.selected = selected;
    },
    handleMutiOperation(
      row,
      useConfirm = true,
      emptyText = '请勾选要删除的选项！',
      confirmText = '是否确定删除？',
    ) {
      const isMuti = row === undefined;

      if (isMuti && !this.selected.length) {
        return new Promise((resolve, reject) => {
          this.$message.warning(emptyText);
          reject('has not selected');
        });
      }

      if (isMuti) {
        this.rows = [...this.selected];
      } else {
        this.rows = [row];
      }

      if (!useConfirm) {
        return Promise.resolve(this.rows);
      }

      return this.$confirm(confirmText, '提示', { type: 'warning' }).then(
        () => this.rows,
      );
    },
    clearSelection() {
      this.$refs.gsServerTable.$refs.gsmultipleTable.clearSelection();
    },
  },
};
