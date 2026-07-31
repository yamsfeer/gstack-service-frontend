<template>
  <gs-modal
    :value="show"
    :title="title"
    @confirm="confirm"
    has-form
    @cancel="close"
    top="86px"
    width="550px"
    class="step-modal"
  >
    <gs-form
      :model="form"
      :rules="rules_step"
      label-width="100px"
      ref='form'>
      <gs-form-item label="环节名称" prop="name">
        <gs-input v-model.trim="form.name" :disabled="form.isOpen"></gs-input>
        <word-limit :val="form.name" :max="50"></word-limit>
      </gs-form-item>
      <gs-form-item :label="form.isOpen ? '开通组':'审核组'" prop="handler">
        <gs-select v-model="form.handler" :pagination="pagination" searchable :remote="true" :remote-method="searchUser" :loading="loading">
          <gs-option
            v-for="item in selectedGroupList || groupList"
            :key="item.id"
            :label="item.group_name"
            :value="item.id + ''">
          </gs-option>
        </gs-select>
      </gs-form-item>
      <gs-form-item label="描述" prop="description" v-if="!form.isOpen">
        <gs-textarea v-model="form.description"></gs-textarea>
        <word-limit :val="form.description" :max="200"></word-limit>
      </gs-form-item>
    </gs-form>
  </gs-modal>
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
import rulesMix from './formRules';
export default {
  mixins: [rulesMix],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    stepNames: {
      type: Array,
      required: true,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      required: true,
      default: false
    },
    editData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    ...mapState('user', {
      groupList: 'groupList',
      groupListStatus: 'groupListStatus',
      groupListTotal: 'groupListTotal'
    }),
    loading() {
      return checkLoading(this.groupListStatus);
    },
    success() {
      return checkSuccess(this.groupListStatus);
    },
    show: {
      get() {
        return this.visible;
      },
      set(val) {
        return val;
      }
    },
    pagination() {
      return {
        pageChange: this.pageChange,
        total: this.groupListTotal || 0,
        'page-size': this.page.pageSize,
        current: this.page.pageNum
      };
    },
    title() {
      return this.isEdit ? '编辑环节' : '添加环节';
    }
  },
  watch: {
    'form.handler': {
      handler(newVal, oldVal) {
        const data = this.groupList.find(item => (item.id + '') === newVal);
        if (data) {
          this.handlerName = data.group_name;
        }
      },
      deep: true
    },
    visible(newVal) {
      if (newVal) {
        this.form = this.initForm();
        this.$refs.form.resetFields();
      }
    }
  },
  data() {
    return {
      form: {},
      page: {
        pageSize: 10,
        pageNum: 1
      },
      searchKey: '',
      handlerName: '',
      saveStepName: '',
      // 用户列表是分页的，当选择的用户不是在第一页，则一开始不会显示用户
      selectedGroupList: null
    };
  },
  methods: {
    ...mapActions('user', [
      'getGroupList'
    ]),
    initForm() {
      if (this.isEdit) {
        this.saveStepName = this.editData.name;
        this.handlerName = this.editData.handlerName;
        if (this.editData.handler) {
          this.selectedGroupList = [
            {
              group_name: this.editData.handlerName,
              id: this.editData.handler
            }
          ];
        }
        setTimeout(_ => { this.selectedGroupList = null; });
        return {
          ...this.editData
        };
      } else {
        return {
          name: '',
          description: '',
          handler: ''
        };
      }
    },
    confirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const param = {
            ...this.form,
            handlerName: this.handlerName
          };
          this.isEdit ? this.$emit('edit-step', param) : this.$emit('add-step', param);
          this.close();
        }
      });
    },
    close() {
      this.show = false;
      this.$emit('close', false);
    },
    pageChange(pageIndex) {
      this.page.pageNum = pageIndex;
      this.fetchListData();
    },
    fetchListData() {
      const param = {
        page: this.page.pageNum,
        pagesize: this.page.pageSize,
        'search_condition': this.searchKey
      };
      this.getGroupList(param);
    },
    searchUser(val) {
      this.page.pageNum = 1;
      this.searchKey = val;
      this.fetchListData();
    }
  },
  created() {
    this.fetchListData();
  }
};
</script>

<style lang="scss">
.step-modal {
  .gs-modal-body {
    overflow: hidden;
  }
  .gs-form-item-content {
    position: relative;
    margin-right: 60px;
  }
}
</style>
