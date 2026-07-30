export const serviceType = [
  {
    icon: 'gs-icon-cloud-upload',
    color: '#a894f6',
    label: '云主机服务',
    id: 1
  }
];

export const serviceOptions = [
  {
    id: 1,
    name: 'vm',
    type: 1,
    title: '虚拟机',
    desc: '申请虚拟机资源'
  },
  {
    id: 4,
    name: 'lvs',
    type: 1,
    title: '被公网访问',
    desc: '申请允许服务被外网访问'
  },
  {
    id: 3,
    name: 'nat',
    type: 1,
    title: '主动访问公网',
    desc: '申请允许服务主动访问外网'
  },
  {
    id: 5,
    name: 'dns',
    type: 1,
    title: 'DNS',
    desc: '申请域名资源'
  },
  {
    id: 2,
    name: 'vmDelete',
    type: 1,
    title: '虚拟机删除',
    desc: '申请删除虚拟机资源'
  }
];

// 状态，详情参照：{"待处理": 1, "审核中": 2, "待开通"： 3, "开通中": 4, "开通待重试": 5, "录入中": 6, "录入待重试": 7, "废弃中":8 , "废弃待重试":9, "已完成": 10, "已废弃": 11}
export const OrderState = ['', '待处理', '审核中', '待开通', '开通中', '待重试', '开通中', '待重试', '废弃中', '待重试', '已完成', '已废弃'];

// 动作
export const OrderAction = ['', '同意', '驳回', '开通', '开通失败确认', '开通成功确认', '重试', '重试失败确认', '重试成功确认', '录入', '录入失败确认', '录入成功确认', '丢弃', '丢弃失败确认', '丢弃成功确认'];

// 状态与前端文字显示的对应
export const stateTextMap = [
  {
    text: '待处理',
    state: [1],
    color: 'warning'
  },
  {
    text: '审核中',
    state: [2],
    color: 'primary'
  },
  {
    text: '待开通',
    state: [3],
    color: 'primary'
  },
  {
    text: '待重试',
    state: [5, 7, 9],
    color: 'warning'
  },
  {
    text: '开通中',
    state: [4, 6],
    color: 'primary'
  },
  {
    text: '废弃中',
    state: [8],
    color: 'warning'
  },
  {
    text: '已完成',
    state: [10],
    color: 'success'
  },
  {
    text: '已废弃',
    state: [11],
    color: 'danger'
  }
];

export const statesMap = {
  PENDING: 1,
  REVIEWING: 2,
  TO_OPENED: 3,
  OPENING: 4,
  OPENING_TO_RETRY: 5,
  ENTERING: 6,
  ENTERING_TO_RETRY: 7,
  ABANDONED: 8,
  ABANDONED_TO_RETRY: 9,
  COMPLETED: 10,
  DEPRECATED: 11
};

export const actionMap = {
  'agree': 1,
  'reject': 2,
  'open': 3,
  'provideFailConfirm': 4,
  'openSuccessConfirm': 5,
  'retry': 6,
  'retryFailedConfirm': 7,
  'retrySuccessConfirm': 8,
  'enter': 9,
  'enterFailConfirm ': 10,
  'enterSuccessConfirm': 11,
  'drop': 12,
  'dropFailConfirm': 13,
  'discardSuccessConfirm': 14
};

/* 工单11种状态 简化成5步 第5步有已完成和已废弃两种状态 */
export const steps = ['待处理', '审核中', '待开通', '开通中', '已完成'];

/* 工单审核5步 [`1-1`, `2-2`, '3-3', `4-9`, `10-11`] */
export const seperators = [
  statesMap.PENDING,
  statesMap.REVIEWING,
  statesMap.TO_OPENED,
  statesMap.ABANDONED_TO_RETRY,
  statesMap.DEPRECATED
];
