/**
 * Tests for component registry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent } from 'vue'
import {
  registerComponent,
  getComponent,
  hasComponent,
  listComponents,
  clearRegistry,
  getDeprecatedComponents
} from '../registry'

// Mock console.log for testing
vi.mock('console', () => ({
  log: vi.fn()
}))

describe('Component Registry', () => {
  beforeEach(() => {
    clearRegistry()
  })

  describe('registerComponent', () => {
    it('should register a component', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>'
      })

      registerComponent('OldComponent', {
        component: TestComponent,
        deprecated: false
      })

      expect(hasComponent('OldComponent')).toBe(true)
    })

    it('should store original name in entry', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>'
      })

      registerComponent('OldComponent', {
        component: TestComponent,
        deprecated: false
      })

      const entry = getComponent('OldComponent')
      expect(entry?.originalName).toBe('OldComponent')
    })
  })

  describe('getComponent', () => {
    it('should return component entry', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>'
      })

      const entry = {
        component: TestComponent,
        deprecated: false,
        migrationNotes: 'Test notes'
      }

      registerComponent('OldComponent', entry)
      
      const retrieved = getComponent('OldComponent')
      expect(retrieved?.component).toStrictEqual(TestComponent)
      expect(retrieved?.migrationNotes).toBe('Test notes')
    })

    it('should return null for unregistered component', () => {
      const result = getComponent('NonExistentComponent')
      expect(result).toBeNull()
    })
  })

  describe('hasComponent', () => {
    it('should return true for registered component', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>'
      })

      registerComponent('OldComponent', {
        component: TestComponent,
        deprecated: false
      })

      expect(hasComponent('OldComponent')).toBe(true)
    })

    it('should return false for unregistered component', () => {
      expect(hasComponent('NonExistentComponent')).toBe(false)
    })
  })

  describe('listComponents', () => {
    it('should return list of registered component names', () => {
      const TestComponent1 = defineComponent({
        name: 'TestComponent1',
        template: '<div>Test1</div>'
      })
      
      const TestComponent2 = defineComponent({
        name: 'TestComponent2',
        template: '<div>Test2</div>'
      })

      registerComponent('OldComponent1', {
        component: TestComponent1,
        deprecated: false
      })
      
      registerComponent('OldComponent2', {
        component: TestComponent2,
        deprecated: false
      })

      const components = listComponents()
      expect(components).toContain('OldComponent1')
      expect(components).toContain('OldComponent2')
      expect(components).toHaveLength(2)
    })
  })

  describe('getDeprecatedComponents', () => {
    it('should return only deprecated components', () => {
      const TestComponent1 = defineComponent({
        name: 'TestComponent1',
        template: '<div>Test1</div>'
      })
      
      const TestComponent2 = defineComponent({
        name: 'TestComponent2',
        template: '<div>Test2</div>'
      })

      registerComponent('OldComponent1', {
        component: TestComponent1,
        deprecated: true
      })
      
      registerComponent('OldComponent2', {
        component: TestComponent2,
        deprecated: false
      })

      const deprecated = getDeprecatedComponents()
      expect(Object.keys(deprecated)).toContain('OldComponent1')
      expect(Object.keys(deprecated)).not.toContain('OldComponent2')
    })
  })

  describe('clearRegistry', () => {
    it('should clear all registered components', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        template: '<div>Test</div>'
      })

      registerComponent('OldComponent', {
        component: TestComponent,
        deprecated: false
      })

      expect(hasComponent('OldComponent')).toBe(true)
      
      clearRegistry()
      
      expect(hasComponent('OldComponent')).toBe(false)
      expect(listComponents()).toHaveLength(0)
    })
  })
})