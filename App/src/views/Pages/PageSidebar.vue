<template>
    <BaseSidebar
        class="page-sidebar" width="240px" style="padding: 0px">
        <component :is="tabs[activeTab-1].component" />
    </BaseSidebar>
</template>

<script lang="js" setup>
import BaseSidebar, {} from '@/components/Composable/UI/Sidebar/BaseSidebar.vue'
import { usePagesStore } from '@/views/Pages/Pages.hooks'
import ComponentsContents from './PageSidebar/ComponentsContents.vue'
import StylesContents from './PageSidebar/StylesContents.vue'
import PropertiesContents from './PageSidebar/PropertiesContents.vue'

const { activeTab } = usePagesStore()
const tabs = [
    { name: 'Components', component: ComponentsContents },
    { name: 'Styles', component: StylesContents },
    { name: 'Properties', component: PropertiesContents }
]
</script>