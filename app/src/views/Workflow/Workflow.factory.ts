import { Process } from '@/views/Workflow'
import {generateUUID} from "@/components/Composable/Utilities"

export const newProcess = (): Process => {
    return {
        id: generateUUID(),
        type: 'default',
        title: 'Untitled',
        description: '',
        nodes: [],
        edges: [],
        tags: [],
        isnew: true
    }
}