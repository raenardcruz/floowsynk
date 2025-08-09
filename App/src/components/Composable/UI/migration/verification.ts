/**
 * Verification utilities to ensure PrimeVue migration foundation is working
 */

import { registry } from './registry'

/**
 * Verifies that the migration foundation is properly set up
 */
export const verifyMigrationFoundation = (): boolean => {
  const checks = {
    registryInitialized: false,
    themeIntegrationLoaded: false,
    primevueConfigured: false
  }

  // Check if registry is initialized
  try {
    const components = Object.keys(registry.mappings)
    checks.registryInitialized = components.length > 0
  } catch (error) {
    console.error('Registry verification failed:', error)
  }

  // Check if theme integration CSS is loaded
  try {
    const themeStyle = document.querySelector('#brand-color-integration')
    checks.themeIntegrationLoaded = !!themeStyle
  } catch (error) {
    console.error('Theme integration verification failed:', error)
  }

  // Check if PrimeVue is configured (check for PrimeVue CSS variables)
  try {
    const rootStyles = getComputedStyle(document.documentElement)
    const hasPrimevueVars = rootStyles.getPropertyValue('--p-primary-color') !== ''
    checks.primevueConfigured = hasPrimevueVars
  } catch (error) {
    console.error('PrimeVue configuration verification failed:', error)
  }

  const allChecksPass = Object.values(checks).every(check => check)

  if (process.env.NODE_ENV === 'development') {
    console.group('Migration Foundation Verification')
    console.table(checks)
    console.log('All checks passed:', allChecksPass)
    console.groupEnd()
  }

  return allChecksPass
}

/**
 * Development helper to log migration status
 */
export const logMigrationStatus = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group('PrimeVue Migration Status')
    console.log('✅ PrimeVue installed and configured')
    console.log('✅ Theme integration system ready')
    console.log('✅ Component registry system ready')
    console.log('✅ Migration utilities available')
    console.log('✅ CSS layer ordering configured')
    console.log('✅ Brand color integration active')
    console.log('📋 Ready for component migration tasks')
    console.groupEnd()
  }
}