<template>
  <div class="audit-order-page">
    <div class="page-header">
      <span :class="{'active': query.status === 2}" @click="changeType(2)">需处理</span>
      <span :class="{'active': query.status === 3}" @click="changeType(3)">处理中</span>
      <span :class="{'active': query.status === 4}" @click="changeType(4)">已完成</span>
    </div>
    <div class="page-main">
      <query-table @query="updateListData" @reset-query="resetQuery">
        <gs-form ref="searchForm" :model="searchForm" label-width="100px">
          <gs-form-item label="分类：" prop="type">
            <gs-select v-model="searchForm.type" @change="updateListData" clearable>
              <gs-option v-for="item in serviceOptions" :key="item.id" :value="item.id" :label="item.title"></gs-option>
            </gs-select>
          </gs-form-item>
          <gs-form-item label="状态：" prop="state" v-if="query.status !== 4">
            <gs-select v-model="searchForm.state" @change="updateListData" clearable>
              <gs-option v-for="item in stateOptions" :key="item.text" :value="item.state.join(',')" :label="item.text"></gs-option>
            </gs-select>
          </gs-form-item>
          <gs-form-item label="租户：" prop="tenant">
            <!-- <gs-input clearable v-model="searchForm['tenant']" placeholder="请输入租户精确搜索" @keyup.enter.native="updateListData"></gs-input> -->
            <gs-select v-model="searchForm['tenant']" clearable searchable @change="updateListData">
              <gs-option v-for="item in tenantList" :key="item.tenant_id" :value="item.tenant_name" :label="item.tenant_name"></gs-option>
            </gs-select>
          </gs-form-item>
          <gs-form-item label="申请人：" prop="creator">
            <gs-input clearable v-model="searchForm['creator']" placeholder="请输入申请人精确搜索" @keyup.enter.native="updateListData"></gs-input>
          </gs-form-item>
          <gs-form-item label="关键词：" prop="search_condition">
            <gs-input clearable v-model="searchForm['search_condition']" placeholder="请输入关键词搜索（支持申请理由）" @keyup.enter.native="updateListData"></gs-input>
          </gs-form-item>
        </gs-form>
      </query-table>
      <div class="tool-box">
        <!-- <gs-button type="primary">批量同意</gs-button>
        <gs-button type="primary">批量驳回</gs-button>
        <gs-button type="primary">批量丢弃</gs-button> -->
      </div>
      <gs-table
          v-loading="loading"
          ref="table"
          :data="orderList || []"
          :pagination="pagination"
          paging
          @page-change="pageChange"
          @size-change="sizeChange"
          >
          <gs-table-column prop="id" label="工单编号" width="120">
            <template slot-scope="{ row }">
              <gs-button type="text-primary" @click="$router.push(`/main/order/audit/${row.type}/${row.id}`)">{{ row.id }}</gs-button>
            </template>
          </gs-table-column>
          <gs-table-column prop="type" label="工单类型" width="120">
            <template slot-scope="{ row }">
              <span>{{ formatType(row.type) }}</span>
            </template>
          </gs-table-column>
          <gs-table-column prop="description" label="申请理由" width="200" show-overflow-tooltip />
          <gs-table-column prop="state" label="状态" width="100">
            <template slot-scope="{ row }">
              <gs-tag :type="formatState(row.state).color">{{ formatState(row.state).text }}</gs-tag>
              <!-- <gs-tag type="primary" v-if="row.state > 2 && row.state < 10">{{ formatState(row.state) }}</gs-tag>
              <gs-tag type="danger" v-if="row.state === 11">{{ formatState(row.state) }}</gs-tag>
              <gs-tag type="success" v-if="row.state === 10">{{ formatState(row.state) }}</gs-tag> -->
            </template>
          </gs-table-column>
          <gs-table-column prop="tenant" label="租户" show-overflow-tooltip width="120" />
          <gs-table-column prop="creator" label="申请人" width="100" show-overflow-tooltip />
          <gs-table-column prop="group" label="当前处理组" width="120" show-overflow-tooltip />
          <gs-table-column prop="create_time" label="创建时间" width="165" />
          <gs-table-column prop="create_time" label="操作" width="120" v-if="query.status === 2">
            <template slot-scope="{ row }">
              <gs-button type="text-primary" v-if="row.state === 1 || row.state === 2" @click="openHandleModal(row, 1)">同意</gs-button>
              <gs-button type="text-primary" v-if="row.state === 1 || row.state === 2" @click="openHandleModal(row, 2)">驳回</gs-button>
              <gs-button type="text-primary" v-if="row.state === 3" @click="$router.push(`/main/order/audit/${row.type}/${row.id}`)">开通</gs-button>
              <gs-button type="text-primary" v-if="row.state === 5 || row.state === 7 || row.state === 9" @click="$router.push(`/main/order/audit/${row.type}/${row.id}`)">重试</gs-button>
              <gs-button type="text-primary" v-if="row.state > 2 && row.state < 10" @click="openHandleModal(row, 12)">丢弃</gs-button>
            </template>
          </gs-table-column>
        </gs-table>
    </div>
    <handle-modal
      :visible="handleModalVisible"
      :id="handleForm.id"
      :action="handleForm.action"
      @close="closeHandleModal"
      @update="updateListData"
    ></handle-modal>
  </div>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex';
import {
  checkLoading,
  checkSuccess
} from '@/store/status';
import './style.scss';
import { serviceOptions, OrderState, stateTextMap } from '@/views/apply/constant';
import HandleModal from './handle-modal';
export default {
  components: {
    HandleModal
  },
  data() {
    return {
      stateTextMap,
      OrderState,
      serviceOptions,
      stateOptions: [],
      searchForm: {
        creator: '',
        type: '',
        tenant: '',
        search_condition: '',
        state: ''
      },
      page: {
        pageSize: 10,
        pageSizes: [10, 30, 50],
        pageNum: 1
      },
      query: {
        status: 2
      },
      handleModalVisible: false,
      handleForm: {}
    };
  },
  computed: {
    ...mapGetters({
      tenantList: 'GET_TENANT'
    }),
    ...mapState('order', {
      orderListStatus: 'orderListStatus',
      orderList: 'orderList',
      orderListTotal: 'orderListTotal'
    }),
    loading() {
      return checkLoading(this.orderListStatus);
    },
    success() {
      return checkSuccess(this.orderListStatus);
    },
    pagination() {
      const page = this.page;
      return {
        current: page.pageNum,
        pageSize: page.pageSize,
        pageSizes: page.pageSizes,
        total: this.orderListTotal
      };
    }
  },
  created() {
    this.formatStateOption();
    this.fetchListData();
  },
  methods: {
    ...mapActions('order', [
      'getOrderList'
    ]),
    formatStateOption() {
      if (this.query.status === 2) {
        this.stateOptions = this.stateTextMap.slice(0, 4);
      } else if (this.query.status === 3) {
        this.stateOptions = this.stateTextMap.slice(4, 6);
      } else {
        this.stateOptions = this.stateTextMap.slice(6, 8);
      }
    },
    formatType(id) {
      return ['', '虚拟机', '虚拟机删除', '主动访问公网', '被公网访问', 'DNS'][id];
    },
    formatState(state) {
      return this.stateTextMap.find(item => item.state.indexOf(state) > -1) || {};
    },
    changeType(val) {
      this.query.status = val;
      this.formatStateOption();
      this.resetQuery();
    },
    fetchListData() {
      let param = {
        ...this.query,
        ...this.searchForm,
        page_size: this.page.pageSize,
        page: this.page.pageNum
      };
      // 工单状态筛选
      if (this.searchForm.state.length) {
        param.state = this.searchForm.state.split(',').map(item => parseInt(item));
      } else {
        delete param.state;
      }
      // tab筛选
      if (param.status === 4) {
        param.state = [10, 11];
        delete param.status;
      }
      // 工单类型筛选
      if (param.type && !(param.type instanceof Array)) {
        param.type = [param.type];
      } else {
        delete param.type;
      }
      this.getOrderList(param);
    },
    pageChange(pageIndex) {
      this.page.pageNum = pageIndex;
      this.fetchListData();
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize || this.query.pageSize || 10;
      let newCurrenPage = Math.ceil((this.pagination.total / pageSize));
      if (this.page.pageNum > newCurrenPage) {
        this.page.pageNum = newCurrenPage;
      }
      this.fetchListData();
    },
    resetQuery() {
      this.$refs.searchForm.resetFields();
      this.searchForm.state = '';
      this.updateListData();
    },
    updateListData() {
      this.page.pageNum = 1;
      this.fetchListData();
    },
    openHandleModal(data, action) {
      this.handleForm = {
        id: data.id,
        action
      };
      this.handleModalVisible = true;
    },
    closeHandleModal() {
      this.handleModalVisible = false;
    }
  }
};
</script>
