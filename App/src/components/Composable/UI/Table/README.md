# Table Components Migration

This directory contains both the new PrimeVue DataTable wrapper and the legacy grid-based table components.

## Components

### New PrimeVue DataTable Wrapper

#### `Table.vue`
A comprehensive wrapper around PrimeVue's DataTable component that provides:

- **Column Configuration**: Define columns with headers, sorting, filtering, and custom components
- **Selection Support**: Single or multiple row selection with events
- **Pagination**: Built-in pagination support
- **Sorting & Filtering**: Column-level sorting and filtering capabilities
- **Virtual Scrolling**: Support for large datasets with virtual scrolling
- **Loading States**: Built-in loading indicators
- **Accessibility**: Full keyboard navigation and screen reader support

**Usage Example:**
```vue
<template>
  <Table
    :value="data"
    :columns="columns"
    :selectable="true"
    :paginator="true"
    :rows="10"
    @row-click="handleRowClick"
    @update:selection="handleSelectionChange"
  />
</template>

<script setup>
import { Table } from '@/components/Composable/UI/Table'

const columns = [
  { field: 'id', header: 'ID', sortable: true, width: '80px' },
  { field: 'name', header: 'Name', sortable: true },
  { field: 'status', header: 'Status', sortable: true }
]

const data = [
  { id: 1, name: 'John Doe', status: 'Active' },
  { id: 2, name: 'Jane Smith', status: 'Inactive' }
]
</script>
```

### Legacy Grid-based Components

#### `Headers.vue` and `Row.vue`
Simple grid-based components that maintain backward compatibility with existing usage:

- **Grid Layout**: Uses CSS Grid with configurable column styles
- **Slot-based Content**: Flexible content through slots
- **Selection State**: Row selection styling support
- **Consistent Styling**: Matches existing application design

**Usage Example:**
```vue
<template>
  <div class="table-container">
    <Headers columnstyle="repeat(3, 1fr)">
      <div class="header">ID</div>
      <div class="header">Name</div>
      <div class="header">Status</div>
    </Headers>
    
    <Row
      v-for="(item, index) in data"
      :key="item.id"
      columnstyle="repeat(3, 1fr)"
      :selected="selectedRow === index"
      @click="selectedRow = index"
    >
      <div>{{ item.id }}</div>
      <div>{{ item.name }}</div>
      <div>{{ item.status }}</div>
    </Row>
  </div>
</template>
```

## Migration Strategy

### Current State
- **Legacy components** (`Headers.vue`, `Row.vue`) are maintained for backward compatibility
- **New PrimeVue wrapper** (`Table.vue`) is available for new implementations
- **Existing usage** in Process List and ReplaySteps continues to work without changes

### Migration Path
1. **Immediate**: New features should use the `Table.vue` component
2. **Gradual**: Existing implementations can be migrated when convenient
3. **Benefits**: Enhanced functionality, better accessibility, consistent styling

### Migration Benefits
- **Enhanced Features**: Sorting, filtering, pagination, selection
- **Better Performance**: Virtual scrolling for large datasets
- **Improved Accessibility**: Full keyboard navigation and ARIA support
- **Consistent Styling**: Matches PrimeVue theme system
- **Reduced Maintenance**: Leverages well-maintained PrimeVue components

## Files Structure

```
Table/
├── Table.vue              # New PrimeVue DataTable wrapper
├── Table.types.ts         # TypeScript interfaces for new component
├── Table.config.ts        # Configuration and defaults
├── Headers.vue            # Legacy grid-based headers component
├── Row.vue               # Legacy grid-based row component
├── Table.example.vue     # Usage examples for both approaches
├── index.ts              # Component exports
├── __tests__/
│   ├── Table.test.ts     # Tests for new PrimeVue wrapper
│   └── Legacy.test.ts    # Tests for legacy components
└── README.md             # This documentation
```

## Testing

All components are thoroughly tested:
- **Unit Tests**: Component behavior and API compatibility
- **Integration Tests**: Component interaction and styling
- **Legacy Tests**: Backward compatibility verification

Run tests with:
```bash
npm test -- src/components/Composable/UI/Table/__tests__/
```

## Future Considerations

1. **Performance Monitoring**: Track performance impact of PrimeVue DataTable
2. **Feature Requests**: Gather feedback on additional DataTable features needed
3. **Migration Timeline**: Plan gradual migration of existing implementations
4. **Bundle Size**: Monitor impact on application bundle size