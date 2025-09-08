import { ref, computed } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { convertStyleArrayToProps } from './Tools/Tools.config'
import { COMPONENT_MAPPING, COMPONENT_NAMES } from './Tools/Tools.components';
import { ComponentProperty, ComponentStyle } from './Tools/Tools.types';

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
  const styles = ref<Record<string, Array<ComponentStyle>>>({})
  const properties = ref<Record<string, Array<ComponentProperty>>>({})
  const selectedItem = ref<string>('')
  const isTestMode = ref<boolean>(false)

  return {
    activeTab,
    droppedItems,
    styles,
    properties,
    selectedItem,
    isTestMode,
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
      const component = COMPONENT_MAPPING[componentName as COMPONENT_NAMES];
      selectedItem.value = newComponentId;
      const baseStyle = component.styleConfig || [];
      const clonedStyleArray = (Array.isArray(baseStyle) ? baseStyle : [baseStyle]).map(style => ({ ...style }));
      styles.value[newComponentId] = clonedStyleArray;
      const clonedPropertiesArray = (component.propertiesConfig || []).map(prop => ({ ...prop }));
      properties.value[newComponentId] = clonedPropertiesArray || [];
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