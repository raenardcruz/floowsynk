<template>
    <h2>Reviews</h2>
    <MonacoEditor :variables="sampleVariables" />
</template>

<script setup>
import MonacoEditor from '@/components/Common/UI/MonacoEditor.vue';
const sampleVariables = [
    "Name.FirstName",
    "Name.MiddleName",
    "Name.LastName",
    "LastName",
    "FullName",
    "Age",
    "Birthday",
    "Sex"
]
</script>