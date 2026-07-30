<template>
  <gs-layout class="app-container">
    <!-- 头部区域 -->
    <basic-header slot="header" />

    <!-- 左侧菜单区域 -->
    <side-nav
      slot="sidebar"
      :data="slibarData"
      class="app-sidebar"
    />

    <!-- 内容左侧菜单区域 -->
    <div
      slot="content"
      class="app-content"
    >
      <!-- <div class="app-page-header">
        <h3 class="app-page-title">{{ title }}</h3>
      </div> -->
      <div class="breadcrumb-block" v-if="isBack">
        <router-link :to="prevPath">
          <gs-button class="back-btn" type="primary">
            <i class="gs-icon-revoke" style="font-size: 16px;"></i>
          </gs-button>
        </router-link>

        <div class="text-block">
          <div class="current-text">{{title}}</div>
          <div class="pre-text">{{prevTitle}}</div>
        </div>

        <div style="clear: both;"></div>
      </div>

      <div class="breadcrumb-block" v-if="!isBack">
        <span class="app-page-title">{{ title }}</span>
      </div>
      <div class="app-page-content">
        <router-view />
      </div>
    </div>
  </gs-layout>
</template>

<script>
import {
  Layout
} from '@gs-ui/gs-ui';

import BasicHeader from '@/components/basic-header';
import SideNav from '@components/side-nav';

import {
  menus
} from '@/router';
import { serviceOptions } from '@/views/apply/constant';
import { mapGetters } from 'vuex';
export default {
  components: {
    [Layout.name]: Layout,
    SideNav,
    BasicHeader
  },

  data() {
    return {
      serviceOptions,
      menus: menus[0].children,
      slibarData: []
    };
  },
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO'
    }),
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
        return data.title + '工单';
      } else {
        return this.$route.meta.title;
      }
    },
    isBack() {
      return this.$route.meta.isBack;
    }
    // slibarData() {
    //   return this.menus.filter(d => {
    //     return d.isNav;
    //   });
    // }
  },
  watch: {
    userInfo(newVal) {
      let slibarData = this.menus.filter(d => { return d.isNav; });
      if (!newVal.isServiceAdmin) {
        // 一级过滤
        slibarData = slibarData.filter(d => !d.isAuth);
        // 二级过滤
        slibarData = slibarData.map(d => {
          if (d.children) {
            d.children = d.children.filter(a => !a.isAuth);
          }
          return d;
        });
      }
      this.slibarData = slibarData;
    }
  }
};
</script>
