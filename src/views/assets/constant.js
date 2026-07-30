export function arr2map(arr) {
  return arr.map(item => ({
    label: item,
    value: item,
  }));
}

export const assetsLevel = ['生产', '测试'];
export const assetsLevelMap = arr2map(assetsLevel);

export const assetsOS = ['Centos', 'Windows'];
export const assetsOSMap = arr2map(assetsOS);

export const assetsServerType = ['物理机', '虚拟机'];
export const assetsServerTypeMap = arr2map(assetsServerType);

export const assetsStatusAll = ['关机保留', '删除', '正常运行', '下架', '报废', '外调'];
export const assetsStatusAllMap = arr2map(assetsStatusAll);

export const assetsStatusPhysical = ['下架', '报废', '外调', '正常运行'];
export const assetsStatusPhysicalMap = arr2map(assetsStatusPhysical);

export const assetsStatusVirtual = ['关机保留', '删除', '正常运行'];
export const assetsStatusVirtualMap = arr2map(assetsStatusVirtual);

export const assetsOwner = ['与我相关'];
export const assetsOwnerMap = arr2map(assetsOwner);

export const serverStatus = ['删除', '下架', '正常运行', '报废', '外调', '关机保留'];
export const lvsStatus = ['正常', '删除失败', '删除', '删除中'];
export const lvsStatusMap = {
  '正常': 'success',
  '删除失败': 'danger',
  '删除': 'danger',
  '删除中': 'warning',
  '未知': 'warning'
};
export const natStatus = ['关闭', '正常', '删除'];
export const natStatusMap = {
  '关闭': 'primary',
  '正常': 'success',
  '删除': 'danger',
};
export const dnsStatus = ['deleted', 'exception', 'deleting', 'unknown', 'enable'];
export const dnsStatusMap = {
  'deleted': 'primary',
  'exception': 'danger',
  'deleting': 'warning',
  'unknown': 'warning',
  'enable': 'success',
};
export const dnsStatusLabelMap = {
  'enable': '正常',
  'exception': '异常',
  'deleting': '正在删除',
  'deleted': '已删除',
  'unknown': '未知',
};
export const dnsStatusListMap = Object.keys(dnsStatusLabelMap).map(status => {
  return {
    label: dnsStatusLabelMap[status],
    value: status,
  };
});
