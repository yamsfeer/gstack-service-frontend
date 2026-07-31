<template>
  <div class="table-page">
    <div class="table-page-filter">
      <slot name="filter" />
    </div>
    <div class="table-page-tool">
      <slot name="tool" />
    </div>
    <div class="table-page-table">
      <slot name="table" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TablePage',
};
</script>
<style lang="scss">
  .table-page {
    &-tool {
      margin: 16px 0;
    }
  }
</style>
