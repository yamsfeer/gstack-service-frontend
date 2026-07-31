<template>
  <el-menu
    :default-active="activeMenu"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
    class="side-nav-menu"
  >
    <template v-for="item in data" :key="item.path">
      <!-- 有子菜单 -->
      <el-sub-menu v-if="item.children && item.children.length" :index="'/' + item.path">
        <template #title>
          <el-icon v-if="item.icon"><component :is="iconMap[item.icon]" /></el-icon>
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item
          v-for="child in item.children"
          :key="child.path"
          :index="'/' + child.path"
        >
          {{ child.title }}
        </el-menu-item>
      </el-sub-menu>
      <!-- 无子菜单 -->
      <el-menu-item v-else :index="'/' + item.path">
        <el-icon v-if="item.icon"><component :is="iconMap[item.icon]" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script>
import {
  Menu as IconMenu,
  Setting,
  Document,
  Monitor,
  Connection,
  Tickets,
  List,
  HomeFilled,
} from '@element-plus/icons-vue';

const iconMap = {
  bars: Tickets,
  homepage: HomeFilled,
  'setting-o': Setting,
  unchecked: Document,
};

export default {
  name: 'SideNav',
  props: {
    data: { type: Array, default: () => [] },
  },
  data() {
    return { iconMap };
  },
  computed: {
    activeMenu() {
      const path = this.$route.path;
      return path;
    },
  },
};
</script>

<style scoped>
.side-nav-menu {
  height: 100%;
  border-right: none;
}
</style>
