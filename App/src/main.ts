import { createApp } from 'vue'
import * as jspb from 'google-protobuf'

// Polyfill for Protobuf compatibility (protoc-gen-js v4.x generate code requires readStringRequireUtf8, but v3.x runtime doesn't have it)
// @ts-ignore
if (!jspb.BinaryReader.prototype.readStringRequireUtf8) {
    // @ts-ignore
    jspb.BinaryReader.prototype.readStringRequireUtf8 = jspb.BinaryReader.prototype.readString;
}
// Polyfill for readPackableInt32Into
// @ts-ignore
if (!jspb.BinaryReader.prototype.readPackableInt32Into) {
    // @ts-ignore
    jspb.BinaryReader.prototype.readPackableInt32Into = function(target) {
        // @ts-ignore
        const method = this.readPackableInt32 || this.readPackedInt32;
        if (method) {
            const values = method.call(this);
            for (let i = 0; i < values.length; i++) {
                target.push(values[i]);
            }
        }
    };
}

// Polyfill for readPackableBoolInto
// @ts-ignore
if (!jspb.BinaryReader.prototype.readPackableBoolInto) {
    // @ts-ignore
    jspb.BinaryReader.prototype.readPackableBoolInto = function(target) {
        // @ts-ignore
        const method = this.readPackableBool || this.readPackedBool;
        if (method) {
            const values = method.call(this);
            for (let i = 0; i < values.length; i++) {
                target.push(values[i]);
            }
        }
    };
}
import './style.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';

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
app.use(ToastService)
app.directive('tooltip', Tooltip);
app.mount('#app')
