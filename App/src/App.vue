<template>
  <Toast position="bottom-right" />
  <ConfirmDialog />
  <router-view />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useTheme } from '@/components/Composable/UI/composables/useTheme'

// Initialize theme listener and apply data-theme on html element
useTheme()
</script>