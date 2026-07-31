// Vitest 全局 setup：Element Plus 与 gs-ui 兼容层需要真实的 DOM API
import { config } from '@vue/test-utils';

// happy-dom 缺少 scrollTo / ResizeObserver 等，Element Plus 组件用到
if (!window.scrollTo) window.scrollTo = () => {};
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!window.matchMedia) {
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
}
if (!window.getComputedStyle) {
  window.getComputedStyle = () => ({});
}

// Element Plus 弹出层 append 到 body，测试时定位 body
// happy-dom 对 el-table 虚拟滚动/列渲染支持不佳，单元测试统一 stub ElTable
// 表格的真实渲染行为由 Playwright E2E 覆盖
config.global.stubs = {
  transition: false,
  ElTable: {
    template: '<div class="el-table-stub"><slot /></div>',
    methods: { doLayout() {}, clearSelection() {}, toggleRowSelection() {} },
  },
  ElTableColumn: { template: '<div class="el-table-column-stub" />' },
};

// 默认不输出噪音警告（保存原始 console.warn 防止递归）
const originalWarn = globalThis.console.warn;
const originalError = globalThis.console.error;
globalThis.console.error = (...args) => {
  const msg = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
  // Element Plus 的 label-as-value 弃用警告是升级噪音，不影响功能
  if (/is about to be deprecated/.test(msg)) return;
  originalError(...args);
};
globalThis.console.warn = (...args) => {
  let msg;
  try {
    msg = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
  } catch (e) {
    msg = '';
  }
  if (/Cannot read propert|Failed to resolve|warning/i.test(msg)) return;
  originalWarn(...args);
};
