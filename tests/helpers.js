// 组件测试辅助：统一的挂载环境（Element Plus + gs-ui 兼容层 + 组件库 + Pinia）
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia, getActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';

/**
 * 创建带完整插件环境的测试挂载器
 * @param {Object} component 待挂载组件
 * @param {Object} options mount options（可覆盖 global）
 * 若已有 active pinia（如测试里已初始化 store）则复用，否则新建
 */
export function createMounter(component, options = {}) {
  const pinia = getActivePinia() || createPinia();
  setActivePinia(pinia);
  const global = {
    plugins: [ElementPlus, gsUiCompat, components, pinia],
    stubs: {
      transition: false,
      'router-link': { template: '<a :href="to"><slot /></a>' },
      'router-view': { template: '<div class="router-view-stub" />' },
      ...(options.global && options.global.stubs),
    },
    mocks: {
      $router: {
        push: () => {},
      },
      $route: {
        params: {},
        query: {},
        path: '/main',
        meta: {},
      },
      ...(options.global && options.global.mocks),
    },
    ...(options.global && options.global),
  };
  return mount(component, { ...options, global });
}

// 便捷的响应式等待
export function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// 等待 debounce / setTimeout 完成
export function wait(ms = 50) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
