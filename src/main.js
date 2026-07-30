import Vue from 'vue';
import router from './router';
import store from './store';
import {
  Layout,
  Button,
  Input,
  Radio,
  Form,
  Search,
  Popover,
  Scrollbar,
  Switch,
  Tag,
  Menu,
  SubMenu,
  Header,
  Progress,
  Dropdown,
  Icon,
  Steps,
  Modal,
  Select,
  DatePicker,
  Mask,
  Table,
  Tabs,
  TabPane,
  Pagination,
  TableTags,
  Tooltip,
  Checkbox,
  Tree,
  Collapse,
  Row,
  Col,
  CascaderSelect,
  AutoComplete,
  Loading,
  Notification,
  Badge,
  Timeline,
  Upload,
  Message,
  Cascader,
  Transfer,
} from '@gs-ui/gs-ui';
import App from './App.vue';
import { debounce } from '@/utils/utils';
import * as service from '@/service/user';
import cfg from '@/config';
import components from '@/components';
import '@/components/style/global.scss';

const URL = cfg.GOD_URL;
Vue.config.productionTip = false;

/* import from gs-ui */
Vue.use(Layout);
Vue.use(Icon);
Vue.use(Button);
Vue.use(Steps);
Vue.use(Input);
Vue.use(Radio);
Vue.use(Progress);
Vue.use(Form);
Vue.use(Tag);
Vue.use(Search);
Vue.use(Popover);
Vue.use(Scrollbar);
Vue.use(Switch);
Vue.use(Menu);
Vue.use(SubMenu);
Vue.use(Header);
Vue.use(Dropdown);
Vue.use(Modal);
Vue.use(DatePicker);
Vue.use(Select);
Vue.use(Mask);
Vue.use(Table);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Pagination);
Vue.use(TableTags);
Vue.use(Tooltip);
Vue.use(Checkbox);
Vue.use(Tree);
Vue.use(Collapse);
Vue.use(Row);
Vue.use(Col);
Vue.use(CascaderSelect);
Vue.use(AutoComplete);
Vue.use(Loading);
Vue.use(Notification);
Vue.use(Badge);
Vue.use(Timeline);
Vue.use(Upload);
Vue.use(Message);
Vue.use(Cascader);
Vue.use(Transfer);

Vue.use(components);

// Vue.directive('disableClick', {
//   bind(el, binding, vnode) {
//     const defaultTimeout = 1000;
//     el.addEventListener('click', () => {
//       if (el.disabled) {
//         return;
//       }

//       el.disabled = true;
//       setTimeout(() => {
//         el.disabled = false;
//       }, binding.value || defaultTimeout);
//     });
//   }
// });

// Vue.directive('debounceClick', {
//   bind(el, binding) {
//     const fn = debounce(binding.arg || 500, binding.value);
//     el.addEventListener('click', () => fn());
//   }
// });

// Vue.directive('has', (el, binding, vnode) => {
//   const user = vnode.context.$store.getters.GET_USER_INFO;
//   const isServiceAdmin = user.isServiceAdmin;
//   if (!isServiceAdmin) {
//     el.parentNode && el.parentNode.removeChild(el);
//   }
// });

// v-if 和 disabled 的指令使用
Vue.prototype.has = function () {
  const user = this.$store.getters.GET_USER_INFO;
  const isServiceAdmin = user.isServiceAdmin;
  return isServiceAdmin;
};

new Promise(function (resolve, reject) {
  const url = window.location.href;
  if (url.indexOf('?code') === -1) {
    service.getUserInfo().then(res => {
      if (res.error_code === 0) {
        resolve();
      } else {
        // window.location.href = `http://localhost:8080?formOrder=${window.location.href}`;
        window.location.href = `${URL}?formOrder=${window.location.href}`;
      }
    }).catch(res => {
      // window.location.href = `http://localhost:8080?formOrder=${window.location.href}`;
      window.location.href = `${URL}?formOrder=${window.location.href}`;
    });
  } else {
    const search = url.split('?')[1];
    const [key, code] = search.split('=');
    service.getAuthToken({ code }).then(res => {
      localStorage.setItem('access_token', res.data['access_token']);
      window.location.href = url.split('?code=')[0];
      resolve();
    });
  }
}).then(function (r) {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
});

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app');
