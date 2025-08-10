# FloowSynk UI Component Library

This directory contains the FloowSynk UI component library, which has been migrated to use PrimeVue components with simplified wrapper APIs. The library provides a consistent, accessible, and maintainable set of UI components.

## Migration Status: ✅ COMPLETED

All components have been successfully migrated to PrimeVue wrappers with simplified APIs that maintain backward compatibility.

## Structure

```
UI/
├── Buttons/             # Button components (PrimeVue Button wrappers)
├── Inputs/              # Input components (PrimeVue input wrappers)
├── Modal/               # Modal component (PrimeVue Dialog wrapper)
├── Sidebar/             # Sidebar component (PrimeVue Sidebar wrapper)
├── Loading/             # Loading component (PrimeVue ProgressSpinner wrapper)
├── Notif/               # Notification component (PrimeVue Toast wrapper)
├── Tabs/                # Tabs component (PrimeVue TabView wrapper)
├── Table/               # Table component (PrimeVue DataTable wrapper)
├── Collapsible/         # Collapsible component (maintained as custom)
├── MonacoEditor/        # Monaco Editor (maintained as specialized component)
├── composables/         # Vue composables for component functionality
├── migration/           # Migration utilities and component registry
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # CSS and theme system
└── index.ts            # Main exports
```

## Key Features

### 1. PrimeVue Integration
- All components use PrimeVue as the underlying implementation
- Simplified wrapper APIs with sensible defaults
- Maintains backward compatibility with existing component APIs
- Full access to PrimeVue features when needed

### 2. Component Categories

#### Input Components ✅ MIGRATED
- **TextInput**: PrimeVue InputText with FloatLabel
- **PasswordInput**: PrimeVue Password component
- **Select**: PrimeVue Select/Dropdown component
- **Checkbox**: PrimeVue Checkbox component
- **KeyValue**: Enhanced key-value pair functionality
- **ListField**: Enhanced list management with protocol buffer compatibility
- **TextCodeInput**: Monaco Editor integration for code editing

#### Button Components ✅ MIGRATED
- **Button**: PrimeVue Button wrapper with variant mapping
- **PrimaryButton**: Extends Button wrapper with primary styling

#### Layout Components ✅ MIGRATED
- **Modal**: PrimeVue Dialog wrapper with simplified API
- **Sidebar**: PrimeVue Sidebar wrapper with drawer functionality

#### Feedback Components ✅ MIGRATED
- **Loading**: PrimeVue ProgressSpinner wrapper
- **Notif**: PrimeVue Toast wrapper with notification management

#### Navigation Components ✅ MIGRATED
- **Tabs**: PrimeVue TabView wrapper with simplified API

#### Data Components ✅ MIGRATED
- **Table**: PrimeVue DataTable wrapper with column configuration

#### Specialized Components ✅ EVALUATED
- **Collapsible**: Maintained as custom (optimal for use case)
- **MonacoEditor**: Maintained as specialized component (fully compatible)

### 3. Theme System
- PrimeVue Aura preset theme
- CSS custom properties integration
- Consistent design system
- Dark/light mode support

### 4. Migration Utilities
- Component registry system for mapping old to new components
- Migration wrapper utilities
- Theme integration helpers
- Deprecation warning system

## Usage Examples

### Basic Component Usage
```vue
<template>
  <!-- Input Components -->
  <TextInput v-model="name" label="Full Name" required />
  <PasswordInput v-model="password" label="Password" />
  <Select v-model="country" :options="countries" label="Country" />
  <Checkbox v-model="agreed" label="I agree to the terms" />

  <!-- Button Components -->
  <Button @click="handleClick" label="Click Me" variant="primary" />
  <PrimaryButton @click="handleSubmit" label="Submit" :loading="isLoading" />

  <!-- Layout Components -->
  <Modal v-model="showModal" title="Confirmation">
    <p>Are you sure you want to proceed?</p>
  </Modal>

  <!-- Feedback Components -->
  <Loading v-if="isLoading" />
  <Notif ref="notifRef" />

  <!-- Data Components -->
  <Table :data="users" :columns="userColumns" />
</template>

<script setup>
import { 
  TextInput, PasswordInput, Select, Checkbox,
  Button, PrimaryButton,
  Modal, Loading, Notif, Table
} from '@/components/Composable/UI'
</script>
```

### Advanced Usage with PrimeVue Features
```vue
<template>
  <!-- Access underlying PrimeVue component -->
  <Button 
    ref="buttonRef"
    @click="handleAdvancedClick"
    label="Advanced Button"
    :pt="{ root: { class: 'custom-button' } }"
  />
</template>

<script setup>
import { Button } from '@/components/Composable/UI'

const buttonRef = ref()

const handleAdvancedClick = () => {
  // Access PrimeVue Button instance
  const primeButton = buttonRef.value.primevueRef
  // Use PrimeVue methods or properties
}
</script>
```

### Migration Utilities
```typescript
import { 
  registerComponent, 
  getComponent, 
  createMigrationWrapper 
} from '@/components/Composable/UI'

// Register a custom component mapping
registerComponent('CustomButton', {
  component: MyCustomButton,
  deprecated: false,
  migrationNotes: 'Custom button with special functionality'
})

// Get a component from the registry
const buttonComponent = getComponent('Button')
```

## PrimeVue Theme Integration

The component library integrates with PrimeVue's theming system:

### Theme Configuration
- **Preset**: Aura (PrimeVue's modern design system)
- **CSS Layers**: Proper layer ordering for theme consistency
- **Custom Properties**: Integration with existing CSS variables
- **Dark Mode**: Automatic dark mode support

### Available Themes
- **Light Mode**: Default Aura light theme
- **Dark Mode**: Aura dark theme with automatic detection
- **Custom Properties**: Brand colors and spacing maintained

### CSS Layer Structure
```css
@layer tailwind-base, primevue, tailwind-utilities;
```

## TypeScript Support

All components and utilities are fully typed with TypeScript:
- **Component Props**: Comprehensive interface definitions for all wrapper components
- **PrimeVue Integration**: Proper typing for underlying PrimeVue components
- **Migration Utilities**: Type-safe component registry and wrapper creation
- **IDE Support**: Full autocomplete and error checking

### Example Type Definitions
```typescript
interface ButtonWrapperProps extends BaseWrapperProps {
  label?: string
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
}

interface WrapperComponent<T = any> {
  primevueRef: Ref<T>
  focus?: () => void
  blur?: () => void
}
```

## Migration Benefits

### ✅ Achieved Goals
1. **Consistency**: All components now use PrimeVue design system
2. **Maintainability**: Reduced custom code maintenance burden
3. **Accessibility**: Enhanced accessibility through PrimeVue components
4. **Performance**: Optimized bundle size through tree shaking
5. **Developer Experience**: Simplified APIs with full TypeScript support
6. **Future-Proof**: Benefits from PrimeVue updates and community support

### 📊 Migration Statistics
- **Components Migrated**: 12 core components
- **Wrapper Components Created**: 8 simplified wrappers
- **Custom Components Maintained**: 2 (Collapsible, MonacoEditor)
- **Bundle Size Impact**: Optimized through tree shaking
- **Breaking Changes**: None (backward compatibility maintained)

## Documentation

For detailed migration information, see:
- **Requirements**: `.kiro/specs/primevue-migration/requirements.md`
- **Design**: `.kiro/specs/primevue-migration/design.md`
- **Implementation Plan**: `.kiro/specs/primevue-migration/tasks.md`
- **Component Analysis**: Individual component analysis files

## Support

For questions or issues with the migrated components:
1. Check the component's TypeScript interface for available props
2. Review the migration notes in the component registry
3. Consult PrimeVue documentation for advanced features
4. See migration utilities in `App/src/components/Composable/UI/migration/`