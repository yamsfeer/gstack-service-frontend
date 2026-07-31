<template>
  <div class="assets-server">
    <table-page>
      <filter-table slot="filter" label-width="140px" v-loading="loadingOpt">
        <filter-table-item label="产品线(多选)">
          <radio-button
            :data="assetProductListMap"
            v-model="form.assetProductList"
            show-type="toggle"
            multiple
          />
        </filter-table-item>
        <filter-table-item label="机房(多选)">
          <radio-button
            :data="assetIdcListMap"
            v-model="form.assetIdcList"
            multiple
          />
        </filter-table-item>
        <filter-table-item label="业务等级">
          <radio-button
            :data="assetsLevelMap"
            v-model="form.assetLevelList"
          />
        </filter-table-item>
        <filter-table-item label="操作系统">
          <radio-button
            :data="assetsOSMap"
            v-model="form.logicalOperationSystemList"
          />
        </filter-table-item>
        <filter-table-item label="服务器类型">
          <radio-button
            :data="assetsServerTypeMap"
            v-model="form.assetServerTypeList"
          />
        </filter-table-item>
        <filter-table-item label="资产状态(多选)">
          <radio-button
            :data="assetsStatusMap"
            v-model="form.assetAssetStatusList"
            multiple
          />
        </filter-table-item>
        <filter-table-item label="资产所属人">
          <radio-button
            :data="assetsOwnerMap"
            v-model="form.assetOwner"
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
          <gs-button type="primary" @click="$router.push('/main/assets/server/add')" v-if="has()">手工录入</gs-button>
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
              <template v-if="item.value === 'logicalHostName'">
                <router-link
                  :to="`/main/assets/server/detail/${row.assetServerUuid}`"
                ><span v-html="highLightHtml(row[item.value])"></span></router-link>
              </template>
              <template v-else-if="item.value === 'logicalIpListIpAddress'">
                <div v-for="(ip, index) in row[item.value] && row[item.value].split(',')" :key="index" class="line-height-20" >
                  <span v-html="highLightHtml(ip)"></span>
                </div>
              </template>
              <template v-else-if="item.value === 'logicalHostMachineIpAddress' && row.logicalHostMachineDetails">
                <div v-for="(ip, index) in row.logicalHostMachineDetails.logicalIpListIpAddress && row.logicalHostMachineDetails.logicalIpListIpAddress.split(',')" :key="index" class="line-height-20" >
                  <span v-html="highLightHtml(ip)"></span>
                </div>
              </template>
              <template v-else>
                <span v-html="highLightHtml(row[item.value])"></span>
              </template>
            </template>
          </gs-table-column>
        </template>
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
import { serverColumns } from '@/views/assets/modules/columns.js';
import { getAssetsServer, getAssetsServerOption } from '@/service/asset';
import {
  arr2map,
  assetsStatusPhysicalMap,
  assetsStatusVirtualMap,
  assetsOwnerMap,
} from '@/views/assets/constant';
import { isEmptyArr, loading, debounce } from '@/utils/utils';
import { mapGetters } from '@/stores/vuex-compat';

const LOCAL_STORAGE_KEY = 'ASSETS_SERVER_COL_CONFIG';
const tableCols = serverColumns;

export default {
  name: 'AssetsServer',
  mixins: [
    colConfigMixin,
    localStorageMixin,
    serverTableMixin,
    restoreMixin,
  ],
  data() {
    return {
      storeNamespace: 'ASSETS_SERVER_TABLE',
      form: {
        assetProductList: [],
        assetAssetStatusList: [],
        assetLevelList: [],
        assetIdcList: [],
        logicalOperationSystemList: [],
        assetServerTypeList: [],
        assetOwner: [],
        logicalHostMachine: [],
      },

      assetProductListMap: [],
      assetIdcListMap: [],
      assetsLevelMap: [],
      assetsOSMap: [],
      assetsServerTypeMap: [],
      assetsStatusAllMap: [],
      assetsStatusPhysicalMap,
      assetsStatusVirtualMap,
      assetsOwnerMap,

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
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO',
    }),
    assetsStatusMap() {
      // 资产状态的可选项根据当前选中的服务器类型决定
      const serverMap = {
        '物理机': this.assetsStatusPhysicalMap,
        '虚拟机': this.assetsStatusVirtualMap,
      };
      const [serverType] = this.form.assetServerTypeList;
      return serverType ? serverMap[serverType] : this.assetsStatusAllMap;
    }
  },
  watch: {
    form: {
      handler(val) {
        this.debounceFetch();
      },
      deep: true
    },
    assetsStatusMap: {
      handler(newVal, oldVal) {
        if (!newVal.length) return;
        // 当前选中的资产状态是否在选项中不存在
        const isNotFound = this.form.assetAssetStatusList.filter(item => {
          return newVal.findIndex(statusItem => statusItem.value === item) === -1;
        }).length > 0;
        if (isNotFound) {
          this.form.assetAssetStatusList = [];
        }
      },
      deep: true,
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
      // 资产所属人-与我相关,需要传当前登录用户中文名
      if (params.assetOwner) {
        params.assetOwner = this.userInfo.name;
      }
      return params;
    },
    async getTableList() {
      const res = await getAssetsServer(this.getParams());
      if (res.error_code !== 0) {
        this.$Notify.error('获取列表失败');
        this.tableData = [];
        return;
      }
      this.tableData = res.data.servers;
      this.total = res.data.total;
    },
    async getOption() {
      const res = await getAssetsServerOption();
      if (res.error_code !== 0) return;
      this.assetProductListMap = arr2map(res.data.products);
      this.assetIdcListMap = arr2map(res.data.idcs);
      this.assetsLevelMap = arr2map(res.data.server_levels);
      this.assetsOSMap = arr2map(res.data.systems);
      this.assetsServerTypeMap = arr2map(res.data.server_types);
      this.assetsStatusAllMap = arr2map(res.data.server_statuses);
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
    highLightHtml(data) {
      if (!this.keywords || !data) return data;
      return data.replace(this.keywords, `<span class="highLight">${this.keywords}</span>`);
    }
  },
  created() {
    this.setSelectedCol();
    this.getOption();
    this.getTableList();
  }
};
</script>
<style lang="scss">
  .assets-server {
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
    .line-height-20 {
      line-height: 20px;
    }
  }
  .highLight {
    background: #fefba5;
    padding: 3px;
  }
</style>
