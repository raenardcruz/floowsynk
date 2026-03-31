<template>
    <div style="padding: 8px">
        <div class="test">
            <accordion />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Accordion from '../Pages/Tools/Accordion/Accordion.vue';

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