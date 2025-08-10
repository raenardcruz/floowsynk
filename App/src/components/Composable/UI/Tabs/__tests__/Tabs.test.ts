/**
 * Unit tests for Tabs wrapper component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Tabs from '../Tabs.vue'
import type { TabContent } from '../Tabs.types'

// Mock PrimeVue components
vi.mock('primevue/tabs', () => ({
  default: {
    name: 'Tabs',
    template: '<div class="p-tabs"><slot /></div>',
    props: ['id', 'value', 'class', 'style', 'scrollable', 'data-testid'],
    emits: ['update:value', 'tab-click']
  }
}))

vi.mock('primevue/tablist', () => ({
  default: {
    name: 'TabList',
    template: '<div class="p-tablist"><slot /></div>'
  }
}))

vi.mock('primevue/tab', () => ({
  default: {
    name: 'Tab',
    template: '<div class="p-tab"><slot /></div>',
    props: ['value']
  }
}))

vi.mock('primevue/tabpanels', () => ({
  default: {
    name: 'TabPanels',
    template: '<div class="p-tabpanels"><slot /></div>'
  }
}))

vi.mock('primevue/tabpanel', () => ({
  default: {
    name: 'TabPanel',
    template: '<div class="p-tabpanel"><slot /></div>',
    props: ['value']
  }
}))

// Mock close icon
vi.mock('@/components/Icons/basic/close.svg', () => ({
  default: 'close-icon.svg'
}))

describe('Tabs', () => {
  const mockTabContents: TabContent[] = [
    {
      id: 'tab1',
      label: 'Tab 1',
      content: 'Content 1',
      canClose: false
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      content: 'Content 2',
      canClose: true
    },
    {
      id: 'tab3',
      label: 'Tab 3',
      content: 'Content 3',
      direction: 'column'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API Compatibility', () => {
    it('should accept tabContents prop', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      expect(wrapper.props('tabContents')).toEqual(mockTabContents)
    })

    it('should accept modelValue prop', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents,
          modelValue: 'tab2'
        }
      })

      expect(wrapper.props('modelValue')).toBe('tab2')
    })

    it('should emit update:modelValue when tab changes', async () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents,
          modelValue: 'tab1'
        }
      })

      // Simulate internal value change
      await wrapper.vm.$nextTick()
      wrapper.vm.internalValue = 'tab2'
      await nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tab2'])
    })

    it('should emit close event when close button is clicked', async () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      // Find and click close button
      const closeButton = wrapper.find('.close-icon')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')?.[0]).toEqual(['tab2'])
    })

    it('should emit tab-click event when tab is clicked', async () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      const mockEvent = {
        originalEvent: new Event('click'),
        value: 'tab2'
      }

      await wrapper.vm.handleTabClick(mockEvent)

      expect(wrapper.emitted('tab-click')).toBeTruthy()
      const emittedEvent = wrapper.emitted('tab-click')?.[0]?.[0] as any
      expect(emittedEvent.index).toBe(1)
      expect(emittedEvent.tab).toEqual(mockTabContents[1])
    })
  })

  describe('Rendering', () => {
    it('should render all tabs', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      const tabs = wrapper.findAll('.p-tab')
      expect(tabs).toHaveLength(3)
    })

    it('should render tab labels correctly', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      const labels = wrapper.findAll('.tab-label-container span')
      expect(labels[0].text()).toBe('Tab 1')
      expect(labels[1].text()).toBe('Tab 2')
      expect(labels[2].text()).toBe('Tab 3')
    })

    it('should render close button only for closable tabs', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      const closeButtons = wrapper.findAll('.close-icon')
      expect(closeButtons).toHaveLength(1) // Only tab2 has canClose: true
    })

    it('should render tab content correctly', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      const panels = wrapper.findAll('.p-tabpanel')
      expect(panels).toHaveLength(3)
      expect(panels[0].text()).toContain('Content 1')
      expect(panels[1].text()).toContain('Content 2')
      expect(panels[2].text()).toContain('Content 3')
    })
  })

  describe('Styling', () => {
    it('should apply correct label styles based on direction', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      // Check row direction (default)
      const rowStyle = wrapper.vm.getLabelStyle(mockTabContents[0])
      expect(rowStyle.flexDirection).toBe('row')
      expect(rowStyle.fontSize).toBe('16px')

      // Check column direction
      const columnStyle = wrapper.vm.getLabelStyle(mockTabContents[2])
      expect(columnStyle.flexDirection).toBe('column')
      expect(columnStyle.fontSize).toBe('8px')
    })

    it('should merge classes correctly', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents,
          class: 'custom-class',
          tabPosition: 'bottom'
        }
      })

      const mergedClasses = wrapper.vm.mergedClasses
      expect(mergedClasses).toContain('custom-class')
      expect(mergedClasses).toContain('tabs-bottom')
    })

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' }
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents,
          style: customStyle
        }
      })

      const mergedStyle = wrapper.vm.mergedStyle
      expect(mergedStyle.backgroundColor).toBe('red')
      expect(mergedStyle.borderRadius).toBe('16px') // Default style should be preserved
    })
  })

  describe('Accessibility', () => {
    it('should accept data-testid attribute', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents,
          'data-testid': 'test-tabs'
        }
      })

      // Component should accept the prop without errors
      expect(wrapper.exists()).toBe(true)
    })

    it('should support keyboard navigation through exposed methods', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      // Test exposed methods exist
      expect(typeof wrapper.vm.focus).toBe('function')
      expect(typeof wrapper.vm.blur).toBe('function')
    })
  })

  describe('Initialization', () => {
    it('should initialize with first tab when no modelValue provided', async () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.internalValue).toBe('tab1')
    })

    it('should initialize with provided modelValue', async () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents,
          modelValue: 'tab2'
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.internalValue).toBe('tab2')
    })
  })

  describe('Dynamic Tab Management', () => {
    it('should handle tab content updates', async () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: mockTabContents
        }
      })

      const newTabContents = [
        ...mockTabContents,
        { id: 'tab4', label: 'Tab 4', content: 'Content 4' }
      ]

      await wrapper.setProps({ tabContents: newTabContents })

      const tabs = wrapper.findAll('.p-tab')
      expect(tabs).toHaveLength(4)
    })

    it('should handle empty tab contents', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabContents: []
        }
      })

      const tabs = wrapper.findAll('.p-tab')
      expect(tabs).toHaveLength(0)
    })
  })
})