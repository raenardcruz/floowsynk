<template>
    <div style="padding: 8px">
        <div class="test">
            <Tabs id="tabs" :tabContents="test" v-model="tabSelection" @close="closeTab" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Tabs, type TabContent } from '@/components/Composable/UI/Tabs'
import Test1 from './Test1.vue'
import Test2 from './Test2.vue'

const test: TabContent[] = [
    {
    id: 'ID1',
    icon: Test1,
    label: 'Test1',
    content: 'Sample Value 1',
    direction: 'column',
    canClose: false
   },
   {
    id: 'ID2',
    icon: Test2,
    label: 'Test2',
    content: 'Sample Value 2',
    direction: 'row',
    canClose: true
   }
]
const tabSelection = ref('ID1')
const closeTab = (id: string) => {
    alert(`Close tab with ID: ${id}`)
}
</script>

<style scoped>

</style>