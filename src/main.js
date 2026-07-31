import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import * as service from '@/service/user';
import cfg from '@/config';
import components from '@/components';
import gsUiCompat from '@/stores/gs-ui-compat';
import '@/components/style/global.scss';

const URL = cfg.GOD_URL;

const app = createApp(App);
const pinia = createPinia();

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, { locale: zhCn });
app.use(pinia);
app.use(router);
app.use(gsUiCompat); // gs-ui → Element Plus 兼容层
app.use(components);

// 全局 has 方法
app.config.globalProperties.has = function () {
  const store = pinia._s.get('loginInfo');
  if (!store) return false;
  const user = store.userInfo;
  return user.isServiceAdmin;
};

new Promise(function (resolve, reject) {
  const url = window.location.href;
  if (url.indexOf('?code') === -1) {
    service.getUserInfo().then(res => {
      if (res.error_code === 0) {
        resolve();
      } else {
        window.location.href = `${URL}?formOrder=${window.location.href}`;
      }
    }).catch(() => {
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
}).then(function () {
  app.mount('#app');
});
