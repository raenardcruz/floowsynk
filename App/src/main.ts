import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';

// PrimeVue theme integration is now handled directly in primevue.config.ts

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
