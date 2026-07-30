import { mapGetters, mapMutations } from 'vuex';

/**
 * @file 离开页面时保存需要的参数，从其他页面进入时还原参数，默认可用于表格页的筛选条件
 * @mixins
 */
export default {
  data() {
    return {
      storeNamespace: '',
    };
  },
  computed: {
    ...mapGetters({
      storedParams: 'GET_STORE_PARAMS',
    }),
  },
  methods: {
    ...mapMutations(['SET_STORE_PARAMS']),
    // 将状态保存至vuex，默认针对表格页，可重写
    store() {
      const params = {
        keywords: this.keywords,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        orderMethod: this.orderMethod,
        form: this.form,
      };
      this.SET_STORE_PARAMS({
        namespace: this.storeNamespace,
        params,
      });
    },
    // 将状态还原，可重写
    restore() {
      const params = this.storedParams[this.storeNamespace];
      if (!params) return;
      const {
        keywords,
        pageNum,
        pageSize,
        orderBy,
        orderMethod,
        form,
      } = params;
      this.keywords = keywords;
      this.pageNum = pageNum;
      this.pageSize = pageSize;
      this.orderBy = orderBy;
      this.orderMethod = orderMethod;
      this.form = form;
    },
  },
  created() {
    this.restore();
  },
  beforeDestroy() {
    this.store();
  }
};
