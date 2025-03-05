<!-- MyToolComponent.vue -->
<template>
  <input type="text" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Define the props interface
interface Props {
  modelValue: string
}

// Use defineProps to declare component props
const props = defineProps<Props>()
// Define emits with a type for the update event
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const localData = ref(props.modelValue)

// Update local value if the prop changes externally
watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = newVal
  }
)

// Emit the updated value when the input changes
function updateData() {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
input {
  field-sizing: content;
}
</style>