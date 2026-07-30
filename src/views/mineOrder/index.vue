<template>
  <div class="mine-order-page">
    <div class="page-header">
      <div class="page-header-left">工单列表</div>
      <div class="page-header-right">
        <span :class="{'active': activeTab === 'mine'}" @click="changeTab('mine')">我的工单</span>
        <span :class="{'active': activeTab === 'all'}" @click="changeTab('all')">全部工单</span>
      </div>
    </div>
    <div class="page-main">
      <div class="page-main-left">
        <ul>
          <li v-for="item in serviceOptions" :key="item.id" :class="{'active': query.type === item.id}" @click="changeType(item.id)">{{ item.title }}</li>
        </ul>
      </div>
      <div class="page-main-right">
        <query-table @query="updateListData" @reset-query="resetQuery">
          <gs-form ref="searchForm" :model="searchForm" label-width="100px">
            <gs-form-item label="状态：" prop="state" v-if="query.status !== 4">
              <gs-select v-model="searchForm.state" @change="updateListData" clearable>
                <gs-option v-for="item in stateTextMap" :key="item.text" :value="item.state.join(',')" :label="item.text"></gs-option>
              </gs-select>
            </gs-form-item>
            <gs-form-item label="租户：" prop="tenant">
              <!-- <gs-input clearable v-model="searchForm['tenant']" placeholder="请输入租户精确搜索" @keyup.enter.native="updateListData"></gs-input> -->
              <gs-select v-model="searchForm['tenant']" clearable searchable @change="updateListData">
                <gs-option v-for="item in tenantList" :key="item.tenant_id" :value="item.tenant_name" :label="item.tenant_name"></gs-option>
              </gs-select>
            </gs-form-item>
            <gs-form-item label="申请人：" prop="creator" v-if="activeTab === 'all'">
              <gs-input clearable v-model="searchForm['creator']" placeholder="请输入申请人精确搜索" @keyup.enter.native="updateListData"></gs-input>
            </gs-form-item>
            <gs-form-item label="关键词：" prop="search_condition">
              <gs-input clearable v-model="searchForm['search_condition']" placeholder="请输入关键词搜索(支持申请理由)" @keyup.enter.native="updateListData"></gs-input>
            </gs-form-item>
          </gs-form>
        </query-table>
        <div class="tool-box">
          <gs-button type="primary" @click="linkToOrder">提交工单 ></gs-button>
        </div>
        <gs-table
          v-loading="loading"
          ref="table"
          :data="orderList || []"
          :pagination="pagination"
          paging
          @page-change="pageChange"
          @size-change="sizeChange"
          @selection-change="selectionChange"
          >
          <!-- <gs-table-column type='selection' width="35"></gs-table-column> -->
          <gs-table-column prop="id" label="工单编号" width="100">
            <template slot-scope="{ row }">
              <gs-button type="text-primary" @click="$router.push(`/main/order/detail/${row.type}/${row.id}`)">{{ row.id }}</gs-button>
            </template>
          </gs-table-column>
          <gs-table-column prop="type" label="工单类型" width="120">
            <template slot-scope="{ row }">
              <span>{{ formatType(row.type) }}</span>
            </template>
          </gs-table-column>
          <gs-table-column prop="description" label="申请理由" min-width="150" show-overflow-tooltip/>
          <gs-table-column prop="tenant" label="租户" min-width="140" show-overflow-tooltip/>
          <gs-table-column prop="creator" label="申请人" min-width="100" show-overflow-tooltip />
          <gs-table-column prop="state" label="状态" width="80">
            <template slot-scope="{ row }">
              <gs-tag :type="formatState(row.state).color">{{ formatState(row.state).text }}</gs-tag>
            </template>
          </gs-table-column>
          <!-- <gs-table-column prop="handler" label="当前处理人" width="150"/> -->
          <gs-table-column prop="create_time" label="创建时间" width="165"/>
          <gs-table-column label="操作" width="150">
            <template slot-scope="{ row }">
              <gs-button type="text-primary" :disabled="row.state !== 11" @click="reSubmit(row)">重新审核</gs-button>
              <gs-button type="text-primary" :disabled="row.state !== 1" @click="openHandleModal(row, 12)">丢弃</gs-button>
            </template>
          </gs-table-column>
        </gs-table>
      </div>
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
import HandleModal from '@/views/audit/handle-modal';
export default {
  components: {
    HandleModal
  },
  data() {
    return {
      stateTextMap,
      OrderState,
      serviceOptions: [{id: 0, title: '全部'}, ...serviceOptions],
      hostList: [],
      options: [],
      page: {
        pageSize: 10,
        pageSizes: [10, 30, 50],
        pageNum: 1
      },
      query: {
        status: 1, // 我的工单,
        type: 0 // 全部
      },
      activeTab: 'mine',
      ticketIds: [],
      handleModalVisible: false,
      handleForm: {},
      searchForm: {
        creator: '',
        tenant: '',
        search_condition: '',
        state: ''
      }
    };
  },
  computed: {
    ...mapGetters({
      userInfo: 'GET_USER_INFO',
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
  watch: {
    userInfo() {
      this.fetchListData();
    }
  },
  created() {
    this.fetchListData();
  },

  methods: {
    ...mapActions('order', [
      'getOrderList',
      'batchUpdateStateByAction',
      'createOrder'
    ]),
    formatType(id) {
      return ['', '虚拟机', '虚拟机删除', '主动访问公网', '被公网访问', 'DNS'][id];
    },
    formatState(state) {
      return this.stateTextMap.find(item => item.state.indexOf(state) > -1) || {};
    },
    changeTab(val) {
      this.activeTab = val;
      this.query.type = 0;
      this.page.pageNum = 1;
      this.searchForm.state = '';
      this.$refs.searchForm.resetFields();
      this.fetchListData();
    },
    changeType(val) {
      this.query.type = val;
      this.page.pageNum = 1;
      this.fetchListData();
    },
    fetchListData() {
      let param = {
        ...this.query,
        ...this.searchForm,
        page_size: this.page.pageSize,
        page: this.page.pageNum
      };
      if (this.searchForm.state.length) {
        param.state = this.searchForm.state.split(',').map(item => parseInt(item));
      } else {
        delete param.state;
      }
      if (!param.type) {
        delete param.type;
      } else {
        param.type = [param.type];
      }
      if (this.activeTab === 'mine') {
        param.creator = this.userInfo.name;
        if (!param.creator) return;
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
    getCreateParam(data) {
      return {
        tenant_id: data.tenant_id,
        type: data.type,
        resource: data.resource,
        description: data.description
      };
    },
    reSubmit(data) {
      this.$Modal.confirm({
        title: `是否确定重新发起审核？重新审核会创建新的工单。`,
        onOk: () => {
          const param = this.getCreateParam(data);
          this.createOrder(param).then(res => {
            if (res.error_code === 0) {
              this.$Message.success('发起重新审核成功！');
              this.updateListData();
            }
          });
        }
      });
    },
    selectionChange(val) {
      this.ticketIds = val.map(item => item.id);
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
    },
    linkToOrder() {
      const orderTypeMap = {
        0: '',
        1: 'vm',
        2: 'vmDelete',
        3: 'nat',
        4: 'lvs',
        5: 'dns'
      };
      this.$router.push(`/main/order/apply/${orderTypeMap[this.query.type]}`);
    }
  }
};
</script>
