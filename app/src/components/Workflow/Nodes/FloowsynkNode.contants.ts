import { Group } from '@/views/Workflow'
import {
    Node,
    NodeDataArray,
    ArrayDataType 
} from 'proto/floowsynk_pb'

export const groups: Group[] = [
    {
        id: 1,
        icon: "handyman",
        name: "Utility",
        description: "Performs fundamental operations like math, string manipulations, date operations, variable management, text replacement, and regex operations.",
    },
    {
        id: 2,
        icon: "network_node",
        name: "Logic/Control Flow",
        description: "Manages workflow logic with conditions, loops, and delays.",
    },
    {
        id: 3,
        icon: "transform",
        name: "Data Transformation",
        description: "Transforms data formats and structures, including mapping, parsing, and aggregating data.",
    },
    {
        id: 4,
        icon: "cable",
        name: "Connectivity",
        description: "Connects to external systems and services, including messaging, APIs, and software connectors.",
    },
    {
        id: 5,
        icon: "security",
        name: "Security",
        description: "Handles authentication, encryption, and security-related operations.",
    },
    {
        id: 6,
        icon: "analytics",
        name: "Monitoring and Analytics",
        description: "Collects metrics, monitors performance, and generates reports and dashboards.",
    },
    {
        id: 7,
        icon: "output",
        name: "Output",
        description: "Output nodes are used for testing visualization. These nodes are not executed in deployed process.",
    }
]

export const nodes: Node.AsObject[] = [
    {
        id: '', nodetype: 'setVariable', label: 'Set Variable', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "memory",
            color: "linear-gradient(135deg, var(--green-1), var(--green-5))" // green
        },
        data: {
            name: "",
            value: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'condition', label: 'Condition', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "question_mark",
            color: "linear-gradient(135deg, var(--red-1), var(--red-5))" // red
        },
        data: {
            expression: ""
        },
        inputsList: ["input"],
        outputsList: ["True", "False"]
    },
    {
        id: '', nodetype: 'loop', label: 'Loop', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "linear-gradient(135deg, var(--blue-1), var(--blue-5))" // blue
        },
        data: {
            iteration: 1
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'foreach', label: 'For Each', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "linear-gradient(135deg, var(--blue-1), var(--blue-5))" // blue
        },
        data: {
            listvar: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'while', label: 'While', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "linear-gradient(135deg, var(--blue-1), var(--blue-5))" // blue
        },
        data: {
            expression: "",
            limit: 1000
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'api', label: 'Rest API', position: { x: 0, y: 0 },
        groupList: [4],
        icon: {
            name: "language",
            color: "linear-gradient(135deg, var(--green-3), var(--green-5))" // light green
        },
        data: {
            url: "",
            method: "GET",
            headers: {
                type: 3,
                keyvalueitemsList: [
                    {
                        key: "Content-Type",
                        value: "application/json"
                    }
                ],
            },
            payload: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'log', label: 'Logging', position: { x: 0, y: 0 },
        groupList: [6],
        icon: {
            name: "edit_document",
            color: "linear-gradient(135deg, var(--grey-1), var(--grey-5))" // grey
        },
        data: {
            message: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'getGuid', label: 'Get Guid', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "frame_source",
            color: "linear-gradient(135deg, var(--blue-3), var(--blue-5))" // light blue
        },
        data: {
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as any,
    {
        id: '', nodetype: 'text', label: 'Text', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "article",
            color: "linear-gradient(135deg, var(--grey-1), var(--grey-5))" // grey
        },
        data: {
            message: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'math', label: 'math', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "calculate",
            color: "linear-gradient(135deg, var(--red-1), var(--red-5))" // red
        },
        data: {
            expression: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'list', label: 'List', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "list",
            color: "linear-gradient(135deg, var(--green-3), var(--green-5))" // light green
        },
        data: {
            list: {
                type: ArrayDataType.STRING
            },
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'count', label: 'List Count', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "tag",
            color: "linear-gradient(135deg, var(--grey-1), var(--grey-5))" // grey
        },
        data: {
            listvariable: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'map', label: 'Map', position: { x: 0, y: 0 },
        groupList: [3],
        icon: {
            name: "map",
            color: "linear-gradient(135deg, var(--green-3), var(--green-5))" // light green
        },
        data: {
            listvariable: "",
            template: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'replace', label: 'Replace', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "swap_horiz",
            color: "linear-gradient(135deg, var(--brown-1), var(--brown-5))" // brown
        },
        data: {
            text: "",
            pattern: "",
            replacetext: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        id: '', nodetype: 'findAll', label: 'Find All', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "find_replace",
            color: "linear-gradient(135deg, var(--blue-2), var(--blue-5))" // teal
        },
        data: {
            text: "",
            pattern: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        // Implement logic on Front End
        id: '', nodetype: 'image', label: 'Output Image', position: { x: 0, y: 0 },
        groupList: [7],
        icon: {
            name: "image",
            color: "linear-gradient(135deg, var(--green-4), var(--green-5))" // lime
        },
        data: {
            value: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    },
    {
        // Implement Logic
        id: '', nodetype: 'subprocess', label: 'Sub Process', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "account_tree",
            color: "linear-gradient(135deg, var(--blue-2), var(--blue-5))" // blue
        },
        data: {
            subprocessid: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    }
]

const startNodesArray: Node.AsObject[] = [
    {
        id: '0',
        nodetype: 'defaultnode',
        label: '',
        draggable: false,
        icon: { name: 'flag_circle', color: 'var(--green-2)' }, // green
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
        inputsList: []
    },
    {
        id: '0',
        nodetype: 'interval',
        label: '',
        draggable: false,
        icon: { name: 'calendar_month', color: 'var(--blue-3)' }, // light blue
        data: {
            type: 'seconds',
            interval: 1,
            weeks: {
                type: ArrayDataType.BOOL,
                boolitemsList: [true, true, true, true, true, true, true]
            } as NodeDataArray.AsObject,
        },
        inputsList: [],
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    },
    {
        id: '0',
        nodetype: 'webhook',
        label: '',
        draggable: false,
        icon: { name: 'webhook', color: 'var(--orange-2)' }, // orange
        data: {
            name: ''
        },
        inputsList: [],
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    },
    {
        id: '0',
        nodetype: 'events',
        label: '',
        draggable: false,
        icon: { name: 'event', color: 'var(--pink-2)' }, // pink
        data: {
            name: ''
        },
        inputsList: [],
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    },
]

const startNodes: { [key: string]: Node.AsObject } = {}
startNodesArray.forEach(node => {
    startNodes[node.nodetype] = node
})

export {
    startNodes
}