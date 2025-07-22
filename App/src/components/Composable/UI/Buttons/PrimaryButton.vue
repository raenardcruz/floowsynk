<template>
    <Button pt:root:class="button-primary" @click="onClick">
        <slot name="icon"></slot>
        {{ label }}
    </Button>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import { IdProps } from '@/components/Composable/constants'
import Button from 'primevue/button'

interface Props extends IdProps {
    label?: string,
}
defineProps<Props>()
const emit = defineEmits(['click'])
const onClick = () => {
    emit('click')
}
</script>

<style scoped>
.button-primary {
    background: var(--grey-3);
    color: var(--white-1);
    border: var(--grey-1);
}
.button-primary:hover {
    background: var(--grey-2) !important;
    color: var(--white-1);
}
</style>
