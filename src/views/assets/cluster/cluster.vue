<template>
  <div class="assets-cluster">
    <table-page>
      <filter-table slot="filter" label-width="140px" v-loading="loadingOpt">
        <filter-table-item label="产品线(多选)">
          <radio-button
            :data="assetProductListMap"
            v-model="form.productList"
            show-type="toggle"
            multiple
          />
        </filter-table-item>
        <filter-table-item label="机房(多选)">
          <radio-button
            :data="assetIdcListMap"
            v-model="form.idcList"
            multiple
          />
        </filter-table-item>
      </filter-table>
      <div class="tool" slot="tool">
        <gs-search
          v-model="keywords"
          :input-search="debounceFetch"
          placeholder="请输入关键词搜索"
        />
        <div>
          <gs-button type="primary" @click="colConfigVisible = true">列配置</gs-button>
          <gs-button type="primary" @click="$router.push('/main/assets/balancing/cluster/add')" v-if="has()">添加</gs-button>
        </div>
      </div>
      <gs-server-table
        slot="table"
        ref="serverTable"
        v-loading="loading"
        :table-data="tableData"
        :total-num="total"
        :page-size="pageSize"
        :page-number="pageNum"
        @currentChange="currentChange"
        @sizeChange="sizeChange"
        @sortChange="sortChange"
      >
        <template v-for="(item, index) in renderCol">
          <gs-table-column
            :key="index"
            :label="item.label"
            :prop="item.value"
            :min-width="item.width"
            :sortable="item.sortable"
            :fixed="item.fixed"
            show-overflow-tooltip
          >
            <template slot-scope="{ row }">
              <template v-if="item.value === 'groupName'">
                <router-link
                  :to="`/main/assets/balancing/cluster/detail/${row.esId}`"
                >{{ row[item.value] }}</router-link>
              </template>
              <!-- <template v-else-if="item.value === 'privateVipList'">
                <gs-popover trigger="hover" placement="right">
                  <span v-vip="row[item.value]"></span>
                  <gs-icon name="desktop" style="font-size: 20px" slot="reference" />
                </gs-popover>
              </template> -->
              <template v-else-if="item.value === 'privateVipListVip'">
                <div v-for="(ip, index) in row[item.value] && row[item.value].split(',')" :key="index" class="line-height-20">{{ ip }}</div>
              </template>
              <template v-else-if="item.value === 'memberHostManagedIp'">
                <div v-for="(host, index) in row.memberHostListDetails" :key="index" class="line-height-20">{{ adminIp(host.logicalIpList || '') }}</div>
              </template>
              <template v-else-if="item.value === 'memberHostList'">
                <div v-for="(host, index) in row.memberHostListDetails" :key="index" class="line-height-20">
                  <router-link
                    :to="`/main/assets/server/detail/${host.assetServerUuid}`"
                    >{{ host.logicalHostName }}</router-link>
                </div>
              </template>
              <template v-else>
                <span>{{ row[item.value] | arr2str }}</span>
              </template>
            </template>
          </gs-table-column>
        </template>
        <gs-table-column label="操作" min-width="80px" fixed="right" v-if="has()">
            <template slot-scope="{ row }">
              <!-- <template>
                <gs-icon name="delete-o" class="operation" @click="handleDel(row)" />
              </template> -->
              <gs-button type="text-primary" @click="handleDel(row)">删除</gs-button>
            </template>
          </gs-table-column>
      </gs-server-table>
    </table-page>
    <col-config
      title="配置显示列"
      :visible.sync="colConfigVisible"
      v-model="sortCol"
      :data="tableCols"
      @confirm="saveColConfig"
    />
  </div>
</template>
<script>
import {
  colConfigMixin,
  localStorageMixin,
  serverTableMixin,
  restoreMixin,
} from '@/mixins';
import { cloneDeep } from 'lodash';
import { arr2map } from '@/views/assets/constant';
import { clusterColumns } from '@/views/assets/modules/columns';
import { isEmptyArr, loading, debounce } from '@/utils/utils';
import { getAssetsClusterOption, getAssetsCluster, delAssetsCluster } from '@/service/asset';

const LOCAL_STORAGE_KEY = 'ASSETS_CLUSTER_COL_CONFIG';
const tableCols = clusterColumns;

export default {
  name: 'AssetsCluster',
  mixins: [
    colConfigMixin,
    localStorageMixin,
    serverTableMixin,
    restoreMixin,
  ],
  data() {
    return {
      storeNamespace: 'ASSETS_CLUSTER_TABLE',
      form: {
        productList: [],
        idcList: [],
      },

      assetProductListMap: [],
      assetIdcListMap: [],

      loadingOpt: false,
      loading: false,
      keywords: '',

      LOCAL_STORAGE_KEY,
      sortCol: [],
      renderCol: tableCols,
      tableCols: tableCols,
      colConfigVisible: false,

      debounceFetch: debounce(300, this.fetchTable),
    };
  },
  watch: {
    form: {
      handler(val) {
        this.debounceFetch();
      },
      deep: true
    },
  },
  directives: {
    vip: {
      inserted(el, binding) {
        let str = binding.value;
        try {
          const data = JSON.parse(str);
          str = data.map(item => item.vip).join('<br />');
        } catch (e) {}

        el.innerHTML = `<span style="line-height: 2">${str}</span>`;
      }
    }
  },
  filters: {
    arr2str(arr = '') {
      try {
        return JSON.parse(arr).join();
      } catch (error) {
        return arr;
      }
    }
  },
  methods: {
    getParams() {
      const params = {
        search_condition: this.keywords,
        page: this.pageNum,
        page_size: this.pageSize,
        order_by: this.orderBy,
        order_method: this.orderMethod,
        ...this.form
      };
      // 清除所有未在页面手动设置的参数
      for (const key in params) {
        if (isEmptyArr(params[key]) || params[key] === '') {
          delete params[key];
        }
      }
      return params;
    },
    handleDel(row) {
      this.$Modal.confirm({
        title: `是否确认删除集群${row.groupName}？`,
        onOk: () => {
          this.del(row.esId);
        }
      });
    },
    async del(esId) {
      const res = await delAssetsCluster(esId);
      if (res.error_code !== 0) {
        this.$Notify.error('删除集群失败');
        return;
      }
      this.fetchTable();
    },
    @loading()
    async getTableList() {
      const res = await getAssetsCluster(this.getParams());
      if (res.error_code !== 0) {
        this.$Notify.error('获取集群列表失败');
        this.tableData = [];
        return;
      }
      this.tableData = res.data.lb_groups;
      this.total = res.data.total;
    },
    @loading('loadingOpt')
    async getOption() {
      const res = await getAssetsClusterOption();
      if (res.error_code !== 0) return;
      this.assetProductListMap = arr2map(res.data.products);
      this.assetIdcListMap = arr2map(res.data.idcs);
    },

    // 列配置
    saveColConfig() {
      this.$refs.serverTable.$refs.gsmultipleTable.doLayout();
      this.renderCol = this.sortCol;
      this.saveToLocal(this.LOCAL_STORAGE_KEY, this.sortCol);
      this.colConfigVisible = false;
    },
    setSelectedCol() {
      const localData = this.getLocal(this.LOCAL_STORAGE_KEY) || [];

      this.renderCol = this.mergeCol(
        localData,
        this.renderCol,
      );
      this.sortCol = cloneDeep(this.renderCol);
    },
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
  created() {
    this.setSelectedCol();
    this.getOption();
    this.getTableList();
  }
};
</script>
<style lang="scss" scoped>
  .assets-cluster {
    padding: 16px;
    background-color: #fff;
    min-height: 400px;

    .tool {
      display: flex;
      justify-content: space-between;
      padding: 0 16px;

      & > .gs-search {
        width: 400px;
      }
    }

    .operation {
      cursor: pointer;
    }

    .line-height-20 {
      line-height: 20px;
    }
  }
</style>
