<template>
  <teleport to="body">
    <div class="item-toolbar" @contextmenu.stop.prevent :style="{ top: y + 'px', left: x + 'px' }">
      <button @click="emit('duplicate')" title="Duplicate">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="7" width="10" height="10" rx="2" stroke="#333" stroke-width="2" />
          <rect x="3" y="3" width="10" height="10" rx="2" stroke="#888" stroke-width="2" />
        </svg>
      </button>
      <button @click="emit('delete')" title="Delete">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="14" height="14" rx="2" stroke="#333" stroke-width="2" />
          <line x1="8" y1="8" x2="16" y2="16" stroke="#d00" stroke-width="2" />
          <line x1="16" y1="8" x2="8" y2="16" stroke="#d00" stroke-width="2" />
        </svg>
      </button>
    </div>
  </teleport>
</template>

<script setup lang="ts">
const emit = defineEmits(['duplicate', 'delete'])
const props = defineProps<{ x: number; y: number }>()
const { x, y } = props
</script>

<style scoped>
.item-toolbar {
  position: absolute;
  min-width: 80px;
  background: #fff;
  border: 1px solid #ccc;
  padding: 5px;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
}
</style>
