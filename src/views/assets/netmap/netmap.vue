<template>
  <div class="assets-netmap">
    <table-page>
      <filter-table slot="filter" label-width="140px" v-loading="loadingOpt">
        <filter-table-item label="机房">
          <radio-button
            :data="assetIdcListMap"
            v-model="form.idcList"
          />
        </filter-table-item>
        <filter-table-item label="映射类型">
          <radio-button
            :data="mappingTypeListMap"
            v-model="form.mappingTypeList"
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
            show-overflow-tooltip
          >
            <template slot-scope="{ row }">
              <!-- <template v-if="item.value === 'public_ip'">
                <router-link
                  :to="`/main/assets/server/detail/${row[item.value]}`"
                >{{ row[item.value] }}</router-link>
              </template>
              <template v-if="item.value === 'private_ip'">
                <router-link
                  :to="`/main/assets/server/detail/${row[item.value]}`"
                >{{ row[item.value] }}</router-link>
              </template> -->
              <template v-if="item.value === 'domains'">
                <div v-for="(domain, index) in JSON.parse(row.domains)" :key="index" class="line-height-20">{{ domain }}</div>
              </template>
              <template v-else>
                <span>{{ row[item.value] | arr2str }}</span>
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
import { arr2map } from '@/views/assets/constant';
import { netmapColumns } from '@/views/assets/modules/columns';
import { isEmptyArr, loading, debounce } from '@/utils/utils';
import { getAssetsNetMapOption, getAssetsNetMap } from '@/service/asset';

const LOCAL_STORAGE_KEY = 'ASSETS_NET_MAP_COL_CONFIG';
const tableCols = netmapColumns;

export default {
  name: 'AssetsNetmap',
  mixins: [
    colConfigMixin,
    localStorageMixin,
    serverTableMixin,
    restoreMixin,
  ],
  data() {
    return {
      storeNamespace: 'ASSETS_NET_MAP_TABLE',
      form: {
        mappingTypeList: [],
        idcList: [],
      },

      mappingTypeListMap: [],
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
  filters: {
    arr2str(arr = '') {
      try {
        return JSON.parse(arr).join('，\n');
      } catch (error) {
        return arr;
      }
    }
  },
  directives: {
    domains: {
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
    @loading()
    async getTableList() {
      const res = await getAssetsNetMap(this.getParams());
      if (res.error_code !== 0) {
        this.$Notify.error('获取集群列表失败');
        this.tableData = [];
        return;
      }
      this.tableData = res.data.net_mappings;
      this.total = res.data.total;
    },
    @loading('loadingOpt')
    async getOption() {
      const res = await getAssetsNetMapOption();
      if (res.error_code !== 0) return;
      this.mappingTypeListMap = arr2map(res.data.net_mapping_types);
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
  .assets-netmap {
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
