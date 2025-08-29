<template>
    <div style="padding: 8px">
        <div class="test">
            <MenuBar :model="items"/>
            <CustomList id="test" :template="template" label="Sample Label" v-model="a" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import MenuBar from 'primevue/menubar'
import CustomList from '@/components/Composable/UI/Inputs/CustomList.vue'

const items = ref([
    {
        label: 'Home'
    },
]);
const a = ref()
const template = {
    name: '',
    age: ''
}
</script>

<style scoped>

</style>