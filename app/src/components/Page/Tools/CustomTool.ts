// MyTool.ts
import { h, render } from 'vue'
import CustomTool from "@/components/Page/Tools/CustomTool.vue"
// Define the custom tool class
export default class MyTool {
  // Toolbox settings for Editor.js (toolbar appearance)
  static get toolbox() {
    return {
      title: 'My Tool',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>'
    }
  }
  
  // Data held by the tool
  data: string
  // The container element where the Vue component will be mounted
  container: HTMLElement | null

  constructor({ data }: { data: string }) {
    this.data = data || ''
    this.container = null
  }

  // Render method mounts the Vue component into a container div
  render(): HTMLElement {
    this.container = document.createElement('div')
    const vueVNode = h(CustomTool, {
      modelValue: this.data,
      'onUpdate:modelValue': (val: string) => {
        this.data = val
      }
    })
    render(vueVNode, this.container)
    return this.container
  }

  // Save method returns the current data
  save(): string {
    return this.data
  }
}
