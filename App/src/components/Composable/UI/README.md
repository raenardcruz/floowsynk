# VueUse Integration and Base Infrastructure

This directory contains the base infrastructure for the PrimeVue to VueUse migration, including composables, types, utilities, and theme system.

## Structure

```
UI/
├── composables/          # VueUse-based composables
│   ├── useTheme.ts      # Theme management
│   ├── useFormValidation.ts # Form validation
│   ├── useModal.ts      # Modal management
│   ├── useComponentError.ts # Error handling
│   └── index.ts         # Composables exports
├── types/               # TypeScript type definitions
│   ├── base.ts         # Base component interfaces
│   └── index.ts        # Types exports
├── utils/               # Utility functions
│   ├── component.ts    # Component utilities
│   └── index.ts        # Utils exports
├── styles/              # CSS and theme system
│   └── theme.css       # CSS custom properties theme
└── index.ts            # Main exports
```

## Key Features

### 1. Theme System
- CSS custom properties for consistent theming
- Light/dark mode support with system preference detection
- Persistent theme preferences in localStorage
- Automatic theme application to document

### 2. Form Validation
- Field-level and form-level validation
- Built-in validation rules (required, email, minLength, etc.)
- Reactive validation state management
- Touch and dirty state tracking

### 3. Modal Management
- Modal state management with VueUse integration
- Keyboard navigation (ESC to close)
- Outside click handling
- Scroll locking
- Focus management

### 4. Error Handling
- Component-level error management
- Automatic error clearing with timeout
- Global error handling setup
- Async operation error wrapping

### 5. Component Utilities
- CSS class generation helpers
- Component state management
- ID generation
- Common utility functions

## Usage Examples

### Theme Management
```typescript
import { useTheme } from '@/components/Composable/UI'

const { currentTheme, isDark, toggleTheme, setLightTheme } = useTheme()
```

### Form Validation
```typescript
import { useFormValidation, validationRules } from '@/components/Composable/UI'

const form = useFormValidation(
  { email: '', password: '' },
  {
    email: [validationRules.required(), validationRules.email()],
    password: [validationRules.required(), validationRules.minLength(6)]
  }
)
```

### Modal Management
```typescript
import { useModal } from '@/components/Composable/UI'

const modal = useModal({
  closeOnEscape: true,
  closeOnOutsideClick: true,
  lockScroll: true
})
```

## CSS Custom Properties

The theme system provides a comprehensive set of CSS custom properties:

- **Colors**: `--color-primary`, `--color-secondary`, etc.
- **Spacing**: `--spacing-xs` through `--spacing-3xl`
- **Border Radius**: `--radius-sm` through `--radius-full`
- **Shadows**: `--shadow-sm` through `--shadow-xl`
- **Typography**: Font sizes, weights, and line heights
- **Component Sizes**: Button and input heights
- **Transitions**: Standard transition durations
- **Z-index**: Layering scale for modals, tooltips, etc.

## TypeScript Support

All composables and utilities are fully typed with TypeScript, providing:
- Comprehensive interface definitions
- Generic type support for form validation
- Proper return type inference
- IDE autocomplete and error checking

## VueUse Integration

This infrastructure leverages VueUse composables for:
- State management (`useStorage`, `useToggle`)
- Browser APIs (`usePreferredDark`, `useClipboard`)
- DOM utilities (`useElementSize`, `onClickOutside`)
- Sensors (`useMouse`, `useScroll`)
- Animation (`useTransition`, `useTimeout`)
- Form handling (`useVModel`)
- Focus management (`useFocus`)

## Next Steps

With this base infrastructure in place, you can now:
1. Create custom components that extend the base interfaces
2. Use the theme system for consistent styling
3. Leverage the composables for common functionality
4. Build upon the validation system for forms
5. Use the modal system for overlays and dialogs