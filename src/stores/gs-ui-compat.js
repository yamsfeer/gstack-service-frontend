// Element Plus compatibility — registers el-* components as gs-* aliases
// so old templates using <gs-button>, <gs-table> etc. work without changes

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
  'gs-switch': ElSwitch,
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
  'gs-modal': ElDialog,
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
  'gs-textarea': ElInput, // gs-textarea → el-input with type="textarea"
  'gs-search': ElInput,
  'gs-header': { template: '<div class="gs-header-stub"><slot /></div>' },
  'gs-layout': { template: '<div class="gs-layout-stub"><slot /></div>' },
  'gs-icon': { template: '<i class="gs-icon-stub"><slot /></i>' },
  'gs-mask': { template: '<div class="gs-mask-stub"><slot /></div>' },
  'gs-table-tags': { template: '<div class="gs-table-tags-stub"><slot /></div>' },
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
