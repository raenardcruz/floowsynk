/**
 * Input Components - PrimeVue Wrappers
 * 
 * All input components have been migrated to use PrimeVue input components as the underlying
 * implementation with simplified wrapper APIs that maintain backward compatibility.
 * 
 * Migration Status: ✅ COMPLETED
 * - TextInput: Migrated to PrimeVue InputText with FloatLabel
 * - PasswordInput: Migrated to PrimeVue Password component
 * - Select: Migrated to PrimeVue Select/Dropdown component
 * - Checkbox: Migrated to PrimeVue Checkbox component
 * - KeyValue: Migrated with enhanced key-value pair functionality
 * - ListField: Migrated with enhanced list management and protocol buffer compatibility
 * - TextCodeInput: Migrated with Monaco Editor integration for code editing
 * 
 * Features:
 * - Consistent validation and error handling
 * - Enhanced accessibility support
 * - Improved theming integration
 * - Full TypeScript support
 * - Maintains existing form integration patterns
 */

// Component imports
import Checkbox from "./Checkbox.vue";
import KeyValue from "./KeyValue.vue";
import ListField from "./ListField.vue";
import PasswordInput from "./PasswordInput.vue";
import Select from "./Select.vue";
import TextCodeInput from "./TextCodeInput.vue";
import TextInput from "./TextInput.vue";

// Component exports
export {
    Checkbox,
    KeyValue,
    ListField,
    PasswordInput,
    Select,
    TextCodeInput,
    TextInput,
}

// TypeScript type re-exports for all input components
export type { CheckboxProps, CheckboxEmits } from './Checkbox.types'
export type { KeyValueWrapperProps, KeyValueWrapperEmits, KeyValuePair } from './KeyValue.types'
export type { ListFieldWrapperProps, ListFieldWrapperEmits, ListFieldItem } from './ListField.types'
export type { PasswordInputProps, PasswordInputEmits } from './PasswordInput.types'
export type { SelectProps, SelectEmits } from './Select.types'
export type { TextCodeInputWrapperProps, TextCodeInputWrapperEmits } from './TextCodeInput.types'
export type { TextInputProps, TextInputEmits } from './TextInput.types'

// Configuration exports
export * from './Checkbox.config'
export * from './KeyValue.config'
export * from './ListField.config'
export * from './PasswordInput.config'
export * from './Select.config'
export * from './TextCodeInput.config'
export * from './TextInput.config'