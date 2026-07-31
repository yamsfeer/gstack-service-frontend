<template>
  <div class="side-nav-stub">
    <ul class="side-nav-list">
      <li v-for="item in data" :key="item.path" class="side-nav-item">
        <router-link :to="'/' + item.path">{{ item.title }}</router-link>
        <ul v-if="item.children" class="side-nav-sub">
          <li v-for="child in item.children" :key="child.path">
            <router-link :to="'/' + child.path">{{ child.title }}</router-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SideNav',
  props: {
    data: { type: Array, default: () => [] }
  }
};
</script>

<style scoped>
.side-nav-stub {
  width: 200px;
  background: #304156;
  color: #bfcbd9;
  min-height: 100%;
  padding: 0;
}
.side-nav-list { list-style: none; padding: 0; margin: 0; }
.side-nav-item { padding: 8px 20px; }
.side-nav-item a { color: #bfcbd9; text-decoration: none; }
.side-nav-item a:hover { color: #fff; }
.side-nav-sub { padding-left: 16px; list-style: none; }
.side-nav-sub li { padding: 4px 0; }
</style>
