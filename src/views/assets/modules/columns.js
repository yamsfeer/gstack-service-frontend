/**
 * @file 资产列表包含的列配置
 * @param {string} width 列宽度
 * @param {boolean} sortable 是否可排序
 * @param {boolean} disabled 是否必须显示（主要用于列配置）
 * @param {string} label 列名称
 * @param {string} value 列字段名
*/

export const serverColumns = [
  { width: '140px', sortable: true, disabled: true, fixed: true, label: '主机名', value: 'logicalHostName' },
  { width: '140px', sortable: true, disabled: true, fixed: 'right', label: '资产状态', value: 'assetAssetStatus' },
  { width: '140px', sortable: true, disabled: false, label: '宿主机', value: 'logicalHostMachine' },
  { width: '160px', sortable: true, disabled: false, label: 'IP地址', value: 'logicalIpListIpAddress' },
  { width: '140px', sortable: true, disabled: false, label: '产品', value: 'assetProduct' },
  { width: '140px', sortable: true, disabled: false, label: '级别', value: 'assetLevel' },
  { width: '140px', sortable: true, disabled: false, label: '机房', value: 'assetIdc' },
  { width: '140px', sortable: true, disabled: false, label: '操作系统', value: 'logicalOperationSystem' },
  { width: '140px', sortable: true, disabled: false, label: '所属人', value: 'assetOwner' },
  { width: '140px', sortable: true, disabled: false, label: '服务器描述', value: 'assetUsage' },
  { width: '140px', sortable: true, disabled: false, label: '所有内存容量', value: 'logicalTotalMemorySizeInGb' },
  { width: '140px', sortable: true, disabled: false, label: 'CPU核心数', value: 'deviceCpusCores' },
  { width: '140px', sortable: true, disabled: false, label: '所有的硬盘数', value: 'deviceDisks' },
  { width: '140px', sortable: true, disabled: false, label: 'IDRAC地址', value: 'logicalIdracIp' },
  { width: '140px', sortable: true, disabled: false, label: '网关', value: 'logicalIpListGateway' },
  { width: '140px', sortable: true, disabled: false, label: '机柜', value: 'assetCabinet' },
  { width: '140px', sortable: true, disabled: false, label: '行政,财务资产编号', value: 'assetAssetId' },
  { width: '140px', sortable: true, disabled: false, label: '快速服务代码', value: 'assetExpressServiceCode' },
  { width: '140px', sortable: true, disabled: false, label: '服务器质保时间', value: 'assetLifecyclePhysicalServerWarrantyTime' },
  { width: '140px', sortable: true, disabled: false, label: 'saltid', value: 'assetServerUuid' },
  { width: '140px', sortable: true, disabled: false, label: 'vm名称', value: 'assetVmName' },
  { width: '140px', sortable: true, disabled: false, label: '服务器类型', value: 'assetServerType' },
  { width: '140px', sortable: true, disabled: false, label: '型号', value: 'deviceModel' },
  { width: '140px', sortable: true, disabled: false, label: 'ZABBIX主机ID', value: 'logicalZabbixHostid' },
  { width: '160px', sortable: true, disabled: false, label: '宿主机IP地址', value: 'logicalHostMachineIpAddress' },
];

export const clusterColumns = [
  { width: '140px', sortable: true, disabled: true, fixed: true, label: '负载均衡集群名', value: 'groupName' },
  { width: '140px', sortable: true, disabled: false, label: '产品线', value: 'product' },
  { width: '140px', sortable: true, disabled: false, label: '所在网络', value: 'subNet' },
  { width: '140px', sortable: true, disabled: false, label: '所在机房', value: 'idc' },
  { width: '140px', sortable: true, disabled: false, label: '服务描述', value: 'usage' },
  { width: '140px', sortable: true, disabled: false, label: '创建日期', value: 'dateCreated' },
  { width: '140px', sortable: true, disabled: false, label: '成员主机名', value: 'memberHostList' },
  { width: '140px', sortable: true, disabled: false, label: '成员管理IP', value: 'memberHostManagedIp' },
  { width: '140px', sortable: true, disabled: false, label: '私网VIP', value: 'privateVipListVip' },
  { width: '140px', sortable: true, disabled: false, label: '占用RouterID', value: 'privateVipListRouterId' },
  // { width: '140px', sortable: true, disabled: false, label: '累计预估使用带宽', value: 'peak_prediction_in_mbps' },
];

export const lvsColumns = [
  { width: '140px', sortable: true, disabled: true, fixed: true, label: '实例名', value: 'instanceName' },
  { width: '140px', sortable: true, disabled: true, fixed: 'right', label: '实例状态', value: 'instanceStatus' },
  { width: '140px', sortable: true, disabled: false, label: '产品线', value: 'product' },
  { width: '140px', sortable: true, disabled: false, label: '机房', value: 'idc' },
  { width: '140px', sortable: true, disabled: false, label: '开通日期', value: 'dateCreated' },
  { width: '160px', sortable: true, disabled: false, label: '公网VIP', value: 'publicVip' },
  { width: '140px', sortable: true, disabled: false, label: '公网开放端口列表', value: 'portList' },
  { width: '140px', sortable: true, disabled: false, label: '所在负载均衡集群', value: 'assetLbGroup' },
  { width: '160px', sortable: true, disabled: false, label: '主负载均衡分发器', value: 'directorMasterUuidMappingIp' },
  { width: '160px', sortable: true, disabled: false, label: '后端主机列表', value: 'rsUuidListMappingIps' },
  { width: '140px', sortable: true, disabled: false, label: '描述', value: 'usage' },
  { width: '140px', sortable: true, disabled: false, label: '申请人', value: 'owner' },
  { width: '140px', sortable: true, disabled: false, label: '连接超时时间', value: 'persistent' },
  { width: '140px', sortable: true, disabled: false, label: '轮询算法', value: 'lbAlgo' },
  { width: '140px', sortable: true, disabled: false, label: '公网RouterID', value: 'publicRouterId' },
  { width: '140px', sortable: true, disabled: false, label: '所在网络', value: 'subNet' },
  // { width: '140px', sortable: true, disabled: false, label: '累计预估使用带宽', value: 'peakPredictionInMbps' },
  // { width: '140px', sortable: true, disabled: false, label: '申请人账号', value: 'ownerAccount' },
  // { width: '140px', sortable: true, disabled: false, label: '机房', value: 'idc' },
  // { width: '140px', sortable: true, disabled: false, label: '确认方法', value: 'checkMethod' },
  // { width: '140px', sortable: true, disabled: false, label: '资产状态', value: 'assetStatus' },
  // { width: '140px', sortable: true, disabled: false, label: '转发类型', value: 'lbKind' },
  // { width: '140px', sortable: true, disabled: false, label: '唯一标识', value: 'esId' },
];

export const natColumns = [
  { width: '140px', sortable: true, disabled: true, fixed: true, label: '实例名', value: 'instanceName' },
  { width: '140px', sortable: true, disabled: true, fixed: 'right', label: '实例状态', value: 'instanceStatus' },
  { width: '140px', sortable: true, disabled: false, label: '产品线', value: 'assetProduct' },
  { width: '140px', sortable: true, disabled: false, label: '机房', value: 'idc' },
  { width: '140px', sortable: true, disabled: false, label: '申请人', value: 'owner' },
  { width: '140px', sortable: true, disabled: false, label: '创建日期', value: 'dateCreated' },
  { width: '140px', sortable: true, disabled: false, label: '所在负载均衡集群', value: 'assetLbGroup' },
  { width: '160px', sortable: true, disabled: false, label: '主负载均衡分发器', value: 'directorMasterUuidMappingIp' },
  { width: '160px', sortable: true, disabled: false, label: '后端主机', value: 'clientServerUuidMappingIps' },
  { width: '140px', sortable: true, disabled: false, label: '描述', value: 'usage' },
  // { width: '140px', sortable: true, disabled: false, label: '累计预估使用带宽', value: 'peakPredictionInMbps' },
  // { width: '140px', sortable: true, disabled: false, label: '机房', value: 'idc' },
  // { width: '140px', sortable: true, disabled: false, label: '产品', value: 'product' },
  // { width: '140px', sortable: true, disabled: false, label: '唯一标识', value: 'esId' },
];

export const ipColumns = [
  { width: '160px', sortable: true, disabled: true, fixed: true, label: 'IP地址', value: 'ipAddress' },
  { width: '140px', sortable: true, disabled: true, fixed: 'right', label: '是否占用', value: 'isUsed' },
  { width: '140px', sortable: true, disabled: false, label: '所在机房', value: 'idc' },
  { width: '140px', sortable: true, disabled: false, label: '类型', value: 'type' },
  { width: '140px', sortable: true, disabled: false, label: '子网掩码', value: 'netmask' },
  { width: '140px', sortable: true, disabled: false, label: '掩码位数', value: 'prefix' },
  { width: '140px', sortable: true, disabled: false, label: '网关', value: 'defaultGateway' },
  { width: '140px', sortable: true, disabled: false, label: '子网地址', value: 'subNet' },
  { width: '140px', sortable: true, disabled: false, label: '是否爬虫专用', value: 'usedforSpider' },
  // { width: '140px', sortable: true, disabled: false, label: '类型', value: 'type' },
  // { width: '140px', sortable: true, disabled: false, label: '唯一标识', value: 'esId' },
];

// export const dnsColumns = [
//   { width: '140px', sortable: true, disabled: true, fixed: true, label: '域名', value: 'subDomain' },
//   { width: '150px', sortable: true, disabled: true, fixed: 'right', label: '状态', value: 'status' },
//   { width: '140px', sortable: true, disabled: false, label: '根域', value: 'primaryDomain' },
//   { width: '140px', sortable: true, disabled: false, label: '解析地址', value: 'value' },
//   { width: '140px', sortable: true, disabled: false, label: '产品', value: 'production' },
//   { width: '140px', sortable: true, disabled: false, label: '区域', value: 'scope' },
//   { width: '140px', sortable: true, disabled: false, label: '解析类型', value: 'recordType' },
//   { width: '140px', sortable: true, disabled: false, label: '记录缓存时间', value: 'ttl' },
//   { width: '140px', sortable: true, disabled: false, label: '申请人', value: 'applyUserName' },
//   { width: '140px', sortable: true, disabled: false, label: '修改人', value: 'lastModifyUserName' },
//   { width: '140px', sortable: true, disabled: false, label: '修改时间', value: 'endTime' },
//   { width: '140px', sortable: true, disabled: false, label: '来源', value: 'origin' },
//   // { width: '140px', sortable: true, disabled: false, label: '备注', value: 'remark' },
//   // { width: '140px', sortable: true, disabled: false, label: '日志信息', value: 'message' },
//   // { width: '140px', sortable: true, disabled: false, label: '审核人', value: 'approveUserName' },
//   // { width: '140px', sortable: true, disabled: false, label: 'ID', value: 'id' },
//   // { width: '140px', sortable: true, disabled: false, label: '唯一标识', value: 'esId' },
// ];

export const dnsColumns = [
  { width: '140px', sortable: true, disabled: true, fixed: true, label: '域名', value: 'domain' },
  { width: '140px', sortable: true, disabled: false, label: '子域', value: 'subDomain' },
  { width: '150px', sortable: true, disabled: false, label: '根域', value: 'primaryDomain' },
  { width: '140px', sortable: true, disabled: false, label: '解析地址', value: 'value' },
  { width: '140px', sortable: true, disabled: false, label: '区域', value: 'scope' },
  { width: '140px', sortable: true, disabled: false, label: '解析类型', value: 'recordType' },
  { width: '140px', sortable: true, disabled: false, label: '记录缓存时间', value: 'ttl' },
  { width: '140px', sortable: true, disabled: false, label: '申请人', value: 'createUserName' },
  { width: '140px', sortable: true, disabled: false, label: '修改人', value: 'handleUserName' },
  { width: '140px', sortable: true, disabled: false, label: '创建时间', value: 'createTime' },
  // { width: '140px', sortable: true, disabled: false, label: '申请人租户', value: 'createTenantId' },
  { width: '140px', sortable: true, disabled: false, label: '描述', value: 'description' },
  // { width: '140px', sortable: true, disabled: false, label: '备注', value: 'remark' },
  // { width: '140px', sortable: true, disabled: false, label: '日志信息', value: 'message' },
  // { width: '140px', sortable: true, disabled: false, label: '审核人', value: 'approveUserName' },
  // { width: '140px', sortable: true, disabled: false, label: 'ID', value: 'id' },
  // { width: '140px', sortable: true, disabled: false, label: '唯一标识', value: 'esId' },
];

export const netmapColumns = [
  { width: '140px', sortable: true, disabled: true, label: '公网IP', value: 'publicIp' },
  { width: '140px', sortable: true, disabled: false, label: '私网IP', value: 'privateIp' },
  { width: '140px', sortable: true, disabled: false, label: '机房', value: 'idc' },
  { width: '140px', sortable: true, disabled: false, label: '映射类型', value: 'mappingType' },
  { width: '140px', sortable: true, disabled: false, label: '相关域名', value: 'domains' },
];
