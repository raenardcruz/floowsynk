<template>
    <div ref="editorContainer" class="editor-container"></div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import * as monaco from 'monaco-editor'
  import {getDefaultSuggestions} from "./MonacoEditor"
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    variables: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['update:modelValue'])
  
  const editorContainer = ref<HTMLDivElement | null>(null)
  let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
  let mnco: monaco.IDisposable;
  
  function registerCustomLanguage() {
    monaco.languages.register({ id: 'gotemplate' })
    
    monaco.languages.setLanguageConfiguration("gotemplate", {
      comments: {
        blockComment: ["{{/*", "*/}}"]
      }
    })
  
    monaco.languages.setMonarchTokensProvider('gotemplate', {
      tokenizer: {
        root: [
          [/{{.+?}}/, 'template-code'],
          [/{{\/\*.*?\*\/}}/, 'template-comments'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"([^"\\]|\\.)*"/, 'string'],
          [/\b\d+(\.\d+)?\b/, 'number'],
        ]
      }
    })

    monaco.editor.defineTheme('floowsynk-template', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'template-code', foreground: '077D81' },
          { token: 'template-comments', foreground: '43a564' },
          { token: 'string', foreground: 'ff0000' },
          { token: 'number', foreground: '0000ff' },
          { token: 'class', foreground: '00ff00' },
        ],
        colors: {}
      })

    mnco = monaco.languages.registerCompletionItemProvider('gotemplate', {
      triggerCharacters: [''],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        )
        const inlineText = model.getLineContent(position.lineNumber)

        let suggestions = getDefaultSuggestions(monaco, range)
        props.variables.forEach(v => {
          if (suggestions.findIndex(f => f.label == v) == -1) {
            suggestions.push({
              label: String(v),
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: `{{ .${v} }}`,
              range: range,
              documentation: 'Snippet for inserting a variable. Change the variable name and TempField to your desired value'
            })
          }
        })

        const isInsideRange = /{{.+(range|if|with).+}}/.test(inlineText);
        if (isInsideRange) {
          return {
            suggestions: suggestions.filter(f => f.kind == monaco.languages.CompletionItemKind.Variable).map(s => ({
              ...s,
              insertText: s.insertText.replace('{{ .', '').replace(' }}', '')
            }))
          }
        }
        
        return {
          suggestions
        }
      }
    })
  }
  
  onMounted(() => {
    registerCustomLanguage()
  
    if (editorContainer.value) {
      editorInstance = monaco.editor.create(editorContainer.value, {
        value: props.modelValue,
        language: 'gotemplate',
        automaticLayout: true,
        theme: 'floowsynk-template',
        wordWrap: 'on',
        cursorBlinking: "phase",
        minimap: {
          enabled: true
        }
      })
  
      editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance?.getValue() || ''
        emit('update:modelValue', value)
      })
    }
  })
  
  onBeforeUnmount(() => {
    mnco?.dispose()
    editorInstance?.dispose()
  })
  
  watch(
    () => props.modelValue,
    (newVal) => {
      if (editorInstance && newVal !== editorInstance.getValue()) {
        const model = editorInstance.getModel()
        if (model) {
          model.pushEditOperations(
            [],
            [{
              range: model.getFullModelRange(),
              text: newVal
            }],
            () => null
          )
        }
      }
    }
  )
  </script>
  
  <style scoped>
  .editor-container {
    width: 100%;
    height: 100%;
    border: 1px solid #ddd;
  }
  </style>
