<template>
    <h2>Reviews</h2>
    <Loading />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ListField from '@/components/Composable/UI/Inputs/ListField.vue'
import { ArrayDataType } from 'proto/floowsynk_pb'
import Loading from '@/components/Composable/UI/Loading/Loading.vue'

const text = ref({
    type: ArrayDataType.STRING,
    stringitemsList: [],
    intitemsList: [],
    boolitemsList: [],
    keyvalueitemsList: []
})
</script>