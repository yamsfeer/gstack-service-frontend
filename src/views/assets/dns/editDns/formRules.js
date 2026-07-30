import { validatorGenerator, ruleTypes } from '@/utils/validator';
import { isIpLegal } from '@/utils/ipValidate';
const { empty, rightInt, gte } = ruleTypes;
const g = validatorGenerator;

export default {
  subDomain: {
    required: true,
    trigger: 'blur',
    message: '请输入域名',
  },
  ttl: {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: empty,
        err: '请输入TTL',
      },
      {
        expr: rightInt,
        err: '请输入整数',
      },
      {
        expr: gte(1),
        err: '请大于等于1的整数',
      }
    ]),
  },
  value: {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: empty,
        err: '请输入正确的ip地址',
      },
      {
        expr: isIpLegal,
        err: '请输入正确的ip地址',
      }
    ]),
  }
};
