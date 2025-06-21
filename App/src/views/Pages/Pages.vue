<template>
  <div class="page-container">
    <Subheader />
  </div>
</template>

<script setup>
import Subheader from '@/components/Page/SubHeader.vue'
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
</style>