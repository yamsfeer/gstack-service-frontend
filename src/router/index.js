import { createRouter, createWebHashHistory } from 'vue-router';
import config from './config';

function startWithRoot(path) {
  return /^\/.*/.test(path);
}

function createRoute(routeConfig, path, children) {
  const { title, component, meta = {} } = routeConfig;
  return { name: path, path, component, children, meta: { ...meta, title } };
}

function travelLayouts(layouts, prefix = '') {
  let routes = [];
  let menus = [];

  layouts.forEach(layout => {
    let { children, path, component } = layout;
    let newPath = path;
    let childRoutes = [];

    if (!startWithRoot(path)) {
      newPath = prefix + (path ? `/${path}` : '');
    }

    if (children) {
      let result = travelLayouts(children, newPath);
      childRoutes = result.routes;
      layout.children = result.menus;
    }

    if (path && component) {
      routes.push(createRoute(layout, newPath, childRoutes));
    } else {
      routes = routes.concat(childRoutes);
    }
    layout.path = newPath;
    menus.push(layout);
  });

  return { routes, menus };
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
  { path: '/:pathMatch(.*)*', redirect: '/main/order/apply' },
];

export const menus = createMenus(config);

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
