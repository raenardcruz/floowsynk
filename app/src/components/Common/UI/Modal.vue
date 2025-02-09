<template>
    <div class="background" :class="{'show': visible}">
        <div class="modal">
            <div class="modal-header" :style="{ color: fontcolor, backgroundColor: bgcolor }">
                <span class="title">{{ title }}</span>
                <span class="caption">{{ caption }}</span>
                <span
                    @click="visible = false"
                    :style="{ color: fontcolor }"
                    class="material-symbols-outlined btn-close">
                    close
                </span>
            </div>
            <div class="modal-content">
                <slot></slot>
            </div>
            <div class="modal-actions" v-if="showActions">
                <button
                    class="btn" 
                    :style="{ color: fontcolor, background: bgcolor, border: '1px solid ' + fontcolor }"
                    v-if="onSave" 
                    @click="onSave">Save</button>
                <button
                    class="btn" 
                    :style="{ color: fontcolor, background: bgcolor, border: '1px solid ' + fontcolor }"
                    v-if="onOk" 
                    @click="onOk">Ok</button>
                <slot name="actions"></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defineEmits } from 'vue';

interface Props {
    title: string;
    caption: string;
    visible: boolean;
    fontcolor?: string | '#222';
    bgcolor?: string | '#E6E5E5';
    onOk?: (payload: MouseEvent) => void;
    onSave?: (payload: MouseEvent) => void;
}

const emit = defineEmits(['update:visible']);

const visible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
});

const showActions = computed(() => props.onOk || props.onSave);

const props = defineProps<Props>();
</script>

<style scoped src="./Modal.css"></style>