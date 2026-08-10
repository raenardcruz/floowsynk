import { Workflow, Node, Edge, Environment } from 'proto/workflow/workflow_pb'
import { generateUUID } from "@/components/Composable/Utilities"

export const newProcess = (): Workflow.AsObject => {
    return {
        id: generateUUID(),
        type: 'default',
        name: 'Untitled',
        description: '',
        nodesList: [] as Node.AsObject[],
        edgesList: [] as Edge.AsObject[],
        tagsList: [],
        isnew: true,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
        createdby: 'system',
        updatedby: 'system',
        ismodified: false,
        publishedversionid: '',
        publishedversionnum: 0,
        environment: Environment.PRODUCTION
    }
}