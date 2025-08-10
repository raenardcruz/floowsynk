<template>
    <div class="collapsible-container">
        <button 
            class="collapsible-title" 
            @click="showContent = !showContent"
            :aria-expanded="showContent"
            :aria-controls="contentId"
            :id="titleId"
            type="button"
        >
            {{ title }}
            <span 
                class="material-symbols-outlined" 
                :class="{ 'expanded': showContent }"
                aria-hidden="true"
            >
                arrow_forward_ios
            </span>
        </button>
        <div v-if="caption" class="collapsible-caption">{{ caption }}</div>
        <transition name="collapsible">
            <div 
                v-show="showContent"
                class="collapsible-contents"
                :id="contentId"
                role="region"
                :aria-labelledby="titleId"
            >
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const showContent = defineModel({
    type: Boolean,
    default: false,
})

const props = defineProps({
    title: {
        type: String,
        default: '',
        required: true,
    },
    caption: {
        type: String,
        required: false,
    },
    id: {
        type: String,
        required: false,
    }
})

// Generate unique IDs for accessibility
const baseId = computed(() => props.id || `collapsible-${Math.random().toString(36).substr(2, 9)}`)
const titleId = computed(() => `${baseId.value}-title`)
const contentId = computed(() => `${baseId.value}-content`)
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
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    transition: background-color 0.2s ease;
}

.collapsible-title:hover {
    background-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.05);
}

.collapsible-title:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
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
    overflow-y: hidden;
}
</style>