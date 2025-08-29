<template>
    <MenuBar
        :pt="{root: { class: 'menu-bar' }, rootList: { class: 'menu-list' }, end: { class: 'menu-end' } }"
        :model="items">
        <template #start>
            <img v-if="logo?.length > 0" alt="logo" :src="logo" height="40" class="mr-2">
        </template>
        <template #item="{ item }">
            <span class="menu-item">
                <span v-if="item?.icon" class="material-symbols-outlined">{{ item.icon }}</span>
                <span v-if="item?.link"><a :href="item.link">{{ item?.label || '' }}</a></span>
                <span v-else>{{ item?.label || '' }}</span>
                <Badge v-if="item?.badge || item.badge > 0" :value="item.badge" class="ml-2"></Badge>
            </span>
        </template>
        <template #end>
            <span v-if="endtext.length > 0">
                {{ endtext }}
            </span>
        </template>
    </MenuBar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MenuBar from 'primevue/menubar'
import Badge from 'primevue/badge'
import { PageComponentProps, usePageComponent } from '@/views/Pages/Pages.hooks'

    const props = defineProps<PageComponentProps>()
    const { componentProperties } = usePageComponent(props.id)
    const items = computed(() => {
        const property = componentProperties.value.find(prop => prop.name === 'menu-items')
        return property?.value || []
    })
    const endtext = computed(() => {
        const property = componentProperties.value.find(prop => prop.name === 'end-text')
        return property?.value || []
    }) 
    const logo = computed(() => {
        const property = componentProperties.value.find(prop => prop.name === 'logo')
        return property?.value || []
    }) 
</script>

<style scoped>
.menu-bar {
    display: flex;
    width: 100%;
    align-items: center;
    min-height: 40px;
}
:deep(.menu-end) {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}
:deep(.menu-list) {
    width: 100%;
}
.menu-item {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>