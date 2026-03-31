/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Suppress source map warnings during development
  css: {
    devSourcemap: false
  },

  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    },
    // Suppress source map warnings
    hmr: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': '/src',
    }
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress source map warnings for node_modules
        if (warning.code === 'SOURCEMAP_ERROR' && warning.message.includes('node_modules')) {
          return
        }
        warn(warning)
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router'],
          'primevue-vendor': ['primevue/config', '@primeuix/themes/aura'],
          'primevue-components': [
            'primevue/button',
            'primevue/inputtext',
            'primevue/password',
            'primevue/select',
            'primevue/checkbox',
            'primevue/dialog',
            'primevue/sidebar',
            'primevue/progressspinner',
            'primevue/toast',
            'primevue/tabview',
            'primevue/datatable'
          ],
          // Utilities
          'utils': ['@vueuse/core', 'axios'],
          // Monaco Editor (large dependency)
          'monaco': ['monaco-editor']
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Optimize conditionals
        conditionals: true,
        // Remove unused variables
        unused: true
      }
    },
    // Source maps for debugging (can be disabled in production)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'primevue/config',
      '@primeuix/themes/aura',
      '@vueuse/core'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded separately
      'monaco-editor'
    ]
  },
  // Define configuration to handle Monaco Editor properly
  define: {
    // Suppress source map warnings in development
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts']
  }
})
