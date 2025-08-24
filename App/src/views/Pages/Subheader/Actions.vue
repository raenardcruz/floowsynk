<template>
    <Select
    class="select-input"
    :options="options"
    :is-running="false"></Select>
</template>

<script setup>
    import { SCREEN_SIZES } from './Action.constants'
    import { Select } from '@/components/Composable/UI/Inputs'
    import ActionsOptions from './Actions.Options.vue'

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
    .select-input {
        display: flex;
        position: relative;
        width: 300px;
        justify-content: center;
        align-items: center;
    }
</style>