import {
  validatorGenerator,
  ruleTypes
} from '@/utils/validator';

const g = validatorGenerator;
const required = [
  'ownerEmail-所属人',
  'assetProduct-产品线-选择',
  'assetIdc-所在机房',
  'assetServerUuid-uuid',
  'logicalHostName-主机名',
  'assetUsage-服务器描述'
];

const int = [
  'logicalTotalCpuCores'
];

const float = [
  'logicalTotalMemorySizeInGb',
  'logicalTotalDiskSizeInGb'
];

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
