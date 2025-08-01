<template>
    <img :src="DashboardSvg" alt="Add Icon" class="add-icon" />
</template>

<script lang="ts" setup>
import DashboardSvg from '@/components/Icons/dashboard.svg'
</script>

<style scoped>
.tab-label-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
.add-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
}
</style>