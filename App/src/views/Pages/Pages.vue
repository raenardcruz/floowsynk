<template>
  <div class="page-container">
    <Subheader />
    <div class="page-contents">
      <PageSidebar style="position: relative;" />
    </div>
  </div>
</template>

<script setup>
import Subheader from '@/components/Page/SubHeader.vue'
import PageSidebar from '@/components/Page/PageSidebar.vue'
</script>

<style scoped>
.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%; 
  overflow: hidden;
}
.page-contents {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>