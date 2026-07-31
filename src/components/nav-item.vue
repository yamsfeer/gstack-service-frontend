<template>
  <!-- 有子菜单则递归渲染，支持任意层级（如 资产 > 负载均衡 > 集群） -->
  <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
    <template #title>
      <el-icon v-if="item.icon"><component :is="iconMap[item.icon]" /></el-icon>
      <span>{{ item.title }}</span>
    </template>
    <nav-item
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :icon-map="iconMap"
    />
  </el-sub-menu>
  <el-menu-item v-else :index="item.path">
    <el-icon v-if="item.icon"><component :is="iconMap[item.icon]" /></el-icon>
    <span>{{ item.title }}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: 'NavItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
    iconMap: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
