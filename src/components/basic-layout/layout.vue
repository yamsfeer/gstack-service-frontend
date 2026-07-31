<template>
  <el-container class="app-container">
    <el-header class="app-header" height="60px">
      <basic-header />
    </el-header>
    <el-container>
      <el-aside width="220px" class="app-sidebar">
        <side-nav :data="slibarData" />
      </el-aside>
      <el-main class="app-content">
        <div class="breadcrumb-block" v-if="isBack">
          <router-link :to="prevPath">
            <el-button class="back-btn" type="primary">
              <el-icon style="font-size: 16px;"><ArrowLeft /></el-icon>
            </el-button>
          </router-link>
          <div class="text-block">
            <div class="current-text">{{ title }}</div>
            <div class="pre-text">{{ prevTitle }}</div>
          </div>
          <div style="clear: both;"></div>
        </div>
        <div class="breadcrumb-block" v-if="!isBack">
          <span class="app-page-title">{{ title }}</span>
        </div>
        <div class="app-page-content">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue';
import BasicHeader from '@/components/basic-header/index.js';
import SideNav from '@/components/side-nav.vue';
import { menus } from '@/router';
import { serviceOptions } from '@/views/apply/constant';
import { mapStores } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

export default {
  components: {
    BasicHeader,
    SideNav,
    ArrowLeft,
  },
  data() {
    return {
      serviceOptions,
      menus: menus[0].children,
      slibarData: [],
    };
  },
  computed: {
    ...mapStores(useLoginInfoStore),
    userInfo() {
      return this.loginInfoStore.userInfo;
    },
    prevPath() {
      return this.$route.meta.backTo;
    },
    prevTitle() {
      return this.$route.meta.prevTitle;
    },
    title() {
      if (this.$route.name === '/main/order/apply/:type') {
        const type = this.$route.params.type;
        const data = this.serviceOptions.find(item => item.name === type);
        return data ? data.title + '工单' : '';
      } else {
        return this.$route.meta.title;
      }
    },
    isBack() {
      return this.$route.meta.isBack;
    },
  },
  watch: {
    userInfo: {
      handler(newVal) {
        let slibarData = this.menus.filter(d => d.isNav);
        if (!newVal.isServiceAdmin) {
          slibarData = slibarData.filter(d => !d.isAuth);
          slibarData = slibarData.map(d => {
            if (d.children) {
              d.children = d.children.filter(a => !a.isAuth);
            }
            return d;
          });
        }
        this.slibarData = slibarData;
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>

<style lang="scss" src="./style.scss"></style>
