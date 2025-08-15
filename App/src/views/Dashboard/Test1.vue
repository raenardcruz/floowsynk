<template>
    <div>
        <img :src="DashboardSvg" alt="Add Icon" class="add-icon" />
    </div>
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

.button-test-container {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.button-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}
</style>