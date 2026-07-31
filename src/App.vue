<template>
  <router-view />
</template>
<script>
import * as service from '@/service/user';
import { mapStores } from 'pinia';
import { useLoginInfoStore } from '@/stores/loginInfo';

export default {
  computed: {
    ...mapStores(useLoginInfoStore),
  },
  created() {
    let token = this.loginInfoStore.token;
    let user = this.loginInfoStore.userInfo;
    if (!token) {
      token = localStorage.getItem('access_token');
      this.loginInfoStore.UPDATE_TOKEN(token);
    }
    if (!user.username) {
      this.getUserInfo();
    }
  },
  methods: {
    getUserInfo() {
      service.getUserInfo().then(res => {
        if (res.error_code === 0) {
          let user = res.data.user || {};
          let isServiceAdmin = user.policies.findIndex(item => item.name === 'TicketFullAccess') > -1;
          user.isServiceAdmin = isServiceAdmin;
          this.loginInfoStore.UPDATE_USER_INFO(user);
          this.getUserTenant(isServiceAdmin);
        }
      });
    },
    getUserTenant(isServiceAdmin) {
      service.getUserTenant(isServiceAdmin).then(res => {
        if (res.error_code !== 0) return;
        const tenantList = res.data[`${isServiceAdmin ? 'tenat_list' : 'tenant_list'}`].map(item => {
          if (isServiceAdmin) {
            item.tenant_id = item.tenat_id;
            item.tenant_name = item.tenat_name;
          }
          return item;
        });
        this.loginInfoStore.UPDATE_TENANT(tenantList);
      });
    }
  }
};
</script>
