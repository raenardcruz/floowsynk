import { Node } from "@/components/Common/Interfaces"

const nodes: Node[] = [
    {
        id: '', nodetype: 'setVariable', label: 'Set Variable', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "memory",
            color: "green"
        },
        data: {
            name: "",
            value: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'condition', label: 'Condition', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "question_mark",
            color: "red"
        },
        data: {
            expression: ""
        },
        inputs: ["input"],
        outputs: ["True", "False"]
    },
    {
        id: '', nodetype: 'loop', label: 'Loop', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            iteration: 1
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'foreach', label: 'For Each', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            listvar: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'while', label: 'While', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            expression: "",
            limit: 1000
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'api', label: 'Rest API', position: { x: 0, y: 0 },
        group: [4],
        icon: {
            name: "language",
            color: "#87B359"
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
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'log', label: 'Logging', position: { x: 0, y: 0 },
        group: [6],
        icon: {
            name: "edit_document",
            color: "#222"
        },
        data: {
            message: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'getGuid', label: 'Get Guid', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "frame_source",
            color: "#3477B9"
        },
        data: {
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'text', label: 'Text', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "article",
            color: "#9A9A9A"
        },
        data: {
            message: "",
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'math', label: 'math', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "calculate",
            color: "#D36C6C"
        },
        data: {
            expression: "",
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'list', label: 'List', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "list",
            color: "#85B158"
        },
        data: {
            list: [],
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'count', label: 'List Count', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "tag",
            color: "#979797"
        },
        data: {
            listVariable: "",
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'map', label: 'Map', position: { x: 0, y: 0 },
        group: [3],
        icon: {
            name: "map",
            color: "#85B158"
        },
        data: {
            listVariable: "",
            template: "",
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'replace', label: 'Replace', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "swap_horiz",
            color: "#77584C"
        },
        data: {
            text: "",
            pattern: "",
            replaceText: "",
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        id: '', nodetype: 'findAll', label: 'Find All', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "find_replace",
            color: "#057D72"
        },
        data: {
            text: "",
            pattern: "",
            variable: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        // Implement logic on Front End
        id: '', nodetype: 'image', label: 'Output Image', position: { x: 0, y: 0 },
        group: [7],
        icon: {
            name: "image",
            color: "#98BC18"
        },
        data: {
            value: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    },
    {
        // Implement Logic
        id: '', nodetype: 'subprocess', label: 'Sub Process', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "account_tree",
            color: "#1986BD"
        },
        data: {
            subProcessId: ""
        },
        inputs: ["input"],
        outputs: ["output"]
    }
]

const startNodesArray: Node[] = [
    {
        id: '0',
        nodetype: 'defaultnode',
        label: '',
        draggable: false,
        icon: { name: 'flag_circle', color: '#84ab86' },
        outputs: ['output'],
        group: [1],
        position: { x: 100, y: 100 },
    },
    {
        id: '0',
        nodetype: 'interval',
        label: '',
        draggable: false,
        icon: { name: 'calendar_month', color: '#09a6d6' },
        data: {
            type: 'seconds',
            interval: 1,
            weeks: [true, true, true, true, true, true, true],
        },
        outputs: ['output'],
        group: [1],
        position: { x: 100, y: 100 },
    },
    {
        id: '0',
        nodetype: 'webhook',
        label: '',
        draggable: false,
        icon: { name: 'webhook', color: '#b86a11' },
        data: {
            name: ''
        },
        outputs: ['output'],
        group: [1],
        position: { x: 100, y: 100 },
    },
    {
        id: '0',
        nodetype: 'events',
        label: '',
        draggable: false,
        icon: { name: 'event', color: '#A3245B' },
        data: {
            name: ''
        },
        outputs: ['output'],
        group: [1],
        position: { x: 100, y: 100 },
    },
]

const startNodes: { [key: string]: Node } = {};
startNodesArray.forEach(node => {
    startNodes[node.nodetype] = node;
});

export {
    nodes,
    startNodes
};