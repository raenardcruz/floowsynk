<template>
    <div style="padding: 8px">
        <div class="test">
            <Button label="Test Toast" @click="() => showToast()" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const showToast = () => {
    toast.add({severity:'info', summary: 'Info Message', detail:'Message Content', life: 3000});
}
</script>

<style scoped>

</style>