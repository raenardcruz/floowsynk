<template>
    <BaseSidebar v-if="visible">
        <div class="title">{{ title }}</div>
        <div class="caption">{{ caption }}</div>
        <div class="content">
            <slot></slot>
        </div>
    </BaseSidebar>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { SidebarProps } from './Sidebar.types'
import { EMIT_VISIBLE } from './Sidebar.constants'
import BaseSidebar from './BaseSidebar.vue'

const props = defineProps<SidebarProps>()
const emit = defineEmits([EMIT_VISIBLE])

const visible = useVModel(props, 'visible', emit)
</script>

<style scoped>
.title {
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px 0px 20px;
    background: var(--white-3);
    font-size: 16px;
    font-weight: bold;
    color: var(--grey-2);
}
.caption {
    display: flex;
    position: relative;
    padding: 0px 20px 10px 20px;
    font-size: 10px;
    color: var(--grey-3);
    border-bottom: 1px solid var(--grey-4);
}
.content {
    display: flex;
    position: relative;
    gap: 12px;
    padding: 10px;
    overflow-y: auto;
    height: calc(100% - 40px);
    flex-direction: column;
}
</style>