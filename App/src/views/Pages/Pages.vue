<template>
  <div class="page-container">
    <CollapsibleSidebar position="left">
      <h2>Hello</h2>
    </CollapsibleSidebar>
    <div class="test"></div>
  </div>
</template>

<script setup>
import CollapsibleSidebar from '@/components/Composable/UI/Sidebar/CollapsibleSidebar.vue';
</script>

<style scoped>
.page-container {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.test {
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;
  background: var(--grey-5);
  z-index: 1;
}
</style>