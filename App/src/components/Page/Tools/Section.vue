<template>
    <div :style="style">

    </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{ style: Record<string, string> }>()
const { style } = toRefs(props)
</script>