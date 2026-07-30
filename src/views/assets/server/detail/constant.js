export const keyMap = {
  asset: {
    label: '资产属性',
    prop: [
      {
        key: 'assetAssetId',
        label: '公司资产编号'
      },
      {
        key: 'assetExpressServiceCode',
        label: '快速服务代码'
      },
      {
        key: 'assetServerType',
        label: '服务器类型',
        display: 'select',
        option: ['物理机', '虚拟机'],
        defaultValue: '物理机'
      },
      {
        key: 'assetOwner',
        detailKey: 'owner',
        formKey: 'ownerEmail',
        label: '所属人',
        unit: '@example.com'
      },
      {
        key: 'assetLevel',
        label: '业务级别',
        display: 'select',
        option: ['测试', '生产'],
        defaultValue: '测试'
      },
      {
        key: 'assetProduct',
        label: '产品线',
        display: 'select',
        optionKey: 'products'
      },
      {
        key: 'assetVmName',
        label: '虚拟机实例名'
      },
      {
        key: 'assetAssetStatus',
        label: '资产状态',
        display: 'select',
        physicalOption: ['正常运行', '下架', '报废', '外调'],
        virtualOption: ['正常运行', '关机保留', '删除']
      },
      {
        key: 'assetIdc',
        label: '所在机房',
        display: 'select',
        optionKey: 'idcs'
      },
      {
        key: 'assetCabinet',
        label: '所在机柜'
      },
      {
        key: 'assetSn',
        label: 'S/N'
      },
      {
        key: 'assetServerUuid',
        label: 'uuid',
        width: 16
      },
      {
        key: 'assetUsage',
        label: '服务器描述',
        width: 24,
        display: 'textarea'
      },
      {
        key: 'assetLifecycle',
        label: '生命周期',
        width: 24,
        display: 'list',
        physicalProp: [
          {
            key: 'assetLifecyclePhysicalServerWarrantyTime',
            label: '服务器质保时间',
            width: 12
          },
          {
            key: 'assetLifecyclePhysicalServerShelveTime',
            label: '上架时间',
            width: 12
          },
          {
            key: 'assetLifecyclePhysicalServerScrappedTime',
            label: '报废时间',
            width: 12
          },
          {
            key: 'assetLifecyclePhysicalServerOrderTime',
            label: '采购时间',
            width: 12
          },
          {
            key: 'assetLifecyclePhysicalServerUnshelveTime',
            label: '下架时间',
            width: 12
          },
          {
            key: 'assetLifecyclePhysicalServerTicketTime',
            label: '工单完成时间',
            width: 12
          }
        ],
        virtualProp: [
          {
            key: 'assetLifecycleVirtualServerCreateTime',
            label: '工单完成时间',
            width: 12
          },
          {
            key: 'assetLifecycleVirtualServerExpiredTime',
            label: '过期时间',
            width: 12
          },
          {
            key: 'assetLifecycleVirtualServerCloseTime',
            label: '关闭时间',
            width: 12
          },
          {
            key: 'assetLifecycleVirtualServerDeleteTime',
            label: '删除时间',
            width: 12
          }
        ]
      }
    ]
  },
  logical: {
    label: '逻辑属性',
    prop: [
      {
        key: 'logicalHostName',
        label: '主机名'
      },
      {
        key: 'logicalOperationSystem',
        label: '操作系统'
      },
      {
        key: 'logicalHostMachine',
        label: '宿主机'
      },
      {
        key: 'logicalZabbixHostid',
        label: 'Zabbix Host ID'
      },
      {
        key: 'logicalIdracIp',
        label: 'IDRAC地址'
      },
      {
        key: 'logicalTotalCpuCores',
        label: 'CPU核心数总和',
        unit: '核'
      },
      {
        key: 'logicalTotalMemorySizeInGb',
        label: '所有内存容量总和',
        unit: 'GB'
      },
      {
        key: 'logicalTotalDiskSizeInGb',
        label: '所有硬盘容量总和',
        unit: 'GB'
      },
      // {
      //   key: 'logicalTotalDiskSizeInGb',
      //   label: '实际使用空间',
      //   unit: 'GB'
      // },
      {
        key: 'logicalDiskPartitions',
        label: '逻辑分区信息',
        type: 'jsonString',
        display: 'table',
        width: 24,
        columns: [
          {
            label: '逻辑磁盘盘符/挂载点',
            prop: 'path'
          },
          {
            label: '文件系统',
            prop: 'file_system'
          },
          {
            label: '逻辑分区容量(G)',
            prop: 'drive_size_in_gb'
          }
        ],
        data: [
          {
            path: '/boot/efi',
            file_system: 'vfat',
            drive_size_in_gb: '0.49'
          },
          {
            path: '/',
            file_system: 'ext4',
            drive_size_in_gb: '0.231.69'
          },
          {
            path: '/boot/efi',
            file_system: 'vfat',
            drive_size_in_gb: '0.49'
          }
        ]
      },
      {
        key: 'logicalIpList',
        label: 'IP列表',
        type: 'jsonString',
        display: 'table',
        width: 24,
        modalType: 'ip',
        isAdd: true,
        isEdit: false,
        isDelete: true,
        columns: [
          {
            label: 'IP地址',
            prop: 'ip_address',
            type: 'text'
          },
          {
            label: 'IP类型',
            prop: 'type',
            type: 'text'
          },
          {
            label: '网关',
            prop: 'gateway',
            type: 'text'
          },
          {
            label: '子网地址',
            prop: 'subnet',
            type: 'text'
          },
          {
            label: '子网掩码',
            prop: 'netmask',
            type: 'text'
          },
          {
            label: '掩码位数',
            prop: 'prefix',
            type: 'text'
          },
          {
            label: '是否为集群IP',
            prop: 'is_cluster_ip',
            type: 'boolean'
          },
          {
            label: '是否为管理IP',
            prop: 'is_admin_ip',
            type: 'boolean'
          }
        ]
      }
    ]
  },
  device: {
    label: '设备属性',
    prop: [
      {
        key: 'deviceManufacturer',
        label: '厂商'
      },
      {
        key: 'deviceModel',
        label: '型号'
      },
      {
        key: 'deviceCpus',
        label: 'CPU',
        type: 'jsonString',
        display: 'table',
        width: 24,
        columns: [
          {
            label: '厂商',
            prop: 'manufacturer'
          },
          {
            label: '型号',
            prop: 'model'
          },
          {
            label: '最大速度',
            prop: 'max_speed'
          },
          {
            label: '速度',
            prop: 'speed'
          },
          {
            label: 'slot',
            prop: 'slot'
          },
          {
            label: 'stepping',
            prop: 'stepping'
          },
          {
            label: '核心数量',
            prop: 'cores'
          }
        ]
      },
      {
        key: 'deviceNetworkAdapters',
        label: '网络适配器',
        type: 'jsonString',
        display: 'table',
        width: 24,
        columns: [
          {
            label: '厂商',
            prop: 'manufacturer'
          },
          {
            label: 'mac地址',
            prop: 'mac_address'
          },
          {
            label: 'NIC描述',
            prop: 'NIC_description'
          }
        ]
      },
      {
        key: 'devicePhysicalDisks',
        label: '物理磁盘',
        type: 'jsonString',
        display: 'table',
        width: 24,
        columns: [
          {
            label: '磁盘sn',
            prop: 'disk_sn'
          },
          {
            label: '修订',
            prop: 'revise'
          },
          {
            label: '磁盘厂商',
            prop: 'manufacturer'
          },
          {
            label: '磁盘型号',
            prop: 'model'
          },
          {
            label: '部件号',
            prop: 'firmware_id'
          },
          {
            label: '介质类型',
            prop: 'media_type'
          },
          {
            label: '总线类型',
            prop: 'bus_type'
          },
          {
            label: '磁盘容量(G)',
            prop: 'size_in_gb'
          }
        ]
      },
      {
        key: 'deviceMemorySticks',
        label: '内存',
        width: 24,
        type: 'jsonString',
        display: 'table',
        columns: [
          {
            label: '内存sn',
            prop: 'memory_sn'
          },
          {
            label: '厂商',
            prop: 'manufacturer'
          },
          {
            label: '类型',
            prop: 'model'
          },
          {
            label: '类型信息',
            prop: 'device_type_info'
          },
          {
            label: '部件号',
            prop: 'firmware_id'
          },
          {
            label: '接口类型',
            prop: 'firmware_id'
          },
          {
            label: '容量(G)',
            prop: 'size_in_gb'
          }
        ]
      },
      {
        key: 'deviceRaidAdapters',
        label: 'raid 控制器',
        type: 'jsonString',
        display: 'table',
        width: 24,
        columns: [
          {
            label: '厂商',
            prop: 'manufacturer'
          },
          {
            label: '型号',
            prop: 'model'
          },
          {
            label: '状态',
            prop: 'status'
          },
          {
            label: '类型',
            prop: 'type'
          }
        ]
      },
      {
        key: 'deviceDisks',
        label: '磁盘',
        type: 'jsonString',
        display: 'table',
        width: 24,
        columns: [
          {
            label: '名字',
            prop: 'name'
          },
          {
            label: '设备名',
            prop: 'device_name'
          },
          {
            label: '磁盘缓存策略',
            prop: 'cache_policy'
          },
          {
            label: '读策略',
            prop: 'read_policy'
          },
          {
            label: '写策略',
            prop: 'write_policy'
          },
          {
            label: 'raid模式',
            prop: 'raid_mode'
          },
          {
            label: '容量(G)',
            prop: 'zonary_size'
          },
          {
            label: '分区大小(G)',
            prop: 'size'
          }
        ]
      }
    ]
  },
  virtualServer: {
    label: '旗下虚拟机',
    onlyDetail: true,
    prop: [
      {
        key: 'virtualServer',
        label: '',
        display: 'table',
        modalType: 'server',
        width: 24,
        columns: [
          {
            label: '主机名',
            prop: 'logicalHostName'
          },
          {
            label: '资产状态',
            prop: 'assetAssetStatus'
          },
          {
            label: 'vm名称',
            prop: 'assetVmName'
          },
          {
            label: 'ip地址',
            prop: 'logicalIpListIpAddress'
          },
          {
            label: '产品',
            prop: 'assetProduct'
          },
          {
            label: '所属人',
            prop: 'assetOwner'
          }
        ]
      }
    ]
  }
};
