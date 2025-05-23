<template>
    <Teleport :to="editorConfig.target" v-if="editorConfig">
        <Modal title="Text Editor" :caption="label" v-model="showEditor">
            <MonacoEditor v-model="value" :variables="editorConfig.variables" :disabled="disabled" />
        </Modal>
    </Teleport>
    <div class="input">
        <div class="label" v-if="label">{{ label }}</div>
        <input :type="type" v-model="value" :disabled="disabled" :placeholder="placeholder" />
        <span class="material-symbols-outlined show-code-btn" @click="toggleEditor" v-if="editorConfig && !showEditor" title="Show Editor">developer_mode_tv</span>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Modal from '@/components/Composable/UI/Modal/Modal.vue';
import MonacoEditor from '@/components/Composable/UI/MonacoEditor/MonacoEditor.vue';
import { EditorConfig } from './Inputs';

const value = defineModel();
const showEditor = ref(false);

const toggleEditor = () => {
    showEditor.value = !showEditor.value;
};

defineProps({
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'text'
    },
    editorConfig: {
        type: Object as () => EditorConfig,
        default: null
    }
});
</script>

<style scoped>
.input {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 8px;
    border-radius: 50px;
    border: 1px solid var(--grey-4);
    background: var(--white-1);
    margin-top: 12px;
}
.input input {
    width: 100%;
    height: 100%;
    padding: 5px;
    border-radius: 50px;
    border: none;
    background: none;
    color: var(--grey-8);
    font-size: 14px;
}
.input input:focus {
    outline: none;
}
.show-code-btn {
    display: flex;
    position: absolute;
    right: 8px;
    cursor: pointer;
    color: var(--blue-2);
    z-index: 100;
    border-radius: 50%;
    padding: 2px;
    transition: all 0.3s;
}
.label {
    display: flex;
    position: absolute;
    top: -10px;
    left: 10px;
    font-size: 12px;
    background: var(--grey-3);
    color: var(--white-1);
    border: 1px solid var(--grey-4);
    border-radius: 10px;
    padding: 0px 8px;
    font-weight: 500;
    box-shadow: 2px 4px 8px var(--grey-4);
}
</style>