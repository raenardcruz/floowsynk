import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FloowsynkNode from '../FloowsynkNode.vue'
import { nodeFromObject } from '@/components/Composable/protoTransformers'

import { ref, reactive } from 'vue'

const { hoistedRefs, localStorageMock } = vi.hoisted(() => {
  const store: Record<string, string> = {}
  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { for (const k in store) delete store[k] }
  }
  return {
    hoistedRefs: {
      mockCommit: vi.fn(),
      isRunning: { value: false },
      hadOpenModalSidebar: { value: false },
      activeInspectorNodeId: { value: null },
      draggedNode: { value: null },
      connectionsList: { value: [] },
      templatesList: { value: [] },
      tab: { value: { id: 'test-tab', nodesList: [] } },
      mockCurrentNode: { id: '', nodetype: '', label: '', selected: false, data: {} }
    },
    localStorageMock: mockStorage
  }
})

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock PrimeVue and services
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() })
}))

vi.mock('@/views/Connectors/Connectors.api', () => ({
  useConnectorCatalog: () => ({
    connectionsList: hoistedRefs.connectionsList,
    templatesList: hoistedRefs.templatesList,
    fetchConnectorCatalog: vi.fn()
  })
}))

vi.mock('@/views/Workflow/Sidebar/Canvas/Workflow.Sidebar.Canvas.hooks', () => ({
  useSidebarCanvasStore: () => ({
    draggedNode: hoistedRefs.draggedNode
  })
}))

vi.mock('@/views/Workflow/Canvas/Workflow.Canvas.hooks', () => ({
  useWorkflowCanvasStore: () => ({
    isRunning: hoistedRefs.isRunning,
    hadOpenModalSidebar: hoistedRefs.hadOpenModalSidebar,
    activeInspectorNodeId: hoistedRefs.activeInspectorNodeId
  }),
  useWorkflowCanvasHooks: () => ({
    commit: hoistedRefs.mockCommit,
    tab: hoistedRefs.tab
  })
}))

vi.mock('@vue-flow/core', async () => {
  const actual = await vi.importActual<any>('@vue-flow/core')
  return {
    ...actual,
    useNode: () => ({
      node: hoistedRefs.mockCurrentNode
    })
  }
})

describe('FloowsynkNode Resizer & Drag Prevention', () => {
  it('renders NodeResizer inside stickyNote and has nodrag on inputs', () => {
    Object.assign(hoistedRefs.mockCurrentNode, {
      id: 'sticky-1',
      nodetype: 'stickyNote',
      label: 'Sticky Note',
      selected: false,
      data: {
        name: 'My Note',
        message: 'Some note text',
        template: '#fef08a'
      }
    })

    const wrapper = mount(FloowsynkNode, {
      props: {
        id: 'sticky-1',
        tabid: 'test-tab',
        type: 'default',
        selected: false,
        connectable: true,
        position: { x: 0, y: 0 },
        data: hoistedRefs.mockCurrentNode.data
      }
    })

    const stickyNode = wrapper.find('.sticky-note-node')
    expect(stickyNode.exists()).toBe(true)

    // NodeResizer controls should exist
    const resizerControls = wrapper.findAll('.vue-flow__resize-control')
    expect(resizerControls.length).toBeGreaterThan(0)
    // Every resize control should have nodrag
    for (const control of resizerControls) {
      expect(control.classes()).toContain('nodrag')
    }

    // Input and textarea should have nodrag
    const titleInput = wrapper.find('.sticky-title-input')
    expect(titleInput.classes()).toContain('nodrag')

    const textarea = wrapper.find('.sticky-textarea')
    expect(textarea.classes()).toContain('nodrag')
  })

  it('renders NodeResizer inside visualGroup and has nodrag on inputs', () => {
    Object.assign(hoistedRefs.mockCurrentNode, {
      id: 'group-1',
      nodetype: 'visualGroup',
      label: 'Visual Group',
      selected: true,
      data: {
        name: 'My Group',
        message: 'Group description'
      }
    })

    const wrapper = mount(FloowsynkNode, {
      props: {
        id: 'group-1',
        tabid: 'test-tab',
        type: 'default',
        selected: true,
        connectable: true,
        position: { x: 0, y: 0 },
        data: hoistedRefs.mockCurrentNode.data
      }
    })

    const groupNode = wrapper.find('.visual-group-node')
    expect(groupNode.exists()).toBe(true)

    // NodeResizer controls should exist and have nodrag
    const resizerControls = wrapper.findAll('.vue-flow__resize-control')
    expect(resizerControls.length).toBeGreaterThan(0)
    for (const control of resizerControls) {
      expect(control.classes()).toContain('nodrag')
    }

    // Input fields should have nodrag
    const groupTitle = wrapper.find('.visual-group-title')
    expect(groupTitle.classes()).toContain('nodrag')

    const groupDesc = wrapper.find('.visual-group-desc')
    expect(groupDesc.classes()).toContain('nodrag')
  })

  it('preserves dimensions during serialization in protoTransformers', () => {
    const nodeObj = {
      id: 'node-resize-test',
      nodetype: 'stickyNote',
      label: 'Sticky Note',
      position: { x: 100, y: 200 },
      dimensions: { width: 350, height: 260 },
      data: {}
    }

    const protoNode = nodeFromObject(nodeObj)
    const dims = protoNode.getDimensions()
    expect(dims).toBeDefined()
    expect(dims?.getWidth()).toBe(350)
    expect(dims?.getHeight()).toBe(260)
  })

  it('falls back to extracting dimensions from style if dimensions object is absent', () => {
    const nodeObj = {
      id: 'node-style-fallback',
      nodetype: 'visualGroup',
      label: 'Visual Group',
      position: { x: 50, y: 50 },
      style: { width: '420px', height: '280px' },
      data: {}
    }

    const protoNode = nodeFromObject(nodeObj)
    const dims = protoNode.getDimensions()
    expect(dims).toBeDefined()
    expect(dims?.getWidth()).toBe(420)
    expect(dims?.getHeight()).toBe(280)
  })
})
