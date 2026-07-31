<template>
  <div class="app-header-inner">
    <div class="header-logo">
      <a :href="gridStackLink" style="font-size: 20px; color: #fff; text-decoration: none;">ServicePlatform</a>
      <span style="color: #fff; margin-left: 8px;">| 自助服务</span>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click" @command="handleSelect">
        <span class="user-info-dropdown">
          <span>{{ userInfo.name || userInfo.username || '测试用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :command="0">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { ArrowDown } from '@element-plus/icons-vue';
import { mapStores } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';
import * as service from '@/service/user';
import config from '@/config';
import { ElMessageBox, ElMessage } from 'element-plus';

const URL = config.GOD_URL;

export default {
  components: { ArrowDown },
  data() {
    return {
      gridStackLink: URL,
    };
  },
  computed: {
    ...mapStores(useLoginInfoStore),
    userInfo() {
      return this.loginInfoStore.userInfo;
    },
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
      ElMessageBox.confirm('您即将退出ServicePlatform的自助服务工单？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        service.logout();
      }).catch(() => {});
    },
  },
};
</script>

<style scoped>
.app-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background: #0073e8;
  padding: 0 20px;
}
.header-logo {
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info-dropdown {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.user-info-dropdown:hover {
  opacity: 0.8;
}
</style>
