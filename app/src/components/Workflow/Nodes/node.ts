import { Node } from "@/components/Common/Interfaces"

const nodes: Node[] = [
    {
        id: '', type: 'setVariable', label: 'Set Variable', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "memory",
            color: "green"
        },
        data: {
            status: "",
            name: "",
            value: ""
        }
    },
    {
        id: '', type: 'condition', label: 'Condition', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "question_mark",
            color: "red"
        },
        data: {
            status: "",
            expression: ""
        }
    },
    {
        id: '', type: 'loop', label: 'Loop', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            status: "",
            iteration: 1
        }
    },
    {
        id: '', type: 'foreach', label: 'For Each', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            status: "",
            listvar: ""
        }
    },
    {
        id: '', type: 'while', label: 'While', position: { x: 0, y: 0 },
        group: [2],
        icon: {
            name: "all_inclusive",
            color: "#2864A9"
        },
        data: {
            status: "",
            expression: "",
            limit: 1000
        }
    },
    {
        id: '', type: 'api', label: 'Rest API', position: { x: 0, y: 0 },
        group: [4],
        icon: {
            name: "language",
            color: "#87B359"
        },
        data: {
            status: "",
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
        }
    },
    {
        id: '', type: 'log', label: 'Logging', position: { x: 0, y: 0 },
        group: [6],
        icon: {
            name: "edit_document",
            color: "#222"
        },
        data: {
            status: "",
            message: ""
        }
    },
    {
        id: '', type: 'getGuid', label: 'Get Guid', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "frame_source",
            color: "#3477B9"
        },
        data: {
            status: "",
            variable: ""
        }
    },
    {
        id: '', type: 'text', label: 'Text', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "article",
            color: "#9A9A9A"
        },
        data: {
            status: "",
            message: "",
            variable: ""
        }
    },
    {
        id: '', type: 'math', label: 'math', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "calculate",
            color: "#D36C6C"
        },
        data: {
            status: "",
            expression: "",
            variable: ""
        }
    },
    {
        id: '', type: 'list', label: 'List', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "list",
            color: "#85B158"
        },
        data: {
            status: "",
            type: "string",
            list: [],
            variable: ""
        }
    },
    {
        id: '', type: 'count', label: 'List Count', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "tag",
            color: "#979797"
        },
        data: {
            status: "",
            list: [],
            variable: ""
        }
    },
    {
        id: '', type: 'map', label: 'Map', position: { x: 0, y: 0 },
        group: [3],
        icon: {
            name: "map",
            color: "#85B158"
        },
        data: {
            status: "",
            list: [],
            template: "",
            variable: ""
        }
    },
    {
        id: '', type: 'replace', label: 'Replace', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "swap_horiz",
            color: "#77584C"
        },
        data: {
            status: "",
            text: "",
            pattern: "",
            replaceText: "",
            variable: ""
        }
    },
    {
        id: '', type: 'regexfind', label: 'Find Regex', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "find_replace",
            color: "#057D72"
        },
        data: {
            status: "",
            text: "",
            pattern: "",
            variable: ""
        }
    },
    {
        id: '', type: 'image', label: 'Output Image', position: { x: 0, y: 0 },
        group: [7],
        icon: {
            name: "image",
            color: "#98BC18"
        },
        data: {
            status: "",
            value: ""
        }
    },
    {
        id: '', type: 'subprocess', label: 'Sub Process', position: { x: 0, y: 0 },
        group: [1],
        icon: {
            name: "account_tree",
            color: "#1986BD"
        },
        data: {
            status: "",
            value: ""
        }
    }
]

export default nodes;