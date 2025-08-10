<template>
  <div class="comparison-container">
    <h2>Collapsible Component Comparison</h2>
    
    <div class="comparison-grid">
      <div class="comparison-item">
        <h3>Original Custom Collapsible</h3>
        <Collapsible 
          v-model="originalExpanded"
          title="Original Component"
          caption="This is the original custom implementation"
        >
          <div class="test-content">
            <p>This is the content inside the original collapsible component.</p>
            <p>It has custom styling and animations.</p>
            <button>Test Button</button>
          </div>
        </Collapsible>
      </div>
      
      <div class="comparison-item">
        <h3>PrimeVue Wrapper</h3>
        <CollapsibleWrapper 
          v-model="wrapperExpanded"
          title="PrimeVue Wrapper"
          caption="This uses PrimeVue Accordion internally"
        >
          <div class="test-content">
            <p>This is the content inside the PrimeVue wrapper component.</p>
            <p>It uses PrimeVue's Accordion component internally.</p>
            <button>Test Button</button>
          </div>
        </CollapsibleWrapper>
      </div>
    </div>
    
    <div class="controls">
      <button @click="originalExpanded = !originalExpanded">
        Toggle Original: {{ originalExpanded ? 'Expanded' : 'Collapsed' }}
      </button>
      <button @click="wrapperExpanded = !wrapperExpanded">
        Toggle Wrapper: {{ wrapperExpanded ? 'Expanded' : 'Collapsed' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Collapsible from './Collapsible.vue'
import CollapsibleWrapper from './CollapsibleWrapper.vue'

const originalExpanded = ref(false)
const wrapperExpanded = ref(false)
</script>

<style scoped>
.comparison-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 20px 0;
}

.comparison-item {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}

.test-content {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 8px;
}

.test-content button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

.controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.controls button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #0056b3;
}
</style>