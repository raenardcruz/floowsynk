import { ref, computed, toRef } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { convertStyleArrayToProps } from './Pages.methods'
import { COMPONENTS } from '@/views/Pages/PageSidebar/ComponentsContents.constants';
import { getComponentStyles } from '@/views/Pages/Pages.methods';

export interface componentItem {
  id: string
  name: string
  parent: string
  component: any
}

export interface PageComponentProps {
  id: string
}

export const usePagesStore = createGlobalState(() => {
  const activeTab = ref<number>(1)
  const droppedItems = ref<Array<componentItem>>([])
  const styles = ref<Record<string, Array<any>>>({})
  const properties = ref<Record<string, Array<any>>>({})
  const selectedItem = ref<string>('')

  return {
    activeTab,
    droppedItems,
    styles,
    properties,
    selectedItem,
  }
})

export const usePageComponent = (id: string) => {
  const {
    styles,
    properties,
    selectedItem,
    droppedItems,
    activeTab
  } = usePagesStore()

  const isDragOver = ref(false)
  const componentStyle = computed(() => convertStyleArrayToProps(styles.value[id] || []))
  const componentProperties = computed(() => properties.value[id])
  const onDragOver = (_: DragEvent) => {
    isDragOver.value = true;
  }
  const onDragLeave = (_: DragEvent) => {
    isDragOver.value = false;
  }
  const onDrop = (event: DragEvent) => {
    isDragOver.value = false;
    const newComponentId = crypto.randomUUID();
    const componentName = event.dataTransfer?.getData('text/plain');
    if (componentName) {
      const component = COMPONENTS.find(c => c.name === componentName);
      selectedItem.value = newComponentId;
      const baseStyle = getComponentStyles(componentName);
      const clonedStyleArray = (Array.isArray(baseStyle) ? baseStyle : [baseStyle]).map(style => ({ ...style }));
      styles.value[newComponentId] = clonedStyleArray;
      droppedItems.value.push({
        id: newComponentId,
        name: componentName,
        component: component?.component,
        parent: id,
      });
      activeTab.value = 2;
    }
  }
  return {
    componentStyle,
    componentProperties,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}