<template>
    <div :style="componentStyle">Test</div>
</template>

<script setup lang="ts">
    import { PageComponentProps, usePageComponent } from '@/views/Pages/Pages.hooks'
    const props = defineProps<PageComponentProps>()
    const { componentStyle } = usePageComponent(props.id)
</script>