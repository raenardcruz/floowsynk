<template>
    <div class="table-header" :style="{ '--columnstyle': columnstyle }">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
defineProps({
    columnstyle: {
        type: String,
        default: 'repeat(3, 1fr)',
    },
});
</script>

<style scoped>
.table-header {
    display: grid;
    position: relative;
    height: 40px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: var(--white-1);
    color: var(--grey-1);
    margin-bottom: 8px;
    grid-template-columns: var(--columnstyle);
    padding: 0 12px;
    cursor: pointer;
    width: 100%;
}
</style>