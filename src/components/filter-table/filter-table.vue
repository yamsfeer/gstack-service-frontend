<template>
  <div class="filter-table">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'FilterTable',
  props: {
    model: Object,
    labelWidth: String,
    labelSuffix: {
      type: String,
      default: ''
    }
  },
  provide() {
    return {
      filterTable: this
    };
  },
  computed: {},
  methods: {}
};
</script>
