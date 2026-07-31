import BasicLayout from '@/components/basic-layout';

import Apply from '@/views/apply/overview.vue';
import MineOrder from '@/views/mineOrder/index.vue';
import Audit from '@/views/audit/index.vue';
import Manage from '@/views/manage/index.vue';
import ApplyForm from '@/views/apply/applyForm/apply-index.vue';
import Detail from '@/views/detail/index.vue';
import Process from '@/views/manage/create-process/index.vue';

import Server from '@/views/assets/server/server.vue';
import ServerDetail from '@/views/assets/server/detail/index.vue';
import Cluster from '@/views/assets/cluster/cluster.vue';
import ClusterDetail from '@/views/assets/cluster/detail/index.vue';
import Lvs from '@/views/assets/lvs/lvs.vue';
import LvsDetail from '@/views/assets/lvs/detail/index.vue';
import Nat from '@/views/assets/nat/nat.vue';
import Ip from '@/views/assets/ip/ip.vue';
import Dns from '@/views/assets/dns/dns.vue';
import NetMap from '@/views/assets/netmap/netmap.vue';

export default {
  basicLayout: {
    title: '首页',
    path: '/main',
    component: BasicLayout,
    children: [
      {
        title: '工单',
        icon: 'bars',
        path: 'order',
        isNav: true,
        children: [
          {
            title: '提交工单',
            path: 'apply',
            icon: 'unchecked',
            component: Apply,
            meta: {
              title: 'sdasd'
            }
          },
          {
            title: '工单列表',
            path: 'mine',
            icon: 'unchecked',
            component: MineOrder,
            meta: {
              title: 'sdasd'
            }
          },
          {
            title: '审核工单',
            path: 'audit',
            icon: 'unchecked',
            component: Audit,
            isAuth: true
          }
        ]
      },
      {
        title: '资产',
        icon: 'homepage',
        path: 'assets',
        isNav: true,
        children: [
          {
            title: '服务器',
            path: 'server',
            icon: 'unchecked',
            component: Server,
            meta: {
              title: 'sdasd'
            }
          },
          {
            title: '负载均衡',
            path: 'balancing',
            icon: 'unchecked',
            children: [
              {
                title: '集群',
                path: 'cluster',
                icon: 'unchecked',
                component: Cluster
              },
              {
                title: 'LVS(被外网访问)',
                path: 'lvs',
                icon: 'unchecked',
                component: Lvs
              },
              {
                title: 'NAT(主动访问外网)',
                path: 'nat',
                icon: 'unchecked',
                component: Nat
              }
            ],
            meta: {
              title: 'sdasd'
            }
          },
          {
            title: 'IP地址',
            path: 'ip',
            icon: 'unchecked',
            component: Ip
          },
          {
            title: 'DNS记录',
            path: 'dns',
            icon: 'unchecked',
            component: Dns
          },
          {
            title: '内外网映射',
            path: 'map',
            icon: 'unchecked',
            component: NetMap
          }
        ]
      },
      {
        title: '流程管理',
        path: 'manage',
        icon: 'setting-o',
        component: Manage,
        isNav: true,
        isAuth: true
      },
      // 不在左侧菜单中
      {
        path: 'order/apply/:type',
        component: ApplyForm,
        title: '工单',
        meta: {
          prevTitle: '提交工单',
          backTo: '/main/order/apply',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'order/detail/:type/:id',
        component: Detail,
        title: '工单详情',
        meta: {
          prevTitle: '我的工单列表',
          backTo: '/main/order/mine',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'order/audit/:type/:id',
        component: Detail,
        title: '工单审核',
        meta: {
          prevTitle: '审核工单列表',
          backTo: '/main/order/audit',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'manage/process/create',
        component: Process,
        title: '创建工单流程',
        meta: {
          prevTitle: '流程管理',
          backTo: '/main/manage',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'manage/process/edit/:id',
        component: Process,
        title: '编辑工单流程',
        meta: {
          prevTitle: '流程管理',
          backTo: '/main/manage',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'assets/server/detail/:id',
        component: ServerDetail,
        title: '服务器详情',
        meta: {
          prevTitle: '服务器列表',
          backTo: '/main/assets/server',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'assets/server/add',
        component: ServerDetail,
        title: '添加服务器',
        meta: {
          prevTitle: '服务器列表',
          backTo: '/main/assets/server',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'assets/balancing/cluster/detail/:id',
        component: ClusterDetail,
        title: '集群详情',
        meta: {
          prevTitle: '集群列表',
          backTo: '/main/assets/balancing/cluster',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'assets/balancing/cluster/add',
        component: ClusterDetail,
        title: '添加集群',
        meta: {
          prevTitle: '集群列表',
          backTo: '/main/assets/balancing/cluster',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'assets/balancing/lvs/detail/:id',
        component: LvsDetail,
        title: 'LVS详情',
        meta: {
          prevTitle: 'LVS列表',
          backTo: '/main/assets/balancing/lvs',
          isBack: true
        },
        isNav: false
      },
      {
        path: 'assets/balancing/lvs/add',
        component: LvsDetail,
        title: '添加LVS',
        meta: {
          prevTitle: 'LVS列表',
          backTo: '/main/assets/balancing/lvs',
          isBack: true
        },
        isNav: false
      }
    ]
  }
};
