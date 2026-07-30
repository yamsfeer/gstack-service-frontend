<template>
  <div class="server-detail-page floatfix">
    <detail-layout ref="layout" type="server" :rules="rules" :keyMap="keyMap" :editData="editData" :virtualServer="virtualServer" :option="option" @openModal="openModal"></detail-layout>
    <div class="operation">
      <gs-button type="primary" v-if="isDetail && !isEditing && has()" @click="turnToEdit">编辑</gs-button>
      <gs-button type="primary" v-if="isDetail && isEditing" @click="sumbit">保存</gs-button>
      <gs-button v-if="isDetail && isEditing" @click="cancelEdit">取消</gs-button>
      <gs-button type="primary" v-if="!isDetail" @click="sumbit">添加</gs-button>
      <gs-button v-if="!isDetail" @click="resetForm">清空</gs-button>
    </div>
    <ip
      :value="ip.selected"
      :visible.sync="ip.visible"
      :selectedList="ip.data"
      :pageFilterCondition="{isUsed: 'False'}"
      @confirm="confirmSelectIp"
      @close="ip.visible = false"
    ></ip>
  </div>
</template>
<script>
import {
  mapActions
} from 'vuex';
import './style.scss';
import { keyMap } from './constant';
import { rules } from './formRules';
import detailLayout from '@/views/assets/modules/detailLayout';
import ip from '@/views/assets/modules/selectIp';
import { getAssetsServer, getHostName, getAssetsServerOption } from '@/service/asset';

export default {
  components: {
    detailLayout,
    ip
  },
  data() {
    return {
      rules,
      keyMap,
      id: '',
      isDetail: true,
      isEditing: false,
      editData: {},
      ip: {
        key: '',
        data: [],
        index: '',
        visible: false,
        selected: ''
      },
      virtualServer: [],
      option: {},
      saveNewHostname: {}
    };
  },
  methods: {
    ...mapActions('asset', [
      'getServerDetail',
      'updateServer',
      'createServer',
      'getUserListByUsername'
    ]),
    turnToEdit() {
      this.isEditing = true;
      this.$refs.layout.turnToEdit();
    },
    cancelEdit() {
      this.isEditing = false;
      this.$refs.layout.cancelEdit();
    },
    resetForm() {
      this.$refs.layout.resetForm();
      this.$refs.layout.updateData({ key: 'assetServerUuid', newData: this.saveNewHostname.uuid });
      this.$refs.layout.updateData({ key: 'logicalHostName', newData: this.saveNewHostname.hostname });
    },
    sumbit() {
      this.$refs.layout.$refs.form.validate(valid => {
        if (!valid) return;
        const param = this.$refs.layout.getParam();
        // 先通过用户的英文名获取中文名
        this.getUserName(param);
      });
    },
    getDetail() {
      if (!this.id) return;
      // this.id = 'dc39f1e6-3de6-11e6-8869-68f7280f32dc';
      this.getServerDetail(this.id).then(res => {
        if (res.error_code === 0) {
          this.editData = res.data;
          this.getVirtualServer();
        }
      });
    },
    getVirtualServer() {
      if (this.editData.assetServerType !== '物理机' || this.editData.assetIsHostMachine !== 'True') return;
      getAssetsServer({ logicalHostMachine: this.editData.logicalHostName, assetServerType: '虚拟机', page: 1, page_size: 1000 }).then(res => {
        if (res.error_code === 0) {
          this.virtualServer = res.data.servers;
        }
      });
    },
    openModal({ modalType, key, index, form }) {
      const data = form[key];
      this[modalType].key = key;
      this[modalType].data = data;
      this[modalType].index = index;
      this[modalType].selected = data[index] ? data[index].ip_address : '';
      this[modalType].visible = true;
    },
    confirmSelectIp(val) {
      this.ip.data.push(val.selected);
      this.$refs.layout.updateData({ key: this.ip.key, newData: this.ip.data });
      this.ip.visible = false;
    },
    getUserName(data) {
      // 通过username获取name
      this.getUserListByUsername({ username_list: [data.ownerEmail] }).then(res => {
        if (res.error_code === 0 && res.data.user_list.length) {
          data.assetOwner = res.data.user_list[0].name;
        }
        data.assetOwnerEmail = data.ownerEmail + '@example.com';
        if (this.isDetail) {
          this.updateServer({ id: this.id, param: data }).then(res => {
            if (res.error_code === 0) {
              this.$Message.success('保存成功！');
              this.cancelEdit();
              this.editData = res.data;
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg || '保存失败！'
              });
            }
          });
        } else {
          this.createServer(data).then(res => {
            if (res.error_code === 0) {
              this.$Modal.confirm({
                title: `录入服务器成功！`,
                modalProps: {
                  'confirm-text': '确定',
                  'cancel-text': '继续录入'
                },
                onOk: () => {
                  this.$router.push('/main/assets/server');
                },
                onCancel: () => {
                  this.resetForm();
                  this.getNewHostName();
                }
              });
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg || '录入失败！'
              });
            }
          });
        }
      });
    },
    getNewHostName() {
      getHostName().then(res => {
        if (res.error_code === 0) {
          this.saveNewHostname = res.data;
          this.$refs.layout.updateData({ key: 'assetServerUuid', newData: res.data.uuid });
          this.$refs.layout.updateData({ key: 'logicalHostName', newData: res.data.hostname });
        }
      });
    },
    async getAssetsServerOption() {
      const res = await getAssetsServerOption();
      if (res.error_code !== 0) return;
      this.option = res.data;
    },
  },
  watch: {
    '$route'(val) {
      this.id = val.params.id || '';
      console.log(val);
      this.getDetail();
    }
  },
  mounted() {
    this.id = this.$route.params.id || '';
    this.isDetail = this.$route.path.indexOf('detail') > -1;
    this.getAssetsServerOption();
    if (this.isDetail) {
      this.getDetail();
    } else {
      this.getNewHostName();
      this.turnToEdit();
    }
  }
};
</script>
