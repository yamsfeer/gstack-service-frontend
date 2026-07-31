// Element Plus compatibility — registers el-* components as gs-* aliases
// so old templates using <gs-button>, <gs-table> etc. work without changes

import { h } from 'vue';
import {
  ElButton, ElInput, ElRadio, ElRadioGroup, ElForm, ElFormItem,
  ElPopover, ElScrollbar, ElSwitch, ElTag, ElMenu, ElSubMenu,
  ElMenuItem, ElMenuItemGroup, ElProgress, ElDropdown, ElDropdownMenu,
  ElDropdownItem, ElSteps, ElStep, ElDialog, ElSelect, ElOption,
  ElDatePicker, ElTable, ElTableColumn, ElTabs, ElTabPane,
  ElPagination, ElTooltip, ElCheckbox, ElTree, ElCollapse,
  ElCollapseItem, ElRow, ElCol, ElCascader, ElAutocomplete,
  ElBadge, ElTimeline, ElTimelineItem, ElUpload,
  ElCascaderPanel, ElTransfer, ElInputNumber,
  ElBreadcrumb, ElBreadcrumbItem, ElCard, ElCarousel,
  ElCarouselItem, ElDivider, ElImage, ElLink,
  ElPageHeader, ElRate, ElResult, ElSkeleton,
  ElSpace, ElText, ElAvatar, ElColorPicker,
  ElDescriptions, ElDescriptionsItem, ElEmpty, ElStatistic,
  ElAlert, ElDrawer, ElLoading,
} from 'element-plus';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';

// gs-switch 兼容包装：旧 gs-switch 用 on-value/off-value 控制开关值，
// ElSwitch 对应 prop 名为 active-value/inactive-value。直接映射时字符串值
// 会被 ElSwitch 视为非法并自动 emit change（导致页面加载时误弹确认框）
const GsSwitch = {
  name: 'GsSwitch',
  props: {
    value: [Boolean, String, Number],
    modelValue: [Boolean, String, Number],
    onValue: [Boolean, String, Number],
    offValue: [Boolean, String, Number],
  },
  emits: ['input', 'update:modelValue', 'change'],
  computed: {
    valueModel: {
      get() {
        return this.modelValue !== undefined ? this.modelValue : this.value;
      },
      set(val) {
        this.$emit('update:modelValue', val);
        this.$emit('input', val);
      },
    },
  },
  render() {
    return h(ElSwitch, {
      ...this.$attrs,
      modelValue: this.valueModel,
      'onUpdate:modelValue': v => {
        this.valueModel = v;
      },
      activeValue: this.onValue !== undefined ? this.onValue : true,
      inactiveValue: this.offValue !== undefined ? this.offValue : false,
      onChange: v => this.$emit('change', v),
    });
  },
};

// gs-textarea 兼容包装：旧 gs-textarea 就是多行文本框，映射到 el-input 必须指定 type
const GsTextarea = {
  name: 'GsTextarea',
  props: {
    value: [String, Number],
    modelValue: [String, Number],
    disabled: Boolean,
    placeholder: String,
    maxlength: Number,
    rows: [Number, String],
    autosize: [Boolean, Object],
    resize: String,
  },
  emits: ['input', 'update:modelValue', 'change', 'blur', 'focus'],
  computed: {
    valueModel: {
      get() {
        return this.modelValue !== undefined ? this.modelValue : this.value;
      },
      set(val) {
        this.$emit('update:modelValue', val);
        this.$emit('input', val);
      },
    },
  },
  render() {
    return h(ElInput, {
      type: 'textarea',
      modelValue: this.valueModel,
      'onUpdate:modelValue': v => {
        this.valueModel = v;
      },
      disabled: this.disabled,
      placeholder: this.placeholder,
      maxlength: this.maxlength,
      rows: this.rows,
      autosize: this.autosize,
      resize: this.resize,
    });
  },
};

// gs-modal 兼容包装：旧代码用 :value 控制显示，ElDialog 只认 modelValue
// 并还原 gs-ui 的 footer 确定/取消按钮，分别触发 @confirm / @cancel
const GsModal = {
  name: 'GsModal',
  props: {
    value: Boolean,
    title: String,
    width: [String, Number],
    top: String,
    'has-form': Boolean,
    beforeClose: Function,
    class: String,
  },
  emits: ['update:value', 'update:visible', 'confirm', 'cancel'],
  computed: {
    modelValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('update:value', val);
        this.$emit('update:visible', val);
      },
    },
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    },
  },
  render() {
    const footer = this.$slots.footer
      ? this.$slots.footer()
      : [
          h(ElButton, { onClick: () => this.handleCancel() }, () => '取消'),
          h(ElButton, { type: 'primary', onClick: () => this.handleConfirm() }, () => '确定'),
        ];
    return h(
      ElDialog,
      {
        modelValue: this.modelValue,
        'onUpdate:modelValue': v => {
          this.modelValue = v;
        },
        title: this.title,
        width: this.width,
        top: this.top,
        beforeClose: this.beforeClose,
      },
      {
        default: () => this.$slots.default ? this.$slots.default() : null,
        footer: () => footer,
      }
    );
  },
};

// Map old gs component names to Element Plus components
const componentMap = {
  'gs-button': ElButton,
  'gs-input': ElInput,
  'gs-radio': ElRadio,
  'gs-radio-group': ElRadioGroup,
  'gs-form': ElForm,
  'gs-form-item': ElFormItem,
  'gs-popover': ElPopover,
  'gs-scrollbar': ElScrollbar,
  'gs-switch': GsSwitch,
  'gs-tag': ElTag,
  'gs-menu': ElMenu,
  'gs-sub-menu': ElSubMenu,
  'gs-menu-item': ElMenuItem,
  'gs-menu-item-group': ElMenuItemGroup,
  'gs-progress': ElProgress,
  'gs-dropdown': ElDropdown,
  'gs-dropdown-menu': ElDropdownMenu,
  'gs-dropdown-items': ElDropdownItem,
  'gs-dropdown-item': ElDropdownItem,
  'gs-steps': ElSteps,
  'gs-step': ElStep,
  'gs-modal': GsModal,
  'gs-select': ElSelect,
  'gs-option': ElOption,
  'gs-date-picker': ElDatePicker,
  'gs-table': ElTable,
  'gs-table-column': ElTableColumn,
  'gs-tabs': ElTabs,
  'gs-tab-pane': ElTabPane,
  'gs-pagination': ElPagination,
  'gs-tooltip': ElTooltip,
  'gs-checkbox': ElCheckbox,
  'gs-tree': ElTree,
  'gs-collapse': ElCollapse,
  'gs-collapse-item': ElCollapseItem,
  'gs-row': ElRow,
  'gs-col': ElCol,
  'gs-cascader-select': ElCascader,
  'gs-cascader': ElCascader,
  'gs-auto-complete': ElAutocomplete,
  'gs-badge': ElBadge,
  'gs-timeline': ElTimeline,
  'gs-timeline-item': ElTimelineItem,
  'gs-upload': ElUpload,
  'gs-transfer': ElTransfer,
  'gs-input-number': ElInputNumber,
  'gs-breadcrumb': ElBreadcrumb,
  'gs-breadcrumb-item': ElBreadcrumbItem,
  'gs-card': ElCard,
  'gs-divider': ElDivider,
  'gs-link': ElLink,
  'gs-rate': ElRate,
  'gs-alert': ElAlert,
  'gs-drawer': ElDrawer,
  'gs-space': ElSpace,
  'gs-empty': ElEmpty,
  'gs-avatar': ElAvatar,
  'gs-skeleton': ElSkeleton,
  'gs-descriptions': ElDescriptions,
  'gs-descriptions-item': ElDescriptionsItem,
  'gs-textarea': GsTextarea, // gs-textarea → el-input type="textarea"
  'gs-search': ElInput,
  'gs-header': { name: 'GsHeaderStub', render() { return h('div', { class: 'gs-header-stub' }, this.$slots.default ? this.$slots.default() : null); } },
  'gs-layout': { name: 'GsLayoutStub', render() { return h('div', { class: 'gs-layout-stub' }, this.$slots.default ? this.$slots.default() : null); } },
  'gs-icon': { name: 'GsIconStub', render() { return h('i', { class: 'gs-icon-stub' }, this.$slots.default ? this.$slots.default() : null); } },
  'gs-mask': { name: 'GsMaskStub', render() { return h('div', { class: 'gs-mask-stub' }, this.$slots.default ? this.$slots.default() : null); } },
  'gs-table-tags': { name: 'GsTableTagsStub', render() { return h('div', { class: 'gs-table-tags-stub' }, this.$slots.default ? this.$slots.default() : null); } },
  'gs-loading': ElLoading, // v-loading directive
};

export default {
  install(app) {
    // Register all component aliases
    Object.entries(componentMap).forEach(([name, component]) => {
      app.component(name, component);
    });

    // Also register loading directive
    app.directive('loading', ElLoading);

    // Global methods
    app.config.globalProperties.$Modal = {
      confirm({ title, onOk, onCancel, modalProps }) {
        ElMessageBox.confirm(title || '确认?', '提示', {
          confirmButtonText: modalProps?.['confirm-text'] || '确定',
          cancelButtonText: modalProps?.['cancel-text'] || '取消',
          type: 'warning',
        }).then(() => {
          if (onOk) onOk();
        }).catch(() => {
          if (onCancel) onCancel();
        });
      },
    };

    app.config.globalProperties.$Message = {
      success(msg) { ElMessage.success(msg); },
      error(msg) { ElMessage.error(msg); },
      warning(msg) { ElMessage.warning(msg); },
      info(msg) { ElMessage.info(msg); },
    };

    app.config.globalProperties.$Notification = {
      error(opts) {
        ElNotification({
          title: opts.title || '错误',
          message: opts.desc || '',
          type: 'error',
        });
      },
    };

    app.config.globalProperties.$notify = {
      error(opts) {
        ElNotification({
          title: opts.title || '错误',
          message: opts.desc || '',
          type: 'error',
        });
      },
    };

    app.config.globalProperties.$Notify = {
      error(opts) {
        ElNotification({
          title: opts.title || '错误',
          message: opts.desc || '',
          type: 'error',
        });
      },
    };
  },
};
