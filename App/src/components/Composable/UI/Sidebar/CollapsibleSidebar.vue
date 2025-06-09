<template>
    <span>
        <div class="toggle-sidebar" @click="showSideBar = !showSideBar">
            <span class="material-symbols-outlined" v-if="showSideBar">keyboard_double_arrow_left</span>
            <span class="material-symbols-outlined" v-else>keyboard_double_arrow_right</span>
        </div>
        <Transition name="slide">
            <BaseSidebar>
                <slot></slot>
            </BaseSidebar>
        </Transition>
    </span>
</template>

<script setup lang="ts">
import BaseSidebar from './BaseSidebar.vue'

const showSideBar = defineModel({
    type: Boolean,
    default: false
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
    height: 0;
    opacity: 0;
    transform: translateY(-10px);
}
.slide-enter-to, .slide-leave-from {
    height: auto;
    transform: translateY(0px);
    opacity: 1;
}
</style>