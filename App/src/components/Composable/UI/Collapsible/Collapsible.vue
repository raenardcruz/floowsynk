<template>
    <div class="collapsible-container">
        <div class="collapsible-title" @click="showContent = !showContent">
            {{ title }}
            <span class="material-symbols-outlined" :class="{ 'expanded': showContent }">
            arrow_forward_ios
            </span>
        </div>
        <div class="collapsible-caption" v-if="caption">{{ caption }}</div>
        <transition name="collapsible">
            <div class="collapsible-contents" v-show="showContent">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
const showContent = defineModel({
    type: Boolean,
    default: false,
})
defineProps({
    title: {
        type: String,
        default: '',
        required: true,
    },
    caption: {
        type: String,
        required: false,
    }
})
</script>

<style scoped>
.collapsible-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    transition: all 0.3s ease, height 0.3s ease;
}
.collapsible-title {
    font-size: 18px;
    font-weight: bold;
    color: var(--primary-color);
    padding: 10px 14px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.collapsible-caption {
    font-size: 14px;
    color: var(--grey-2);
    padding: 0 12px;
}
.collapsible-enter-active, .collapsible-leave-active {
    transition: all 0.3s ease;
}
.collapsible-enter-from, .collapsible-leave-to {
    height: 0;
    opacity: 0;
    transform: translateY(-10px);
}
.collapsible-enter-to, .collapsible-leave-from {
    height: auto;
    transform: translateY(0px);
    opacity: 1;
}
.material-symbols-outlined {
    font-size: 20px;
    color: var(--secondary-color);
    transition: transform 0.3s ease;
}
.material-symbols-outlined.expanded {
    transform: rotate(90deg);
}
.collapsible-contents {
    max-height: 300px;
    overflow-y: auto;
}
</style>