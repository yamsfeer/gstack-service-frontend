export const serviceType = [
  {
    id: 1,
    title: '创建虚拟机',
    config: [
      {
        key: 'business_level',
        label: '业务等级'
      },
      {
        key: 'vm_count',
        label: '申请数量',
        unit: '台'
      },
      {
        key: 'os_name',
        label: '系统模板'
      },
      {
        key: 'product',
        label: '产品线'
      },
      {
        key: 'idc',
        label: '所在机房'
      },
      {
        key: 'cpu_core_quantity',
        label: 'CPU核心数',
        unit: '核'
      },
      {
        key: 'memory_size_in_gb',
        label: '内存容量',
        unit: 'GB'
      },
      {
        key: 'disk_size_in_gb',
        label: '额外磁盘容量',
        unit: 'GB'
      },
      {
        key: 'period',
        label: '过期时间',
        type: 'number_turn_date'
      },
      {
        key: 'usage',
        label: '申请理由'
      },
      {
        key: 'remark',
        label: '备注信息'
      }
    ],
    page: ['detail', 'VmConfig']
  },
  {
    id: 2,
    title: '删除虚拟机',
    config: [
      {
        key: 'usage',
        label: '申请理由'
      },
      {
        key: 'remark',
        label: '备注信息'
      },
      // {
      //   key: 'virtual_machines',
      //   label: '需要删除的虚拟机',
      //   type: 'vm_table'
      // },
      {
        key: 'lvsList',
        label: '相关的lvs',
        type: 'lvs_table'
      },
      {
        key: 'natList',
        label: '相关的nat',
        type: 'nat_table'
      }
    ],
    page: ['detail', 'VmDeleteConfig']
  },
  {
    id: 4,
    title: '被公网访问',
    config: [
      {
        key: 'product',
        label: '产品线'
      },
      {
        key: 'level',
        label: '业务等级'
      },
      {
        key: 'persistent',
        label: '会话保持时间',
        unit: 's'
      },
      {
        key: 'peak_prediction_in_mbps',
        label: '预估带宽峰值',
        unit: 'mbps'
      },
      {
        key: 'lb_algo',
        label: '调度算法',
        alias: {sh: '源地址散列', rr:'轮询'}
      },
      {
        key: 'check_method',
        label: '后端健康检查方式'
      },
      {
        key: 'port_list',
        label: '占用端口',
        type: 'array_string'
      },
      {
        key: 'usage',
        label: '申请理由'
      },
      {
        key: 'rs_uuid_list',
        label: '后端主机列表',
        type: 'array_table'
      }
    ],
    serverKey: 'rs_uuid_list',
    page: ['detail', 'LvsAndNatConfig']
  },
  {
    id: 3,
    title: '访问公网',
    config: [
      {
        key: 'product',
        label: '产品线'
      },
      {
        key: 'level',
        label: '业务等级'
      },
      {
        key: 'specified_public_vip',
        label: '使用独立外网IP地址',
        type: 'boolean'
      },
      {
        key: 'peak_prediction_in_mbps',
        label: '预估带宽峰值',
        unit: 'mbps'
      },
      {
        key: 'is_spider',
        label: '爬虫业务',
        type: 'boolean'
      },

      {
        key: 'usage',
        label: '申请理由'
      },
      {
        key: 'rs_uuids',
        label: '后端主机列表',
        type: 'array_table'
      }
    ],
    serverKey: 'rs_uuids',
    page: ['detail', 'LvsAndNatConfig']
  },
  {
    id: 5,
    title: 'DNS',
    config: [
      {
        key: 'sub_domain',
        label: '域名'
      },
      {
        key: 'primary_domain',
        label: '根域'
      },
      {
        key: 'values',
        label: '解析地址',
        type: 'array_string'
      },
      {
        key: 'scope',
        label: '区域',
        alias: { private: '私网', public: '公网', all: '公网&私网' }
      },
      {
        key: 'record_type',
        label: '解析类型'
      },
      {
        key: 'ttl',
        label: '记录缓存时间',
        unit: 's'
      },
      {
        key: 'description',
        label: '申请理由'
      }
    ],
    page: ['detail', 'dnsConfig']
  }
];

export const TASK_ORDER = {
  PENDING: 1,
  RUNNING: 2,
  SHUTDOWN_FAILURE: 3,
  SHUTDOWN_SUCCESS: 4,
  COLLECT_FAILURE: 5,
  COLLECT_SUCCESS: 6,
  RECORD_FAILURE: 7,
  RECORD_SUCCESS: 8,
  DISCARD_FAILURE: 9,
  DISCARD_SUCCESS: 10
};

export const taskClassMap = ['', 'pending', 'progress', 'failure', 'progress', 'failure', 'progress', 'failure', 'success', 'pending', 'pending'];

// export const taskSeperators = [
//   TASK_ORDER.PENDING,
//   TASK_ORDER.RECORD_SUCCESS,
//   TASK_ORDER.DISCARD_FAILURE,
//   TASK_ORDER.DISCARD_SUCCESS
// ];

// export const taskClassMap = ['pending', 'progress', 'success', 'failure'];

// 宿主机的筛选条件
export const conditionKeyMap = {
  subnet: {
    label: '网段',
    operation: '包含',
    required: true,
    key: 'subnet'
  },
  idc: {
    label: '机房',
    operation: '包含',
    key: 'idc'
  },
  free_memory: {
    label: '可用内存',
    operation: '大于等于',
    unit: 'GB',
    key: 'free_memory'
  },
  free_disk: {
    label: '磁盘绝对剩余空间',
    operation: '大于等于',
    unit: 'GB',
    key: 'free_disk'
  },
  total_cpu_cores: {
    label: 'cpu总核心数',
    operation: '大于等于',
    unit: '核',
    key: 'total_cpu_cores'
  },
  business_level: {
    label: '业务级别',
    operation: '包含',
    key: 'business_level'
  },
  product: {
    label: '产品线',
    operation: '包含',
    key: 'product'
  }
};