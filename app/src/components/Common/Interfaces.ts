export interface Process {
    id: string;
    title: string;
    description: string;
    type: string;
    tags: string[];
    logging?: any[];
    showLogModal?: boolean;
    nodes?: Node[];
    edges?: any[];
    runMode?: boolean;
    draggable?: boolean;
    isnew: boolean;
}

export interface Alert {
    message: string;
    visible: boolean;
    status: string;
}

export interface Node {
    id: string;
    nodetype: string;
    label: string;
    group: number[];
    nodestyle?: string;
    inputs?: string[];
    outputs?: string[];
    draggable?: boolean;
    icon: {  name: string; color: string; };
    position: {
        x: number;
        y: number;
    };
    data?: any;
    nodestatus?: string;
}

export interface Group {
    id: number;
    name: string;
    description: string;
    icon: string;
}

export interface NodeStatus {
    id: string;
    status: string;
}