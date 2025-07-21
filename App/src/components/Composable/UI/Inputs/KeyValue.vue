<template>
    <div class="kv-container">
        <div class="label">{{ label }}</div>
        <div class="kv-item">
            <TextCodeInput
                type="text"
                v-model="value.key"
                placeholder="Enter Key"
                :label="'Key'" />
            <TextCodeInput
                type="text"
                v-model="value.value"
                placeholder="Enter Value"
                :label="'Value'" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import TextCodeInput from './TextCodeInput.vue';
const value = defineModel<{ key: string, value: string }>()
defineProps({
    label: {
        type: String,
        default: ''
    }
})
</script>

<style scoped> 
.kv-container {
    display: flex;
    position: relative;
    width: 100%;
    gap: 10px;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid var(--grey-4);
    margin-top: 12px;
}
.label {
    display: flex;
    position: absolute;
    top: -10px;
    left: 10px;
    font-size: 12px;
    background: var(--grey-3);
    color: var(--white-1);
    border: 1px solid var(--grey-4);
    border-radius: 10px;
    padding: 0px 8px;
    font-weight: 500;
    box-shadow: 2px 4px 8px var(--grey-4);
}
.kv-item {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    flex-direction: column;
}
.kv-item input {
    flex-grow: 1;
    border: none;
}
</style>