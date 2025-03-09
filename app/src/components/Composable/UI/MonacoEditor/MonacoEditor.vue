<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineEmits } from 'vue'
import { MonacoEditorProps } from './MonacoEditor.types'
import { registerCustomLanguage, initMonacoEditor, disposeMonacoEditor } from './MonacoEditor.helper'
import { EMIT_MODAL } from './MonacoEditor.contants'
import { IDisposable, editor } from 'monaco-editor';

const editorContainer = ref<HTMLDivElement | null>(null)

const props = defineProps<MonacoEditorProps>()
const emit = defineEmits([EMIT_MODAL])
let monacoDisposable: IDisposable | null = null;
let editorInstance: editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  monacoDisposable = registerCustomLanguage(props);
  editorInstance = initMonacoEditor(editorContainer, props, emit);
})
onBeforeUnmount(() => {
  if (monacoDisposable) {
    disposeMonacoEditor(editorInstance, monacoDisposable);
  }
})
</script>

<style scoped src="./MonacoEditor.styles.css"></style>
