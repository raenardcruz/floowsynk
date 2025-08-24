<template>
  <div class="monaco-test-container">
    <h2>Monaco Editor Integration Test</h2>
    
    <div class="test-controls">
      <div class="control-group">
        <label>Variables:</label>
        <div class="variables-list">
          <span v-for="variable in variables" :key="variable" class="variable-tag">
            {{ variable }}
          </span>
        </div>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="disabled" />
          Disabled
        </label>
      </div>
      
      <div class="control-group">
        <button @click="addVariable">Add Variable</button>
        <button @click="clearContent">Clear Content</button>
        <button @click="setTemplate">Set Template</button>
      </div>
    </div>
    
    <div class="editor-wrapper">
      <MonacoEditor
        v-model="content"
        :variables="variables"
        :disabled="disabled"
      />
    </div>
    
    <div class="output">
      <h3>Current Content:</h3>
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const content = ref(`{{ .Name }} - {{ .Email }}
{{ if eq .Status "active" }}
  User is active
{{ else }}
  User is inactive
{{ end }}`)

const variables = ref(['Name', 'Email', 'Status', 'CreatedAt', 'UpdatedAt'])
const disabled = ref(false)

const addVariable = () => {
  const newVar = `Variable${variables.value.length + 1}`
  variables.value.push(newVar)
}

const clearContent = () => {
  content.value = ''
}

const setTemplate = () => {
  content.value = `{{ range .Items }}
  Item: {{ .Name }}
  Value: {{ .Value }}
{{ end }}`
}
</script>

<style scoped>
.monaco-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-controls {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.control-group {
  margin-bottom: 12px;
}

.control-group label {
  font-weight: bold;
  margin-right: 8px;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.variable-tag {
  background: var(--primary-color, #007bff);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.control-group button {
  margin-right: 8px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-group button:hover {
  background: #0056b3;
}

.editor-wrapper {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.output {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.output pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
}
</style>