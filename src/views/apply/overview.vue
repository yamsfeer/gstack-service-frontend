<template>
  <div class="apply-overview-page">
    <div class="page-header">请选择工单分类</div>
    <div class="page-main">
      <div class="order-item" v-for="item in serviceType" :key="item.id">
        <div class="type-title"><i :class="item.icon" :style="{'color': item.color}"></i>{{item.label}}</div>
        <gs-row :gutter="16">
          <gs-col :span="6" v-for="temp in serviceOptions" v-if="temp.type === item.id && !temp.disabled" :key="temp.id">
            <div class="item">
              <div class="item-title">{{temp.title}}</div>
              <div class="item-desc">{{temp.desc}}</div>
              <router-link :to="`/main/order/apply/${temp.name}`">
                <a>提交工单</a>
              </router-link>
            </div>
          </gs-col>
        </gs-row>
      </div>
    </div>
  </div>
</template>

<script>
import './style.scss';
import { serviceType, serviceOptions } from './constant';

export default {
  data() {
    return {
      serviceType,
      serviceOptions
    };
  }
};
</script>
