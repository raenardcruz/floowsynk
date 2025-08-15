<template>
  <DataTable
    ref="primevueRef"
    :id="id"
    :value="value"
    :class="mergedClasses"
    :style="mergedStyle"
    :selection="internalSelection"
    :selectionMode="selectable ? 'multiple' : undefined"
    :paginator="paginator"
    :rows="rows"
    :sortable="sortable"
    :showGridlines="showGridlines"
    :rowHover="rowHover"
    :rowClass="rowClass"
    :loading="loading"
    :emptyMessage="emptyMessage"
    :virtualScroll="virtualScroll"
    :scrollHeight="scrollHeight"
    :virtualScrollItemSize="virtualScrollItemSize"
    :data-testid="dataTestid"
    @update:selection="handleSelectionUpdate"
    @row-click="handleRowClick"
    @row-select="handleRowSelect"
    @row-unselect="handleRowUnselect"
  >
    <Column
      v-if="selectable"
      selectionMode="multiple"
      headerStyle="width: 3rem"
    />
    
    <Column
      v-for="column in columns"
      :key="column.field"
      :field="column.field"
      :header="column.header"
      :sortable="column.sortable !== false && sortable"
      :style="column.style"
      :class="column.class"
      :headerStyle="column.width ? { width: column.width } : undefined"
    >
      <template #body="slotProps" v-if="column.component">
        <component :is="column.component" :data="slotProps.data" :field="column.field" />
      </template>
    </Column>
  </DataTable>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { mergeComponentClasses } from '../utils'
import { defaultTableProps } from './Table.config'
import type { TableWrapperProps, TableWrapperEmits } from './Table.types'

// Define component props
const props = withDefaults(defineProps<TableWrapperProps>(), defaultTableProps)

// Define component emits
const emit = defineEmits<TableWrapperEmits>()

// Internal reactive selection for v-model
const internalSelection = ref<any[]>(props.selection || [])

// Watch for external selection changes
watch(() => props.selection, (newValue) => {
  if (newValue !== undefined && newValue !== internalSelection.value) {
    internalSelection.value = newValue
  }
}, { deep: true })

// Watch for internal selection changes and emit update
watch(internalSelection, (newValue) => {
  emit('update:selection', newValue)
}, { deep: true })

// Computed properties
const dataTestid = computed(() => props['data-testid'])

const mergedClasses = computed(() => {
  return mergeComponentClasses(props.class, 'table-wrapper')
})

const mergedStyle = computed(() => {
  if (typeof props.style === 'string') {
    return props.style
  }
  return {
    borderRadius: '8px',
    ...props.style
  }
})

// Event handlers
const handleSelectionUpdate = (value: any[]) => {
  internalSelection.value = value
}

const handleRowClick = (event: any) => {
  emit('row-click', {
    originalEvent: event.originalEvent,
    data: event.data,
    index: event.index
  })
}

const handleRowSelect = (event: any) => {
  emit('row-select', {
    originalEvent: event.originalEvent,
    data: event.data,
    index: event.index
  })
}

const handleRowUnselect = (event: any) => {
  emit('row-unselect', {
    originalEvent: event.originalEvent,
    data: event.data,
    index: event.index
  })
}

// Expose component instance for parent access
const primevueRef = ref()

defineExpose({
  primevueRef,
  focus: () => primevueRef.value?.focus?.(),
  blur: () => primevueRef.value?.blur?.(),
  exportCSV: () => primevueRef.value?.exportCSV?.(),
  clearFilters: () => primevueRef.value?.clearFilters?.()
})
</script>

<style scoped>
.table-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

/* Custom styling to match existing design */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-header) {
  background: var(--white-1);
  color: var(--grey-1);
  border-radius: 8px 8px 0 0;
}

:deep(.p-datatable-tbody > tr) {
  background: var(--grey-5);
  color: var(--grey-1);
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--grey-4);
  color: var(--grey-2);
}

:deep(.p-datatable-tbody > tr.p-highlight) {
  color: var(--white-2);
  background: linear-gradient(135deg,
    var(--blue-2) 0%,
    var(--blue-3) 50%,
    var(--blue-4) 100%);
  font-weight: bold;
  border: 1px solid var(--blue-5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--white-1);
  color: var(--grey-1);
  height: 40px;
  padding: 0 12px;
}

:deep(.p-datatable-tbody > tr > td) {
  height: 40px;
  padding: 0 12px;
}
</style>