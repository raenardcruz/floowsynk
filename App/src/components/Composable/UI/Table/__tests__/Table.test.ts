/**
 * Unit tests for Table wrapper component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Table from '../Table.vue'
import type { TableColumn } from '../Table.types'

// Mock PrimeVue components
vi.mock('primevue/datatable', () => ({
  default: {
    name: 'DataTable',
    template: '<div class="p-datatable"><slot /></div>',
    props: [
      'id', 'value', 'class', 'style', 'selection', 'selectionMode',
      'paginator', 'rows', 'sortable', 'showGridlines', 'rowHover',
      'rowClass', 'loading', 'emptyMessage', 'virtualScroll',
      'scrollHeight', 'virtualScrollItemSize', 'data-testid'
    ],
    emits: ['update:selection', 'row-click', 'row-select', 'row-unselect']
  }
}))

vi.mock('primevue/column', () => ({
  default: {
    name: 'Column',
    template: '<div class="p-column"><slot /></div>',
    props: ['field', 'header', 'sortable', 'style', 'class', 'headerStyle', 'selectionMode']
  }
}))

describe('Table', () => {
  const mockColumns: TableColumn[] = [
    {
      field: 'id',
      header: 'ID',
      width: '100px',
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
      sortable: false
    }
  ]

  const mockData = [
    { id: 1, name: 'John Doe', status: 'Active' },
    { id: 2, name: 'Jane Smith', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', status: 'Active' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API Compatibility', () => {
    it('should accept value prop', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      expect(wrapper.props('value')).toEqual(mockData)
    })

    it('should accept columns prop', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      expect(wrapper.props('columns')).toEqual(mockColumns)
    })

    it('should accept selection prop', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true,
          selection: [mockData[0]]
        }
      })

      expect(wrapper.props('selection')).toEqual([mockData[0]])
    })

    it('should emit update:selection when selection changes', async () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true,
          selection: []
        }
      })

      // Simulate internal selection change
      wrapper.vm.internalSelection = [mockData[0]]
      await nextTick()

      expect(wrapper.emitted('update:selection')).toBeTruthy()
      expect(wrapper.emitted('update:selection')?.[0]).toEqual([[mockData[0]]])
    })

    it('should emit row-click event when row is clicked', async () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      const mockEvent = {
        originalEvent: new Event('click'),
        data: mockData[0],
        index: 0
      }

      await wrapper.vm.handleRowClick(mockEvent)

      expect(wrapper.emitted('row-click')).toBeTruthy()
      expect(wrapper.emitted('row-click')?.[0]).toEqual([mockEvent])
    })

    it('should emit row-select event when row is selected', async () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const mockEvent = {
        originalEvent: new Event('click'),
        data: mockData[0],
        index: 0
      }

      await wrapper.vm.handleRowSelect(mockEvent)

      expect(wrapper.emitted('row-select')).toBeTruthy()
      expect(wrapper.emitted('row-select')?.[0]).toEqual([mockEvent])
    })

    it('should emit row-unselect event when row is unselected', async () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const mockEvent = {
        originalEvent: new Event('click'),
        data: mockData[0],
        index: 0
      }

      await wrapper.vm.handleRowUnselect(mockEvent)

      expect(wrapper.emitted('row-unselect')).toBeTruthy()
      expect(wrapper.emitted('row-unselect')?.[0]).toEqual([mockEvent])
    })
  })

  describe('Rendering', () => {
    it('should render DataTable component', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      expect(wrapper.find('.p-datatable').exists()).toBe(true)
    })

    it('should render columns correctly', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      const columns = wrapper.findAll('.p-column')
      expect(columns).toHaveLength(3) // 3 data columns
    })

    it('should render selection column when selectable', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const columns = wrapper.findAll('.p-column')
      expect(columns).toHaveLength(4) // 1 selection + 3 data columns
    })

    it('should not render selection column when not selectable', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: false
        }
      })

      const columns = wrapper.findAll('.p-column')
      expect(columns).toHaveLength(3) // Only 3 data columns
    })
  })

  describe('Configuration', () => {
    it('should apply default props correctly', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      expect(wrapper.props('selectable')).toBe(false)
      expect(wrapper.props('paginator')).toBe(false)
      expect(wrapper.props('rows')).toBe(10)
      expect(wrapper.props('sortable')).toBe(true)
      expect(wrapper.props('rowHover')).toBe(true)
    })

    it('should override default props', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true,
          paginator: true,
          rows: 20,
          sortable: false,
          rowHover: false
        }
      })

      expect(wrapper.props('selectable')).toBe(true)
      expect(wrapper.props('paginator')).toBe(true)
      expect(wrapper.props('rows')).toBe(20)
      expect(wrapper.props('sortable')).toBe(false)
      expect(wrapper.props('rowHover')).toBe(false)
    })

    it('should handle virtual scrolling configuration', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          virtualScroll: true,
          scrollHeight: '500px',
          virtualScrollItemSize: 50
        }
      })

      expect(wrapper.props('virtualScroll')).toBe(true)
      expect(wrapper.props('scrollHeight')).toBe('500px')
      expect(wrapper.props('virtualScrollItemSize')).toBe(50)
    })
  })

  describe('Styling', () => {
    it('should merge classes correctly', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          class: 'custom-class'
        }
      })

      const mergedClasses = wrapper.vm.mergedClasses
      expect(mergedClasses).toContain('custom-class')
      expect(mergedClasses).toContain('table-wrapper')
    })

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' }
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          style: customStyle
        }
      })

      const mergedStyle = wrapper.vm.mergedStyle
      expect(mergedStyle.backgroundColor).toBe('red')
      expect(mergedStyle.borderRadius).toBe('8px') // Default style should be preserved
    })

    it('should handle string styles', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          style: 'background-color: blue;'
        }
      })

      const mergedStyle = wrapper.vm.mergedStyle
      expect(mergedStyle).toBe('background-color: blue;')
    })
  })

  describe('Column Configuration', () => {
    it('should handle column sorting configuration', () => {
      const columnsWithSorting: TableColumn[] = [
        { field: 'id', header: 'ID', sortable: true },
        { field: 'name', header: 'Name', sortable: false },
        { field: 'status', header: 'Status' } // Should inherit table sortable setting
      ]

      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: columnsWithSorting,
          sortable: true
        }
      })

      expect(wrapper.exists()).toBe(true)
      // Column sorting behavior would be tested in integration tests
    })

    it('should handle column styling', () => {
      const columnsWithStyles: TableColumn[] = [
        {
          field: 'id',
          header: 'ID',
          width: '100px',
          style: { fontWeight: 'bold' },
          class: 'id-column'
        }
      ]

      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: columnsWithStyles
        }
      })

      expect(wrapper.exists()).toBe(true)
      // Column styling would be verified in integration tests
    })
  })

  describe('Accessibility', () => {
    it('should accept data-testid attribute', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          'data-testid': 'test-table'
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support keyboard navigation through exposed methods', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns
        }
      })

      expect(typeof wrapper.vm.focus).toBe('function')
      expect(typeof wrapper.vm.blur).toBe('function')
      expect(typeof wrapper.vm.exportCSV).toBe('function')
      expect(typeof wrapper.vm.clearFilters).toBe('function')
    })
  })

  describe('Data Handling', () => {
    it('should handle empty data', () => {
      const wrapper = mount(Table, {
        props: {
          value: [],
          columns: mockColumns,
          emptyMessage: 'No records found'
        }
      })

      expect(wrapper.props('emptyMessage')).toBe('No records found')
    })

    it('should handle loading state', () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          loading: true
        }
      })

      expect(wrapper.props('loading')).toBe(true)
    })

    it('should handle selection updates from parent', async () => {
      const wrapper = mount(Table, {
        props: {
          value: mockData,
          columns: mockColumns,
          selectable: true,
          selection: []
        }
      })

      await wrapper.setProps({ selection: [mockData[0]] })

      expect(wrapper.vm.internalSelection).toEqual([mockData[0]])
    })
  })
})