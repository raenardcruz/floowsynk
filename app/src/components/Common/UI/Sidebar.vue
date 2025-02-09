<template>
    <div class="sidebar" v-if="visible">
        <div class="title">{{ title }}</div>
        <div class="caption">{{ caption }}</div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from "vue";
    interface Props {
        title: string;
        caption: string;
        visible: boolean;
    }
    const props = defineProps<Props>();
    const emit = defineEmits(['update:visible']);
    const visible = computed({
        get: () => props.visible,
        set: (value: boolean) => emit('update:visible', value)
    });
</script>

<style scoped src="./Sidebar.css"></style>