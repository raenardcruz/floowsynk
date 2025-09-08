<template>
    <div class="action-bar">
        <Select class="select-input" :options="options" :is-running="false"></Select>
        <ToggleButton v-model="isTestMode" class="toggle" onLabel="Test" offLabel="Build" size="small" v-tooltip.bottom="isTestMode ? 'Tester Mode' : 'Builder Mode'">
            <template #icon>
                <span class="material-symbols-outlined">experiment</span>
            </template>
            <template #off>
                <span class="material-symbols-outlined">design_services</span>
            </template>
        </ToggleButton>
    </div>
</template>

<script setup>
import { SCREEN_SIZES } from './Action.constants'
import { Select } from '@/components/Composable/UI/Inputs'
import ActionsOptions from './Actions.Options.vue'
import ToggleButton from 'primevue/togglebutton';
import { usePagesStore } from '../Pages.hooks'

const { isTestMode } = usePagesStore()

const options = SCREEN_SIZES.map(size => {
    return {
        label: `${size.name} (${size.size}) ${size.height} x ${size.width}px`,
        value: size.id,
        data: size,
        customComponent: ActionsOptions
    }
})
</script>

<style scoped>
.action-bar {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
    border-radius: 8px;
    width: 100%;
}
.select-input {
    display: flex;
    position: relative;
    width: 300px;
    justify-content: center;
    align-items: center;
}
</style>