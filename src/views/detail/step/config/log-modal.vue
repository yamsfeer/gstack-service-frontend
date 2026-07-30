<template>
  <gs-modal
    :value="show"
    title="日志"
    has-form
    :before-close="close"
    :show-confirm="false"
    top="86px"
    width="800px"
    class="log-modal"
    @confirm="close"
  >
    <pre v-loading="loading" v-if="!isHtml">{{ log || '无'}}</pre>
    <pre v-loading="loading" v-if="isHtml" v-html="log || '无'"></pre>
  </gs-modal>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    log: {
      type: String,
      required: true
    },
    isHtml: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(val) {
        return val;
      }
    }
  },
  methods: {
    close() {
      this.show = false;
      this.$emit('close', false);
    }
  }
};
</script>

<style lang="scss">
.log-modal {
  pre {
    min-height: 300px;
    border: 1px solid #ddd;
    padding: 8px;
    border-radius: 3px;
    background: #fafafa;
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
