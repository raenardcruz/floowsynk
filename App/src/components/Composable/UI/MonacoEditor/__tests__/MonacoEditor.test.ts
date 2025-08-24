import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MonacoEditor from '../MonacoEditor.vue'

// Mock monaco-editor
vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn(() => ({
      getValue: vi.fn(() => 'test value'),
      onDidChangeModelContent: vi.fn(),
      dispose: vi.fn(),
      getModel: vi.fn(() => ({
        getFullModelRange: vi.fn(),
        pushEditOperations: vi.fn()
      }))
    })),
    defineTheme: vi.fn()
  },
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
    CompletionItemKind: {
      Variable: 1,
      Snippet: 2
    }
  },
  Range: vi.fn()
}))

describe('MonacoEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render editor container', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'test code',
        variables: ['var1', 'var2']
      }
    })
    
    expect(wrapper.find('.editor-container').exists()).toBe(true)
  })

  it('should accept required props', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'test code',
        variables: ['var1', 'var2']
      }
    })
    
    expect(wrapper.props('modelValue')).toBe('test code')
    expect(wrapper.props('variables')).toEqual(['var1', 'var2'])
  })

  it('should accept disabled prop', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'test code',
        variables: ['var1', 'var2'],
        disabled: true
      }
    })
    
    expect(wrapper.props('disabled')).toBe(true)
  })

  it('should have proper CSS styling', () => {
    const wrapper = mount(MonacoEditor, {
      props: {
        modelValue: 'test code',
        variables: []
      }
    })
    
    const container = wrapper.find('.editor-container')
    expect(container.exists()).toBe(true)
  })
})