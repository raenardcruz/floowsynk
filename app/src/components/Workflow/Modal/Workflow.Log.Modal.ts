import { Process } from "@/components/Common/Interfaces";
import Workflow from "@/views/Workflow"

export default class WorkflowLogModal {
    static utcDateToLocal(utcDate: string): string {
        const date = new Date(utcDate);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        const localDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
        
        return localDate;
    }
    static displayText(text: string): string {
        if (text == null)
            return "";
        if (text.length > 300) {
            const blob = new Blob([text], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            return `Content too big. Click <a href="${url}" target="_blank">HERE</a> to view the whole document`
        } else {
            return text;
        }
    }
    static getTab(id: string): Process {
        return Workflow.store.tabs.value.find((tab: Process) => tab.id === id) as Process;
    }
}