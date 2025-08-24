<template>
    <div class="table-row" :class="{ selected: selected }" :style="{ '--columnstyle': columnstyle }">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
defineProps({
    columnstyle: {
        type: String,
        default: 'repeat(3, 1fr)',
    },
    selected: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.table-row {
    display: grid;
    position: relative;
    height: 40px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: var(--grey-5);
    color: var(--grey-1);
    margin-bottom: 8px;
    grid-template-columns: var(--columnstyle);
    padding: 0 12px;
    cursor: pointer;
}

.table-row:hover {
    background: var(--grey-4);
    color: var(--grey-2);
}

.table-row.selected {
    color: var(--white-2);
    background: linear-gradient(135deg,
            var(--blue-3) 0%,
            var(--blue-4) 50%,
            var(--blue-5) 100%);
    font-weight: bold;
    border: 1px solid var(--blue-5);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>