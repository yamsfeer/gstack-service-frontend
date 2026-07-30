<template>
  <div class="query-table">
    <div class="query-table-header">
      <slot name="header">
        <label class="label">{{title}}</label>
        <div class="query-button">
          <gs-button type="primary" @click="query">查询</gs-button>
          <gs-button @click="resetQuery">重置</gs-button>
        </div>
      </slot>
    </div>
    <div class="query-table-body">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'QueryTable',
  props: {
    title: {
      type: String,
      default: '查询条件'
    }
  },
  methods: {
    query() {
      this.$emit('query');
    },
    resetQuery() {
      this.$emit('reset-query');
    }
  }
};
</script>
<style lang="scss">
.query-table {
  $borderColor: #d9d9d9;
  margin-top: 16px;
  background: #fafafa;
  border-top: 1px solid $borderColor;
  border-bottom: 1px solid $borderColor;
  padding: 0 16px;

  &-header {
    display: flex;
    border-bottom: 1px solid $borderColor;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  &-body {
    padding: 16px 0 8px;

    .gs-form {
      display: flex;
      flex-wrap: wrap;

      .gs-form-item {
        display: inline-block;
        margin-bottom: 8px;
        width: 33.3%;
        .gs-search {
          width: 100%;
        }
      }
    }
  }
}
</style>
