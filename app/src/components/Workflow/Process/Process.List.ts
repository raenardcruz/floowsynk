import { ref, computed } from "vue";
import Workflow from "@/views/Workflow";
import { Process } from "@/components/Common/Interfaces";
import Templates from "@/components/Common/Templates"

const processes = ref<Process[]>([
    {
        id: 'de8672e3-e5f3-43a5-9ca0-fced34ea4251',
        type: 'default',
        title: 'Main Process',
        description: 'This is the main process',
        tags: ['tag1', 'tag2', 'tag3']
    },
    {
        id: '6e2c3d59-6a8e-4e54-9fac-5787636e5956',
        type: 'interval',
        title: 'Interval Process',
        description: 'This is the interval process',
        tags: ['tag1', 'tag2', 'tag3']
    },
    {
        id: 'de3abb53-34ab-4010-8635-1008849bee50',
        type: 'webhook',
        title: 'Webhook Process',
        description: 'This is the webhook process',
        tags: ['tag1', 'tag2', 'tag3']
    },
    {
        id: '07d81a79-20ad-4f63-aed0-745d0a84b9e0',
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
    static cardClicked(process: Process) {
        if (!Workflow.store.tabs.value.some(existingTab => existingTab.id === process.id)) {
            Workflow.store.tabs.value.push(process);
        }
        Workflow.store.activeTab.value = process.id;
    }
    static createProcess() {
        const {
            tabs,
            activeTab
        } = Workflow.store;
        let newProcess = Templates.Process();
        tabs.value.push(newProcess);
        activeTab.value = newProcess.id;
    }
}