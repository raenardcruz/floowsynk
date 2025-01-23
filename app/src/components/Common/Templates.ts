import { Process } from "@/components/Common/Interfaces"
import Utilities from "@/components/Common/Utilities"

export default class Templates {
    static Process(): Process {
        return {
            id: Utilities.generateUUID(),
            type: 'default',
            title: 'Untitled',
            description: '',
            nodes: [],
            edges: [],
            tags: [],
            isnew: true
        }
    }
    static processFactory(data: any): Process {
        return {
            id: data.id,
            type: data.type,
            title: data.name,
            description: data.description,
            nodes: data.nodes,
            edges: data.edges,
            tags: [],
            isnew: false,
        }
    }
}