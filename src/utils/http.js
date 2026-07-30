import axios from 'axios';
import config from '@/config';
import router from '@/router';
import { Notification, Message } from '@gs-ui/gs-ui';
axios.defaults.baseURL = config.API_SERVER;

// token
axios.interceptors.request.use(req => {
  // const token = router.app.$store.getters['GET_TOKEN'];
  const token = localStorage.getItem('access_token');
  req.headers.Authorization = `Bearer ${token}`;
  return req;
});

axios.interceptors.response.use(undefined, err => {
  if (err) {
    if (err.response) {
      // 超时登录出现401
      if (err.response.status === 401) {
        window.location.href = `${config.GOD_URL}?formOrder=${window.location.href}`;
        // window.location.href = `http://localhost:8080?formOrder=${window.location.href}`;
        // Message.error('认证失效，请重新登录！');
        // setTimeout(() => {
        //   window.location.href = `${config.GOD_URL}/#/login`;
        //   window.location.href = `http://localhost:8080?formOrder=${window.location.href}`;
        // }, 1500);
      }
      // 退出登录时返回302
      if (err.response.status === 302 && err.response.config.url.indexOf('cmd=Logout') > -1) {
        const res = err.response.data;
        if (res.error_code === 0) {
          Message.success('已成功注销!', 2);
          setTimeout(_ => {
            window.location.href = `${config.GOD_URL}/#/login?formOrder=${window.location.href}`;
            // window.location.href = `http://localhost:8080/#/login?formOrder=${window.location.href}`;
          }, 1500);
        } else {
          Notification.error({
            title: '退出失败',
            desc: res.error_msg || '操作失败'
          });
        }
      }
    }
    return Promise.reject(err);
  }
});

axios.interceptors.response.use((res) => {
  return res.data;
});

export default axios;
