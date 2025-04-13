import { h, render } from 'vue'
import CustomTool from "@/components/Page/Tools/CustomTool.vue"

export default class MyTool {
  static get toolbox() {
    return {
      title: 'My Tool',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>'
    }
  }
  
  data: string
  container: HTMLElement | null

  constructor({ data }: { data: string }) {
    this.data = data || ''
    this.container = null
  }

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

  save(): string {
    return this.data
  }
}
