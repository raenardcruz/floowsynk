<template>
    <div>
        <h2>Dashboard</h2>
        <TextInput id="test" v-model="text" label="Test Input" placeholder="Type something..." tooltip="Sample tooltip" type="password"/>
        {{ text }}
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TextInput from '@/components/Composable/UI/Inputs/TextInput.vue'

const text = ref('')
</script>