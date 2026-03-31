import { Group } from '@/views/Workflow'

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

export const nodes: any[] = [
    {
        id: '', nodeType: 'setVariable', label: 'Set Variable', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "memory",
            color: "linear-gradient(135deg, var(--green-1), var(--green-8))" // green
        },
        data: {
            name: "",
            value: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'condition', label: 'Condition', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "question_mark",
            color: "linear-gradient(135deg, var(--red-1), var(--red-8))" // red
        },
        data: {
            expression: "",
            inputs: ["input"],
            outputs: ["True", "False"]
        },
    },
    {
        id: '', nodeType: 'loop', label: 'Loop', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "linear-gradient(135deg, var(--blue-1), var(--blue-8))" // blue
        },
        data: {
            iteration: 1,
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'foreach', label: 'For Each', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "linear-gradient(135deg, var(--blue-1), var(--blue-8))" // blue
        },
        data: {
            listvar: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'while', label: 'While', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "linear-gradient(135deg, var(--blue-1), var(--blue-8))" // blue
        },
        data: {
            expression: "",
            limit: 1000,
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'api', label: 'Rest API', position: { x: 0, y: 0 },
        groupList: [4],
        icon: {
            name: "language",
            color: "linear-gradient(135deg, var(--green-3), var(--green-8))" // light green
        },
        data: {
            url: "",
            method: "GET",
            headers: [
                {
                    key: "Content-Type",
                    value: "application/json"
                }
            ],
            payload: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'log', label: 'Logging', position: { x: 0, y: 0 },
        groupList: [6],
        icon: {
            name: "edit_document",
            color: "linear-gradient(135deg, var(--grey-1), var(--grey-2))" // grey
        },
        data: {
            message: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'getGuid', label: 'Get Guid', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "frame_source",
            color: "linear-gradient(135deg, var(--blue-3), var(--blue-5))" // light blue
        },
        data: {
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'text', label: 'Text', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "article",
            color: "linear-gradient(135deg, var(--grey-1), var(--grey-2))" // grey
        },
        data: {
            message: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'math', label: 'math', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "calculate",
            color: "linear-gradient(135deg, var(--red-1), var(--red-8))" // red
        },
        data: {
            expression: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'list', label: 'List', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "list",
            color: "linear-gradient(135deg, var(--green-3), var(--green-8))" // light green
        },
        data: {
            list: [],
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'count', label: 'List Count', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "tag",
            color: "linear-gradient(135deg, var(--grey-1), var(--grey-2))" // grey
        },
        data: {
            listvariable: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'map', label: 'Map', position: { x: 0, y: 0 },
        groupList: [3],
        icon: {
            name: "map",
            color: "linear-gradient(135deg, var(--green-3), var(--green-8))" // light green
        },
        data: {
            listvariable: "",
            template: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'replace', label: 'Replace', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "swap_horiz",
            color: "linear-gradient(135deg, var(--brown-1), var(--brown-8))" // brown
        },
        data: {
            text: "",
            pattern: "",
            replacetext: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'findAll', label: 'Find All', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "find_replace",
            color: "linear-gradient(135deg, var(--blue-2), var(--blue-8))" // teal
        },
        data: {
            text: "",
            pattern: "",
            variable: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'image', label: 'Output Image', position: { x: 0, y: 0 },
        groupList: [7],
        icon: {
            name: "image",
            color: "linear-gradient(135deg, var(--green-4), var(--green-8))" // lime
        },
        data: {
            value: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    },
    {
        id: '', nodeType: 'subprocess', label: 'Sub Process', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "account_tree",
            color: "linear-gradient(135deg, var(--blue-2), var(--blue-8))" // blue
        },
        data: {
            subprocessid: "",
            inputs: ["input"],
            outputs: ["output"]
        },
    }
]

const startNodesArray: any[] = [
    {
        id: '0',
        nodeType: 'defaultnode',
        label: '',
        draggable: false,
        icon: { name: 'flag_circle', color: 'var(--green-5)' }, // green
        groupList: [1],
        position: { x: 100, y: 100 },
        data: {
            inputs: [],
            outputs: ['output'],
        }
    },
    {
        id: '0',
        nodeType: 'interval',
        label: '',
        draggable: false,
        icon: { name: 'calendar_month', color: 'var(--blue-6)' }, // light blue
        data: {
            type: 'seconds',
            interval: 1,
            weeks: [true, true, true, true, true, true, true],
            inputs: [],
            outputs: ['output'],
        },
        groupList: [1],
        position: { x: 100, y: 100 },
    },
    {
        id: '0',
        nodeType: 'webhook',
        label: '',
        draggable: false,
        icon: { name: 'webhook', color: 'var(--brown-7)' }, // orange
        groupList: [1],
        position: { x: 100, y: 100 },
        data: {
            inputs: [],
            outputs: ['output'],
        }
    },
    {
        id: '0',
        nodeType: 'events',
        label: '',
        draggable: false,
        icon: { name: 'event', color: 'var(--red-5)' }, // pink
        data: {
            name: '',
            inputs: [],
            outputs: ['output'],
        },
        groupList: [1],
        position: { x: 100, y: 100 },
    },
]

const startNodes: { [key: string]: any } = {}
startNodesArray.forEach(node => {
    startNodes[node.nodeType] = node
})

export {
    startNodes
}