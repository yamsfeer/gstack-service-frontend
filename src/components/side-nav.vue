<template>
  <el-menu
    :default-active="activeMenu"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
    class="side-nav-menu"
  >
    <!-- 递归渲染，支持多级子菜单 -->
    <nav-item v-for="item in data" :key="item.path" :item="item" :icon-map="iconMap" />
  </el-menu>
</template>

<script>
import { markRaw } from 'vue';
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
import NavItem from './nav-item.vue';

// markRaw 阻止 Vue 对组件引用做 reactive 包装（否则触发 "Component that was made reactive" 警告）
const iconMap = markRaw({
  bars: Tickets,
  homepage: HomeFilled,
  'setting-o': Setting,
  unchecked: Document,
});

export default {
  name: 'SideNav',
  components: {
    NavItem,
  },
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
