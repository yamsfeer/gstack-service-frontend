import {
  validatorGenerator,
  ruleTypes
} from '@/utils/validator';

const g = validatorGenerator;
const required = [];

const int = [
  'peakPredictionInMbps'
];

const float = [];

function setRule() {
  let rule = {};
  required.forEach(item => {
    const [key, label, type] = item.split('-');
    rule[key] = {
      required: true,
      trigger: 'blur',
      validator: g([{
        expr: ruleTypes.empty,
        err: `请${type || '输入'}${label}`
      }])
    };
  });

  int.forEach(key => {
    rule[key] = {
      trigger: 'blur',
      validator: g([{
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      }])
    };
  });

  float.forEach(key => {
    rule[key] = {
      trigger: 'blur',
      validator: g([{
        expr: ruleTypes.rightFloat,
        err: '请输入数字'
      }])
    };
  });
  rule.publicRouterId = {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请输入公网RouteID'
      },
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.range(1, 256),
        err: '请输入[1, 256]的整数'
      }
    ])
  };
  return rule;
}
export const rules = setRule();
