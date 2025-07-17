<template>
  <span class="item-wrapper" ref="el" @mouseover="showToolbar = true" @mouseleave="showToolbar = false">
    <ItemToolbar v-if="showToolbar" @duplicate="emit('duplicate')" @delete="emit('delete')" />
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ItemToolbar from './ItemToolbar.vue'

const emit = defineEmits(['duplicate', 'delete']);

const el = ref<HTMLElement | null>(null)
const showToolbar = ref(false)

</script>

<style scoped>
.item-wrapper {
  display: inline-block;
  /* Let the wrapper size itself to its child */
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.item-wrapper:hover {
  border-color: #22c55e; /* Tailwind green-500 */
}
</style>
