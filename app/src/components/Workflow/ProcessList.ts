import { ref, computed } from "vue";
import { Tab, Workflow } from "../../views/Workflow"

export interface Process {
    id: number;
    title: string;
    description: string;
    type: string;
    tags: string[];
}

const processes = ref<Process[]>([
    {
        id: 1,
        type: 'default',
        title: 'Main Process',
        description: 'This is the main process',
        tags: ['tag1', 'tag2', 'tag3']
    },
    {
        id: 2,
        type: 'interval',
        title: 'Interval Process',
        description: 'This is the interval process',
        tags: ['tag1', 'tag2', 'tag3']
    },
    {
        id: 3,
        type: 'webhook',
        title: 'Webhook Process',
        description: 'This is the webhook process',
        tags: ['tag1', 'tag2', 'tag3']
    },
    {
        id: 4,
        type: 'events',
        title: 'Events Process',
        description: 'This is the events process',
        tags: ['tag1', 'tag2', 'tag3']
    },
]);
const search = ref("");

const filteredProcesses = computed<Process[]>(() => {
    if (search.value === "") {
        return processes.value;
    }
    return processes.value.filter((process) =>
        process.title.toLowerCase().includes(search.value.toLowerCase())
    );
});


export class ProcessList {
    static store = {
        processes,
        search,
        filteredProcesses
    };
    static cardClicked(tab: Tab) {
        const {
            tabs,
            activeTab
        } = Workflow.store;
        if (!tabs.value.some(existingTab => existingTab.id === tab.id)) {
            tabs.value.push(tab);
        }
        activeTab.value = tab.id;
    }
}