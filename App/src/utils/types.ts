export interface KeyValue {
    key: string;
    value: string;
}

export enum ArrayDataType {
    STRING = 0,
    INT = 1,
    BOOL = 2,
    KEYVALUE = 3
}

export enum NodeStatus {
    RUNNING = 0,
    COMPLETED = 1,
    FAILED = 2,
    INFO = 3,
}

export interface NodeDataArray {
    type: ArrayDataType;
    keyValueItems?: KeyValue[];
    stringItems?: string[];
    intItems?: number[];
    boolItems?: boolean[];
}

export interface NodeData {
    name?: string;
    value?: string;
    expression?: string;
    iteration?: number;
    listVar?: string;
    limit?: number;
    url?: string;
    method?: string;
    headers?: NodeDataArray;
    payload?: string;
    variable?: string;
    message?: string;
    list?: NodeDataArray;
    listVariable?: string;
    template?: string;
    text?: string;
    pattern?: string;
    replaceText?: string;
    subProcessId?: string;
    type?: string;
    interval?: number;
    weeks?: NodeDataArray;
    inputs?: string[];
    outputs?: string[];
    [key: string]: any;
}

export interface NodeIcon {
    name: string;
    color: string;
}

export interface NodePosition {
    x: number;
    y: number;
    z?: number;
}

export interface Node {
    id: string;
    nodeType: string;
    label: string;
    data: NodeData;
    status: NodeStatus;
    icon?: NodeIcon;
    position?: NodePosition;
}

export interface Edge {
    id: string;
    source: string;
    sourceHandle?: string;
    target: string;
    targetHandle?: string;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
    type: string;
    createdAt: string;
    updatedAt: string;
    isNew?: boolean;
}

export interface WorkflowList {
    workflows: Workflow[];
    total: number;
}

export interface ReplayData {
    nodeId: string;
    status: NodeStatus | string;
    message: string;
    data?: any;
    timestamp: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    role: string;
    id: string;
}
