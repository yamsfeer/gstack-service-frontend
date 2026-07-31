import { mapActions } from '@/stores/vuex-compat';
export default {
  data() {
    return {
      id: '',
      isEdit: false,
      pageLoading: false,
      saveProcessName: ''
    };
  },
  methods: {
    ...mapActions('manage', [
      'getProcessDetail',
      'updateProcess'
    ]),
    ...mapActions('user', [
      'getGroupByIds'
    ]),
    init() {
      if (this.isEdit) {
        this.pageLoading = true;
        this.getProcessDetail(this.id).then(res => {
          if (res.error_code === 0) {
            this.getUserName(res.data);
          }
        });
      }
    },
    getUserName(data) {
      let groups = [];
      data.steps.forEach(item => {
        groups.push(item.group_id);
      });
      this.getGroupByIds({ 'group_id_list': groups }).then(res => {
        this.formatApiData(data, res.data['group_list']);
        this.pageLoading = false;
      });
    },
    formatApiData(data, groupList) {
      const openStep = data.steps.find(item => item.name === '开通环节') || {};
      const temp = groupList.find(item => item.id === openStep.group_id) || {};
      this.openStep = {
        name: '开通环节',
        handler: openStep.group_id + '',
        handlerName: temp.group_name,
        description: '',
        isOpen: true
      };
      let steps = [];
      data.steps.forEach(item => {
        if (item.name !== '开通环节' && !item.is_hidden) {
          const temp = groupList.find(user => user.id === item.group_id) || {};
          item.handler = item.group_id + '';
          item.handlerName = temp.group_name;
          steps.push(item);
        }
      });
      data.steps = steps;
      this.processForm = data;
      this.saveProcessName = data.name;
    },
    handlerUpdateProcess() {
      const param = this.getParam();
      this.updateProcess({ id: this.id, param }).then(res => {
        if (res.error_code === 0) {
          this.$Message.success('更新成功！');
          this.saveProcessName = param.name;
          setTimeout(() => {
            this.$router.push('/main/manage');
          }, 1000);
        } else {
          this.$Notify.error({
            title: '失败',
            desc: res.error_msg
          });
        }
      });
    }
  },
  created() {
    this.isEdit = this.$route.path.indexOf('edit') > -1;
    this.id = this.$route.params.id;
    this.init();
  }
};
