<template>
    <FloatLabel variant="on" pt:root:class="text-box" v-tooltip.focus.bottom="tooltip">
        <Password
            type="text"
            :id="id"
            v-model="modelValue"
            :placeholder="placeholder"
            autocomplete="off"
            pt:pcInputText:root:class="text-password"
            toggleMask
        />
        <label for="on_label">{{ label }}</label>
    </FloatLabel>
</template>

<script lang="ts" setup>
import { defineModel, defineProps } from 'vue'
import { IdProps } from '@/components/Composable/constants'
import FloatLabel from 'primevue/floatlabel';
import Password from 'primevue/password'

interface Props extends IdProps {
    label: string,
    placeholder?: string,
}
defineProps<Props>()

const modelValue = defineModel({
    type: String,
    default: ''
})
</script>

<style scoped>
    :deep(.text-box) {
        margin-bottom: 10px;   
    }
   :deep(.text-password) {
        width: 100%;
        height: 2.5rem;
        font-size: 1rem;
        border-radius: 20px !important;
        padding-right: 2.5rem;
    }
    :deep(.text-password:focus) {
        border-color: black !important;
        color: black;
    }
    :deep(.text-box label) {
        display: flex;
        position: absolute;
        top: 50%;
        left: 1rem;
        transform: translateY(-50%);
        color: var(--grey-1) !important;
        font-size: 0.875rem;
        transition: all 0.2s ease-in-out;
    }
</style>