<template>
  <div class="cluster-detail-page floatfix">
    <detail-layout ref="layout" type="cluster" :rules="rules" :keyMap="keyMap" :editData="editData" :option="option" @openModal="openModal"></detail-layout>
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
      :title="ip.title"
      :selectedList="ip.data"
      :pageFilterCondition="ip.filterCondition"
      @confirm="confirmSelectIp"
      @close="ip.visible = false"
    ></ip>
    <server
      :value="server.selected"
      :visible.sync="server.visible"
      :title="server.title"
      :selectedServer="server.data"
      :multiple="false"
      :idcFilterCondition="server.filterCondition"
      @confirm="confirmSelectServer"
    ></server>
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
import server from '@/views/apply/applyForm/server/selectServer';
import { getAssetsClusterOption } from '@/service/asset';

export default {
  components: {
    detailLayout,
    ip,
    server
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
        title: '选择成员私网VIP',
        key: '',
        data: [],
        index: '',
        visible: false,
        selected: '',
        filterCondition: {}
      },
      server: {
        title: '选择成员主机',
        key: '',
        data: [],
        index: '',
        visible: false,
        selected: '',
        filterCondition: {}
      },
      option: {}
    };
  },
  methods: {
    ...mapActions('asset', [
      'getClusterDetail',
      'updateCluster',
      'createCluster',
      'getServerByIds'
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
    },
    sumbit() {
      this.$refs.layout.$refs.form.validate(valid => {
        if (!valid) return;
        const param = this.$refs.layout.getParam();
        if (param.memberHostList === '[]') {
          this.$Message.warning('请选择成员主机');
          return;
        }
        if (param.privateVipList === '[]') {
          this.$Message.warning('请选择成员私网VIP');
          return;
        }
        if (this.checkVip(param)) {
          if (this.isDetail) {
            this.updateCluster({ id: this.id, param }).then(res => {
              if (res.error_code === 0) {
                this.$Message.success('保存成功！');
                this.cancelEdit();
                this.getDetail();
              } else {
                this.$Notify.error({
                  title: '失败',
                  desc: res.error_msg || '保存失败！'
                });
              }
            });
          } else {
            this.createCluster(param).then(res => {
              if (res.error_code === 0) {
                this.$Modal.confirm({
                  title: `添加集群成功！`,
                  modalProps: {
                    'confirm-text': '确定',
                    'cancel-text': '继续添加'
                  },
                  onOk: () => {
                    this.$router.push('/main/assets/balancing/cluster');
                  },
                  onCancel: () => {
                    this.resetForm();
                  }
                });
              } else {
                this.$Notify.error({
                  title: '失败',
                  desc: res.error_msg || '添加失败！'
                });
              }
            });
          }
        }
      });
    },
    checkVip(param) {
      const privateVipList = JSON.parse(param.privateVipList);
      let error = 0;
      privateVipList.map(item => {
        if (!item.router_id || !item.director_master_uuid) error++;
        delete item.isNew;
        delete item.director_backup_uuid_list_name;
        delete item.director_master_uuid_name;
        return item;
      });
      delete param.privateVipListIsNew;
      delete param.privateVipListDirectorBackupUuidListName;
      delete param.privateVipListDirectorMasterUuidName;
      for (let key in param) {
        if (key !== 'memberHostList' && key.indexOf('memberHostList') > -1) delete param[key];
      }
      param.privateVipList = JSON.stringify(privateVipList);
      param.memberHostList = JSON.stringify(JSON.parse(param.memberHostList).map(item => item.assetServerUuid));
      if (error) this.$Message.warning('请输入完整vip信息');
      return !error;
    },
    getDetail() {
      if (!this.id) return;
      this.getClusterDetail(this.id).then(res => {
        if (res.error_code === 0) {
          this.getServer(res.data);
        }
      });
    },
    getServer(data) {
      const param = {
        'server_uuids': JSON.parse(data.memberHostList.replace(/'/g, '"'))
      };
      this.getServerByIds(param).then(res => {
        data.memberHostList = JSON.stringify(res.data || []);
        this.editData = data;
      });
    },
    openModal({ modalType, key, index, form }) {
      if (!form.idc || !form.subNet) {
        this.$Message.warning('请选择机房和网络!');
        return;
      }
      const data = form[key];
      this[modalType].key = key;
      this[modalType].data = data;
      this[modalType].index = index;
      this[modalType].selected = '';
      this[modalType].visible = true;
      this[modalType].filterCondition = {
        idc: form.idc,
        subNet: form.subNet
      };
    },
    confirmSelectIp(val) {
      const temp = {
        vip: val.selected.ip_address,
        router_id: '',
        director_master_uuid: '',
        director_backup_uuid_list: [],
        director_backup_uuid_list_name: '',
        isNew: true
      };
      this.ip.data.push(temp);
      this.$refs.layout.updateData({ key: this.ip.key, newData: this.ip.data });
      this.ip.visible = false;
    },
    confirmSelectServer(val) {
      this.server.data.push(...val);
      this.$refs.layout.updateData({ key: this.server.key, newData: this.server.data });
      this.server.visible = false;
    },
    async getAssetsOption() {
      const res = await getAssetsClusterOption();
      if (res.error_code !== 0) return;
      this.option = res.data;
    }
  },
  watch: {
    '$route'(val) {
      this.id = val.params.id || '';
      this.getDetail();
    }
  },
  mounted() {
    this.id = this.$route.params.id || '';
    this.isDetail = this.$route.path.indexOf('detail') > -1;
    this.getAssetsOption();
    if (this.isDetail) {
      this.getDetail();
    } else {
      this.turnToEdit();
    }
  }
};
</script>
