import { ref, computed } from "vue";
import Workflow from "@/views/Workflow";
import { Process } from "@/components/Common/Interfaces";
import Templates from "@/components/Common/Templates"
import { startNodes } from "../Nodes/node";
import axios from "axios";

const processes = ref<Process[]>([
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
    static readonly store = {
        processes,
        search,
        filteredProcesses
    };

    static async init() {
        let resp: any = await axios.get("api/workflows", {
            headers: {
                "Authorization": `${localStorage.getItem("sessionToken")}`
            }
        });
        resp.data.items.forEach((process: any) => {
            processes.value.push(Templates.processFactory(process));
        });
        console.log("Processes", processes.value);
    }

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
        if (newProcess.nodes) {
            newProcess.nodes.push(startNodes[0]);
        }
        tabs.value.push(newProcess);
        activeTab.value = newProcess.id;
    }
}