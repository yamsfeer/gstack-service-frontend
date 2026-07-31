<template>
  <div class="lvs-detail-page floatfix">
    <detail-layout ref="layout" type="lvs" :rules="rules" :keyMap="keyMap" :editData="editData" :option="option" @openModal="openModal"></detail-layout>
    <div class="operation">
      <gs-button type="primary" v-if="isDetail && has()" @click="deleteEvent">删除</gs-button>
      <!-- <gs-button type="primary" v-if="isDetail">日志</gs-button> -->
      <gs-button type="primary" v-if="!isDetail" @click="sumbit">添加</gs-button>
      <gs-button v-if="!isDetail" @click="resetForm()">清空</gs-button>
    </div>
    <server
      :value="server.selected"
      :visible.sync="server.visible"
      :title="server.title"
      :selectedServer="server.data"
      :multiple="false"
      :idcFilterCondition="server.filterCondition"
      @confirm="confirmSelectServer"
    ></server>
    <lbgroup
      :visible.sync="lbgroup.visible"
      :filterCondition="lbgroup.filterCondition"
      @confirm="confirmSelectLbgroup"
    ></lbgroup>
    <ip
      :value="ip.selected"
      :visible.sync="ip.visible"
      :title="ip.title"
      :selectedList="[]"
      :pageFilterCondition="ip.filterCondition"
      @confirm="confirmSelectIp"
      @close="ip.visible = false"
    ></ip>
  </div>
</template>
<script>
import {
  mapActions
} from '@/stores/vuex-compat';
import './style.scss';
import { keyMap } from './constant';
import { rules } from './formRules';
import detailLayout from '@/views/assets/modules/detailLayout.vue';
import server from '@/views/apply/applyForm/server/selectServer.vue';
import lbgroup from '@/views/detail/step/config/chose/lbgroup.vue';
import ip from '@/views/assets/modules/selectIp.vue';
import { getAssetsLvsOption, getSubnetByIdc } from '@/service/asset';

export default {
  components: {
    detailLayout,
    server,
    lbgroup,
    ip
  },
  data() {
    return {
      rules: { ...rules, ...this.setValidateName() },
      keyMap,
      id: '',
      isDetail: true,
      isEditing: false,
      editData: {},
      server: {
        key: '',
        title: '选择后端主机',
        data: [],
        index: '',
        visible: false,
        selected: '',
        selectedList: [],
        filterCondition: {}
      },
      lbgroup: {
        key: '',
        data: [],
        index: '',
        visible: false,
        filterCondition: {}
      },
      ip: {
        key: '',
        title: '选择公网虚IP',
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
      'getLvsDetail',
      'createLvs',
      'deleteLvs',
      'isLvsExistName',
      'getClusterDetail',
      'getServerByIds'
    ]),
    setValidateName() {
      return {
        instanceName: {
          required: true,
          trigger: 'blur',
          validator: (rule, value, cb) => {
            if (!value) cb(new Error('请输入实例名'));
            if (value && (value.length > 50 || value.length < 2)) cb(new Error('请输入2-50个的字符'));
            if (value) {
              if (this.isDetail && this.editData.instanceName === value) {
                cb();
              }
              this.isLvsExistName(value).then(isExist => {
                if (!isExist) {
                  cb();
                } else {
                  cb(new Error('名称已存在'));
                }
              });
            }
          }
        }
      };
    },
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
        const param = this.formatParam(this.$refs.layout.getParam());
        this.createLvs(param).then(res => {
          if (res.error_code === 0) {
            this.$Modal.confirm({
              title: `添加LVS成功！`,
              modalProps: {
                'confirm-text': '确定',
                'cancel-text': '继续添加'
              },
              onOk: () => {
                this.$router.push('/main/assets/balancing/lvs');
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
      });
    },
    formatParam(param) {
      for (let key in param) {
        if (key !== 'rsUuidList' && key.indexOf('rsUuidList') > -1) delete param[key];
      }
      param.rsUuidList = JSON.stringify(JSON.parse(param.rsUuidList).map(item => item.assetServerUuid));
      param.assetLbGroup = param.LbGroup.groupId;
      param.directorMasterUuid = param.LbGroup.assetServerUuid;
      delete param.LbGroup;
      return param;
    },
    getDetail() {
      if (!this.id) return;
      this.getLvsDetail(this.id).then(res => {
        if (res.error_code === 0) {
          this.getOtherInfo(res.data);
        }
      });
    },
    getOtherInfo(data) {
      const param = {
        'server_uuids': JSON.parse(data.rsUuidList.replace(/'/g, '"'))
      };
      Promise.all([
        // 获取集群名字
        this.getClusterDetail(data.assetLbGroup).then(res => {
          if (res.error_code === 0) {
            data.assetLbGroup = res.data.groupName;
          }
        }),
        // 获取主负载均衡分发器的ip
        this.getServerByIds({ server_uuids: [data.directorMasterUuid] }).then(res => {
          data.directorMasterUuid = res.data && res.data[0] && res.data[0].logicalIp;
        }),
        // 获取集群名字
        this.getServerByIds(param).then(res => {
          data.rsUuidList = JSON.stringify(res.data || []);
        })
      ]).then(_ => {
        this.editData = data;
      });
    },
    deleteEvent() {
      this.$Modal.confirm({
        title: `是否确定删除该LVS记录`,
        onOk: () => {
          this.deleteLvs(this.editData.instanceName).then(res => {
            if (res.error_code === 0) {
              this.$Notify.success({
                title: '成功',
                desc: '删除成功，即将离开跳转到列表页！'
              });
              setTimeout(_ => {
                this.$router.push('/main/assets/balancing/lvs');
              }, 1500);
            } else {
              this.$Notify.error({
                title: '失败',
                desc: res.error_msg || '删除失败！'
              });
            }
          });
        }
      });
    },
    openModal({ modalType, key, index, form }) {
      if (!form.subNet) {
        this.$Message.warning('请选择所在网络!');
        return;
      }
      const data = form[key];
      this[modalType].key = key;
      this[modalType].data = data;
      this[modalType].index = index;
      this[modalType].selected = '';
      this[modalType].visible = true;
      this[modalType].filterCondition = {
        subNet: form.subNet
      };
    },
    confirmSelectIp(val) {
      this.$refs.layout.updateData({ key: this.ip.key, newData: val.selected.ip_address });
      this.ip.visible = false;
    },
    confirmSelectLbgroup(val) {
      const data = {
        groupId: val.selectedLbg.esId,
        groupName: val.selectedLbg.groupName,
        logicalIp: val.selectedServer.logicalIp,
        assetServerUuid: val.selectedServer.assetServerUuid
      };
      this.$refs.layout.updateData({ key: this.lbgroup.key, newData: data });
      this.lbgroup.visible = false;
    },
    confirmSelectServer(val) {
      this.server.data.push(...val);
      this.$refs.layout.updateData({ key: this.server.key, newData: this.server.data });
      this.server.visible = false;
    },
    getAssetsOption() {
      getSubnetByIdc().then(res => {
        this.option['subNets'] = (res.data.statistics || []).map(item => item.sub_net);
      });
      getAssetsLvsOption().then(res => {
        if (res.error_code !== 0) return;
        this.option = Object.assign({}, this.option, res.data);
      });
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
