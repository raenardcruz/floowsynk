/**
 * MonacoEditor Component - Specialized Code Editor
 * 
 * The MonacoEditor component has been evaluated for PrimeVue integration and has been
 * maintained as a specialized component with enhanced PrimeVue theme integration.
 * 
 * Migration Status: ✅ EVALUATED - MAINTAINED AS SPECIALIZED
 * - MonacoEditor: Maintained as specialized component with PrimeVue theme integration
 * 
 * Decision Rationale:
 * - Monaco Editor is a specialized code editing component
 * - No direct PrimeVue equivalent exists for advanced code editing
 * - Component provides essential code editing functionality
 * - Integration with PrimeVue theme system has been enhanced
 * 
 * Features:
 * - Advanced code editing with syntax highlighting
 * - Multiple programming language support
 * - Integration with PrimeVue theme system
 * - Enhanced styling consistency
 * - Full TypeScript support
 * - Maintains existing editor functionality
 * 
 * For detailed assessment, see: ./PRIMEVUE_INTEGRATION_ASSESSMENT.md
 */

import MonacoEditor from "./MonacoEditor.vue"

// Component export
export default MonacoEditor

// Named export for explicit imports
export { MonacoEditor }

// TypeScript type exports
export type { MonacoEditorProps } from './MonacoEditor.types'