import axios from 'axios';
import config from '@/config';
import { ElNotification, ElMessage } from 'element-plus';

axios.defaults.baseURL = config.API_SERVER;

// token
axios.interceptors.request.use(req => {
  const token = localStorage.getItem('access_token');
  req.headers.Authorization = `Bearer ${token}`;
  return req;
});

axios.interceptors.response.use(undefined, err => {
  if (err) {
    if (err.response) {
      if (err.response.status === 401) {
        window.location.href = `${config.GOD_URL}?formOrder=${window.location.href}`;
      }
      if (err.response.status === 302 && err.response.config.url.indexOf('cmd=Logout') > -1) {
        const res = err.response.data;
        if (res.error_code === 0) {
          ElMessage.success('已成功注销!');
          setTimeout(() => {
            window.location.href = `${config.GOD_URL}/#/login?formOrder=${window.location.href}`;
          }, 1500);
        } else {
          ElNotification({
            title: '退出失败',
            message: res.error_msg || '操作失败',
            type: 'error',
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
