<template>
  <div class="assets-cluster">
    <table-page><template #filter>
      <filter-table label-width="140px" v-loading="loadingOpt">
        <filter-table-item label="机房(多选)">
          <radio-button
            :data="assetIdcListMap"
            v-model="form.idcList"
            multiple
          />
        </filter-table-item>
        <filter-table-item label="IP类型">
          <radio-button
            :data="assetTypesListMap"
            v-model="form.typeList"
          />
        </filter-table-item>
      </filter-table></template>
      <template #tool><div class="tool">
        <gs-search
          v-model="keywords"
          :input-search="debounceFetch"
          placeholder="请输入关键词搜索"
        />
        <div>
          <gs-button type="primary" @click="colConfigVisible = true">列配置</gs-button>
          <gs-button type="primary" @click="handleCreateIp" v-if="has()">添加</gs-button>
        </div>
      </div>
      </template><template #table><gs-server-table
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
            <template #default="{ row }">
              <template v-if="item.value === 'isUsed'">
                <gs-switch
                  :disabled="!has()"
                  on-value="True"
                  off-value="False"
                  v-model="row[item.value]"
                  @change="handleToggle($event, row)"
                />
              </template>
              <template v-else-if="item.value === 'usedforSpider'">
                <span>{{ Boolean(row[item.value]) ? '是' : '否' }}</span>
              </template>
              <template v-else>
                <span>{{ row[item.value] }}</span>
              </template>
            </template>
          </gs-table-column>
        </template>
      </gs-server-table></template>
    </table-page>
    <col-config
      title="配置显示列"
      :visible.sync="colConfigVisible"
      v-model="sortCol"
      :data="tableCols"
      @confirm="saveColConfig"
    />
    <create-ip
      title="添加IP"
      :idcs="assetIdcListMap"
      :ip-types="assetTypesListMap"
      :visible.sync="createVisible"
      :loading="loadingCreate"
      @submit="createIp"
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
import { ipColumns } from '@/views/assets/modules/columns.js';
import { isEmptyArr, loading, debounce } from '@/utils/utils';
import {
  getAssetsIpOption,
  getAssetsIp,
  createAssetsIpBatch,
  updateAssetsIp,
} from '@/service/asset';
import CreateIp from '@/views/assets/ip/createIp/createIp.vue';

const LOCAL_STORAGE_KEY = 'ASSETS_IP_COL_CONFIG';
const tableCols = ipColumns;

export default {
  name: 'AssetsIp',
  mixins: [
    colConfigMixin,
    localStorageMixin,
    serverTableMixin,
    restoreMixin,
  ],
  components: {
    CreateIp,
  },
  data() {
    return {
      storeNamespace: 'ASSETS_IP_TABLE',
      form: {
        typeList: [],
        idcList: [],
      },

      assetTypesListMap: [],
      assetIdcListMap: [],

      loading: false,
      loadingOpt: false,
      loadingCreate: false,
      keywords: '',

      LOCAL_STORAGE_KEY,
      sortCol: [],
      renderCol: tableCols,
      tableCols: tableCols,
      colConfigVisible: false,

      createVisible: false,

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
    async getTableList() {
      const res = await getAssetsIp(this.getParams());
      if (res.error_code !== 0) {
        this.$Notify.error('获取列表失败');
        this.tableData = [];
        return;
      }
      this.tableData = res.data.ips;
      this.total = res.data.total;
    },
    async getOption() {
      const res = await getAssetsIpOption();
      if (res.error_code !== 0) return;
      this.assetTypesListMap = arr2map(res.data.ip_types);
      this.assetIdcListMap = arr2map(res.data.idcs);
    },
    handleToggle(status, row) {
      status = status === 'True' ? true : false;
      this.$Modal.confirm({
        title: `是否确定将IP${row.ipAddress}的状态设置为${status ? '已占用' : '未占用'}？`,
        onOk: () => {
          this.toggle(row.esId, status);
        },
        onCancel: () => {
          row.isUsed = row.isUsed === 'True' ? 'False' : 'True';
        },
      });
    },
    async toggle(esId, status) {
      const params = {
        isUsed: status,
      };
      const res = await updateAssetsIp(esId, params);
      if (res.error_code !== 0) {
        this.$Notify.error('操作失败');
        return;
      }
      this.fetchTable();
    },
    handleCreateIp() {
      this.createVisible = true;
    },
    async createIp(params) {
      const res = await createAssetsIpBatch(params);
      if (res.error_code !== 0) {
        this.$Notify.error({
          title: '失败',
          desc: res.error_msg || '添加IP失败'
        });
        return;
      }
      this.$Message.success('添加IP成功');
      this.createVisible = false;
      this.fetchTable();
    },

    // 列配置
    saveColConfig() {
      this.$refs.serverTable?.$refs.gsmultipleTable?.doLayout?.();
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
  }
</style>
