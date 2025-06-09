<template>
    <div class="sidebar">
        <slot></slot>
    </div>
</template>

<style scoped>
.sidebar {
    position: relative;
    display: flex;
    right: 0;
    flex-direction: column;
    background: var(--grey-5);
    width: 400px;
    height: 100%;
    box-shadow: -1px 7px 10px var(--grey-3);
    z-index: 100;
    transition: all 0.3s ease;
    padding: 20px;
}
</style>