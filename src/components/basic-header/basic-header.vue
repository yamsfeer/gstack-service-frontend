<template>
  <gs-header
    class="app-header"
    is-fixed
    @feedback="feedback"
  >
    <span
      slot="logo"
      style="font-size: 20px; color: #fff"
    ><a :href="gridStackLink">ServicePlatform</a> | 自助服务</span>
    <ul slot="special">
      <li>
        <gs-dropdown
          class="user-info-dropdown"
          trigger="click"
          @select="handleSelect"
        >
          <span class="gs-dropdown-link">
            <span>{{userInfo.name || userInfo.username || '测试用户'}}</span>
            <i class="gs-icon-down" />
          </span>
          <gs-dropdown-menu
            slot="dropdown"
            align="right"
          >
            <gs-dropdown-items :options="options" />
          </gs-dropdown-menu>
        </gs-dropdown>
      </li>
    </ul>
  </gs-header>
</template>

<script>
import { mapGetters } from 'vuex';
import * as service from '@/service/user';
import config from '@/config';

const URL = config.GOD_URL;
export default {
  data() {
    return {
      options: [
        {
          label: '退出登录',
          value: 0
        }
      ],
      gridStackLink: URL
    };
  },
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO'
    })
  },
  methods: {
    feedback() {
      window.open('https://example.com/issues');
    },
    handleSelect(val) {
      if (val === 0) {
        this.logout();
      }
    },
    logout() {
      this.$Modal.confirm({
        title: `您即将退出ServicePlatform的自助服务工单？`,
        modalProps: {
          'confirm-text': '退出',
          'cancel-text': '取消'
        },
        onOk: () => {
          service.logout();
        }
      });
    }
  }
};
</script>
