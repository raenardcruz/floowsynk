<template>
    <div class="heading-component" :style="componentStyle">Test</div>
</template>

<script setup lang="ts">
    import { PageComponentProps, usePageComponent } from '@/views/Pages/Pages.hooks'
    const props = defineProps<PageComponentProps>()
    const { componentStyle } = usePageComponent(props.id)
</script>

<style scoped>
.heading-component {
    display: flex;
    position: relative;
    height: fit-content;
    width: fit-content;
}
</style>