<template>
  <div class="table-examples">
    <h2>Table Migration Examples</h2>
    
    <!-- New PrimeVue DataTable Wrapper -->
    <section>
      <h3>New PrimeVue DataTable Wrapper</h3>
      <Table
        :value="sampleData"
        :columns="columns"
        :selectable="true"
        :paginator="true"
        :rows="5"
        :sortable="true"
        :rowHover="true"
        @row-click="onRowClick"
        @update:selection="onSelectionChange"
      />
    </section>

    <!-- Legacy Grid-based Table (for comparison) -->
    <section>
      <h3>Legacy Grid-based Table</h3>
      <div class="legacy-table">
        <Headers columnstyle="repeat(3, 1fr)">
          <div class="header">ID</div>
          <div class="header">Name</div>
          <div class="header">Status</div>
        </Headers>
        <Row
          v-for="(item, index) in sampleData"
          :key="item.id"
          columnstyle="repeat(3, 1fr)"
          :selected="selectedLegacyRow === index"
          @click="selectedLegacyRow = index"
        >
          <div>{{ item.id }}</div>
          <div>{{ item.name }}</div>
          <div>{{ item.status }}</div>
        </Row>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Table, Headers, Row } from './index'
import type { TableColumn } from './Table.types'

// Sample data
const sampleData = [
  { id: 1, name: 'John Doe', status: 'Active' },
  { id: 2, name: 'Jane Smith', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', status: 'Active' },
  { id: 4, name: 'Alice Brown', status: 'Pending' },
  { id: 5, name: 'Charlie Wilson', status: 'Active' },
  { id: 6, name: 'Diana Davis', status: 'Inactive' }
]

// Column configuration for new table
const columns: TableColumn[] = [
  {
    field: 'id',
    header: 'ID',
    width: '80px',
    sortable: true
  },
  {
    field: 'name',
    header: 'Name',
    sortable: true
  },
  {
    field: 'status',
    header: 'Status',
    sortable: true
  }
]

// State for legacy table
const selectedLegacyRow = ref<number | null>(null)

// Event handlers
const onRowClick = (event: any) => {
  console.log('Row clicked:', event.data)
}

const onSelectionChange = (selection: any[]) => {
  console.log('Selection changed:', selection)
}
</script>

<style scoped>
.table-examples {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.table-examples h2 {
  color: var(--grey-1);
  margin-bottom: 30px;
}

.table-examples h3 {
  color: var(--grey-2);
  margin: 20px 0 10px 0;
}

.table-examples section {
  margin-bottom: 40px;
}

.legacy-table {
  max-height: 300px;
  overflow-y: auto;
}

.header {
  font-weight: bold;
  text-align: center;
}
</style>