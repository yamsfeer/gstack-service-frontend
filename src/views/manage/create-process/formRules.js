import {
  validatorGenerator,
  ruleTypes
} from '@/utils/validator';
const g = validatorGenerator;

export default {
  data() {
    return {
      rules_process: {
        'name': {
          required: true,
          trigger: 'blur',
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('请输入名称'));
            }
            if (value && (value.length > 50 || value.length < 2)) {
              cb(new Error('请输入2-50个的字符'));
            }
            if (value) {
              if (this.isEdit && this.saveProcessName === value) {
                cb();
              }
              this.isExistName({ name: value }).then(isExist => {
                if (!isExist) {
                  cb();
                } else {
                  cb(new Error('名称已存在'));
                }
              });
            }
          }
        },
        'description': {
          trigger: 'blur',
          validator: g([
            {
              expr: ruleTypes.length(0, 200),
              err: '请输入200个字符以内'
            }
          ])
        },
        'steps': {
          trigger: 'blur',
          validator: g([
            {
              expr: value => {
                const openStep = this.openStep;
                return !!openStep.handler;
              },
              err: '请选择开通组'
            }
          ])
        }
      },
      rules_step: {
        'name': {
          required: true,
          trigger: 'blur',
          validator: g([
            {
              expr: ruleTypes.empty,
              err: '请输入名称'
            },
            {
              expr: ruleTypes.length(2, 50),
              err: '请输入2-50个的字符'
            },
            {
              expr: value => {
                if (this.saveStepName && this.saveStepName === value) {
                  return true;
                }
                return this.stepNames.indexOf(value) === -1;
              },
              err: '名称已存在'
            }
          ])
        },
        'description': {
          trigger: 'blur',
          validator: g([
            {
              expr: ruleTypes.length(0, 200),
              err: '请输入200个字符以内'
            }
          ])
        },
        'handler': {
          required: true,
          trigger: 'change',
          validator: g([
            {
              expr: ruleTypes.empty,
              err: this.form && this.form.isOpen ? '请选择组' : '请选择组'
            }
          ])
        }
      }
    };
  }
};
