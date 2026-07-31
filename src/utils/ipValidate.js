export function isIpLegal(ip) {
  // const reg = /^(((25[0-5]|2[0-4]d|1d{2}|[1-9]d|[0-9]).){3}(25[0-5]|2[0-4]d|1d{2}|[1-9]d|[0-9]))$/;
  const reg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
  return reg.test(ip);
}

export function isIpAndMaskLegal(seg) {
  const [ip, mask] = seg.split('/');
  return isIpLegal(ip) && parseInt(mask) >= 0 && parseInt(mask) < 32;
}

/* IP地址转换为二进制字符串 */
/* 例如：172.16.4.235 --> 10101100000100000000010011101011 */
export function ip2Binary(ip) {
  if (!isIpLegal(ip)) {
    return;
  }
  return ip.split('.').reduce((acc, cur) => {
    const bin = Number(cur)
      .toString(2)
      .padStart(8, '0');
    return `${acc}${bin}`;
  }, '');
}

export function binaryToIp(bin) {
  let ip = '';
  for (let i = 0; i < bin.length; i += 8) {
    ip += `.${parseInt(bin.substr(i, 8), 2)}`;
  }
  ip = ip.substr(1);
  return ip;
}

/* 判断子网掩码是否合法 */
/* 子网掩码必须是 1 和 0组成的连续的一段 如 11110000 */
export function isMaskLegal(mask) {
  const bin = ip2Binary(mask);
  if (!bin) {
    return false;
  }

  const index = bin.lastIndexOf('1') + 1;
  const front = bin.substring(0, index);
  const back = bin.substring(index);

  return !front.includes('0') && !back.includes('1');
}

/* 两个IP地址做 与 操作 返回结果 */
/* 该功能主要用来实现 IP地址和子网掩码 相与，获取当前IP地址的IP地址段 */
/* 以此来验证输入的网关地址是否合法 */
export function ipAndMask(ip, mask) {
  if (!isIpLegal(ip) || !isIpLegal(mask)) {
    return;
  }
  const _ip = ip.split('.');
  const _mask = mask.split('.');

  return _ip
    .map((item, index) => Number(item) & Number(_mask[index]))
    .join('.');
}

/* 判断网关地址是否合法 */
export function isGatewayLegal(ip, mask, gateway) {
  return ipAndMask(ip, mask) === ipAndMask(gateway, mask);
}

/**
 *掩码位数得子网掩码的二进制
 *
 * @export
 * @param {number} bit 掩码位数 0-32整数
 * @param {number} isBinary 是否返回二进制格式
 * @returns 16位掩码 -> '11111111111111110000000000000000' = '255.255.0.0'
 */
export function number2Mask(bit, isBinary = true) {
  bit = Number(bit);
  if (Number.isNaN(bit) || bit > 32) {
    return '';
  }
  const bin = ''.padStart(bit, '1').padEnd(32, '0');
  return isBinary ? bin : binaryToIp(bin);
}

/* 判断网段包含另一个网段 */
/* 10.10.10.10/16 20.20.20.20/16 */
export function isSegmentContain(seg1, seg2) {
  try {
    const [ip1, mask1] = seg1.split('/');
    const [ip2, mask2] = seg2.split('/');

    const bin1 = ip2Binary(ipAndMask(ip1, number2Mask(mask1, false)));
    const bin2 = ip2Binary(ipAndMask(ip2, number2Mask(mask2, false)));

    return bin1.slice(0, mask1) === bin2.slice(0, mask1);
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * 由ip和掩码位计算广播地址
 * ip转为二进制后，将掩码位后的数字全转为1再转回10进制就是广播地址
 *
 * @export
 * @param {string} ip ip地址 192.168.1.1
 * @param {number} maskBit 掩码位数 16
 * @returns {string} 广播地址
 */
export function broadcast(ip, maskBit = 16, isBinary = false) {
  if (!isIpLegal(ip) || maskBit > 32) {
    return '0.0.0.0';
  }
  const ipBin = ip2Binary(ip);
  const broadcast = ipBin.slice(0, maskBit).padEnd(32, 1);
  return isBinary ? broadcast : binaryToIp(broadcast);
}

/**
 * 由ip和掩码位计算网络地址
 * ip转为二进制后，将掩码位后的数字全转为0再转回10进制就是网络
 *
 * @export
 * @param {string} ip ip地址 192.168.1.1
 * @param {number} maskBit 掩码位数 16
 * @returns {string} 网络地址
 */
export function network(ip, maskBit = 16, isBinary = false) {
  if (!isIpLegal(ip) || maskBit > 32) {
    return '0.0.0.0';
  }
  const ipBin = ip2Binary(ip);
  const network = ipBin.slice(0, maskBit).padEnd(32, 0);
  return isBinary ? network : binaryToIp(network);
}
