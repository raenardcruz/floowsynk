import { ref, computed } from "vue"
import { Workflow } from 'proto/floowsynk_pb'
import { newProcess } from "./Workflow.factory"
import { createGlobalState } from '@vueuse/core'

export const useWorkflowStore = createGlobalState(() => {
    const activeTab = ref<string>('main')
    const tabs = ref<Workflow.AsObject[]>([])

    return {
        activeTab,
        tabs
    }
})

export const useTab = (tabId: string) => {
    const { tabs } = useWorkflowStore()
    const tab = computed<Workflow.AsObject>({
        get() {
            return tabs.value.find(tab => tab.id === tabId) || newProcess()
        },
        set(newValue) {
            const index = tabs.value.findIndex(tab => tab.id === tabId)
            if (index !== -1) {
                tabs.value[index] = newValue
            }
        }
    })
    const setActiveTabToNext = () => {
        const { activeTab } = useWorkflowStore()
        const currentIndex = tabs.value.findIndex(tab => tab.id === activeTab.value)
        if (currentIndex < tabs.value.length - 1) {
            activeTab.value = tabs.value[currentIndex + 1].id
        } else if (currentIndex === tabs.value.length - 1) {
            activeTab.value = tabs.value[0].id
        }
    }

    const setActiveTabToPrevious = () => {
        const { activeTab } = useWorkflowStore()
        const currentIndex = tabs.value.findIndex(tab => tab.id === activeTab.value)
        if (currentIndex > 0) {
            activeTab.value = tabs.value[currentIndex - 1].id
        } else if (currentIndex === 0) {
            activeTab.value = tabs.value[tabs.value.length -1].id
        }
    }

    return {
        tab,
        setActiveTabToNext,
        setActiveTabToPrevious,
    }
}