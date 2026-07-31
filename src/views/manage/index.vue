<template>
  <div class="manage-page">
    <div class="page-header">流程管理</div>
    <div class="page-main">
      <div class="tool-box">
        <div>
          <label>关键词：</label>
          <gs-input placeholder="请输入名称关键词搜索" class="width-300" v-model="query.search_condition" @keyup.enter="filterData"></gs-input>
        </div>
        <gs-button type="primary" @click="$router.push('/main/manage/process/create')">创建工单流程</gs-button>
      </div>
      <gs-table
        v-loading="loading"
        ref="table"
        :data="manageList || []"
        :pagination="pagination"
        paging
        @page-change="pageChange"
        @size-change="sizeChange"
        >
        <gs-table-column prop="name" label="名称" show-overflow-tooltip>
           <template slot-scope="{ row }">
             <gs-button type="text-primary" @click="$router.push('/main/manage/process/edit/' + row.id)">{{ row.name }}</gs-button>
          </template>
        </gs-table-column>
        <gs-table-column prop="type" label="类型">
          <template slot-scope="{ row }">
            <span>{{ row.type === 1 ? '默认' : '自定义'}}</span>
          </template>
        </gs-table-column>
        <gs-table-column prop="description" label="描述" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ row.description || '无'}}</span>
          </template>
        </gs-table-column>
        <gs-table-column prop="state" label="应用状态">
          <template slot-scope="{ row }">
            <gs-tag v-if="row.enable" type="success">应用</gs-tag>
            <gs-tag v-else type="danger">禁用</gs-tag>
          </template>
        </gs-table-column>
        <gs-table-column prop="state" label="就绪状态">
          <template slot-scope="{ row }">
            <gs-tag v-if="row.ready" type="success">有效</gs-tag>
            <gs-tag v-else type="danger">无效</gs-tag>
          </template>
        </gs-table-column>
        <gs-table-column show-overflow-tooltip prop="create_time" label="创建时间" min-width="100" />
        <gs-table-column show-overflow-tooltip prop="update_time" label="更新时间" min-width="100" />
        <gs-table-column prop="create_time" label="操作">
          <template slot-scope="{ row }">
            <gs-button type="text-primary" @click="openProcess(row.id)" :disabled="row.enable || !row.ready">启用</gs-button>
            <gs-button
              type="text-primary"
              @click="delProcess(row.id)"
              :disabled="row.enable && row.ready"
              v-if="row.type !== DEFAULT_MANAGE_TYPE" >删除</gs-button>
          </template>
        </gs-table-column>
      </gs-table>
    </div>
    <!-- updateFetchData未定义 -->
    <!-- <process-modal
      :visible="processModalVisible"
      :is-edit="processForm.isEdit"
      :edit-data="processForm.data"
      @close="closeProcessModal"
      @update="updateFetchData"
    /> -->
  </div>
</template>

<script>
import {
  mapState,
  mapActions
} from '@/stores/vuex-compat';
import {
  checkLoading,
  checkSuccess
} from '@/stores/vuex-compat';
import './style.scss';
import processModal from './process-modal.vue';

// 默认流程不能删除
const DEFAULT_MANAGE_TYPE = 1;

export default {
  components: {
    processModal
  },
  data() {
    return {
      DEFAULT_MANAGE_TYPE,
      page: {
        pageSize: 10,
        pageSizes: [10, 30, 50],
        pageNum: 1
      },
      query: {
        'search_condition': ''
      },
      processModalVisible: false,
      processForm: {}
    };
  },
  computed: {
    ...mapState('manage', {
      manageListStatus: 'manageListStatus',
      manageList: 'manageList'
    }),
    loading() {
      return checkLoading(this.manageListStatus);
    },
    success() {
      return checkSuccess(this.manageListStatus);
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
    this.fetchListData();
  },

  methods: {
    ...mapActions('manage', [
      'getManageList',
      'deleteProcess',
      'updateProcess'
    ]),
    fetchListData () {
      const param = {
        ...this.query,
        page_size: this.page.pageSize,
        page: this.page.pageNum
      };
      this.getManageList(param);
    },
    filterData() {
      this.page.pageNum = 1;
      this.fetchListData();
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
    closeProcessModal() {
      this.processModalVisible = false;
    },
    openProcessModal(data) {
      this.processForm = {
        isEdit: !!data,
        data: data || {}
      };
      this.processModalVisible = true;
    },
    delProcess(id) {
      this.$Modal.confirm({
        title: `是否确定删除该流程？`,
        onOk: () => {
          this.deleteProcess(id).then(res => {
            if (res.error_code === 0) {
              this.$Message.success('删除成功！');
              this.fetchListData();
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg
              });
            }
          });
        }
      });
    },
    // 启用流程
    openProcess(id) {
      this.$Modal.confirm({
        title: `是否确定启用该流程？`,
        onOk: () => {
          this.updateProcess({id, param: {enable: true}}).then(res => {
            if (res.error_code === 0) {
              this.$Message.success('启用成功！');
              this.fetchListData();
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg
              });
            }
          });
        }
      });
    }
  }
};
</script>
