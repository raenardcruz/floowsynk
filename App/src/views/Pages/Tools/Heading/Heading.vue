<template>
    <div class="heading-component" :style="componentStyle">
        <component
            :is="headingTag"
            v-if="headingTag && headingText"
        >
            {{ headingText }}
        </component>
    </div>
</template>

<script setup lang="ts">
    import { PageComponentProps, usePageComponent } from '@/views/Pages/Pages.hooks'
    const props = defineProps<PageComponentProps>()
    import { computed } from 'vue'
    const { componentStyle, componentProperties } = usePageComponent(props.id)

    // Extract 'level' and 'text' from componentProperties (array of property objects)
    const headingLevel = computed(() => {
        const levelProp = componentProperties.value?.find((p: any) => p.name === 'level')
        return levelProp?.value || 'h1'
    })
    const headingText = computed(() => {
        const textProp = componentProperties.value?.find((p: any) => p.name === 'text')
        return textProp?.value || ''
    })
    const headingTag = computed(() => headingLevel.value)
</script>

<style scoped>
.heading-component {
    display: flex;
    position: relative;
    height: 44px;
    width: 100%;
}
</style>