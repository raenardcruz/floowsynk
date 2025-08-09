/**
 * Tests for migration utilities
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent } from 'vue'
import { 
  createMigrationWrapper, 
  migrateThemeProperties,
  mergeComponentClasses,
  extractEventHandlers
} from '../utils'

describe('Migration Utils', () => {
  describe('createMigrationWrapper', () => {
    it('should create a wrapper component', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: ['label'],
        template: '<div>{{ label }}</div>'
      })

      const wrapper = createMigrationWrapper(TestComponent, { label: 'default' })
      
      expect(wrapper.name).toBe('TestComponentWrapper')
    })

    it('should apply default props', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        props: ['label', 'size'],
        template: '<div>{{ label }} - {{ size }}</div>'
      })

      const defaultProps = { size: 'medium' }
      const wrapper = createMigrationWrapper(TestComponent, defaultProps)
      
      expect(wrapper).toBeDefined()
    })
  })

  describe('migrateThemeProperties', () => {
    it('should migrate CSS custom properties', () => {
      const oldProperties = {
        '--color-primary': '#14376B',
        '--color-secondary': '#374151'
      }
      
      const mappings = {
        '--color-primary': '--p-primary-color',
        '--color-secondary': '--p-surface-600'
      }
      
      const result = migrateThemeProperties(oldProperties, mappings)
      
      expect(result).toEqual({
        '--p-primary-color': '#14376B',
        '--p-surface-600': '#374151'
      })
    })

    it('should preserve unmapped properties', () => {
      const oldProperties = {
        '--color-primary': '#14376B',
        '--color-custom': '#123456'
      }
      
      const mappings = {
        '--color-primary': '--p-primary-color'
      }
      
      const result = migrateThemeProperties(oldProperties, mappings)
      
      expect(result).toEqual({
        '--p-primary-color': '#14376B',
        '--color-custom': '#123456'
      })
    })
  })

  describe('mergeComponentClasses', () => {
    it('should merge string classes', () => {
      const result = mergeComponentClasses('wrapper-class', 'primevue-class')
      expect(result).toBe('wrapper-class primevue-class')
    })

    it('should handle array classes', () => {
      const result = mergeComponentClasses(['wrapper-class'], 'primevue-class')
      expect(result).toEqual(['wrapper-class', 'primevue-class'])
    })

    it('should handle undefined classes', () => {
      expect(mergeComponentClasses(undefined, 'primevue-class')).toBe('primevue-class')
      expect(mergeComponentClasses('wrapper-class', undefined)).toBe('wrapper-class')
      expect(mergeComponentClasses(undefined, undefined)).toBeUndefined()
    })
  })

  describe('extractEventHandlers', () => {
    it('should extract event handlers from attributes', () => {
      const attrs = {
        'onClick': vi.fn(),
        'onInput': vi.fn(),
        'class': 'test-class',
        'id': 'test-id'
      }
      
      const { events, otherAttrs } = extractEventHandlers(attrs)
      
      expect(Object.keys(events)).toEqual(['onClick', 'onInput'])
      expect(Object.keys(otherAttrs)).toEqual(['class', 'id'])
    })

    it('should handle empty attributes', () => {
      const { events, otherAttrs } = extractEventHandlers({})
      
      expect(events).toEqual({})
      expect(otherAttrs).toEqual({})
    })
  })
})