export const vmConfig = {
  cpu: [
    {
      value: '1核2GB',
      title: '通用计算型（1核2GB）',
      desc: '使用于一般访问量的网站'
    },
    {
      value: '2核4GB',
      title: '计算密集型（2核4GB）',
      desc: '批量计算，Web前端服务器'
    },
    {
      value: '2核16GB',
      title: '内存密集型（2核16GB）',
      desc: '内存要求高，同时要求内存优化'
    },
    {
      value: '4核32GB',
      title: '密集存储型（4核32GB）',
      desc: '大规模并行数据和日志处理'
    }
  ],
  idc: [
    {
      value: '机房A',
      title: '机房A',
      desc: '192.168.1.0'
    },
    {
      value: '机房B',
      title: '机房B',
      desc: '192.168.2.0'
    },
    {
      value: '机房C',
      title: '机房C',
      desc: '192.168.3.0'
    },
    {
      value: '机房D',
      title: '机房D',
      desc: '192.168.4.0'
    }
  ],
  systemTemplate: {},
  memory: [2, 4, 8, 16, 32, 64],
  expireDay: [1, 2, 3],
  disk: [100, 200, 500],
  defaultForm: {
    'cpu_memory': '1核2GB',
    'cpu_core_quantity': 1,
    'memory_size_in_gb': 2,
    'disk_size_in_gb': 0,
    'business_level': '测试',
    'vm_count': 1,
    'template_type': '',
    'os_name': '',
    'period': 1,
    'idc': '机房A',
    'remark': '',
    'usage': '',
    'tenant_id': '',
    'product': ''
  }
};

export const lvsConfig = {
  'lbAlgo': [
    {
      label:'源地址散列',
      value: 'sh'
    }, 
    { 
      label: '轮询',
      value: 'rr'
    }
  ],
  'checkMethod': ['HTTP', 'TCP'],
  peak: [1, 5, 10, 20, 50],
  'tip': {
    'lbAlgo': '调度算法：指负载均衡按照哪种规则来讲访问分配给后端主机（实际是后端选择算法）。如果您选择的后端主机有多台，并且您希望为访问者保持Session，那么请选择“源地址散列”。否则建议使用“轮询”，因为它消耗资源更少。',
    'checkMethod': '检查你后端主机是否正常的方式：针对WEB服务建议使用HTTP，提交后，会收到对应的邮件。请按照提示操作。TCP，仅会检测对应端口。'
  },
  defaultForm: {
    port_list: [80],
    persistent: 900,
    lb_algo: 'sh',
    check_method: 'HTTP',
    rs_uuid_list: [],
    usage: '',
    tenant_id: '',
    peak_prediction_in_mbps: 5,
    level: '测试',
    product: ''
  }
};

export const natConfig = {
  peak: [1, 5, 10, 20, 50],
  'tip': {
    'ip': '使用独立外网IP地址：指后端主机出外网使用的IP地址（在后端机上访问ip138.com，可以看到这个IP地址）。选择“是”——我们将为您每一台后端主机都配置独立的外网IP地址。'
  },
  defaultForm: {
    peak_prediction_in_mbps: 5,
    specified_public_vip: false,
    is_spider: false,
    usage: '',
    tenant_id: '',
    rs_uuids: [],
    level: '测试',
    product: ''
  }
};

export const dnsConfig = {
  defaultForm: {
    ttl: 3600,
    sub_domain: '',
    primary_domain: [],
    production: '',
    values: [],
    description: '',
    tenant_id: '',
    domain: []
  }
};

export const vmDeleteConfig = {
  defaultForm: {
    remark: '',
    virtual_machines: [],
    usage: '',
    tenant_id: ''
  }
};
