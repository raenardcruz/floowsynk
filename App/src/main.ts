import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';

const app = createApp(App)
app.use(router)
app.use(PrimeVue, { ripple: false, theme: {
    preset: Aura,
} })
app.directive('tooltip', Tooltip);
app.mount('#app')
