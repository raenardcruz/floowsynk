<template>
    <img :src="Approvevg" alt="Approve Icon" class="approve-icon" />
</template>

<script lang="ts" setup>
import Approvevg from '@/components/Icons/approve.svg'
</script>

<style scoped>
.approve-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
}
</style>