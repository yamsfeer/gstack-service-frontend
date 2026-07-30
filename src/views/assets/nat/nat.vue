<template>
  <div class="assets-nat">
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
              <!-- 集群id -> 集群名 -->
              <template v-if="item.value === 'assetLbGroup'">
                <template v-if="row.assetLbGroupDetails">
                  <gs-button
                    type="text-primary"
                    @click="handleBatchServer(row)"
                  >
                    {{ row.assetLbGroupDetails.groupName }}
                  </gs-button>
                </template>
                <template v-else>
                  <span>{{ row[item.value] | arr2str }}</span>
                </template>
              </template>
              <template v-else-if="item.value === 'instanceStatus'">
                <gs-tag :type="natStatusMap[row[item.value]]">{{ row[item.value] }}</gs-tag>
              </template>
              <template v-else-if="item.value === 'clientServerUuidMappingIps'">
                <div v-for="(ip, index) in row[item.value]" :key="index" class="line-height-20">{{ ip }}</div>
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
    <cluster-members
      :loading="loadingCluster"
      :title="`${selectedLvsCluster.groupName}集群的成员`"
      :visible.sync="clusterVisible"
      :table-data="clusterData"
      :value="selectedlvs.directorMasterUuid"
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
import { arr2map, natStatusMap } from '@/views/assets/constant';
import { natColumns } from '@/views/assets/modules/columns';
import { isEmptyArr, loading, debounce } from '@/utils/utils';
import {
  getAssetsNatOption,
  getAssetsNat,
  delAssetsNat,
  batchServer,
} from '@/service/asset';
import ClusterMembers from '@/views/assets/modules/cluster-members';

const LOCAL_STORAGE_KEY = 'ASSETS_NAT_COL_CONFIG';
const tableCols = natColumns;

export default {
  name: 'AssetsNat',
  mixins: [
    colConfigMixin,
    localStorageMixin,
    serverTableMixin,
    restoreMixin,
  ],
  components: {
    ClusterMembers,
  },
  data() {
    return {
      storeNamespace: 'ASSETS_NAT_TABLE',
      form: {
        productList: [],
        idcList: [],
      },

      assetProductListMap: [],
      assetIdcListMap: [],
      natStatusMap,

      loadingOpt: false,
      loading: false,
      keywords: '',

      LOCAL_STORAGE_KEY,
      sortCol: [],
      renderCol: tableCols,
      tableCols: tableCols,
      colConfigVisible: false,

      selectedlvs: {},
      selectedLvsCluster: {},
      clusterVisible: false,
      loadingCluster: false,
      clusterData: [],

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
  filters: {
    arr2str(arr = '') {
      try {
        return JSON.parse(arr).join('，\n');
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
        title: `是否确认删除${row.instanceName}？`,
        onOk: () => {
          this.del(row.instanceName);
        }
      });
    },
    async del(instanceName) {
      const res = await delAssetsNat(instanceName);
      if (res.error_code !== 0) {
        this.$Notify.error('删除失败');
        return;
      }
      this.$Message.success('删除成功');
      this.fetchTable();
    },
    async handleBatchServer(row) {
      this.selectedlvs = row;
      this.selectedLvsCluster = row.assetLbGroupDetails || {};
      let serverList = [];
      try {
        serverList = JSON.parse(this.selectedLvsCluster.memberHostList);
      } catch (e) {}
      this.clusterVisible = true;
      this.clusterData = await this.batchServer(serverList);
    },
    @loading()
    async getTableList() {
      const res = await getAssetsNat(this.getParams());
      if (res.error_code !== 0) {
        this.$Notify.error('获取列表失败');
        this.tableData = [];
        return;
      }
      this.tableData = res.data.nats;
      this.total = res.data.total;
    },
    @loading('loadingCluster')
    async batchServer(serverList) {
      const params = {
        assetServerUuidList: serverList
      };
      const res = await batchServer(params);
      if (res.error_code !== 0) {
        return [];
      }
      return res.data.servers;
    },
    @loading('loadingOpt')
    async getOption() {
      const res = await getAssetsNatOption();
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
  },
  created() {
    this.setSelectedCol();
    this.getOption();
    this.getTableList();
  }
};
</script>
<style lang="scss" scoped>
  .assets-nat {
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

    .status-btn {
      margin-left: 0;
    }

    .operation {
      cursor: pointer;
    }
    .line-height-20 {
      line-height: 20px;
    }
  }
</style>
