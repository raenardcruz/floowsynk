import { Node } from "../Common/Interfaces"

const nodes: Node[] = [
    {
        id: '', type: 'setVariable', label: 'Set Variable', position: { x: 0, y: 0 },
        data: {
            status: "",
            name: "",
            value: ""
        }
    },
    {
        id: '', type: 'condition', label: 'Condition', position: { x: 0, y: 0 },
        data: {
            status: "",
            expression: ""
        }
    },
    {
        id: '', type: 'loop', label: 'Loop', position: { x: 0, y: 0 },
        data: {
            status: "",
            iteration: 1
        }
    },
    {
        id: '', type: 'foreach', label: 'For Each', position: { x: 0, y: 0 },
        data: {
            status: "",
            listvar: ""
        }
    },
    {
        id: '', type: 'while', label: 'While', position: { x: 0, y: 0 },
        data: {
            status: "",
            expression: "",
            limit: 1000
        }
    },
    {
        id: '', type: 'api', label: 'Rest API', position: { x: 0, y: 0 },
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
        data: {
            status: "",
            message: ""
        }
    },
    {
        id: '', type: 'getGuid', label: 'Get Guid', position: { x: 0, y: 0 },
        data: {
            status: "",
            variable: ""
        }
    },
    {
        id: '', type: 'text', label: 'Text', position: { x: 0, y: 0 },
        data: {
            status: "",
            message: "",
            variable: ""
        }
    },
    {
        id: '', type: 'math', label: 'math', position: { x: 0, y: 0 },
        data: {
            status: "",
            expression: "",
            variable: ""
        }
    },
    {
        id: '', type: 'list', label: 'List', position: { x: 0, y: 0 },
        data: {
            status: "",
            type: "string",
            list: [],
            variable: ""
        }
    },
    {
        id: '', type: 'count', label: 'List Count', position: { x: 0, y: 0 },
        data: {
            status: "",
            list: [],
            variable: ""
        }
    },
    {
        id: '', type: 'map', label: 'Map', position: { x: 0, y: 0 },
        data: {
            status: "",
            list: [],
            template: "",
            variable: ""
        }
    },
    {
        id: '', type: 'replace', label: 'Replace', position: { x: 0, y: 0 },
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
        data: {
            status: "",
            text: "",
            pattern: "",
            variable: ""
        }
    },
    {
        id: '', type: 'image', label: 'Output Image', position: { x: 0, y: 0 },
        data: {
            status: "",
            value: ""
        }
    },
    {
        id: '', type: 'subprocess', label: 'Sub Process', position: { x: 0, y: 0 },
        data: {
            status: "",
            value: ""
        }
    }
]

export default nodes;