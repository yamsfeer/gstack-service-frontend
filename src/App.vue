<template>
  <router-view />
</template>
<script>
import * as service from '@/service/user';

export default {
  created() {
    let token = this.$store.getters['GET_TOKEN'];
    let user = this.$store.getters['GET_USER_INFO'];
    if (!token) {
      token = localStorage.getItem('access_token');
      this.$store.commit('UPDATE_TOKEN', token);
    }
    if (!user.username) {
      this.getUserInfo();
    }
    // if (url.indexOf('?code=') > -1) {
    //   const search = url.split('?')[1];
    //   const [key, code] = search.split('=');
    //   if (key === 'code') {
    //     service.getAuthToken({ code }).then(res => {
    //       localStorage.setItem('access_token', res.data['access_token']);
    //       this.$store.commit('UPDATE_TOKEN', res.data['access_token']);
    //       window.location.href = url.split('?code=')[0];
    //       this.getUserInfo();
    //     });
    //   }
    // } else {
    //   let token = this.$store.getters['GET_TOKEN'];
    //   let user = this.$store.getters['GET_USER_INFO'];
    //   if (!token) {
    //     token = localStorage.getItem('access_token');
    //     this.$store.commit('UPDATE_TOKEN', token);
    //   }
    //   if (!user.username) {
    //     this.getUserInfo();
    //   }
    // }
  },
  methods: {
    getUserInfo() {
      service.getUserInfo().then(res => {
        if (res.error_code === 0) {
          let user = res.data.user || {};
          let isServiceAdmin = user.policies.findIndex(item => item.name === 'TicketFullAccess') > -1;
          user.isServiceAdmin = isServiceAdmin;
          this.$store.commit('UPDATE_USER_INFO', user);
          this.getUserTenant(isServiceAdmin);
        }
      });
    },
    getUserTenant(isServiceAdmin) {
      service.getUserTenant(isServiceAdmin).then(res => {
        if (res.error_code !== 0) return;
        // 格式化数据
        const tenantList = res.data[`${isServiceAdmin ? 'tenat_list' : 'tenant_list'}`].map(item => {
          if (isServiceAdmin) {
            item.tenant_id = item.tenat_id;
            item.tenant_name = item.tenat_name;
          }
          return item;
        });
        this.$store.commit('UPDATE_TENANT', tenantList);
      });
    }
  }
};
</script>
