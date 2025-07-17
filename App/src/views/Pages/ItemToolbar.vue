<template>
  <div class="item-toolbar">
    <button @click="emit('duplicate')">Duplicate</button>
    <button @click="emit('delete')">Delete</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['duplicate', 'delete']);
</script>

<style scoped>
.item-toolbar {
  position: absolute;
  top: -30px;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  padding: 5px;
  display: flex;
  gap: 5px;
  z-index: 100;
}
</style>
