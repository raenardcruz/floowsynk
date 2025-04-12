<template>
  <input type="text" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const localData = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = newVal
  }
)

</script>

<style scoped>
input {
  field-sizing: content;
}
</style>