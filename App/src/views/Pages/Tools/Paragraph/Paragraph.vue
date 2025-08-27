<template>
    <p class="paragraph-component" :style="componentStyle">test</p>
</template>

<script setup lang="ts">
    import { PageComponentProps, usePageComponent } from '@/views/Pages/Pages.hooks'
    const props = defineProps<PageComponentProps>()
    const { componentStyle } = usePageComponent(props.id)
</script>

<style scoped>
.paragraph-component {
    display: flex;
    position: relative;
    width: fit-content;
}
</style>