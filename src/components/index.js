import RadioButton from './radio-button/index.js';
import QueryTable from './query-table.vue';
import FilterTable from './filter-table/index.js';
import FilterTableItem from './filter-table/filter-table-item.vue';
import ServerTable from './server-table.vue';
import WordLimit from './word-limit.vue';
import TablePage from './table-page.vue';
import ColConfig from './col-config.vue';
import transfer from './transfer/index.js';

const components = [
  RadioButton,
  QueryTable,
  FilterTable,
  FilterTableItem,
  ServerTable,
  WordLimit,
  TablePage,
  ColConfig,
  transfer,
];

const INSTALLED_KEY = Symbol('gs-components-installed');

const install = (app, opt = {}) => {
  // 按 app 实例标记，避免同一实例重复安装，同时支持多实例（测试环境）
  if (app._context.provides[INSTALLED_KEY]) return;
  app._context.provides[INSTALLED_KEY] = true;
  components.forEach(component => {
    if (component && component.name) {
      app.component(component.name, component);
    }
  });
};

export default install;
