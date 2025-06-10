<template>
    <div class="collapsible-sidebar">
        <div class="toggle-sidebar"
            :style="props.position === 'left' ? { left: showSideBar ? `calc(${props.width} + 8px)` : '8px' } : { right: showSideBar ? `calc(${props.width} + 8px)` : '8px' }"
            @click="showSideBar = !showSideBar">
            <span class="material-symbols-outlined" v-if="showSideBar">
                {{ props.position === 'left' ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right' }}
            </span>
            <span class="material-symbols-outlined" v-else>
                {{ props.position === 'left' ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left' }}
            </span>
        </div>
        <Transition :name="props.position === 'left' ? 'slide' : 'slide-right'" mode="out-in">
            <BaseSidebar v-if="showSideBar" v-bind="props">
                <slot></slot>
            </BaseSidebar>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import BaseSidebar from './BaseSidebar.vue'
import { CollapsibleSidebarProps } from './Sidebar.constants'

const showSideBar = defineModel({
    type: Boolean,
    default: true
})

const props = defineProps(CollapsibleSidebarProps)
</script>

<style scoped>
.collapsible-sidebar {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    z-index: 100;
}

.toggle-sidebar {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transform: translateY(-50%);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 101;
}

.toggle-sidebar:hover {
    background: #f0f0f0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}

.toggle-sidebar .material-symbols-outlined {
    font-size: 24px;
    color: #333;
    transition: color 0.3s;
}

.toggle-sidebar:hover .material-symbols-outlined {
    color: #1976d2;
}

/* Animation for Left */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translatex(-400px);
}

.slide-enter-to,
.slide-leave-from {
    transform: translatex(0px);
}

/* Animation for Right */
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
    transform: translatex(calc(100% + 400px));
}

.slide-right-enter-to,
.slide-right-leave-from {
    transform: translatex(0px);
}
</style>