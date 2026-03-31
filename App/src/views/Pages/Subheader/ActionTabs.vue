<template>
    <div
        class="tab-icon"
        v-for="action in ACTION_TABS"
        :key="action.id"
        :class="{ active: activeTab === action.id }"
        @click="activeTab = action.id">
        <img :src="action.icon" :alt="action.label" class="icon" />
        <span class="tab-label">{{ action.label }}</span>
    </div>
    <div class="indicator" :style="indicatorStyle"></div>
</template>

<script setup>
    import { computed } from 'vue'
    import { ACTION_TABS } from './ActionTabs.constants'
    import { usePagesStore } from '@/views/Pages/Pages.hooks'

    const { activeTab } = usePagesStore()

    const indicatorStyle = computed(() => {
        const indicatorSize = 240 / ACTION_TABS.length
        return {
            left: (activeTab.value - 1) * indicatorSize + 'px',
            width: indicatorSize + 'px',
        }
    })
</script>

<style scoped>
    .tab-icon {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        flex-grow: 1;
        border: 1px solid var(--grey-4);
        cursor: pointer;
        height: 100%;
        width: 100%;
        gap: 4px;
    }
    .tab-label {
        font-size: 8px;
    }
    .tab-icon.active {
        background: var(--brown-5);
    }
    .icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        color: var(--green-3);
    }
    .indicator {
        position: absolute;
        bottom: 0;
        height: 4px;
        background-color: var(--green-2);
        transition: all 0.3s ease-in-out;
    }
    
</style>