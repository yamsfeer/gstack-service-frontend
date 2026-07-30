<template>
  <gs-modal
    class="cluster-members"
    v-model="modalVisible"
    width="750px"
    :title="title"
    :before-close="close"
  >
    <slot>
      <gs-table :data="tableData" v-loading="loading">
        <gs-table-column prop="date" label="当前实例主分发器标识" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <gs-radio :value="row.esId" :label="value" disabled />
          </template>
        </gs-table-column>
        <gs-table-column prop="logicalHostName" label="主机名" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <router-link :to="`/main/assets/server/detail/${row.assetServerUuid}`">
              {{ row.logicalHostName }}
            </router-link>
          </template>
        </gs-table-column>
        <gs-table-column prop="assetServerType" label="服务器类型" show-overflow-tooltip />
        <gs-table-column prop="assetLevel" label="业务等级" show-overflow-tooltip />
        <gs-table-column prop="logicalIpListIpAddress" label="管理IP" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.logicalIpList | adminIp }}
          </template>
        </gs-table-column>
      </gs-table>
    </slot>
    <gs-button
      slot="footer"
      @click="close"
    >关闭</gs-button>
  </gs-modal>
</template>
<script>
export default {
  name: 'ClusterMembers',
  props: {
    title: {
      type: String,
      required: true,
    },
    tableData: {
      type: Array,
      default: () => []
    },
    visible: Boolean,
    loading: Boolean,
    value: String
  },
  data() {
    return {
      modalVisible: this.visible,
    };
  },
  watch: {
    visible(val) {
      this.modalVisible = val;
    }
  },
  filters: {
    adminIp(logicalIpListStr) {
      try {
        const logicalIpList = JSON.parse(logicalIpListStr);
        const adminIp = logicalIpList.find(item => item.is_admin_ip);
        const clusterIp = logicalIpList.find(item => item.is_cluster_ip);
        if (adminIp) return adminIp.ip_address;
        if (clusterIp) return clusterIp.ip_address;
        return (logicalIpList[0] && logicalIpList[0].ip_address) || '';
      } catch (e) {
        return logicalIpListStr;
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false);
    },
  }
};
</script>
<style lang="scss" scoped>
  .cluster-members {}
</style>
