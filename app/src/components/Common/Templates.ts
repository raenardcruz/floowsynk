import { Process } from "@/components/Common/Interfaces"
import Utilities from "@/components/Common/Utilities"

export default class Templates {
    static Process(): Process {
        return {
            id: Utilities.generateUUID(),
            type: 'default',
            title: 'Untitled',
            description: '',
            nodes: [{
                id: '0',
                type: 'start',
                label: 'Default',
                icon: { name: 'play_arrow', color: '#4CAF50' },
                outputs: ['output'],
                group: [1],
                position: { x: 100, y: 100 },
                data: { label: 'Node 1' },
            }],
            edges: [],
            tags: []
        }
    }
}