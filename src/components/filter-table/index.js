import filterTable from './filter-table.vue';
import './style.scss';

/* istanbul ignore next */
filterTable.install = function (Vue) {
  Vue.component(filterTable.name, filterTable);
};

export default filterTable;
