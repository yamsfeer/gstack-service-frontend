import RadioButton from './radio-button';
import QueryTable from './query-table';
import FilterTable from './filter-table';
import FilterTableItem from './filter-table/filter-table-item';
import ServerTable from './server-table';
import WordLimit from './word-limit';
import TablePage from './table-page';
import ColConfig from './col-config';
import transfer from './transfer';

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

const install = (Vue, opt = {}) => {
  if (install.installed) {
    return;
  }
  components.map(component => {
    Vue.component(component.name, component);
  });
};

export default install;
