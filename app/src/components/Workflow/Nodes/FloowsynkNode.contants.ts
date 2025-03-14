import { Group } from '@/views/Workflow'
import { Node, NodeData } from 'proto/floowsynk_pb'

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
            color: "green"
        },
        data: {
            name: "",
            value: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'condition', label: 'Condition', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "question_mark",
            color: "red"
        },
        data: {
            expression: ""
        },
        inputsList: ["input"],
        outputsList: ["True", "False"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'loop', label: 'Loop', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            iteration: 1
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'foreach', label: 'For Each', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            listvar: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'while', label: 'While', position: { x: 0, y: 0 },
        groupList: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            expression: "",
            limit: 1000
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'api', label: 'Rest API', position: { x: 0, y: 0 },
        groupList: [4],
        icon: {
            name: "language",
            color: "#87B359"
        },
        data: {
            url: "",
            method: "GET",
            headersList: [
                {
                    key: "Content-Type",
                    value: "application/json"
                }
            ],
            payload: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'log', label: 'Logging', position: { x: 0, y: 0 },
        groupList: [6],
        icon: {
            name: "edit_document",
            color: "#222"
        },
        data: {
            message: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'getGuid', label: 'Get Guid', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "frame_source",
            color: "#3477B9"
        },
        data: {
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'text', label: 'Text', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "article",
            color: "#9A9A9A"
        },
        data: {
            message: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'math', label: 'math', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "calculate",
            color: "#D36C6C"
        },
        data: {
            expression: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'list', label: 'List', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "list",
            color: "#85B158"
        },
        data: {
            listList: [] as string[],
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'count', label: 'List Count', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "tag",
            color: "#979797"
        },
        data: {
            listvariable: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'map', label: 'Map', position: { x: 0, y: 0 },
        groupList: [3],
        icon: {
            name: "map",
            color: "#85B158"
        },
        data: {
            listvariable: "",
            template: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'replace', label: 'Replace', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "swap_horiz",
            color: "#77584C"
        },
        data: {
            text: "",
            pattern: "",
            replacetext: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        id: '', nodetype: 'findAll', label: 'Find All', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "find_replace",
            color: "#057D72"
        },
        data: {
            text: "",
            pattern: "",
            variable: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        // Implement logic on Front End
        id: '', nodetype: 'image', label: 'Output Image', position: { x: 0, y: 0 },
        groupList: [7],
        icon: {
            name: "image",
            color: "#98BC18"
        },
        data: {
            value: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject,
    {
        // Implement Logic
        id: '', nodetype: 'subprocess', label: 'Sub Process', position: { x: 0, y: 0 },
        groupList: [1],
        icon: {
            name: "account_tree",
            color: "#1986BD"
        },
        data: {
            subprocessid: ""
        },
        inputsList: ["input"],
        outputsList: ["output"]
    } as Node.AsObject
]

const startNodesArray: Node.AsObject[] = [
    {
        id: '0',
        nodetype: 'defaultnode',
        label: '',
        draggable: false,
        icon: { name: 'flag_circle', color: '#84ab86' },
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    } as Node.AsObject,
    {
        id: '0',
        nodetype: 'interval',
        label: '',
        draggable: false,
        icon: { name: 'calendar_month', color: '#09a6d6' },
        data: {
            type: 'seconds',
            interval: 1,
            weeksList: [true, true, true, true, true, true, true],
        } as NodeData.AsObject,
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    } as Node.AsObject,
    {
        id: '0',
        nodetype: 'webhook',
        label: '',
        draggable: false,
        icon: { name: 'webhook', color: '#b86a11' },
        data: {
            name: ''
        } as NodeData.AsObject,
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    } as Node.AsObject,
    {
        id: '0',
        nodetype: 'events',
        label: '',
        draggable: false,
        icon: { name: 'event', color: '#A3245B' },
        data: {
            name: ''
        } as NodeData.AsObject,
        outputsList: ['output'],
        groupList: [1],
        position: { x: 100, y: 100 },
    } as Node.AsObject,
]

const startNodes: { [key: string]: Node.AsObject } = {};
startNodesArray.forEach(node => {
    startNodes[node.nodetype] = node;
});

export {
    startNodes
};