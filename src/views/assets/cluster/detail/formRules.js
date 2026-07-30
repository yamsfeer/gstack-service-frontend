import {
  validatorGenerator,
  ruleTypes
} from '@/utils/validator';

const g = validatorGenerator;
const required = [
  'groupName-名称',
  'product-产品线-选择',
  'idc-机房-选择',
  'subNet-网段-选择'
];

const int = [];

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
  return rule;
}
export const rules = setRule();
