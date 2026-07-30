import moment from 'moment';

export const keyMap = {
  base: {
    label: '基本属性',
    prop: [
      {
        key: 'groupName',
        label: '负载均衡集群名'
      },
      {
        key: 'product',
        label: '产品线',
        display: 'select',
        optionKey: 'products'
      },
      {
        key: 'dateCreated',
        label: '创建时间',
        display: 'date',
        disClearable: true,
        defaultValue: moment(new Date())
      },
      {
        key: 'idc',
        label: '所在机房',
        display: 'select',
        optionKey: 'idcs',
        disabledKey: 'memberHostList'
      },
      {
        key: 'subNet',
        label: '所在网络',
        display: 'select',
        optionKey: 'subNets',
        // 当form.memberHostList.length > 0 时禁用
        disabledKey: 'memberHostList'
      },
      {
        key: 'usage',
        label: '服务器描述',
        width: 24,
        display: 'textarea'
      }
    ]
  },
  member: {
    label: '成员主机',
    prop: [
      {
        key: 'memberHostList',
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
            label: '管理IP',
            prop: 'logicalIp',
            type: 'text'
          }
        ]
      }
    ]
  },
  vip: {
    label: '成员私网VIP',
    prop: [
      {
        key: 'privateVipList',
        label: '',
        type: 'jsonString',
        display: 'table',
        modalType: 'ip',
        width: 24,
        isAdd: true,
        isDelete: true,
        columns: [
          {
            label: '私网VIP',
            prop: 'vip',
            type: 'text'
          },
          {
            label: '对应RouterID',
            prop: 'router_id'
          },
          {
            label: '对应主分发器',
            prop: 'director_master_uuid',
            detailProp: 'director_master_uuid_name',
            type: 'select'
          },
          {
            label: '对应主分发器优先级',
            prop: 'default',
            value: 180,
            type: 'text'
          },
          {
            label: '对应备分发器列表',
            prop: 'director_backup_uuid_list',
            detailProp: 'director_backup_uuid_list_name',
            type: 'text'
          },
          {
            label: '对应备分发器优先级',
            prop: 'default',
            value: 150,
            type: 'text'
          }
        ]
      }
    ]
  }
};
