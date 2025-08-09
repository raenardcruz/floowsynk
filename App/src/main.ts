import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';

// Import migration utilities
import './components/Composable/UI/migration/theme-integration'
import './components/Composable/UI/migration/initial-registry'

const app = createApp(App)
app.use(router)
app.use(PrimeVue, { 
  ripple: false, 
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: {
        name: 'primevue',
        order: 'base, primevue, utilities'
      }
    }
  }
})
app.directive('tooltip', Tooltip);
app.mount('#app')
