import {
  validatorGenerator,
  ruleTypes
} from '@/utils/validator';

const g = validatorGenerator;

export const rules_vm = {
  'tenant_id': {
    required: true,
    trigger: 'change',
    message: '请选择租户'
  },
  'cpu_memory': {
    required: true,
    trigger: 'blur',
    validator: (rule, value, cb) => {
      let [cpu, memory] = value.split('核');
      cpu = parseInt(cpu);
      memory = parseInt(memory);
      if (!ruleTypes.rightInt(cpu) || !ruleTypes.rightInt(memory)) {
        cb(new Error('请输入整数'));
      }
      if (cpu < 1 || cpu > 64) {
        cb(new Error('请输入[1, 64]的cpu核数'));
      }
      if (memory < 1 || memory > 16) {
        cb(new Error('请输入[1, 16]的内存容量'));
      }
      cb();
    }
  },
  'disk_size_in_gb': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.range(0, 80000),
        err: '请输入[0, 80000]的整数'
      }
    ])
  },
  'memory_size_in_gb': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.range(1, 64),
        err: '请输入[1, 64]的整数'
      }
    ])
  },
  'vm_count': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.range(1, 5),
        err: '请输入[1, 5]的整数，一次性最多申请5台'
      }
    ])
  },
  'os_name': {
    required: true,
    trigger: 'change',
    message: '请选择系统模板'
  },
  'business_level': {
    required: true,
    trigger: 'blur'
  },
  'period': {
    required: true,
    trigger: 'blur',
    validator: (rule, value, cb) => {
      cb();
    }
  },
  'idc': {
    required: true,
    trigger: 'blur'
  },
  'usage': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请输入申请理由'
      },
      {
        expr: ruleTypes.length(1, 200),
        err: '请输入不超过200个字符'
      }
    ])
  },
  'product': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择产品线'
      }
    ])
  },
  'remark': {
    trigger: 'blur',
    max: 200,
    message: '请输入不超过200个字符'
  }
};

export const rules_lvs = {
  'tenant_id': {
    required: true,
    trigger: 'change',
    message: '请选择租户'
  },
  'port_list': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请添加端口'
      }
    ])
  },
  'peak_prediction_in_mbps': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.range(1, 1000),
        err: '请输入[1, 1000]的整数'
      }
    ])
  },
  'persistent': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.gte(1),
        err: '请输入大于1的整数'
      }
    ])
  },
  'rs_uuid_list': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择后端主机列表'
      }
    ])
  },
  'lb_algo': {
    required: true,
    trigger: 'change'
  },
  'check_method': {
    required: true,
    trigger: 'change'
  },
  'usage': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请输入申请理由'
      },
      {
        expr: ruleTypes.length(1, 200),
        err: '请输入不超过200个字符'
      }
    ])
  },
  'product': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择产品线'
      }
    ])
  }
};

export const rules_nat = {
  'tenant_id': {
    required: true,
    trigger: 'change',
    message: '请选择租户'
  },
  'peak_prediction_in_mbps': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.range(1, 1000),
        err: '请输入[1, 1000]的整数'
      }
    ])
  },
  'rs_uuids': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择后端主机列表'
      }
    ])
  },
  'usage': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请输入申请理由'
      },
      {
        expr: ruleTypes.length(1, 200),
        err: '请输入不超过200个字符'
      }
    ])
  },
  'specified_public_vip': {
    required: true,
    trigger: 'change',
    validator: (rule, value, cb) => {
      cb();
    }
  },
  'is_spider': {
    required: true,
    trigger: 'change',
    validator: (rule, value, cb) => {
      cb();
    }
  },
  'product': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择产品线'
      }
    ])
  }
};

export const rules_dns = {
  'tenant_id': {
    required: true,
    trigger: 'change',
    message: '请选择租户'
  },
  'production': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择产品线'
      }
    ])
  },
  'domain': {
    required: true,
    trigger: 'change',
    validator: (rule, value, cb) => {
      const [sub, primary] = value;
      const reg = /^[a-zA-Z0-9-\\.]*$/;
      const reg2 = /^[^-]/;
      const reg3 = /[^-]$/;
      if (!sub) {
        cb(new Error('请输入域名'));
      } else if (!reg.test(sub) || !reg2.test(sub) || !reg3.test(sub)) {
        cb(new Error('域名中只允许字母和数字以及连接符‘-’和点‘.’, 连接符不能出现在每级域名的开头或结尾'));
      } else if (sub.length > 63) {
        cb(new Error('域名不超过63个字符'));
      }
      if (!primary) {
        cb(new Error('请选择主域名'));
      }
      cb();
    }
  },
  'values': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请添加解析地址'
      }
    ])
  },
  'ttl': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.rightInt,
        err: '请输入整数'
      },
      {
        expr: ruleTypes.gte(1),
        err: '请输入大于1的整数'
      }
    ])
  },
  'description': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请输入申请理由'
      },
      {
        expr: ruleTypes.length(1, 200),
        err: '请输入不超过200个字符'
      }
    ])
  }
};

export const rules_vmDelete = {
  'tenant_id': {
    required: true,
    trigger: 'change',
    message: '请选择租户'
  },
  'virtual_machines': {
    required: true,
    trigger: 'change',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请选择需要删除的虚拟机'
      }
    ])
  },
  'usage': {
    required: true,
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.empty,
        err: '请输入申请理由'
      },
      {
        expr: ruleTypes.length(1, 200),
        err: '请输入不超过200个字符'
      }
    ])
  },
  'remark': {
    trigger: 'blur',
    validator: g([
      {
        expr: ruleTypes.length(0, 200),
        err: '请输入不超过200个字符'
      }
    ])
  }
};
