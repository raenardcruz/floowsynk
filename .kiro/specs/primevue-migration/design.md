# Design Document

## Overview

This design outlines the systematic migration of FloowSynk's custom UI components to PrimeVue components. The migration will maintain existing functionality while leveraging PrimeVue's comprehensive component library, theming system, and accessibility features. Where PrimeVue components are overly complex for simple use cases, we'll create simplified wrapper components that provide sensible defaults while still allowing access to advanced features.

## Architecture

### Migration Strategy

The migration follows a **component-by-component replacement strategy** with the following principles:

1. **Direct Replacement**: Simple components that map directly to PrimeVue equivalents
2. **Wrapper Creation**: Complex PrimeVue components get simplified wrappers with sensible defaults
3. **Gradual Migration**: Components are migrated incrementally to minimize disruption
4. **Backward Compatibility**: Maintain existing APIs where possible during transition

### Component Mapping Analysis

Based on the current component structure, here's the migration mapping:

#### Direct PrimeVue Replacements
- **TextInput** → `InputText` with `FloatLabel`
- **PasswordInput** → `Password` component
- **Select** → `Select` or `Dropdown` component
- **Checkbox** → `Checkbox` component
- **Loading** → `ProgressSpinner` component
- **Table Components** → `DataTable` with custom columns

#### Wrapper Components Needed
- **Button** → Simplified `Button` wrapper (PrimeVue Button has many options)
- **Modal** → Simplified `Dialog` wrapper (PrimeVue Dialog is feature-rich)
- **Sidebar** → Simplified `Sidebar` wrapper with drawer functionality
- **Tabs** → Simplified `TabView` wrapper
- **Notif** → Simplified `Toast` wrapper with notification management

#### Custom Components to Maintain
- **MonacoEditor** → Keep as-is (specialized code editor)
- **Collapsible** → Evaluate against `Accordion` or keep custom

## Components and Interfaces

### 1. Wrapper Component Architecture

Each wrapper component follows this structure:

```typescript
// Component structure
WrapperComponent/
├── WrapperComponent.vue          # Main wrapper component
├── WrapperComponent.types.ts     # TypeScript interfaces
├── WrapperComponent.config.ts    # Default configurations
└── index.ts                      # Exports
```

#### Base Wrapper Interface
```typescript
interface BaseWrapperProps {
  // Common props that all wrappers should support
  id?: string
  class?: string | object | Array<string | object>
  style?: string | object
  disabled?: boolean
}

interface WrapperComponent<T = any> {
  // Expose the underlying PrimeVue component instance
  primevueRef: Ref<T>
  // Simplified API methods
  focus?: () => void
  blur?: () => void
  // Component-specific methods
}
```

### 2. Button Wrapper Design

```typescript
interface ButtonWrapperProps extends BaseWrapperProps {
  label?: string
  icon?: string
  iconPos?: 'left' | 'right'
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'text'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  outlined?: boolean
  text?: boolean
  raised?: boolean
}
```

**PrimeVue Mapping:**
- Maps `variant` to PrimeVue's `severity` prop
- Provides sensible defaults for `raised`, `rounded`, etc.
- Simplifies the 20+ PrimeVue Button props to ~10 commonly used ones

### 3. Modal Wrapper Design

```typescript
interface ModalWrapperProps extends BaseWrapperProps {
  visible: boolean
  title?: string
  width?: string
  height?: string
  modal?: boolean
  closable?: boolean
  showHeader?: boolean
  showFooter?: boolean
}
```

**PrimeVue Mapping:**
- Wraps PrimeVue `Dialog` component
- Provides default header/footer layouts
- Simplifies positioning and sizing options
- Maintains existing modal behavior patterns

### 4. Input Wrapper Design

```typescript
interface InputWrapperProps extends BaseWrapperProps {
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  invalid?: boolean
  variant?: 'filled' | 'outlined'
}
```

**PrimeVue Mapping:**
- Combines `InputText` with `FloatLabel` automatically
- Provides consistent validation styling
- Maintains existing form integration patterns

## Data Models

### Theme Integration

```typescript
interface ThemeConfig {
  // PrimeVue theme configuration
  theme: {
    preset: 'Aura' | 'Lara' | 'Nora' // PrimeVue preset themes
    options: {
      darkModeSelector: '.dark-mode'
      cssLayer: {
        name: 'primevue'
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  }
  // Custom CSS variables for brand colors
  customProperties: {
    '--primary-color': string
    '--secondary-color': string
    // ... other brand colors
  }
}
```

### Component Registry

```typescript
interface ComponentRegistry {
  // Maps old component names to new wrapper components
  mappings: Record<string, {
    component: Component
    props?: Record<string, any>
    deprecated?: boolean
    migrationNotes?: string
  }>
}
```

## Error Handling

### Migration Error Handling

1. **Component Not Found Errors**
   - Provide clear error messages when old components are referenced
   - Include migration suggestions in error messages
   - Maintain fallback components during transition

2. **Prop Validation Errors**
   - Validate wrapper component props against expected interfaces
   - Provide warnings for deprecated prop usage
   - Auto-migrate simple prop name changes where possible

3. **Theme Compatibility Errors**
   - Detect CSS conflicts between old and new components
   - Provide theme migration utilities
   - Warn about unsupported CSS custom properties

### Runtime Error Recovery

```typescript
// Error boundary for component migration
const ComponentMigrationBoundary = {
  errorCaptured(err: Error, instance: ComponentInternalInstance, info: string) {
    if (err.message.includes('component not found')) {
      // Log migration error and provide fallback
      console.warn(`Component migration needed: ${info}`)
      return false // Don't propagate error
    }
    return true // Propagate other errors
  }
}
```

## Testing Strategy

### 1. Component Compatibility Testing

```typescript
// Test suite structure for each migrated component
describe('ComponentWrapper', () => {
  describe('API Compatibility', () => {
    it('should accept all legacy props')
    it('should emit expected events')
    it('should maintain ref functionality')
  })
  
  describe('Visual Regression', () => {
    it('should match previous visual appearance')
    it('should handle responsive behavior')
    it('should support theme variations')
  })
  
  describe('Accessibility', () => {
    it('should maintain ARIA attributes')
    it('should support keyboard navigation')
    it('should work with screen readers')
  })
})
```

### 2. Integration Testing

- **Form Integration**: Ensure wrapped inputs work with existing form validation
- **Router Integration**: Verify navigation components work with Vue Router
- **State Management**: Test component state management with existing patterns
- **Event Handling**: Validate event propagation and handling

### 3. Performance Testing

- **Bundle Size**: Compare bundle sizes before/after migration
- **Runtime Performance**: Measure component render times
- **Memory Usage**: Monitor memory consumption of new components
- **Tree Shaking**: Verify unused PrimeVue components are excluded

## Implementation Phases

### Phase 1: Foundation Setup
1. Install and configure PrimeVue with theme system
2. Create base wrapper interfaces and utilities
3. Set up component registry and migration helpers
4. Establish testing framework for migration

### Phase 2: Core Component Migration
1. **Inputs**: TextInput, PasswordInput, Select, Checkbox
2. **Buttons**: Button, PrimaryButton
3. **Layout**: Modal, Sidebar
4. **Feedback**: Loading, Notif

### Phase 3: Advanced Component Migration
1. **Data Display**: Table components
2. **Navigation**: Tabs
3. **Complex Inputs**: KeyValue, ListField, TextCodeInput
4. **Specialized**: Collapsible evaluation

### Phase 4: Integration and Cleanup
1. Update all component imports throughout the application
2. Remove unused custom components
3. Optimize theme integration
4. Performance optimization and bundle analysis

## Migration Utilities

### Component Migration Helper

```typescript
// Utility to help with component migration
export const createMigrationWrapper = <T extends Component>(
  primevueComponent: T,
  defaultProps: Partial<ComponentProps<T>>,
  propMappings?: Record<string, string>
) => {
  return defineComponent({
    name: `${primevueComponent.name}Wrapper`,
    props: {
      // Wrapper-specific props
    },
    setup(props, { slots, attrs, emit }) {
      // Map wrapper props to PrimeVue props
      // Handle deprecated props with warnings
      // Provide sensible defaults
      
      return () => h(primevueComponent, mappedProps, slots)
    }
  })
}
```

### Theme Migration Utility

```typescript
// Utility to migrate CSS custom properties
export const migrateThemeProperties = (
  oldProperties: Record<string, string>,
  mappings: Record<string, string>
): Record<string, string> => {
  // Convert old CSS custom properties to PrimeVue theme tokens
}
```

This design ensures a systematic, maintainable approach to migrating from custom components to PrimeVue while preserving functionality and improving the overall developer experience.