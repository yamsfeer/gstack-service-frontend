// ============================================================
// ServicePlatform 自助服务工单系统 - Mock API Server
// 端口 8000
// 数据 Schema 与前端 service 层（src/service/*.js）完全一致：
//   - 所有接口返回 { error_code: 0, data: ... }
//   - 失败时返回 { error_code: 非0, error_msg: ... }
// 内存态数据，重启后重置；可通过 POST /__mock/reset 重置状态
// ============================================================
const express = require('express');
const app = express();
const PORT = process.env.MOCK_PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const ok = (data = {}) => ({ error_code: 0, data });
const fail = (error_msg, error_code = 1) => ({ error_code, error_msg });

// ============ 基础数据 ============
const TENANTS = [
  { tenant_id: '1001', tenant_name: '平台研发部' },
  { tenant_id: '1002', tenant_name: '基础架构部' },
  { tenant_id: '1003', tenant_name: '数据智能部' },
];

const GROUPS = [
  { id: 1, group_name: '运维值班组' },
  { id: 2, group_name: '平台研发组' },
  { id: 3, group_name: '网络管理组' },
];

const USERS = [
  {
    username: 'admin', name: '管理员', email: 'admin@example.com',
    id: '1',
    policies: [{ name: 'TicketFullAccess' }],
    isServiceAdmin: true,
    groups: [{ group_name: '运维值班组', id: 1 }],
  },
  {
    username: 'zhangsan', name: '张三', email: 'zhangsan@example.com',
    id: '2',
    policies: [{ name: 'TicketApply' }],
    isServiceAdmin: false,
    groups: [{ group_name: '平台研发组', id: 2 }],
  },
  {
    username: 'lisi', name: '李四', email: 'lisi@example.com',
    id: '3',
    policies: [{ name: 'TicketApply' }],
    isServiceAdmin: false,
    groups: [{ group_name: '运维值班组', id: 1 }],
  },
];

// 资产选项
const PRODUCTS = ['产品线A', '产品线B', '产品线C'];
const IDCS = ['机房A', '机房B', '机房C'];
const SERVER_LEVELS = ['测试', '生产'];
const SYSTEMS = ['CentOS 7.9', 'Windows Server 2019', 'CentOS 8.2'];
const SERVER_TYPES = ['物理机', '虚拟机'];
const SERVER_STATUSES = ['正常运行', '关机保留', '删除', '下架', '报废', '外调'];
const SUB_NETS = ['192.168.1.0/24', '192.168.2.0/24', '10.0.1.0/24'];

// ============ 资产数据 ============
function makeServer(i) {
  const type = i % 2 === 0 ? '物理机' : '虚拟机';
  const idc = IDCS[i % IDCS.length];
  const subnet = SUB_NETS[i % SUB_NETS.length].split('/')[0];
  return {
    assetServerUuid: `uuid-server-${i}`,
    logicalHostName: `web-server-${String(i).padStart(3, '0')}`,
    logicalHostMachine: i % 2 === 0 ? '' : `hypervisor-${String(i % 4).padStart(3, '0')}`,
    logicalHostMachineDetails: i % 2 === 0 ? null : {
      logicalIpListIpAddress: `192.168.10.${i + 1}`,
    },
    logicalIpListIpAddress: `192.168.10.${i + 1}`,
    logicalIp: `192.168.10.${i + 1}`,
    logicalIpSubnet: subnet,
    assetProduct: PRODUCTS[i % PRODUCTS.length],
    assetLevel: SERVER_LEVELS[i % 2],
    assetIdc: idc,
    logicalOperationSystem: SYSTEMS[i % SYSTEMS.length],
    assetOwner: i % 3 === 0 ? '管理员' : (i % 3 === 1 ? '张三' : '李四'),
    assetUsage: `用于核心业务的 Web 服务器（mock 数据 ${i}）`,
    logicalTotalMemorySizeInGb: 64 + i * 16,
    deviceCpusCores: 8 + i * 4,
    deviceDisks: 2 + i % 4,
    logicalIdracIp: `10.0.0.${i + 1}`,
    logicalIpListGateway: `${subnet}.1`,
    assetCabinet: `机柜${(i % 6) + 1}`,
    assetAssetId: `ASSET-${1000 + i}`,
    assetExpressServiceCode: `ESC-${100 + i}`,
    assetLifecyclePhysicalServerWarrantyTime: '2026-12-31',
    assetVmName: type === '虚拟机' ? `vm-${String(i).padStart(3, '0')}` : '',
    assetServerType: type,
    deviceModel: 'Dell R740',
    logicalZabbixHostid: `zabbix-${i}`,
    logicalHostMachineIpAddress: `192.168.10.${(i % 4) + 1}`,
    assetAssetStatus: i % 5 === 0 ? '关机保留' : '正常运行',
    assetIsHostMachine: type === '物理机' && i % 2 === 0 ? 'True' : 'False',
    ownerEmail: 'owner@example.com',
    assetOwnerEmail: 'owner@example.com',
    assetSn: `SN-${10000 + i}`,
    assetLifecycle: { lifecycle: 'use' },
  };
}
const SERVERS = Array.from({ length: 18 }, (_, i) => makeServer(i + 1));

const LB_GROUPS = [
  { esId: 'lbg-1', groupName: '负载均衡集群A', product: '产品线A', idc: '机房A', subNet: '192.168.1.0/24', usage: '承载核心业务流量', dateCreated: '2024-01-10 10:00:00', memberHostList: "['uuid-server-1','uuid-server-2']", memberHostManagedIp: '192.168.10.1', memberHostListDetails: [SERVERS[0], SERVERS[1]], privateVipList: [{ vip: '192.168.1.10', routerId: 10 }], privateVipListVip: '192.168.1.10', privateVipListRouterId: '10' },
  { esId: 'lbg-2', groupName: '负载均衡集群B', product: '产品线B', idc: '机房B', subNet: '192.168.2.0/24', usage: '承载大数据业务流量', dateCreated: '2024-02-15 10:00:00', memberHostList: "['uuid-server-3','uuid-server-4']", memberHostManagedIp: '192.168.10.3', memberHostListDetails: [SERVERS[2], SERVERS[3]], privateVipList: [{ vip: '192.168.2.10', routerId: 20 }], privateVipListVip: '192.168.2.10', privateVipListRouterId: '20' },
];

const LVS_INSTANCES = [
  { esId: 'lvs-1', instanceName: 'lvs-order-public', instanceStatus: '正常', product: '产品线A', idc: '机房A', dateCreated: '2024-03-01 10:00:00', publicVip: '10.20.1.10', portList: [80, 443], assetLbGroup: 'lbg-1', assetLbGroupDetails: LB_GROUPS[0], directorMasterUuid: 'uuid-server-1', directorMasterUuidMappingIp: '192.168.10.1', rsUuidList: '["uuid-server-1","uuid-server-2"]', rsUuidListMappingIps: ['192.168.10.1', '192.168.10.2'], usage: '订单系统对外访问', owner: '管理员', persistent: 900, lbAlgo: 'rr', publicRouterId: '1001', subNet: '192.168.1.0/24' },
  { esId: 'lvs-2', instanceName: 'lvs-search-public', instanceStatus: '正常', product: '产品线B', idc: '机房B', dateCreated: '2024-04-01 10:00:00', publicVip: '10.20.2.10', portList: [80], assetLbGroup: 'lbg-2', assetLbGroupDetails: LB_GROUPS[1], directorMasterUuid: 'uuid-server-3', directorMasterUuidMappingIp: '192.168.10.3', rsUuidList: '["uuid-server-3"]', rsUuidListMappingIps: ['192.168.10.3'], usage: '搜索服务对外访问', owner: '张三', persistent: 900, lbAlgo: 'sh', publicRouterId: '1002', subNet: '192.168.2.0/24' },
];

const NAT_INSTANCES = [
  { esId: 'nat-1', instanceName: 'nat-spider-out', instanceStatus: '正常', assetProduct: '产品线A', idc: '机房A', owner: '管理员', dateCreated: '2024-05-01 10:00:00', assetLbGroup: 'lbg-1', assetLbGroupDetails: LB_GROUPS[0], directorMasterUuid: 'uuid-server-1', directorMasterUuidMappingIp: '192.168.10.1', clientServerUuidMappingIps: ['192.168.10.1', '192.168.10.2'], usage: '爬虫数据采集' },
  { esId: 'nat-2', instanceName: 'nat-data-out', instanceStatus: '正常', assetProduct: '产品线B', idc: '机房B', owner: '张三', dateCreated: '2024-06-01 10:00:00', assetLbGroup: 'lbg-2', assetLbGroupDetails: LB_GROUPS[1], directorMasterUuid: 'uuid-server-3', directorMasterUuidMappingIp: '192.168.10.3', clientServerUuidMappingIps: ['192.168.10.3'], usage: '数据同步出网' },
];

const IPS = [
  { esId: 'ip-1', ipAddress: '10.20.1.10', isUsed: 'True', idc: '机房A', type: '公网IP', netmask: '255.255.255.0', prefix: 24, defaultGateway: '10.20.1.1', subNet: '10.20.1.0/24', usedforSpider: false },
  { esId: 'ip-2', ipAddress: '10.20.2.10', isUsed: 'False', idc: '机房B', type: '公网IP', netmask: '255.255.255.0', prefix: 24, defaultGateway: '10.20.2.1', subNet: '10.20.2.0/24', usedforSpider: false },
  { esId: 'ip-3', ipAddress: '192.168.1.100', isUsed: 'False', idc: '机房A', type: '私网IP', netmask: '255.255.255.0', prefix: 24, defaultGateway: '192.168.1.1', subNet: '192.168.1.0/24', usedforSpider: true },
];

const DNS_RECORDS = [
  { esId: 'dns-1', domain: 'www.example.com', subDomain: 'www', primaryDomain: 'example.com', value: '10.20.1.10', scope: 'public', recordType: 'A', ttl: 3600, createUserName: '管理员', handleUserName: '管理员', createTime: '2024-07-01 10:00:00', status: 'enable', description: '官网域名解析' },
  { esId: 'dns-2', domain: 'api.example.com', subDomain: 'api', primaryDomain: 'example.com', value: '10.20.2.10', scope: 'public', recordType: 'A', ttl: 3600, createUserName: '张三', handleUserName: '张三', createTime: '2024-07-02 10:00:00', status: 'enable', description: 'API 服务域名' },
];

const NET_MAPPINGS = [
  { esId: 'nm-1', publicIp: '10.20.1.10', privateIp: '192.168.10.1', idc: '机房A', mappingType: '一对一', domains: JSON.stringify(['www.example.com']) },
  { esId: 'nm-2', publicIp: '10.20.2.10', privateIp: '192.168.10.3', idc: '机房B', mappingType: '端口映射', domains: JSON.stringify(['api.example.com']) },
];

const DOMAINS = {
  public: ['example.com', 'example.net'],
  private: ['internal.example.local', 'ops.internal'],
  all: ['both.example.com'],
};

// 子网池: subnet -> 可用数量
const IDC_SUBNETS = {
  '192.168.1.0/24': 50,
  '192.168.2.0/24': 30,
};

// ============ 工单数据 ============
let ticketSeq = 10000;
let processSeq = 1;

function makeTicket(type, resource, description, tenant_id, creator, group) {
  ticketSeq += 1;
  const now = new Date();
  const create_time = now.toISOString().replace('T', ' ').slice(0, 19);
  return {
    id: ticketSeq,
    type,
    state: 1, // 待处理
    creator,
    group: group || '运维值班组',
    description,
    tenant: TENANTS.find(t => t.tenant_id === String(tenant_id))?.tenant_name || '',
    tenant_id: String(tenant_id),
    create_time,
    update_time: create_time,
    resource,
    action_logs: [],
    configurations: {},
  };
}

function findTicket(id) {
  return TICKETS.find(t => t.id === Number(id));
}

// 工单状态机：
//  1 待处理  2 审核中  3 待开通  4 开通中  5 待重试  6 录入中
//  7 录入待重试 8 废弃中  10 已完成  11 已废弃
// action: 1同意 2驳回 3开通 4开通失败确认 5开通成功确认 6重试 9录入 11录入成功确认 12丢弃
function applyAction(ticket, action, description, handler) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  ticket.action_logs.push({ action, handler, description: description || '', create_time: now, update_time: now });
  ticket.update_time = now;
  switch (action) {
    case 1: // 同意
      if (ticket.state === 1) ticket.state = 2;
      else if (ticket.state === 2) ticket.state = 3;
      break;
    case 2: // 驳回
      ticket.state = 11;
      break;
    case 3: // 开通
      if (ticket.state === 3) ticket.state = 10;
      else if (ticket.state === 5) ticket.state = 10;
      break;
    case 4: // 开通失败确认
      ticket.state = 5;
      break;
    case 5: // 开通成功确认
      ticket.state = 6;
      break;
    case 6: // 重试
      ticket.state = 3;
      break;
    case 9: // 录入
      ticket.state = 10;
      break;
    case 11: // 录入成功确认
      ticket.state = 10;
      break;
    case 12: // 丢弃
      ticket.state = 11;
      break;
    default:
      break;
  }
  if (description && description.length > 200) {
    return { error_code: 1, error_msg: '备注不能超过200个字符' };
  }
  return ok();
}

function makeInitialTickets() {
  const tickets = [
    makeTicket(1, { vm_count: 1, os_name: 'CentOS 7.9', cpu_core_quantity: 2, memory_size_in_gb: 4, disk_size_in_gb: 100, business_level: '测试', period: 1, product: '产品线A', idc: '机房A', usage: '搭建测试环境', remark: '' }, '搭建测试环境虚拟机', 1001, '管理员', '运维值班组'),
    makeTicket(4, { product: '产品线A', level: '测试', persistent: 900, peak_prediction_in_mbps: 5, lb_algo: 'rr', check_method: 'TCP', port_list: [80], usage: '测试服务对外访问', rs_uuid_list: ['uuid-server-1'] }, '测试服务对外访问', 1001, '管理员', '运维值班组'),
    makeTicket(3, { product: '产品线A', level: '测试', specified_public_vip: false, is_spider: false, peak_prediction_in_mbps: 5, usage: '测试服务访问外网', rs_uuids: ['uuid-server-2'] }, '测试服务访问外网', 1001, '管理员', '运维值班组'),
  ];
  // 造一些不同状态的工单便于审核页验证
  tickets[1].state = 2; // 审核中
  tickets[1].action_logs.push({ action: 1, handler: '管理员', description: '同意', create_time: '2025-01-01 10:00:00', update_time: '2025-01-01 10:00:00' });
  tickets[2].state = 3; // 待开通
  tickets[2].action_logs.push({ action: 1, handler: '管理员', description: '同意', create_time: '2025-01-01 10:00:00', update_time: '2025-01-01 10:00:00' });
  tickets[2].action_logs.push({ action: 1, handler: '管理员', description: '同意', create_time: '2025-01-01 10:05:00', update_time: '2025-01-01 10:05:00' });
  {
    const t = makeTicket(5, { sub_domain: 'test', primary_domain: 'example.com', values: ['10.20.1.99'], scope: 'public', record_type: 'A', ttl: 3600, description: '测试域名解析' }, '测试域名解析', 1001, '管理员', '运维值班组');
    t.state = 10;
    t.action_logs.push({ action: 1, handler: '管理员', description: '同意', create_time: '2025-01-02 10:00:00', update_time: '2025-01-02 10:00:00' });
    t.action_logs.push({ action: 1, handler: '管理员', description: '同意', create_time: '2025-01-02 10:05:00', update_time: '2025-01-02 10:05:00' });
    t.action_logs.push({ action: 3, handler: '管理员', description: '开通', create_time: '2025-01-02 10:10:00', update_time: '2025-01-02 10:10:00' });
    tickets.push(t);
  }
  return tickets;
}

let TICKETS = makeInitialTickets();
let PROCESSES = makeInitialProcesses();

function makeInitialProcesses() {
  return [
    {
      id: 1,
      name: '虚拟机申请流程',
      type: 1, // 默认流程
      description: '虚拟机资源申请默认流程',
      enable: true,
      ready: true,
      create_time: '2024-01-01 10:00:00',
      update_time: '2024-01-01 10:00:00',
      steps: [
        { name: '提交工单', group_id: 2, sequence: 1, description: '', is_hidden: false },
        { name: '审批', group_id: 1, sequence: 2, description: '审核资源申请', is_hidden: false },
        { name: '开通环节', group_id: 1, sequence: 3, description: '', is_hidden: false },
      ],
    },
  ];
}

// ============ User / Auth APIs ============
app.get('/lanus/api/v1/user/0', (req, res) => {
  res.json(ok({ user: USERS[0] }));
});
app.post('/lanus/api/v1/user/0', (req, res) => {
  if (req.query.cmd === 'Logout') {
    return res.json(ok({}, '已退出'));
  }
  res.json(ok({}));
});
app.get('/auth', (req, res) => {
  res.json(ok({ access_token: 'mock-token-123456' }));
});
app.get('/tenant_management/api/v1/getTenantsOfuser', (req, res) => {
  res.json(ok({ tenant_list: TENANTS }));
});
app.get('/tenant_management/api/v1/getTenat', (req, res) => {
  res.json(ok({ tenat_list: TENANTS.map(t => ({ tenat_id: t.tenant_id, tenat_name: t.tenant_name })) }));
});
app.get('/lanus/api/v1/users', (req, res) => {
  let users = USERS.map(({ policies, ...rest }) => ({ ...rest }));
  const q = (req.query.search_condition || '').toLowerCase();
  if (q) users = users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  res.json(ok({ users, total: users.length }));
});
app.post('/lanus/api/v1/users', (req, res) => {
  if (req.query.cmd === 'GetUserListById') {
    const ids = req.body.user_id_list || req.body.ids || [];
    const users = USERS.filter(u => ids.includes(u.id)).map(({ policies, ...rest }) => ({ ...rest }));
    return res.json(ok({ users }));
  }
  if (req.query.cmd === 'GetUserListByUsername') {
    const names = req.body.username_list || [];
    const user_list = USERS.filter(u => names.includes(u.email) || names.includes(u.username))
      .map(u => ({ username: u.username, name: u.name, email: u.email, id: u.id }));
    return res.json(ok({ user_list }));
  }
  res.json(ok({ users: [], total: 0 }));
});
app.get('/lanus/api/v1/groups', (req, res) => {
  let groups = GROUPS;
  const q = (req.query.search_condition || '').toLowerCase();
  if (q) groups = groups.filter(g => g.group_name.toLowerCase().includes(q));
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.pagesize) || 10;
  res.json(ok({ groups: groups.slice((page - 1) * size, page * size), total: groups.length }));
});
app.post('/lanus/api/v1/groups', (req, res) => {
  if (req.query.cmd === 'GetGroupListById') {
    const ids = req.body.group_id_list || [];
    return res.json(ok({ group_list: GROUPS.filter(g => ids.includes(g.id)) }));
  }
  res.json(ok({ groups: GROUPS }));
});

// ============ Ticket / Order APIs ============
app.get('/ticket/api/v1/ticket_types', (req, res) => {
  res.json(ok([
    { id: 1, title: '虚拟机' },
    { id: 2, title: '虚拟机删除' },
    { id: 3, title: '主动访问公网' },
    { id: 4, title: '被公网访问' },
    { id: 5, title: 'DNS' },
  ]));
});

app.get('/ticket/api/v1/tickets', (req, res) => {
  const { state, type, creator, tenant, search_condition, page, page_size, status } = req.query;
  let tickets = [...TICKETS];
  if (creator) tickets = tickets.filter(t => t.creator === creator);
  if (tenant) tickets = tickets.filter(t => t.tenant === tenant);
  if (type) {
    const types = Array.isArray(type) ? type.map(Number) : JSON.parse(type).map(Number);
    tickets = tickets.filter(t => types.includes(t.type));
  }
  if (search_condition) {
    tickets = tickets.filter(t => (t.description || '').includes(search_condition));
  }
  if (state) {
    const states = Array.isArray(state) ? state.map(Number) : JSON.parse(state).map(Number);
    tickets = tickets.filter(t => states.includes(t.state));
  } else if (status) {
    const statusNum = Number(status);
    if (statusNum === 2) tickets = tickets.filter(t => [1, 2, 3, 5, 7, 9].includes(t.state));
    else if (statusNum === 3) tickets = tickets.filter(t => [4, 6, 8].includes(t.state));
    else if (statusNum === 4) tickets = tickets.filter(t => [10, 11].includes(t.state));
  }
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(page_size) || 10;
  res.json(ok({ tickets: tickets.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: tickets.length }));
});

app.post('/ticket/api/v1/tickets', (req, res) => {
  if (req.query.cmd === 'CreateTicket') {
    const body = req.body || {};
    const user = USERS[0];
    const ticket = makeTicket(body.type, body.resource, body.description, body.tenant_id, user.name, user.groups[0].group_name);
    ticket.configurations = body.configurations || {};
    TICKETS.unshift(ticket);
    return res.json(ok({ id: ticket.id }));
  }
  if (req.query.cmd === 'BatchUpdateStateByAction') {
    const { ids, action, description } = req.body || {};
    (ids || []).forEach(id => {
      const t = findTicket(id);
      if (t) applyAction(t, action, description, USERS[0].name);
    });
    return res.json(ok({}));
  }
  res.json(ok({ id: 'mock-id' }));
});

app.get('/ticket/api/v1/ticket/:id', (req, res) => {
  const ticket = findTicket(req.params.id);
  if (!ticket) return res.json(fail('工单不存在', 404));
  res.json(ok(ticket));
});

app.put('/ticket/api/v1/ticket/:id', (req, res) => {
  const ticket = findTicket(req.params.id);
  if (!ticket) return res.json(fail('工单不存在', 404));
  const { resource, configurations } = req.body || {};
  if (resource) ticket.resource = { ...ticket.resource, ...resource };
  if (configurations) ticket.configurations = configurations;
  res.json(ok(ticket));
});

app.post('/ticket/api/v1/ticket/:id', (req, res) => {
  if (req.query.cmd === 'UpdateStateByAction') {
    const ticket = findTicket(req.params.id);
    if (!ticket) return res.json(fail('工单不存在', 404));
    const { action, description } = req.body || {};
    // 开通动作的配置
    if (action === 3 && req.body.configurations) {
      ticket.configurations = req.body.configurations;
    }
    return res.json(applyAction(ticket, Number(action), description, USERS[0].name));
  }
  res.json(ok({}));
});

app.delete('/ticket/api/v1/ticket/:id', (req, res) => {
  const idx = TICKETS.findIndex(t => t.id === Number(req.params.id));
  if (idx > -1) TICKETS.splice(idx, 1);
  res.json(ok({}));
});

// ============ Process Management APIs ============
app.get('/ticket/api/v1/processes', (req, res) => {
  let processes = [...PROCESSES];
  const q = (req.query.search_condition || '').toLowerCase();
  if (q) processes = processes.filter(p => (p.name || '').toLowerCase().includes(q));
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ processes: processes.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: processes.length }));
});

app.post('/ticket/api/v1/processes', (req, res) => {
  if (req.query.cmd === 'NameExists') {
    const name = req.body.name || '';
    return res.json(ok({ exists: PROCESSES.some(p => p.name === name) }));
  }
  if (req.query.cmd === 'CreateProcess') {
    const body = req.body || {};
    processSeq += 1;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const process = {
      id: processSeq,
      name: body.name,
      description: body.description || '',
      type: 2,
      enable: false,
      ready: true,
      create_time: now,
      update_time: now,
      steps: body.steps || [],
    };
    PROCESSES.push(process);
    return res.json(ok({ id: process.id }));
  }
  res.json(ok({}));
});

app.get('/ticket/api/v1/process/:id', (req, res) => {
  const p = PROCESSES.find(p => p.id === Number(req.params.id));
  if (!p) return res.json(fail('流程不存在', 404));
  res.json(ok({ name: p.name, description: p.description, steps: p.steps, id: p.id }));
});

app.put('/ticket/api/v1/process/:id', (req, res) => {
  const p = PROCESSES.find(p => p.id === Number(req.params.id));
  if (!p) return res.json(fail('流程不存在', 404));
  const body = req.body || {};
  Object.assign(p, body);
  p.update_time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  res.json(ok({}));
});

app.delete('/ticket/api/v1/process/:id', (req, res) => {
  const idx = PROCESSES.findIndex(p => p.id === Number(req.params.id));
  if (idx > -1) PROCESSES.splice(idx, 1);
  res.json(ok({}));
});

// ============ Asset APIs ============
// --- 选项数据 ---
app.get('/ticket/api/v1/asset/server/searchers', (req, res) => {
  res.json(ok({ products: PRODUCTS, idcs: IDCS, server_levels: SERVER_LEVELS, systems: SYSTEMS, server_types: SERVER_TYPES, server_statuses: SERVER_STATUSES }));
});
app.get('/ticket/api/v1/asset/lb_group/searchers', (req, res) => {
  res.json(ok({ products: PRODUCTS, idcs: IDCS }));
});
app.get('/ticket/api/v1/asset/lvs/searchers', (req, res) => {
  res.json(ok({ products: PRODUCTS, idcs: IDCS, lbGroups: LB_GROUPS.map(g => ({ esId: g.esId, groupName: g.groupName })) }));
});
app.get('/ticket/api/v1/asset/nat/searchers', (req, res) => {
  res.json(ok({ products: PRODUCTS, idcs: IDCS }));
});
app.get('/ticket/api/v1/asset/ip/searchers', (req, res) => {
  // 前端 src/views/assets/ip/ip.vue 读取 res.data.ip_types
  res.json(ok({ idcs: IDCS, ip_types: ['公网IP', '私网IP'] }));
});
app.get('/ticket/api/v1/asset/dns/searchers', (req, res) => {
  res.json(ok({ domains: DOMAINS.public.concat(DOMAINS.private), scopes: ['public', 'private', 'all'] }));
});
app.get('/ticket/api/v1/asset/net_mapping/searchers', (req, res) => {
  res.json(ok({ idcs: IDCS, mapping_types: ['一对一', '端口映射'] }));
});

function filterByParams(list, params) {
  let result = [...list];
  const search = params.search_condition;
  if (search) {
    result = result.filter(item => Object.values(item).some(v => typeof v === 'string' && v.includes(search)));
  }
  const keys = Object.keys(params).filter(k => ['page', 'page_size', 'search_condition', 'order_by', 'order_method'].indexOf(k) === -1 && params[k]);
  keys.forEach(k => {
    if (Array.isArray(params[k]) && params[k].length) {
      result = result.filter(item => params[k].includes(item[k]));
    } else if (typeof params[k] === 'string' && params[k]) {
      result = result.filter(item => String(item[k]) === params[k]);
    }
  });
  return result;
}

// --- 服务器 ---
app.get('/ticket/api/v1/asset/servers', (req, res) => {
  const servers = filterByParams(SERVERS, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ servers: servers.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: servers.length }));
});
app.get('/ticket/api/v1/asset/server/:id', (req, res) => {
  const s = SERVERS.find(x => x.assetServerUuid === req.params.id);
  if (!s) return res.json(fail('服务器不存在', 404));
  res.json(ok(s));
});
app.put('/ticket/api/v1/asset/server/:id', (req, res) => {
  const s = SERVERS.find(x => x.assetServerUuid === req.params.id);
  if (!s) return res.json(fail('服务器不存在', 404));
  Object.assign(s, req.body);
  res.json(ok(s));
});
app.post('/ticket/api/v1/asset/servers', (req, res) => {
  const s = { ...req.body, assetServerUuid: req.body.assetServerUuid || `uuid-server-${SERVERS.length + 1}` };
  SERVERS.push(s);
  res.json(ok(s));
});
app.post('/ticket/api/v1/asset/servers/batch', (req, res) => {
  const list = req.body || [];
  list.forEach(item => SERVERS.push(item));
  res.json(ok({}));
});

// --- 集群 ---
app.get('/ticket/api/v1/asset/lb_groups', (req, res) => {
  const groups = filterByParams(LB_GROUPS, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ lb_groups: groups.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: groups.length }));
});
app.get('/ticket/api/v1/asset/lb_group/:id', (req, res) => {
  const g = LB_GROUPS.find(x => x.esId === req.params.id);
  if (!g) return res.json(fail('集群不存在', 404));
  res.json(ok(g));
});
app.put('/ticket/api/v1/asset/lb_group/:id', (req, res) => {
  const g = LB_GROUPS.find(x => x.esId === req.params.id);
  if (!g) return res.json(fail('集群不存在', 404));
  Object.assign(g, req.body);
  res.json(ok(g));
});
app.post('/ticket/api/v1/asset/lb_groups', (req, res) => {
  const g = { ...req.body, esId: `lbg-${LB_GROUPS.length + 1}` };
  LB_GROUPS.push(g);
  res.json(ok(g));
});
app.delete('/ticket/api/v1/asset/lb_group/:id', (req, res) => {
  const idx = LB_GROUPS.findIndex(x => x.esId === req.params.id);
  if (idx > -1) LB_GROUPS.splice(idx, 1);
  res.json(ok({}));
});

// --- LVS ---
app.get('/ticket/api/v1/asset/lvss', (req, res) => {
  const lvs = filterByParams(LVS_INSTANCES, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ lvss: lvs.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: lvs.length }));
});
app.get('/ticket/api/v1/asset/lvs/:id', (req, res) => {
  const l = LVS_INSTANCES.find(x => x.instanceName === req.params.id);
  if (!l) return res.json(fail('LVS 不存在', 404));
  res.json(ok(l));
});
app.post('/ticket/api/v1/asset/lvss', (req, res) => {
  const l = { ...req.body, esId: `lvs-${LVS_INSTANCES.length + 1}`, instanceStatus: '正常' };
  LVS_INSTANCES.push(l);
  res.json(ok(l));
});
app.delete('/ticket/api/v1/asset/lvs/:name', (req, res) => {
  const idx = LVS_INSTANCES.findIndex(x => x.instanceName === req.params.name);
  if (idx > -1) LVS_INSTANCES.splice(idx, 1);
  res.json(ok({}));
});
app.get('/ticket/api/v1/asset/lvs/:name/exists', (req, res) => {
  const exists = LVS_INSTANCES.some(x => x.instanceName === req.params.name);
  res.json(ok({ exists }));
});

// --- NAT ---
app.get('/ticket/api/v1/asset/nats', (req, res) => {
  const nats = filterByParams(NAT_INSTANCES, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ nats: nats.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: nats.length }));
});
app.delete('/ticket/api/v1/asset/nat/:id', (req, res) => {
  const idx = NAT_INSTANCES.findIndex(x => x.esId === req.params.id);
  if (idx > -1) NAT_INSTANCES.splice(idx, 1);
  res.json(ok({}));
});

// --- IP ---
app.get('/ticket/api/v1/asset/ips', (req, res) => {
  const ips = filterByParams(IPS, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ ips: ips.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: ips.length }));
});
app.post('/ticket/api/v1/asset/ips/batch', (req, res) => {
  // 前端 src/views/assets/ip/createIp 发送单个 IP 对象；批量场景发数组，两者都兼容
  const list = Array.isArray(req.body) ? req.body : [req.body];
  list.forEach((item, i) => IPS.push({ esId: `ip-${IPS.length + i + 1}`, isUsed: 'False', ...item }));
  res.json(ok({}));
});
app.patch('/ticket/api/v1/asset/ip/:id', (req, res) => {
  const ip = IPS.find(x => x.esId === req.params.id);
  if (!ip) return res.json(fail('IP 不存在', 404));
  Object.assign(ip, req.body);
  res.json(ok(ip));
});

// --- DNS ---
app.get('/ticket/api/v1/asset/dnss', (req, res) => {
  const dnss = filterByParams(DNS_RECORDS, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ dnss: dnss.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: dnss.length }));
});
app.put('/ticket/api/v1/asset/dns/:domain', (req, res) => {
  const d = DNS_RECORDS.find(x => x.domain === req.params.domain);
  if (!d) return res.json(fail('DNS 记录不存在', 404));
  Object.assign(d, req.body);
  d.handleUserName = USERS[0].name;
  res.json(ok(d));
});
app.put('/ticket/api/v1/asset/dns/retry/:domain', (req, res) => {
  res.json(ok({}));
});

// --- 内外网映射 ---
app.get('/ticket/api/v1/asset/net_mappings', (req, res) => {
  const mappings = filterByParams(NET_MAPPINGS, req.query);
  const pageNum = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 10;
  res.json(ok({ net_mappings: mappings.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: mappings.length }));
});

// --- IP 统计（子网） ---
app.get('/ticket/api/v1/asset/ip/statistics', (req, res) => {
  res.json(ok({ statistics: Object.keys(IDC_SUBNETS).map(subnet => ({ sub_net: subnet, count: IDC_SUBNETS[subnet] })) }));
});

// ============ 工单资源相关 API（lvs/nat/dns/vm 检查与日志） ============
// 校验 lvs 端口
app.post('/lvs/qa/api/v1/:type/check', (req, res) => {
  const { master_ip_list = [], port_list = [] } = req.body || {};
  const result = master_ip_list.map(ip => port_list.map(port => ({ address: ip, port, result: true })));
  res.json(ok(result.flat()));
});
// 校验机柜
app.post('/lvs/qa/api/v1/cabinet/check', (req, res) => {
  res.json(ok(true));
});
// 根据 server_uuids 获取关联 lvs
app.post('/lvs/qa/api/v1/lvs/related', (req, res) => {
  const { server_uuids = [] } = req.body || {};
  const data = {};
  server_uuids.forEach(uuid => {
    data[uuid] = LVS_INSTANCES.filter(l => {
      try {
        return JSON.parse(l.rsUuidList).includes(uuid);
      } catch (e) {
        return false;
      }
    });
  });
  res.json(ok(data));
});
// 根据 server_uuids 获取关联 nat
app.post('/nat/api/v1/nat_instances', (req, res) => {
  const { server_uuids = [] } = req.body || {};
  const data = NAT_INSTANCES.map(n => {
    const item = {};
    n.clientServerUuidMappingIps.forEach((ip, i) => {
      item[server_uuids[i] || `uuid-server-${i}`] = { instanceName: n.instanceName, product: n.assetProduct, specifiedPublicVip: ip, usage: n.usage };
    });
    return item;
  });
  res.json(ok(data));
});
// lvs 日志
app.get('/lvs/qa/api/v1/log/:ticketId', (req, res) => {
  res.json(ok('mock lvs 开通日志\n第1行: 检查通过\n第2行: 开通成功'));
});
// nat 日志
app.get('/nat/api/v1/nat_log/:id', (req, res) => {
  res.json(ok({ log: 'mock nat 开通日志\n开通成功' }));
});
// vm 任务日志
app.get('/hyperv/local/api/v1/hyperv/task_log/:taskId', (req, res) => {
  res.json(ok({ logs: [{ time: '2025-01-01 10:00:00', msg: '创建虚拟机任务开始' }, { time: '2025-01-01 10:01:00', msg: '任务完成' }] }));
});
// vm 工单配置
app.get('/hyperv/local/api/v1/hyperv/ticket/:ticketId', (req, res) => {
  const ticket = findTicket(req.params.ticketId);
  if (ticket && ticket.configurations && ticket.configurations.each_config) {
    return res.json(ok({ result: ticket.configurations.each_config }));
  }
  res.json(ok({ result: [] }));
});
// 删除 vm 任务
app.delete('/hyperv/local/api/v1/hyperv/vm_task/:taskId', (req, res) => {
  res.json(ok({}));
});
// vm 子网
app.get('/hyperv/local/api/v1/hyperv/idc_subnet', (req, res) => {
  res.json(ok({ idc_subnet: IDC_SUBNETS }));
});
// vm 宿主机
app.get('/hyperv/local/api/v1/hyperv/host_server', (req, res) => {
  const hosts = SERVERS.filter(s => s.assetServerType === '物理机' && s.assetAssetStatus === '正常运行').map(s => ({
    uuid: s.assetServerUuid,
    hostname: s.logicalHostName,
    ip: s.logicalIp,
    product: s.assetProduct,
    idc: s.assetIdc,
    cabinet: s.assetCabinet,
    business_level: s.assetLevel,
    cpu_cores: s.deviceCpusCores,
    free_memory: s.logicalTotalMemorySizeInGb,
    free_memory_monitor: s.logicalTotalMemorySizeInGb,
    free_disk: s.deviceDisks * 500,
  }));
  res.json(ok({ hosts }));
});
// vm 子网 IP
app.get('/hyperv/local/api/v1/hyperv/subnet_ip', (req, res) => {
  const subnet = req.query.subnet || '192.168.1.0/24';
  const prefix = subnet.split('/')[0].split('.').slice(0, 3).join('.');
  const subnet_ips = Array.from({ length: 10 }, (_, i) => ({
    ip: `${prefix}.${200 + i}`,
    idc: req.query.idc || '机房A',
    netmask: '255.255.255.0',
    gateway: `${prefix}.1`,
    subnet,
  }));
  res.json(ok({ subnet_ips, idc_subnet: IDC_SUBNETS }));
});
// 新主机名
app.get('/hyperv/local/api/v1/hyperv/new_hostname', (req, res) => {
  res.json(ok({ uuid: `uuid-server-new-${Date.now()}`, hostname: `new-server-${Date.now() % 10000}` }));
});
// 工单日志(批量)
app.get('/ticket/api/v1/vms', (req, res) => {
  if (req.query.cmd === 'GetTaskLog') {
    return res.json(ok({ logs: [{ time: '2025-01-01 10:00:00', msg: '收集任务完成' }] }));
  }
  res.json(ok({}));
});
// 虚拟机收集任务
app.get('/ticket/api/v1/vm_collection_tasks', (req, res) => {
  res.json(ok({ vm_collection_tasks: [{ id: 'task-1', ip: '192.168.10.1', status: 'success' }] }));
});
app.delete('/ticket/api/v1/vm_collection_task/:id', (req, res) => {
  res.json(ok({}));
});

// DNS 域列表
app.get('/dns_module/api/v1/dns/domain', (req, res) => {
  const scope = req.query.scope || 'public';
  res.json(ok(DOMAINS[scope] || []));
});
// DNS exist
app.get('/dns_module/api/v1/dns/exist', (req, res) => {
  const { sub_domain, primary_domain } = req.query;
  const exist = DNS_RECORDS.some(d => d.subDomain === sub_domain && d.primaryDomain === primary_domain);
  res.json(ok({ exist, error_msg: exist ? '域名已存在' : '' }));
});
// DNS 参数检查
app.get('/dns_module/api/v1/dns/check', (req, res) => {
  res.json(ok({ pass: true, error_msg: '' }));
});
// DNS 任务列表
app.get('/dns_module/api/v1/dns/tasklist', (req, res) => {
  res.json(ok([{ id: 'dns-task-1', status: 'success' }]));
});

// lvs 相关的老接口（getServer/getProduction/getLbgroup/getIp/getIdc/getSystems 走 /lvs/qa/api/v1）
app.post('/lvs/qa/api/v1/servers', (req, res) => {
  const { equals = {}, contains = {}, not_equals = {}, tenant, user_id } = req.body || {};
  let servers = SERVERS.filter(s => s.assetAssetStatus === (equals.assetAssetStatus || '正常运行'));
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  res.json(ok({ result: servers.slice((page - 1) * size, page * size), meta: { total: servers.length } }));
});
app.post('/lvs/qa/api/v1/servers/uuid', (req, res) => {
  const { server_uuids = [] } = req.body || {};
  res.json(ok(SERVERS.filter(s => server_uuids.includes(s.assetServerUuid))));
});
app.post('/lvs/qa/api/v1/productions', (req, res) => {
  res.json(ok({ result: PRODUCTS.map(name => ({ name })) }));
});
app.post('/lvs/qa/api/v1/idcs', (req, res) => {
  res.json(ok({ result: IDCS.map(name => ({ name })) }));
});
app.post('/lvs/qa/api/v1/lbgroups', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  res.json(ok({ result: LB_GROUPS, meta: { total: LB_GROUPS.length } }));
});
app.post('/lvs/qa/api/v1/ips', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  res.json(ok({ result: IPS, meta: { total: IPS.length } }));
});
app.post('/lvs/qa/api/v1/systems', (req, res) => {
  res.json(ok({ result: SYSTEMS.map(v => ({ version: v, type: v.includes('Windows') ? 'Windows' : 'CentOS' })) }));
});
app.post('/lvs/qa/api/v1/networks', (req, res) => {
  res.json(ok({ result: SUB_NETS.map(name => ({ name })) }));
});

// 测试辅助：重置内存状态
app.post('/__mock/reset', (req, res) => {
  TICKETS = makeInitialTickets();
  PROCESSES = makeInitialProcesses();
  // makeInitialTickets 已将 ticketSeq 推进到初始工单之后（10004），
  // 不能再重置回 10000，否则新工单 id 会与初始工单冲突
  processSeq = 1;
  res.json(ok({}));
});

// 通用兜底（必须放在最后）
app.all('*', (req, res) => {
  console.log(`[mock] unhandled: ${req.method} ${req.path}`);
  res.json(ok({}));
});

app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});
