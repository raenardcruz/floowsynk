<template>
    <div class="option-container">
        <img class="icon" :src="ScreenIcon" alt="Screen Icon" />
        <div class="option-content">
            <div class="label"><b>{{ props.data.name }}</b></div>
            <span class="caption">{{ data.size }}</span>
        </div>
        <div>{{ data.height }} x {{ data.width }}px</div>
    </div>
</template>

<script setup lang="ts">
import ScreenIcon from '@/components/Icons/screen.svg'
    const props = defineProps({
        label: {
            type: String,
            default: 'Options'
        },
        value: {
            type: null,
            default: 'options'
        },
        data: {
            type: Object,
            default: () => ({ name: 'Default', size: 'Default', height: 0, width: 0 })
        }
    })
</script>

<style scoped>
    .option-container {
        display: flex;
        position: relative;
        width: 100%;
        height: 50px;
        justify-content: space-around;
        align-items: center;
        background-color: var(--white-3);
        border-radius: 8px;
        padding: 10px;
        border: 1px solid var(--grey-4);
    }
    .option-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
    }
    .option-content .label {
        font-size: 14px;
        color: var(--black);
    }
    .option-container .value {
        font-size: 12px;
        color: var(--grey-6);
    }
    .option-content .caption {
        font-size: 12px;
        color: var(--grey-6);
    }
    .icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;
    }
</style>