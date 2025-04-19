<template>
    <h2>Reviews</h2>
    <div class="modal-container"></div>
    <ListField label="Sample List" v-model="text"/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ListField from '@/components/Composable/UI/Inputs/ListField.vue'
import { ArrayDataType } from 'proto/floowsynk_pb'

const text = ref({
    type: ArrayDataType.STRING,
    stringitemsList: [],
    intitemsList: [],
    boolitemsList: [],
    keyvalueitemsList: []
})
</script>