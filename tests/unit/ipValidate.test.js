import { describe, it, expect } from 'vitest';
import {
  isIpLegal,
  isIpAndMaskLegal,
  ip2Binary,
  binaryToIp,
  isMaskLegal,
  ipAndMask,
  isGatewayLegal,
  number2Mask,
  isSegmentContain,
  broadcast,
  network,
} from '@/utils/ipValidate';

describe('ipValidate.js', () => {
  it('isIpLegal 判断 IP 合法性', () => {
    expect(isIpLegal('192.168.1.1')).toBe(true);
    expect(isIpLegal('255.255.255.255')).toBe(true);
    expect(isIpLegal('0.0.0.0')).toBe(true);
    expect(isIpLegal('256.1.1.1')).toBe(false);
    expect(isIpLegal('1.2.3')).toBe(false);
    expect(isIpLegal('abc.def.ghi.jkl')).toBe(false);
    expect(isIpLegal('')).toBe(false);
  });

  it('isIpAndMaskLegal 判断 ip/mask 段', () => {
    expect(isIpAndMaskLegal('192.168.1.1/24')).toBe(true);
    expect(isIpAndMaskLegal('192.168.1.1/32')).toBe(false); // mask < 32
    expect(isIpAndMaskLegal('192.168.1.1/33')).toBe(false);
    expect(isIpAndMaskLegal('abc/24')).toBe(false);
  });

  it('ip2Binary / binaryToIp 互相转换', () => {
    expect(ip2Binary('192.168.1.1')).toBe('11000000101010000000000100000001');
    expect(ip2Binary('bad-ip')).toBeUndefined();
    expect(binaryToIp('11000000101010000000000100000001')).toBe('192.168.1.1');
  });

  it('isMaskLegal 判断子网掩码', () => {
    expect(isMaskLegal('255.255.255.0')).toBe(true);
    expect(isMaskLegal('255.255.0.0')).toBe(true);
    expect(isMaskLegal('255.0.0.0')).toBe(true);
    expect(isMaskLegal('0.0.0.0')).toBe(true);
    expect(isMaskLegal('255.0.255.0')).toBe(false);
    expect(isMaskLegal('abc')).toBe(false);
  });

  it('ipAndMask 做与运算', () => {
    expect(ipAndMask('192.168.1.100', '255.255.255.0')).toBe('192.168.1.0');
    expect(ipAndMask('bad', '255.255.255.0')).toBeUndefined();
  });

  it('isGatewayLegal 判断网关合法性', () => {
    expect(isGatewayLegal('192.168.1.100', '255.255.255.0', '192.168.1.1')).toBe(true);
    expect(isGatewayLegal('192.168.1.100', '255.255.255.0', '192.168.2.1')).toBe(false);
  });

  it('number2Mask 掩码位数转掩码', () => {
    expect(number2Mask(24)).toBe('11111111111111111111111100000000');
    expect(number2Mask(16, false)).toBe('255.255.0.0');
    expect(number2Mask(0)).toBe('00000000000000000000000000000000');
    expect(number2Mask(33)).toBe('');
    expect(number2Mask('abc')).toBe('');
  });

  it('isSegmentContain 判断网段包含', () => {
    expect(isSegmentContain('10.10.10.0/16', '10.10.20.0/24')).toBe(true);
    expect(isSegmentContain('10.10.20.0/24', '10.10.0.0/16')).toBe(false);
  });

  it('broadcast 计算广播地址', () => {
    expect(broadcast('192.168.1.100', 24)).toBe('192.168.1.255');
    expect(broadcast('192.168.1.100', 16)).toBe('192.168.255.255');
    expect(broadcast('bad-ip', 24)).toBe('0.0.0.0');
    expect(broadcast('192.168.1.1', 33)).toBe('0.0.0.0');
  });

  it('network 计算网络地址', () => {
    expect(network('192.168.1.100', 24)).toBe('192.168.1.0');
    expect(network('10.10.10.10', 16)).toBe('10.10.0.0');
    expect(network('bad-ip', 24)).toBe('0.0.0.0');
  });
});
