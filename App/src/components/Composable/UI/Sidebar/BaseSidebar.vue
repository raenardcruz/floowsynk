<template>
    <div class="sidebar" :style="{ width: props.width }"
        :class="props.position === 'left' ? 'sidebar-left' : 'sidebar-right'">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { BaseSidebarProps } from './Sidebar.constants'
const props = defineProps(BaseSidebarProps)
</script>

<style scoped>
.sidebar {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--grey-5);
    height: 100%;
    box-shadow: -1px 7px 10px var(--grey-3);
    z-index: 100;
    transition: all 0.3s ease;
    padding: 20px;
}

.sidebar-left {
    left: 0;
    right: auto;
}

.sidebar-right {
    left: auto;
    right: 0;
}
</style>