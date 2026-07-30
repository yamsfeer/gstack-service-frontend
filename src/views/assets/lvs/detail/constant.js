import moment from 'moment';

export const keyMap = {
  base: {
    label: '基本属性',
    prop: [
      {
        key: 'instanceName',
        label: '实例名'
      },
      {
        key: 'owner',
        label: '申请人'
      },
      {
        key: 'dateCreated',
        label: '开通日期',
        display: 'date',
        disClearable: true,
        defaultValue: moment(new Date())
      },
      {
        key: 'product',
        label: '产品线',
        display: 'select',
        optionKey: 'products'
      },
      {
        key: 'subNet',
        label: '所在网络',
        display: 'select',
        optionKey: 'subNets'
      },
      {
        key: 'publicVip',
        label: '公网虚IP',
        modalType: 'ip',
        display: 'search'
      },
      {
        key: 'assetLbGroup',
        label: '所在负载均衡集群',
        modalType: 'lbgroup',
        display: 'search'
      },
      {
        key: 'directorMasterUuid',
        label: '主负载均衡分发器',
        disabled: true
      },
      {
        key: 'publicRouterId',
        label: '公网RouteID'
      },
      {
        key: 'lbAlgo',
        label: '轮询算法',
        display: 'select',
        option: ['rr', 'sh']
      },
      {
        key: 'checkMethod',
        label: '后端健康检查方式',
        display: 'select',
        option: ['TCP_CHRCK', 'HTTP_GET']
      },
      {
        key: 'peakPredictionInMbps',
        label: '预估使用带宽',
        unit: 'mbps'
      },
      {
        key: 'portList',
        label: '开放端口列表',
        display: 'prot',
        isAdd: true,
        type: 'jsonString',
        width: 24
      },
      {
        key: 'usage',
        label: '描述',
        width: 24,
        display: 'textarea'
      }
    ]
  },
  member: {
    label: '后端主机列表',
    prop: [
      {
        key: 'rsUuidList',
        label: '',
        type: 'jsonString',
        display: 'table',
        modalType: 'server',
        width: 24,
        isAdd: true,
        isDelete: true,
        columns: [
          {
            label: '主机名',
            prop: 'logicalHostName',
            type: 'text'
          },
          {
            label: '服务器类型',
            prop: 'assetServerType',
            type: 'text'
          },
          {
            label: '业务等级',
            prop: 'assetLevel',
            type: 'text'
          },
          {
            label: '宿主机',
            prop: 'logicalHostMachine',
            type: 'text'
          },
          {
            label: '管理IP',
            prop: 'logicalIp',
            type: 'text'
          }
        ]
      }
    ]
  }
};
