<template>
<div id="nodesidebar" class="sidebar">
    <slot></slot>
</div>
</template>

<style scoped>
    .sidebar {
        position: relative;
        display: flex;
        right: 0;
        flex-direction: column;
        background: #f5f5f5;
        width: 300px;
        height: 100%;
        box-shadow: -2px 0px 4px grey;
        z-index: 100;
        transition: all 0.3s ease;
    }

</style>