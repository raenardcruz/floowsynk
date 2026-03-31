import { generateUUID } from "@/components/Composable/Utilities"

export const newProcess = (): any => {
    return {
        id: generateUUID(),
        name: 'Untitled',
        description: '',
        nodes: [],
        edges: [],
        isnew: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}