import { validatorGenerator, ruleTypes } from '@/utils/validator';
import { isIpLegal } from '@/utils/ipValidate';
const { range } = ruleTypes;
const g = validatorGenerator;

export default {
  idc: {
    required: true,
    trigger: 'change',
    message: '请选择所在机房',
  },
  type: {
    required: true,
    trigger: 'change',
    message: '请选择IP类型',
  },
  usedforSpider: {
    required: true,
    trigger: 'change',
    validator: g({
      expr: value => typeof value === 'string',
      err: '请选择是否爬虫专用网段',
    }),
  },
  ipAddressStart: {
    required: true,
    trigger: 'blur',
    validator: g({
      expr: isIpLegal,
      err: '请输入正确的ip地址',
    }),
  },
  ipAddressEnd: {
    required: true,
    trigger: 'blur',
    validator: g({
      expr: isIpLegal,
      err: '请输入正确的ip地址',
    }),
  },
  prefix: {
    trigger: 'blur',
    validator: g({
      expr: range(16, 32),
      err: '掩码位范围是16至32的整数'
    }),
  },
  defaultGateway: {
    trigger: 'blur',
    validator: g({
      expr: isIpLegal,
      err: '请输入正确的网关',
    }),
  },
};
