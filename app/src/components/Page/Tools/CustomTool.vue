<template>
  <input type="text" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const localData = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = newVal
  }
)

function updateData() {
  emit('update:modelValue', localData.value)
}
</script>

<style scoped>
input {
  field-sizing: content;
}
</style>