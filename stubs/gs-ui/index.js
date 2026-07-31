// Stub for @gs-ui/gs-ui — creates empty/dummy Vue components
// Each export is both a Vue component (has render) AND a Vue plugin (has install)
const kebab = (s) => s.replace(/([A-Z])/g, (m, c, i) => (i > 0 ? '-' : '') + m.toLowerCase());

function makeComponentDef(name) {
  return {
    name,
    functional: false,
    render(h) {
      // 渲染所有 slots（包括命名 slot）
      const children = [];
      const slots = this.$slots;
      for (const key of Object.keys(slots)) {
        children.push(...slots[key]);
      }
      return h('div', { class: `gs-stub gs-stub-${name}` }, children);
    },
    props: {
      value: {}, data: {}, options: {}, columns: {}, rules: {}, model: {}, config: {},
      gutter: {}, span: {}, filterable: Boolean, filterPlaceholder: String, filterMethod: Function,
      titles: Array, props: Object, renderItem: Function, noDataText: String,
      leftDefaultChecked: Array, rightDefaultChecked: Array, sortable: Boolean,
      textToChcked: Boolean, validateEvent: { type: Boolean, default: true },
      type: {}, disabled: Boolean, size: {}, trigger: {}, align: {}, placement: {},
      visible: {}, title: {}, isFixed: Boolean, label: {}, valueStr: {},
      // Generic catch-all for any other props
    }
  };
}

function makeComponent(name) {
  const tagName = `gs-${kebab(name)}`;
  const def = makeComponentDef(tagName);
  def.install = function(Vue) {
    Vue.component(tagName, def);
  };
  return def;
}

// ============= Simple components =============
exports.Layout = makeComponent('Layout');
exports.Button = makeComponent('Button');
exports.Input = makeComponent('Input');
exports.Radio = makeComponent('Radio');
exports.Form = makeComponent('Form');
exports.Search = makeComponent('Search');
exports.Popover = makeComponent('Popover');
exports.Scrollbar = makeComponent('Scrollbar');
exports.Switch = makeComponent('Switch');
exports.Tag = makeComponent('Tag');
exports.Menu = makeComponent('Menu');
exports.SubMenu = makeComponent('SubMenu');
exports.Header = makeComponent('Header');
exports.Progress = makeComponent('Progress');
exports.Icon = makeComponent('Icon');
exports.Steps = makeComponent('Steps');
exports.Select = makeComponent('Select');
exports.DatePicker = makeComponent('DatePicker');
exports.Mask = makeComponent('Mask');
exports.Table = makeComponent('Table');
exports.Tabs = makeComponent('Tabs');
exports.TabPane = makeComponent('TabPane');
exports.Pagination = makeComponent('Pagination');
exports.TableTags = makeComponent('TableTags');
exports.Tooltip = makeComponent('Tooltip');
exports.Checkbox = makeComponent('Checkbox');
exports.Tree = makeComponent('Tree');
exports.Collapse = makeComponent('Collapse');
exports.CascaderSelect = makeComponent('CascaderSelect');
exports.AutoComplete = makeComponent('AutoComplete');
exports.Loading = makeComponent('Loading');
exports.Badge = makeComponent('Badge');
exports.Timeline = makeComponent('Timeline');
exports.Upload = makeComponent('Upload');
exports.Cascader = makeComponent('Cascader');
exports.Transfer = makeComponent('Transfer');

// ============= Row/Col =============
exports.Row = makeComponent('Row');
exports.Col = makeComponent('Col');

// ============= Dropdown (multi-component) =============
const dropdownDef = makeComponentDef('gs-dropdown');
dropdownDef.render = function(h) {
  return h('div', { class: 'gs-stub-dropdown' }, [
    this.$slots.default,
    this.$slots.dropdown
  ]);
};
dropdownDef.install = function(Vue) {
  Vue.component('gs-dropdown', dropdownDef);
  Vue.component('gs-dropdown-menu', makeComponentDef('gs-dropdown-menu'));
  Vue.component('gs-dropdown-items', makeComponentDef('gs-dropdown-items'));
};
exports.Dropdown = dropdownDef;

// ============= Modal =============
const modalDef = {
  name: 'gs-modal',
  render(h) {
    return h('div', { class: 'gs-stub-modal' }, this.$slots.default);
  },
  install(Vue) {
    Vue.component('gs-modal', modalDef);
    Vue.prototype.$Modal = {
      confirm({ title, onOk }) {
        if (typeof window !== 'undefined' && window.confirm(title || '确认?')) {
          if (onOk) onOk();
        }
      }
    };
  }
};
exports.Modal = modalDef;

// ============= Notification (plugin only, no component) =============
exports.Notification = {
  name: 'gs-notification',
  render(h) { return h('div', this.$slots.default); },
  install(Vue) {
    Vue.component('gs-notification', this);
    Vue.prototype.$Notification = {
      error(opts) { console.warn('[Notification.error]', opts); }
    };
    Vue.prototype.$notify = {
      error(opts) { console.warn('[notify.error]', opts); }
    };
  }
};

// ============= Message (plugin only, no component) =============
exports.Message = {
  name: 'gs-message',
  render(h) { return h('div', this.$slots.default); },
  install(Vue) {
    Vue.component('gs-message', this);
    Vue.prototype.$Message = {
      success(msg, duration) { console.log('[Message.success]', msg); },
      error(msg, duration) { console.error('[Message.error]', msg); },
      warning(msg, duration) { console.warn('[Message.warning]', msg); },
      info(msg, duration) { console.info('[Message.info]', msg); }
    };
  }
};
