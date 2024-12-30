import { ref, computed } from "vue";

interface Process {
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

export function processListStore() {
  return {
    processes,
    search,
    filteredProcesses,
  };
}