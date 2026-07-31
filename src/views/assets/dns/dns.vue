<template>
  <div class="assets-cluster">
    <table-page>
      <filter-table slot="filter" label-width="140px" v-loading="loadingOpt">
        <filter-table-item label="根域">
          <radio-button
            :data="assetDomainListMap"
            v-model="form.primaryDomainList"
            show-type="toggle"
          />
        </filter-table-item>
        <!-- <filter-table-item label="产品线">
          <radio-button
            :data="assetProductListMap"
            v-model="form.productionList"
            show-type="toggle"
          />
        </filter-table-item> -->
        <filter-table-item label="区域">
          <radio-button
            :data="assetScopeListMap"
            v-model="form.scopeList"
          />
        </filter-table-item>
        <!-- <filter-table-item label="状态">
          <radio-button
            :data="assetStatusListMap"
            v-model="form.statusList"
          />
        </filter-table-item> -->
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
        <template v-for="(item, index) in renderCol" :key="index">
          <gs-table-column
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
              <template v-else-if="item.value === 'status'">
                <gs-tag :type="dnsStatusMap[row[item.value]]">
                  {{ dnsStatusLabelMap[row[item.value]] || '其他' }}
                </gs-tag>
              </template>
              <template v-else>
                <span>{{ row[item.value] | arr2str }}</span>
              </template>
            </template>
          </gs-table-column>
        </template>
        <gs-table-column
        label="处理状态"
        min-width="108"
        >
          <template slot-scope="{ row }">
            <span v-if="row.task_status === 'executing'" class="executing-message">处理中</span>
            <gs-popover
            v-else-if="row.task_status === 'failed'"
            placement="top"
            trigger="hover"
            >
              <span>{{row.task_failed_msg}}</span>
              <span class="fail-message" slot="reference">处理失败</span>
            </gs-popover>
            <!-- <span v-else-if="row.task_status === 'succeed'" class="success-message">处理完成</span> -->
            <!-- <span v-else>无</span> -->
          </template>
        </gs-table-column>
        <gs-table-column label="操作" min-width="120px" v-if="has()">
            <template slot-scope="{ row }">
              <!-- <template>
                <gs-icon name="delete-o" class="operation" @click="handleDel(row)" />
              </template> -->
              <gs-button
              type="text-primary"
              @click="handleEdit(row)"
              v-if="row.task_status !== 'failed'"
              :disabled="row.task_status === 'executing'">编辑</gs-button>
              <gs-button
              type="text-primary"
              @click="handleRetry(row)"
              v-else-if="row.task_status === 'failed'">重试</gs-button>
              <gs-button
              type="text-primary"
              @click="handleDel(row)"
              :disabled="row.task_status === 'executing' || row.task_status === 'failed'">删除</gs-button>
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
    <edit-dns
      title="编辑DNS"
      :visible.sync="editVisible"
      :edit-data="editData"
      @submit="updateDns"
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
import { arr2map, dnsStatusMap, dnsStatusListMap, dnsStatusLabelMap } from '@/views/assets/constant';
import { dnsColumns } from '@/views/assets/modules/columns.js';
import { isEmptyArr, loading, debounce } from '@/utils/utils';
import { getAssetsDnsOption, getAssetsDns, updateAssetsDns, deleteAssetsDns, fetchTaskMessage, retryUpdateAssetsDns } from '@/service/asset';
import EditDns from '@/views/assets/dns/editDns/editDns.vue';

const LOCAL_STORAGE_KEY = 'ASSETS_DNS_COL_CONFIG';
const tableCols = dnsColumns;

export default {
  name: 'AssetsDns',
  mixins: [
    colConfigMixin,
    localStorageMixin,
    serverTableMixin,
    restoreMixin,
  ],
  components: {
    EditDns
  },
  data() {
    return {
      storeNamespace: 'ASSETS_DNS_TABLE',
      form: {
        // productionList: [],
        primaryDomainList: [],
        scopeList: [],
        // statusList: [],
      },

      // assetProductListMap: [],
      assetDomainListMap: [],
      assetScopeListMap: [],
      // assetStatusListMap: [],
      // dnsStatusMap,
      // dnsStatusLabelMap,

      loadingOpt: false,
      loading: false,
      keywords: '',

      LOCAL_STORAGE_KEY,
      sortCol: [],
      renderCol: tableCols,
      tableCols: tableCols,
      colConfigVisible: false,

      debounceFetch: debounce(300, this.fetchTable),

      editVisible: false,
      editData: {},
      timer: null
    };
  },
  computed: {
    executingItems() {
      return this.tableData.filter((data)=> data.task_status === 'executing')
    }
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
        return JSON.parse(arr).join('，');
      } catch (error) {
        return arr;
      }
    }
  },
  methods: {
    async checkTask() {
      if(this.executingItems.length) {
        try {
          const result = await fetchTaskMessage(this.executingItems.map((data)=> data.task_id));

          this.tableData = this.tableData.map((data)=> {
            const item = result.data.tasks.find((item)=> {
              return item.id === data.task_id;
            });

            if(item ) {
              return {
                ...data,
                task_status: item.status,
                task_failed_msg: item.failed_msg,
                task_key: item.task_key
              }
            }

            return data;
          });
        } catch(e) {
          this.$Notify.error('检查处理状态失败');
        }
      }
    },
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
        title: `是否确认删除？`,
        onOk: () => {
          this.del(row);
        }
      });
    },
    async del(row) {
      const params = {
        primaryDomain: row.primaryDomain,
        subDomain: row.subDomain,
        scope: row.scope,
        value: row.value
      };
      const res = await deleteAssetsDns(params);
      if (res.error_code !== 0) {
        this.$Notify.error('删除失败');
        return;
      }
      this.fetchTable();
    },
    async getTableList() {
      const res = await getAssetsDns(this.getParams());
      if (res.error_code !== 0) {
        this.$Notify.error('获取列表失败');
        this.tableData = [];
        return;
      }
      this.tableData = res.data.dnss;
      this.total = res.data.total;
    },
    async getOption() {
      const res = await getAssetsDnsOption();
      if (res.error_code !== 0) return;
      // this.assetProductListMap = arr2map(res.data.products);
      this.assetDomainListMap = arr2map(res.data.dns_primary_domains);
      this.assetScopeListMap = arr2map(res.data.dns_scopes);
      // this.assetStatusListMap = arr2map(res.data.dns_statuses);
      // this.assetStatusListMap = dnsStatusListMap;
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
    handleEdit(row) {
      this.editData = { ...row };
      this.editVisible = true;
    },
    async handleRetry(row) {
      try {
        const result = await retryUpdateAssetsDns(row.domain, {
          task_id: row.task_id
        });

        if(result.error_code !== 0) {
          this.$Notify.error({
            title: '失败',
            desc: res.error_msg || '重试失败'
          });
          return ;
        }

        this.fetchTable();
      } catch(e) {
        this.$Notify.error({
          title: '失败',
          desc: '重试失败'
        });
      }
    },
    async updateDns(param) {
      const params = Object.assign({
        oldValue: this.editData.value,
        oldScope: this.editData.scope
      }, this.editData, param);
      const res = await updateAssetsDns({
        domain: this.editData.domain, param: params });
      if (res.error_code !== 0) {
        this.$Notify.error({
          title: '失败',
          desc: res.error_msg || '更新失败'
        });
        return;
      }
      this.$Message.success('更新成功');
      this.editVisible = false;
      this.fetchTable();
    }
  },
  created() {
    this.setSelectedCol();
    this.getOption();
    this.getTableList();
    this.timer = setInterval(this.checkTask, 10000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>
<style lang="scss" scoped>
  .assets-cluster {
    padding: 16px;
    background-color: #fff;
    min-height: 400px;

    .executing-message {
      color: #0055ff;
    }

    .fail-message {
      color: #f5222d;
    }

    .success-message {
      color: #73d13d;
    }

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
  }
</style>
