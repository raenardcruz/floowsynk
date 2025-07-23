<template>
    <div style="padding: 8px">
        <div class="test">
            <Tab id="tabs" :tabContents="test" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Tab, { TabContent } from '@/components/Composable/UI/Tabs/Tab.vue'

const test: TabContent[] = [
    {
    id: 'ID1',
    label: 'Test 1',
    content: 'Sample Value 1'
   },
   {
    id: 'ID2',
    label: 'Test 2',
    content: 'Sample Value 2'
   },
   {
    id: 'ID3',
    label: 'Test 3',
    content: 'Sample Value 3'
   }
]
const tabSelection = ref('ID1')
</script>

<style scoped>

</style>