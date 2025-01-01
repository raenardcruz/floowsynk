import { Process } from "@/components/Common/Interfaces"
import Utilities from "@/components/Common/Utilities"

export default class Templates {
    static Process(): Process {
        return {
            id: Utilities.generateUUID(),
            type: 'default',
            title: 'Untitled',
            description: '',
            tags: []
        }
    }
}