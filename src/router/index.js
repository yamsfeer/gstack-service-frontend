import Vue from 'vue';
import Router from 'vue-router';
import config from './config';

Vue.use(Router);

function startWithRoot(path) {
  return /^\/.*/.test(path);
}

function createRoute(routeConfig, path, children) {
  const {
    title,
    component,
    meta = {}
  } = routeConfig;

  return {
    name: path,
    path,
    component,
    children,
    meta: {
      ...meta,
      title
    }
  };
}

function travelLayouts(layouts, prefix = '') {
  let routes = [];
  let menus = [];

  layouts.forEach(layout => {
    let {
      children,
      path,
      component
    } = layout;
    let newPath = path;
    let childRoutes = [];

    // 如果不是以根路径开头
    if (!startWithRoot(path)) {
      newPath = prefix + (path ? `/${path}` : '');
    }

    // 处理嵌套路由
    if (children) {
      let result = travelLayouts(children, newPath);
      childRoutes = result.routes;
      layout.children = result.menus;
    }

    // 如果是路由组件
    if (path && component) {
      routes.push(createRoute(layout, newPath, childRoutes));
    } else {
      routes = routes.concat(childRoutes);
    }
    layout.path = newPath;
    menus.push(layout);
  });

  return {
    routes,
    menus
  };
}

function createRoutes(layoutConfig) {
  const layoutTypes = Object.keys(layoutConfig);
  let routes = [];

  layoutTypes.forEach(layout => {
    const result = travelLayouts([layoutConfig[layout]]);
    routes = routes.concat(result.routes);
  });

  return routes;
}

function createMenus(layoutConfig) {
  const result = travelLayouts([layoutConfig.basicLayout]);

  return result.menus;
}

export const routes = [
  ...createRoutes(config),
  {
    path: '*',
    redirect: '/main/order/apply'
  }
];

export const menus = createMenus(config);

const router = new Router({
  routes: routes
});

// router.beforeEach((to, from, next) => {
//   const app = router.app;
//   const url = window.location.href;
//   if (url.indexOf('?code=') > -1) {
//     const search = url.split('?')[1];
//     const [key, code] = search.split('=');
//     if (key === 'code') {
//       service.getAuthToken({code}).then(res => {
//         localStorage.setItem('access_token', res.data['access_token']);
//         app.$store.commit('UPDATE_TOKEN', res.data['access_token']);
//         next();
//       });
//     }
//   } else {
//     let token = app.$store.getters['GET_TOKEN'];
//     let user = app.$store.getters['GET_USER_INFO'];
//     if (!token) {
//       token = localStorage.getItem('access_token');
//       app.$store.commit('UPDATE_TOKEN', token);
//     }
//     if (user.username) {
//       next();
//     } else {
//       service.getUserInfo().then(res => {
//         if (res.error_code === 0) {
//           user = res.data.user || {};
//           app.$store.commit('UPDATE_USER_INFO', user);
//           next();
//         } else {
//           window.location.href = `${URL}/#/login`;
//         }
//       });
//     }
//   }
// });

export default router;
