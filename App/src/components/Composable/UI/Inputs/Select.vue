<template>
    <select class="select-input" v-model="value" :disabled="isRunning">
        <template v-for="option in options">
            <component
                v-if="option.customComponent"
                :is="option.customComponent"
                :key="'custom-' + option.value"
                :value="option.value"
                :label="option.label"
            />
            <option v-else :value="option.value" :key="'default-' + option.value">{{ option.label }}</option>
        </template>
    </select>
</template>

<script setup lang="ts">
import { SelectOption } from './Inputs'
const value = defineModel()
defineProps({
    isRunning: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array<SelectOption>,
        default: () => []
    }
})
</script>

<style scoped>
.select-input {
    display: flex;
    position: relative;
    height: 30px;
    width: 100%;
    padding: 5px;
    border-radius: 50px;
    border: 1px solid var(--grey-4);
    background-color: var(--white);
    font-size: 14px;
    color: var(--black);
    transition: box-shadow 0.3s ease;
}

.select-input:focus {
    outline: none;
    box-shadow: 0 0 5px var(--primary-color);
}

.select-input option {
    padding: 2px 5px;
    background-color: var(--white);
    color: var(--black);
    font-size: 14px;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease, color 0.3s ease;
    min-height: 30px;
    border-bottom: 1px solid var(--grey-4);
}

.select-input option:last-child {
    border-bottom: none;
}

.select-input option:hover {
    background-color: var(--primary-color);
    color: var(--white);
}
</style>