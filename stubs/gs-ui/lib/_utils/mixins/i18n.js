// Stub for @gs-ui/gs-ui/lib/_utils/mixins/i18n
const DEFAULT_LANG = 'zh-CN';

const zhCN = {
  'gs.transfer.leftTitle': '待选项',
  'gs.transfer.rightTitle': '已选项',
  'gs.transfer.noDataText': '暂无数据',
  'gs.transfer.placeholder': '请输入搜索内容',
  'gs.select.noDataText': '暂无数据',
  'gs.select.placeholder': '请选择',
  'gs.cascader.noDataText': '暂无数据',
  'gs.cascader.placeholder': '请选择',
  'gs.datepicker.placeholder': '请选择日期',
  'gs.datepicker.rangePlaceholder': ['开始日期', '结束日期'],
  'gs.pagination.total': '共 {total} 条',
  'gs.pagination.goTo': '跳至',
  'gs.pagination.page': '页',
  'gs.table.emptyText': '暂无数据',
};

export default {
  methods: {
    gsi18n(key) {
      return zhCN[key] || key;
    }
  }
};
