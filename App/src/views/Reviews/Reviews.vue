<template>
    <h2>Reviews</h2>
    <div class="modal-container"></div>
    <TextInput v-model="text" label="Name" placeholder="Enter your name" :editorConfig="editoConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextInput from '@/components/Composable/UI/Inputs/TextInput.vue'


const text = ref('Hello World')
const editoConfig = {
    target: '.modal-container',
    variables: ['name', 'age', 'gender'],
}
</script>