<template>
    <div class="subheader">
        <div class="action-tabs">
            <ActionTabs />
        </div>
        <div class="actions">
            <Actions />
        </div>
    </div>
</template>

<script setup>
    import ActionTabs from './Subheader/ActionTabs.vue'
    import Actions from './Subheader/Actions.vue'
</script>

<style src="./Subheader.styles.css" scoped />